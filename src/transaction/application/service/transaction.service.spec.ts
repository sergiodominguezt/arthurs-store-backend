import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from '../../domain/repository/transaction.repository';
import { ProductService } from 'src/product/application/services/product.service';
import { DeliveryService } from 'src/delivery/application/services/delivery.service';
import { PaymentService } from 'src/payment/application/payment.service';
import { TransactionDTO } from '../dtos/transaction.dto';
import { DeliveryDTO } from 'src/delivery/application/dtos/delivery.dto';
import {
  TransactionErrorMessages,
  TransactionTraceMessages,
} from '../../constants/transaction.constants';
import { Product } from 'src/product/domain/model/product.model';
import { ProductDTO } from 'src/product/application/dtos/product.dto';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let transactionRepository: TransactionRepository;
  let productService: ProductService;
  let deliveryService: DeliveryService;
  let paymentService: PaymentService;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: 'TransactionRepository',
          useValue: {
            create: jest.fn(),
            findByTransactionNumber: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: ProductService,
          useValue: {
            findById: jest.fn(),
            updateStock: jest.fn(),
          },
        },
        {
          provide: DeliveryService,
          useValue: {
            saveDeliveryInformation: jest.fn(),
          },
        },
        {
          provide: PaymentService,
          useValue: {
            processPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<TransactionRepository>(
      'TransactionRepository',
    );
    productService = module.get<ProductService>(ProductService);
    deliveryService = module.get<DeliveryService>(DeliveryService);
    paymentService = module.get<PaymentService>(PaymentService);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('processTransaction', () => {
    it('should process a transaction successfully', async () => {
      const transactionDTO: TransactionDTO = {
        userEmail: 'test@example.com',
        cardNumber: '4111111111111111',
        cvc: '123',
        expirationMonth: '12',
        expirationYear: '25',
        cardHolder: 'John Doe',
        installments: 1,
        productId: 1,
        productQuantity: 5,
      };
      const deliveryDTO: DeliveryDTO = {
        address: 'Calle siempre viva',
        city: 'Bucaramanga',
        customerName: 'Sergio Dominguez',
      };

      const mockProduct: ProductDTO = {
        productId: 1,
        name: 'Mock product name',
        description: 'Mock description',
        price: 100,
        stock: 10,
        urlImage: 'http://example.com/image.png',
      };

      jest.spyOn(productService, 'findById').mockResolvedValue(mockProduct);
      jest
        .spyOn(deliveryService, 'saveDeliveryInformation')
        .mockResolvedValue(null);
      jest.spyOn(paymentService, 'processPayment').mockResolvedValue({
        id: 'paymentId',
        status: 'APPROVED',
      });
      jest.spyOn(transactionRepository, 'create').mockResolvedValue(null);

      const result = await transactionService.processTransaction(
        transactionDTO,
        deliveryDTO,
      );

      expect(productService.findById).toHaveBeenCalledWith(
        transactionDTO.productId,
      );
      expect(deliveryService.saveDeliveryInformation).toHaveBeenCalledWith(
        deliveryDTO,
        transactionDTO.productId,
      );
      expect(paymentService.processPayment).toHaveBeenCalled();
      expect(transactionRepository.create).toHaveBeenCalled();
      expect(result).toEqual({ status: 'APPROVED' });
    });

    it('should throw an error if processing the transaction fails', async () => {
      const transactionDTO: TransactionDTO = {
        userEmail: 'test@example.com',
        cardNumber: '4111111111111111',
        cvc: '123',
        expirationMonth: '12',
        expirationYear: '25',
        cardHolder: 'John Doe',
        installments: 1,
        productId: 1,
        productQuantity: 5,
      };
      const deliveryDTO: DeliveryDTO = {
        address: 'Calle siempre viva',
        city: 'Bucaramanga',
        customerName: 'Sergio Dominguez',
      };

      const mockProduct: ProductDTO = {
        productId: 1,
        name: 'Mock product name',
        description: 'Mock description',
        price: 100,
        stock: 10,
        urlImage: 'http://example.com/image.png',
      };
      jest.spyOn(productService, 'findById').mockResolvedValue(null);

      await expect(
        transactionService.processTransaction(transactionDTO, deliveryDTO),
      ).rejects.toThrow(TransactionErrorMessages.ERROR_PROCESSING_TRANSACTION);
    });
  });

  describe('getTotalAmount', () => {
    it('should return the correct total amount', async () => {
      const productId = 1;
      const productQuantity = 2;
      const productPrice = 100;

      const mockProduct: ProductDTO = {
        productId: 1,
        name: 'Mock product name',
        description: 'Mock description',
        price: 100,
        stock: 10,
        urlImage: 'http://example.com/image.png',
      };

      jest.spyOn(productService, 'findById').mockResolvedValue(mockProduct);

      const totalAmount = await transactionService.getTotalAmount(
        productId,
        productQuantity,
      );

      const expectedAmount =
        productPrice * productQuantity +
        productPrice * productQuantity * transactionService.baseFeePercentage +
        transactionService.deliveryFee;

      expect(totalAmount).toBe(expectedAmount);
      expect(productService.findById).toHaveBeenCalledWith(productId);
    });

    it('should throw an error if product is not found', async () => {
      const productId = 1;
      const productQuantity = 2;

      jest.spyOn(productService, 'findById').mockResolvedValue(null);

      await expect(
        transactionService.getTotalAmount(productId, productQuantity),
      ).rejects.toThrow(`Product with ID ${productId} not found`);
    });
  });

  describe('handleTransactionUpdate', () => {
    it('should update transaction status and update product stock if approved', async () => {
      const transactionNumber = 'txn123';
      const transactionDetails = {
        productId: 1,
        productQuantity: 2,
        status: 'PENDING',
      };

      const transaction = {
        productId: 1,
        transactionNumber: '15555555-D4293498',
        productQuantity: 2,
        status: 'PENDING',
        userEmail: 'email@email.com',
        amount: 30000,
      };

      jest
        .spyOn(transactionRepository, 'findByTransactionNumber')
        .mockResolvedValue(transaction);
      jest.spyOn(transactionRepository, 'updateStatus').mockResolvedValue(null);
      jest.spyOn(productService, 'updateStock').mockResolvedValue(null);

      await transactionService.handleTransactionUpdate(
        transactionNumber,
        'APPROVED',
      );

      expect(
        transactionRepository.findByTransactionNumber,
      ).toHaveBeenCalledWith(transactionNumber);
      expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
        transactionNumber,
        'APPROVED',
      );
      expect(productService.updateStock).toHaveBeenCalledWith(
        transactionDetails.productId,
        transactionDetails.productQuantity,
      );
    });

    it('should throw an error if transaction is not found', async () => {
      const transactionNumber = 'txn123';

      jest
        .spyOn(transactionRepository, 'findByTransactionNumber')
        .mockResolvedValue(null);

      await transactionService.handleTransactionUpdate(
        transactionNumber,
        'APPROVED',
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          TransactionErrorMessages.ERROR_TRANSACTION_NOT_FOUND,
        ),
      );
    });
  });
});
