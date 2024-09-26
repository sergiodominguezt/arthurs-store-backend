import { Test, TestingModule } from '@nestjs/testing';
import { TransactionRepositoryImpl } from './transaction.repository.impl';
import { TransactionEntity } from '../entity/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from 'src/transaction/domain/model/transaction.model';

describe('TransactionRepositoryImpl', () => {
  let transactionRepositoryImpl: TransactionRepositoryImpl;
  let transactionRepository: Repository<TransactionEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepositoryImpl,
        {
          provide: getRepositoryToken(TransactionEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    transactionRepositoryImpl = module.get<TransactionRepositoryImpl>(
      TransactionRepositoryImpl,
    );
    transactionRepository = module.get<Repository<TransactionEntity>>(
      getRepositoryToken(TransactionEntity),
    );
  });

  describe('create', () => {
    it('should create transaction', async () => {
      const transaction: Transaction = new Transaction(
        '12345',
        'PENDING',
        'user@example.com',
        1000,
        1,
        2,
      );
      const saveSpy = jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(undefined);

      // Act
      await transactionRepositoryImpl.create(transaction);

      // Assert
      expect(saveSpy).toHaveBeenCalledWith({
        transactionNumber: '12345',
        status: 'PENDING',
        userEmail: 'user@example.com',
        amount: 1000,
        productId: 1,
        productQuantity: 2,
      });
    });
  });

  describe('findAll', () => {
    it('should find all transactions', async () => {
      const entities: TransactionEntity[] = [
        {
          transactionNumber: '12345',
          status: 'PENDING',
          userEmail: 'user@example.com',
          amount: 1000,
          productId: 1,
          productQuantity: 2,
        } as TransactionEntity,
        {
          transactionNumber: '67890',
          status: 'APPROVED',
          userEmail: 'user2@example.com',
          amount: 1500,
          productId: 1,
          productQuantity: 1,
        } as TransactionEntity,
      ];

      jest.spyOn(transactionRepository, 'find').mockResolvedValue(entities);

      const transactions = await transactionRepositoryImpl.findAll();

      expect(transactions).toEqual([
        new Transaction('12345', 'PENDING', 'user@example.com', 1000, 1, 2),
        new Transaction('67890', 'APPROVED', 'user2@example.com', 1500, 1, 1),
      ]);
    });
  });

  describe('findByTransactionNumber', () => {
    it('should find transaction by id', async () => {
      const entity: TransactionEntity = {
        transactionNumber: '12345',
        status: 'PENDING',
        userEmail: 'user@example.com',
        amount: 1000,
        productId: 1,
        productQuantity: 2,
      } as TransactionEntity;

      jest.spyOn(transactionRepository, 'findOneBy').mockResolvedValue(entity);

      const transaction =
        await transactionRepositoryImpl.findByTransactionNumber('12345');

      expect(transaction).toEqual(
        new Transaction('12345', 'PENDING', 'user@example.com', 1000, 1, 2),
      );
    });

    it('should return null if transaction not found', async () => {
      jest.spyOn(transactionRepository, 'findOneBy').mockResolvedValue(null);
      const transaction =
        await transactionRepositoryImpl.findByTransactionNumber('nonexistent');

      expect(transaction).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      const updateSpy = jest
        .spyOn(transactionRepository, 'update')
        .mockResolvedValue(undefined);

      await transactionRepositoryImpl.updateStatus('12345', 'APPROVED');

      expect(updateSpy).toHaveBeenCalledWith(
        { transactionNumber: '12345' },
        { status: 'APPROVED' },
      );
    });
  });
});
