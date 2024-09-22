import { DeliveryDTO } from 'src/delivery/application/dtos/delivery.dto';
import { TransactionDTO } from './transaction.dto';

export class FullTransactionDTO {
  payment: TransactionDTO;
  delivery: DeliveryDTO;
}
