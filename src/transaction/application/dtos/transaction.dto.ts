import { ProductDTO } from 'src/product/application/dtos/product.dto';

export class TransactionDTO {
  userEmail: string;
  amount?: number;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cardHolder: string;
  cvc: string;
  installments: number;
  productId: number;
  productQuantity: number;
}
