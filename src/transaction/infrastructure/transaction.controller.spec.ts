import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from '../application/service/transaction.service';
import { FullTransactionDTO } from '../application/dtos/full.transaction.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('TransactionController', () => {
  let transactionController: TransactionController;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            processTransaction: jest.fn(),
          },
        },
      ],
    }).compile();

    transactionController = module.get<TransactionController>(
      TransactionController,
    );
    transactionService = module.get<TransactionService>(TransactionService);
  });

  describe('createTransaction', () => {
    it('should process a transaction successfully', async () => {
      const transactionDto: FullTransactionDTO = {
        payment: {
          productId: 1,
          productQuantity: 1,
          userEmail: 'email@email.com',
          cardHolder: 'Sergio Dominguez',
          cardNumber: '4444444444444444',
          cvc: '123',
          expirationMonth: '08',
          expirationYear: '28',
          installments: 1,
          amount: 100000,
        },
        delivery: {
          address: 'Calle siempre viva',
          city: 'Bucaramanga',
          customerName: 'Sergio Dominguez',
        },
      };

      const result = { status: 'APPROVED' };

      jest
        .spyOn(transactionService, 'processTransaction')
        .mockResolvedValue(result);

      const response =
        await transactionController.createTransaction(transactionDto);

      expect(response).toEqual({
        message: 'Transaction processed successfully',
        status: result.status,
      });
      expect(transactionService.processTransaction).toHaveBeenCalledWith(
        transactionDto.payment,
        transactionDto.delivery,
      );
    });

    it('should throw an error when transaction processing fails', async () => {
      const transactionDto: FullTransactionDTO = {
        payment: {
          productId: 1,
          productQuantity: 1,
          userEmail: 'email@email.com',
          cardHolder: 'Sergio Dominguez',
          cardNumber: '4444444444444444',
          cvc: '123',
          expirationMonth: '08',
          expirationYear: '28',
          installments: 1,
          amount: 100000,
        },
        delivery: {
          address: 'Calle siempre viva',
          city: 'Bucaramanga',
          customerName: 'Sergio Dominguez',
        },
      };

      const error = new Error('Transaction failed');
      jest
        .spyOn(transactionService, 'processTransaction')
        .mockRejectedValue(error);

      // Act & Assert
      await expect(
        transactionController.createTransaction(transactionDto),
      ).rejects.toThrow(HttpException);
      await expect(
        transactionController.createTransaction(transactionDto),
      ).rejects.toThrow(
        new HttpException('Transaction failed', HttpStatus.BAD_REQUEST),
      );

      expect(transactionService.processTransaction).toHaveBeenCalledWith(
        transactionDto.payment,
        transactionDto.delivery,
      );
    });

    it('should throw a generic error if the message is not available', async () => {
      const transactionDto: FullTransactionDTO = {
        payment: {
          productId: 1,
          productQuantity: 1,
          userEmail: 'email@email.com',
          cardHolder: 'Sergio Dominguez',
          cardNumber: '4444444444444444',
          cvc: '123',
          expirationMonth: '08',
          expirationYear: '28',
          installments: 1,
          amount: 100000,
        },
        delivery: {
          address: 'Calle siempre viva',
          city: 'Bucaramanga',
          customerName: 'Sergio Dominguez',
        },
      };

      const error = {};
      jest
        .spyOn(transactionService, 'processTransaction')
        .mockRejectedValue(error);

      await expect(
        transactionController.createTransaction(transactionDto),
      ).rejects.toThrow(HttpException);
      await expect(
        transactionController.createTransaction(transactionDto),
      ).rejects.toThrow(
        new HttpException(
          'An error ocurred while processing the transaction',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
