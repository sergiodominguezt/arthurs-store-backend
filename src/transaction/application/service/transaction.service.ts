import { Inject, Injectable } from '@nestjs/common';
import { TransactionDTO } from '../dtos/transaction.dto';
import { TransactionErrorMessages } from '../../constants/transaction.constants';
import axios, { AxiosRequestConfig } from 'axios';
import { PaymentData } from '../../domain/interfaces/payment-data.interface';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { CardData } from '../../domain/interfaces/card-data.interface';
import { TransactionRepository } from '../../domain/repository/transaction.repository';
import { Transaction } from '../../domain/model/transaction.model';
import { TransactionMappers } from '../../infrastructure/mappers/transaction.mappers';
import { ProductService } from 'src/product/application/services/product.service';
import { DeliveryService } from 'src/delivery/application/services/delivery.service';
import { DeliveryDTO } from 'src/delivery/application/dtos/delivery.dto';
import { ProductDTO } from 'src/product/application/dtos/product.dto';
import { PaymentService } from 'src/payment/application/payment.service';

dotenv.config();

@Injectable()
export class TransactionService {
  traceMessagePaymentRequest = 'Payment request sent, Transaction ID is:';
  traceMessagePendingStatus = 'Transaction created with status:';
  approvedStatus = 'APPROVED';
  deliveryFee = 15000;
  baseFeePercentage = 0.015;

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    private readonly productService: ProductService,
    private readonly deliveryService: DeliveryService,
    private readonly paymentService: PaymentService,
  ) {}

  async processTransaction(
    transactionDTO: TransactionDTO,
    deliveryDTO: DeliveryDTO,
    productDTO: ProductDTO,
  ): Promise<void> {
    try {
      const productId = transactionDTO.productId;

      const totalAmount = await this.getTotalAmount(productDTO);
      await this.deliveryService.saveDeliveryInformation(
        deliveryDTO,
        productId,
      );

      await this.paymentService.processPayment(transactionDTO, totalAmount);
    } catch (error) {
      this.handleError(
        TransactionErrorMessages.ERROR_PROCESSING_TRANSACTION,
        error,
      );
    }
  }

  async getTotalAmount(productDTO: ProductDTO): Promise<number> {
    const productDetails = await this.productService.findById(
      productDTO.productId,
    );
    if (!productDetails) {
      throw new Error(`Product with ID ${productDTO.productId} not found`);
    }

    const productTotal = productDetails.price * productDTO.quantity;
    const baseFee = productTotal * this.baseFeePercentage;

    const totalAmount = productTotal + baseFee + this.deliveryFee;
    console.log(totalAmount);
    return totalAmount;
  }

  async handleTransactionUpdate(
    transactionNumber: string,
    status: string,
    quantity: number,
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
        await this.productService.updateStock(productId, quantity);
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

  handleError(message: any, error: any) {
    console.error(message, error.response?.data || error.message);
    throw new Error(message);
  }
}
