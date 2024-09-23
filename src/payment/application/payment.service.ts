import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import {
  CardData,
  PaymentData,
  PaymentMethod,
} from '../domain/interfaces/payment-data.interface';
import { TransactionDTO } from 'src/transaction/application/dtos/transaction.dto';
import { ApiResponse } from 'src/shared/models/generic/api-response.model';
import { ArthompiResponse } from 'src/shared/models/generic/arthompi-response.model';
import toSnakeCase from 'src/utils/to-snake-case';
import { CardTokenResponse } from 'src/shared/models/generic/token-card-response.model';
import toCamelCase from 'src/utils/to-camel-case';
import { MerchantData } from 'src/shared/models/generic/merchant-api-response.model';
import { ApiResponseCard } from 'src/shared/models/generic/api-response-card.model';
import { PaymentTraceMessage } from '../constants/payment-trace-message.constant';

dotenv.config();

@Injectable()
export class PaymentService {
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
  deliveryFee = 15000;
  baseFeePercentage = 0.015;

  constructor() {}

  async processPayment(transactionDTO: TransactionDTO, totalAmount: number) {
    const [acceptanceToken, cardToken] = await Promise.all([
      this.getAcceptanceToken(),
      this.getCardToken(transactionDTO),
    ]);

    if (!acceptanceToken)
      throw new Error(PaymentTraceMessage.ERROR_ACCEPTANCE_TOKEN);

    if (!cardToken)
      throw new Error(PaymentTraceMessage.ERROR_GETTING_CARD_TOKEN);

    const reference = this.generateReference();
    const signature = this.generateSignature(reference, totalAmount);

    const paymentData = this.generatePaymentData(
      transactionDTO,
      reference,
      signature,
      cardToken,
      acceptanceToken,
      totalAmount,
    );

    await this.sendPaymentRequest(paymentData);
  }

  async sendPaymentRequest(
    paymentData: PaymentData,
  ): Promise<{ id: string; status: string }> {
    try {
      const response = await axios.post<ApiResponse<ArthompiResponse>>(
        `${this.API_URL}${this.TRANSACTION}`,
        toSnakeCase(paymentData),
        {
          headers: {
            'Content-Type': this.applicationJson,
            Authorization: `Bearer ${this.SECRET_KEY}`,
          },
        },
      );

      const camelCaseResponse = toCamelCase(response.data);
      const { id, status } = camelCaseResponse.data;

      console.log(`${this.traceMessagePendingStatus} ${status}`);
      console.log(`${this.traceMessagePaymentRequest} ${id}`);
      return { id, status };
    } catch (error) {
      this.handleError(
        PaymentTraceMessage.ERROR_SENDING_PAYMENT_REQUEST,
        error,
      );
      throw error;
    }
  }

  generatePaymentData(
    transactionDTO,
    reference,
    signature,
    cardToken,
    acceptanceToken,
    totalAmount,
  ): PaymentData {
    const paymentMethod: PaymentMethod = {
      type: this.paymentMethodType,
      installments: transactionDTO.installments,
      token: cardToken,
    };

    const paymentData: PaymentData = {
      amountInCents: totalAmount * 100,
      currency: this.copCurrency,
      reference: reference,
      signature: signature,
      customerEmail: transactionDTO.userEmail,
      paymentMethod: paymentMethod,
      acceptanceToken: acceptanceToken,
    };

    return paymentData;
  }

  async getAcceptanceToken(): Promise<string | null> {
    try {
      const response = await axios.get<ApiResponse<MerchantData>>(
        `${this.API_URL}${this.ACCEPTANCE_TOKEN}${this.PUBLIC_KEY}`,
        { headers: { 'Content-Type': this.applicationJson } },
      );

      const responseToCamelCase = toCamelCase(response.data);
      return responseToCamelCase.data.presignedAcceptance.acceptanceToken;
    } catch (error) {
      this.handleError(
        PaymentTraceMessage.ERROR_GETTING_ACCEPTANCE_TOKEN,
        error,
      );
      throw error;
    }
  }

  async getCardToken(transactionDTO: TransactionDTO): Promise<string | null> {
    try {
      const cardData = await this.generateCardData(transactionDTO);
      const response = await axios.post<ApiResponseCard<CardTokenResponse>>(
        `${this.API_URL}${this.TOKENIZATION_CARDS}`,
        toSnakeCase(cardData),
        {
          headers: {
            'Content-Type': this.applicationJson,
            Authorization: `Bearer ${this.PUBLIC_KEY}`,
          },
        },
      );
      const camelCaseResponse = toCamelCase(response.data);

      return camelCaseResponse.data.id;
    } catch (error) {
      this.handleError(PaymentTraceMessage.ERROR_GETTING_CARD_TOKEN, error);
      throw error;
    }
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

  handleError(message: any, error: any) {
    console.error(message, error.response?.data || error.message);
    throw new Error(message);
  }
}
