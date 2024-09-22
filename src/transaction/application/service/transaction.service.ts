import { Inject, Injectable } from '@nestjs/common';
import { TransactionDTO } from '../dtos/transaction.dto';
import { TransactionErrorMessages } from '../../constant/transaction.constants';
import axios, { AxiosRequestConfig } from 'axios';
import { PaymentData } from '../../domain/interfaces/payment-data.interface';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { CardData } from '../../domain/interfaces/card-data.interface';
import { TransactionRepository } from '../../domain/repository/transaction.repository';
import { Transaction } from '../../domain/model/transaction.model';
import { TransactionMappers } from '../../infrastructure/mappers/transaction.mappers';
import { ProductRepository } from 'src/product/domain/repository/product.repository';
import { ProductService } from 'src/product/application/services/product.service';

dotenv.config();

@Injectable()
export class TransactionService {
  private API_URL = process.env.API_URL;
  private ACCEPTANCE_TOKEN = process.env.ACCEPTANCE_TOKEN;
  private PUBLIC_KEY = process.env.PUBLIC_KEY;
  private SECRET_KEY = process.env.SECRET_KEY;
  private TOKENIZATION_CARDS = process.env.TOKENIZATION_CARDS;
  private TRANSACTION = process.env.TRANSACTIONS;
  private INTEGRITY_KEY = process.env.INTEGRITY_KEY;
  private applicationJson = 'application/json';

