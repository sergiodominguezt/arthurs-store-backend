import { Transaction } from '../../domain/model/transaction.model';
import { TransactionEntity } from '../entity/transaction.entity';

export class TransactionMappers {
  static mapToEntity(transaction: Transaction) {
    const transactionEntity = new TransactionEntity();
    transactionEntity.transactionNumber = transaction.transactionNumber;
    transactionEntity.status = transaction.status;
    transactionEntity.userEmail = transaction.userEmail;
    transactionEntity.amount = transaction.amount;
    transactionEntity.productId = transaction.productId;
    transactionEntity.productQuantity = transaction.productQuantity;
    return transactionEntity;
  }

  static toModel(entity: TransactionEntity) {
    return new Transaction(
      entity.transactionNumber,
      entity.status,
      entity.userEmail,
      entity.amount,
      entity.productId,
      entity.productQuantity,
    );
  }
}
