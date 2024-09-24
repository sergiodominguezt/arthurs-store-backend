import { DeliveryDTO } from 'src/delivery/application/dtos/delivery.dto';
import { TransactionDTO } from './transaction.dto';
import { ProductDTO } from 'src/product/application/dtos/product.dto';

export class FullTransactionDTO {
  payment: TransactionDTO;
  delivery: DeliveryDTO;
}