  traceMessagePaymentRequest = 'Payment request sent, Transaction ID is:';
  traceMessagePendingStatus = 'Transaction created with status:';
  approvedStatus = 'APPROVED';
  copCurrency = 'COP';
  paymentMethodType = 'CARD';

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    private readonly productService: ProductService,
  ) {}

  async processTransaction(transactionDTO: TransactionDTO): Promise<void> {
    try {
      const [acceptanceToken, cardToken] = await Promise.all([
        this.getAcceptanceToken(),
        this.getCardToken(this.generateCardData(transactionDTO)),
      ]);

      if (!acceptanceToken)
        throw new Error(TransactionErrorMessages.ERROR_ACCEPTANCE_TOKEN);

      if (!cardToken)
        throw new Error(TransactionErrorMessages.ERROR_GETTING_CARD_TOKEN);

      const reference = this.generateReference();
      const signature = this.generateSignature(
        reference,
        transactionDTO.amount,
      );

      const paymentData = this.generatePaymentData(
        transactionDTO,
        reference,
        signature,
        cardToken,
        acceptanceToken,
      );

      await this.sendPaymentRequest(paymentData, transactionDTO);
    } catch (error) {
      this.handleError(
        TransactionErrorMessages.ERROR_PROCESSING_TRANSACTION,
        error,
      );
    }
  }

  private async sendPaymentRequest(
    paymentData: PaymentData,
    transactionDTO: TransactionDTO,
  ): Promise<void> {
    try {
      const response = await this.postRequest(
        `${this.API_URL}${this.TRANSACTION}`,
        paymentData,
        this.SECRET_KEY,
      );

      const transactionId = response.data.data.id;
      const initialStatus = response.data.data.status;
      console.log(`${this.traceMessagePendingStatus} ${initialStatus}`);
      console.log(`${this.traceMessagePaymentRequest} ${transactionId}`);

      await this.handleTransactionResponse(
        transactionId,
        initialStatus,
        paymentData,
        transactionDTO,
      );
    } catch (error) {
      this.handleError(
        TransactionErrorMessages.ERROR_SENDING_PAYMENT_REQUEST,
        error,
      );
      throw error;
    }
  }

  async handleTransactionUpdate(
    transactionNumber: string,
    status: string,
  ): Promise<void> {
    const transactionDetails =
      await this.transactionRepository.findByTransactionNumber(
        transactionNumber,
      );

    if (!transactionDetails)
      throw new Error(TransactionErrorMessages.ERROR_TRANSACTION_NOT_FOUND);

    if (status === this.approvedStatus) {
      await this.transactionRepository.updateStatus(transactionNumber, status);

      const productId = transactionDetails.productId;
      if (productId) {
        await this.productService.updateStock(productId, 1);
      } else {
        throw new Error(TransactionErrorMessages.ERROR_PRODUCT_NOT_FOUND);
      }
    }
  }

  async handleTransactionResponse(
    transactionId: string,
    initialStatus: string,
    paymentData: PaymentData,
    transactionDTO: TransactionDTO,
  ) {
    await this.saveTransactionToDB(
      transactionId,
      initialStatus,
      paymentData.customer_email,
      paymentData.amount_in_cents,
      transactionDTO.productId,
    );
  }

  private async updateTransactionStatus(transactionId: string): Promise<void> {
    try {
      const response = await this.getRequest(
        `${this.API_URL}${this.TRANSACTION}/${transactionId}`,
      );

      const updatedStatus = response.data.data.status;
      await this.updateTransactionStatusInDB(transactionId, updatedStatus);
    } catch (error) {
      this.handleError(
        TransactionErrorMessages.ERROR_UPDATING_TRANSACTION_STATE,
        error,
      );
      throw error;
    }
  }

  async updateTransactionStatusInDB(
    transactionId: string,
    updatedStatus: any,
  ): Promise<void> {
    await this.transactionRepository.updateStatus(transactionId, updatedStatus);
  }

  private async saveTransactionToDB(
    transactionId: string,
    initialStatus: string,
    userEmail: string,
    amount: number,
    productId: number,
  ): Promise<void> {
    const transaction = new Transaction(
      transactionId,
      initialStatus,
      userEmail,
      amount,
      productId,
    );

    const transactionEntity = TransactionMappers.mapToEntity(transaction);
    await this.transactionRepository.create(transactionEntity);
  }

  generateReference(): string {
    const now = new Date();
    const formattedDate = now.toISOString().replace(/[-:.]/g, '').slice(0, 14);
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    return `ART${formattedDate}${randomSuffix}`;
  }

  generateSignature(reference: string, amount: number): string {
    const amountInCents = amount * 100;
    const dataToSign = `${reference}${amountInCents}COP${this.INTEGRITY_KEY}`;
    return crypto.createHash('sha256').update(dataToSign).digest('hex');
  }

  generateCardData(transactionDto: TransactionDTO): CardData {
    return {
      number: transactionDto.cardNumber,
      cvc: transactionDto.cvc,
      expMonth: transactionDto.expirationMonth,
      expYear: transactionDto.expirationYear,
      cardHolder: transactionDto.cardHolder,
    };
  }

  generatePaymentData(
    transactionDTO: TransactionDTO,
    reference: string,
    signature: string,
    cardToken: string,
    acceptanceToken: string,
  ): PaymentData {
    return {
      amount_in_cents: transactionDTO.amount * 100,
      currency: this.copCurrency,
      signature,
      customer_email: transactionDTO.userEmail,
      reference,
      payment_method: {
        type: this.paymentMethodType,
        installments: transactionDTO.installments,
        token: cardToken,
      },
      acceptance_token: acceptanceToken,
    };
  }

  async getAcceptanceToken(): Promise<string | null> {
    try {
      const response = await this.getRequest(
        `${this.API_URL}${this.ACCEPTANCE_TOKEN}${this.PUBLIC_KEY}`,
      );

      return response.data.data.presigned_acceptance.acceptance_token;
    } catch (error) {
      this.handleError(
        TransactionErrorMessages.ERROR_GETTING_ACCEPTANCE_TOKEN,
        error,
      );
      throw error;
    }
  }

  async getCardToken(tokenCardData: CardData): Promise<string | null> {
    try {
      const response = await this.postRequest(
        `${this.API_URL}${this.TOKENIZATION_CARDS}`,
        this.transformCardDataToSnakeCase(tokenCardData),
        this.PUBLIC_KEY,
      );
      return response.data.data.id;
    } catch (error) {
      this.handleError(
        TransactionErrorMessages.ERROR_GETTING_CARD_TOKEN,
        error,
      );
      throw error;
    }
  }

  transformCardDataToSnakeCase(data: CardData): any {
    return {
      number: data.number,
      cvc: data.cvc,
      exp_month: data.expMonth,
      exp_year: data.expYear,
      card_holder: data.cardHolder,
    };
  }

  async processPayment(paymentData: PaymentData): Promise<void> {
    try {
      await this.postRequest(
        `${this.API_URL}${this.TRANSACTION}`,
        paymentData,
        this.SECRET_KEY,
      );
    } catch (error) {
      this.handleError(
        TransactionErrorMessages.ERROR_PROCESSING_PAYMENTS,
        error,
      );
      throw error;
    }
  }

  async postRequest(url: string, data: any, token: string): Promise<any> {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': this.applicationJson,
          Authorization: `Bearer ${token}`,
        },
      };
      return await axios.post(url, data, config);
    } catch (error) {
      this.handleError(TransactionErrorMessages.ERROR_POST_REQUEST, error);
      throw error;
    }
  }

  async getRequest(url: string): Promise<any> {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': this.applicationJson,
        },
      };
      return await axios.get(url, config);
    } catch (error) {
      this.handleError(TransactionErrorMessages.ERROR_GET_REQUEST, error);
      throw error;
    }
  }

  handleError(message: any, error: any) {
    console.error(message, error.response?.data || error.message);
  }
}
