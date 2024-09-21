import { Injectable } from '@nestjs/common';
import { TransactionDTO } from '../dtos/transaction.dto';
import { TransactionConstants } from 'src/transaction/constant/transaction.constants';
import axios from 'axios';
import { PaymentData } from 'src/transaction/domain/interfaces/payment-data.interface';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { CardData } from 'src/transaction/domain/interfaces/card-data.interface';

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

  copCurrency = 'COP';
  paymentMethodType = 'CARD';
  transactionConstants: any = TransactionConstants;

  constructor() {}

  async processTransaction(transactionDTO: TransactionDTO): Promise<void> {
    const acceptanceToken = await this.getAcceptanceToken();
    const cardData = this.generateCardData(transactionDTO);
    const cardToken = await this.getCardToken(cardData);

    if (!acceptanceToken) {
      throw new Error('Could not retrieve acceptance token');
    }

    const reference = this.generateReference();
    const signature = this.generateSignature(reference, transactionDTO.amount);

    const paymentData: PaymentData = {
      amount_in_cents: transactionDTO.amount * 100,
      currency: this.copCurrency,
      signature: signature,
      customer_email: transactionDTO.userEmail,
      reference: reference,
      payment_method: {
        type: this.paymentMethodType,
        installments: transactionDTO.installments,
        token: cardToken,
      },
      acceptance_token: acceptanceToken,
    };

    await this.sendPaymentRequest(paymentData);
  }

  private async sendPaymentRequest(paymentData: PaymentData): Promise<void> {
    try {
      const response = await axios.post(
        this.API_URL + this.TRANSACTION,
        paymentData,
        {
          headers: {
            'Content-Type': this.applicationJson,
            Authorization: `Bearer ${this.SECRET_KEY}`,
          },
        },
      );
      const status = response.data.data.status;
      console.log('Transaction status', status);
      console.log('Transaction id:', response.data.data.id);
    } catch (error) {
      console.error('Error processing payment:', error.response.data);
    }
  }

  generateReference(): string {
    const now = new Date();
    const formattedDate = now.toISOString().replace(/[-:.]/g, '').slice(0, 14);
    return `ART${formattedDate}`;
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

  async getAcceptanceToken(): Promise<string | null> {
    try {
      const response = await axios.get(
        this.API_URL + this.ACCEPTANCE_TOKEN + this.PUBLIC_KEY,
        {
          headers: {
            'Content-Type': this.applicationJson,
          },
        },
      );
      return response.data.data.presigned_acceptance.acceptance_token;
    } catch (error) {
      console.error(
        this.transactionConstants.ERROR_GETTING_ACCEPTANCE_TOKEN,
        error.message,
      );
    }
  }

  async getCardToken(tokenCardData: CardData): Promise<string | null> {
    try {
      const response = await axios.post(
        this.API_URL + this.TOKENIZATION_CARDS,
        this.transformCardDataToSnakeCase(tokenCardData),
        {
          headers: {
            'Content-Type': this.applicationJson,
            Authorization: `Bearer ${this.PUBLIC_KEY}`,
          },
        },
      );

      return response.data.data.id;
    } catch (error) {
      console.error(
        this.transactionConstants.ERROR_GETTING_CARD_TOKEN,
        error.response.data,
      );
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
      const response = await axios.post(
        this.API_URL + this.TRANSACTION,
        paymentData,
        {
          headers: {
            'Content-Type': this.applicationJson,
            Authorization: `Bearer ${this.SECRET_KEY}`,
          },
        },
      );

      if (response.data.status === 'SUCCESS') {
        console.log('Payment processed successfully:', response.data);
      } else {
        console.error('Payment failed:', response.data);
      }
    } catch (error) {
      console.error('Error processing payment:', error.message);
    }
  }
}
