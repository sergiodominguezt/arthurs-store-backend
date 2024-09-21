export interface PaymentMethod {
    type: string;
    installments: number;
    token: string;
}

export interface PaymentData {
    amount_in_cents: number;
    currency: string;
    signature: string;
    customer_email: string;
    reference: string;
    payment_method: PaymentMethod;
    acceptance_token: string;
}