import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDTO {
  @IsString()
  cardNumber: string;

  @IsString()
  cvv: string;

  @IsString()
  expirationMonth: string;

  @IsString()
  expirationYear: string;

  @IsString()
  cardHolder: string;

  @IsEmail()
  userEmail: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  installments: number;
}
