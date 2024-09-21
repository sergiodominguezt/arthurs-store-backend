export class TransactionDTO {
    userEmail: string;
    amount: number;
    cardNumber: string;
    expirationMonth: string;
    expirationYear: string;
    cardHolder: string;
    cvc: string;
    installments: number;
}