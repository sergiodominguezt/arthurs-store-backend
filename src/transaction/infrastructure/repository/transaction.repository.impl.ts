import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/transaction/domain/model/transaction.model';
import { TransactionRepository } from 'src/transaction/domain/repository/transaction.repository';
import { TransactionEntity } from '../entity/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionRepositoryImpl implements TransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}

  async create(transaction: Transaction): Promise<void> {
    const entity = new TransactionEntity();
    entity.transactionNumber = transaction.transactionNumber;
    entity.status = transaction.status;
    entity.userEmail = transaction.userEmail;
    entity.amount = transaction.amount;

    await this.transactionRepository.save(entity);
  }

  async findAll(): Promise<Transaction[]> {
    const entities = await this.transactionRepository.find();
    return entities.map(
      (entity) =>
        new Transaction(
          entity.transactionNumber,
          entity.status,
          entity.userEmail,
          entity.amount,
        ),
    );
  }

  async findOne(id: number): Promise<Transaction> {
    const entity = await this.transactionRepository.findOneBy({ id });
    if (!entity) return null;
    return new Transaction(
      entity.transactionNumber,
      entity.status,
      entity.userEmail,
      entity.amount,
    );
  }

  async updateStatus(transactionNumber: string, status: string): Promise<void> {
    await this.transactionRepository.update({ transactionNumber }, { status });
  }
}
