export interface PaymentMethod {
  type: string;
  installments: number;
  token: string;
}

export interface PaymentData {
  amountInCents: number;
  currency: string;
  signature: string;
  customerEmail: string;
  reference: string;
  paymentMethod: PaymentMethod;
  acceptanceToken: string;
}

export interface CardData {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}
