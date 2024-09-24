export interface TransactionEvent {
  event: string;
  data: {
    transaction: {
      id: string;
      amountInCents: number;
      reference: string;
      customerEmail: string;
      currency: string;
      paymentMethodType: string;
      redirectUrl: string;
      status: string;
      shippingAddress: string | null;
      paymentLinkId: string | null;
      paymentSourceId: string | null;
    };
  };
  environment: string;
  signature: {
    properties: string[];
    checksum: string;
  };
  timestamp: number;
  sentAt: string;
}
