import { Inject, Injectable } from '@nestjs/common';
import { TransactionDTO } from '../dtos/transaction.dto';
import {
  TransactionErrorMessages,
  TransactionTraceMessages,
} from '../../constants/transaction.constants';
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
import { Product } from 'src/product/domain/model/product.model';

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
  ): Promise<{ status: string }> {
    try {
      const productId = transactionDTO.productId;

      const totalAmount = await this.getTotalAmount(
        transactionDTO.productId,
        transactionDTO.productQuantity,
      );
      await this.deliveryService.saveDeliveryInformation(
        deliveryDTO,
        productId,
      );

      const paymentResult = await this.paymentService.processPayment(
        transactionDTO,
        totalAmount,
      );

      await this.saveTransactionToDB(
        paymentResult.id,
        paymentResult.status,
        transactionDTO.userEmail,
        totalAmount,
        transactionDTO.productId,
        transactionDTO.productQuantity,
      );
      return { status: paymentResult.status };
    } catch (error) {
      this.handleError(
        TransactionErrorMessages.ERROR_PROCESSING_TRANSACTION,
        error,
      );
    }
  }

  async getTotalAmount(
    productId: number,
    productQuantity: number,
  ): Promise<number> {
    const productDetails = await this.productService.findById(productId);
    if (!productDetails) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const productTotal = productDetails.price * productQuantity;
    const baseFee = productTotal * this.baseFeePercentage;

    const totalAmount = productTotal + baseFee + this.deliveryFee;
    return totalAmount;
  }

  async handleTransactionUpdate(
    transactionNumber: string,
    status: string,
  ): Promise<void> {
    try {
      const transactionDetails =
        await this.transactionRepository.findByTransactionNumber(
          transactionNumber,
        );

      if (!transactionDetails)
        throw new Error(TransactionErrorMessages.ERROR_TRANSACTION_NOT_FOUND);

      await this.transactionRepository.updateStatus(transactionNumber, status);
      console.log(TransactionTraceMessages.TRANSACTION_STATUS_UPDATED + status);

      const productId = transactionDetails.productId;
      const productQuantity = transactionDetails.productQuantity;

      if (!productId) {
        throw new Error(TransactionErrorMessages.ERROR_PRODUCT_NOT_FOUND);
      }

      if (status === 'APPROVED') {
        await this.productService.updateStock(productId, productQuantity);
        console.log(
          TransactionTraceMessages.STOCK_UPDATED_FOR_PRODUCT + productId,
        );
      } else {
        console.log(
          TransactionTraceMessages.NO_STOCK_UPDATE_FOR_PRODUCT + productId,
        );
      }
    } catch (error) {
      console.error(
        TransactionTraceMessages.ERROR_UPDATING_TRANSACTION + error.message,
      );
    }
  }

  private async saveTransactionToDB(
    transactionId: string,
    initialStatus: string,
    userEmail: string,
    amount: number,
    productId: number,
    productQuantity: number,
  ): Promise<void> {
    const transaction = new Transaction(
      transactionId,
      initialStatus,
      userEmail,
      amount,
      productId,
      productQuantity,
    );

    const transactionEntity = TransactionMappers.mapToEntity(transaction);
    await this.transactionRepository.create(transactionEntity);
  }

  handleError(message: any, error: any) {
    console.error(message, error.response?.data || error.message);
    throw new Error(message);
  }
}
