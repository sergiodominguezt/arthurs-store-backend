import { Transaction } from '../model/transaction.model';

export interface TransactionRepository {
  create(transaction: Transaction): Promise<void>;
  findAll(): Promise<Transaction[]>;
  findByTransactionNumber(
    transactionNumber: string,
  ): Promise<Transaction | null>;
  updateStatus(transactionNumber: string, status: string): Promise<void>;
}
