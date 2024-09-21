import { Transaction } from "../model/transaction.model";

export interface TransactionRepository{
    create(transaction: Transaction): Promise<void>;
    findAll(): Promise<Transaction[]>;
    findOne(id: number): Promise<Transaction>;
}