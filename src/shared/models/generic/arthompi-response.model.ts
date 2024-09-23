export interface ArthompiResponse {
  id: string;
  createdAt: string;
  amountInCents: number;
  status: string;
  reference: string;
  customerEmail: string;
  currency: string;
  paymentMethodType: string;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  redirectUrl: string;
  paymentLinkId: any;
}

export interface PaymentMethod {
  type: string;
  phoneNumber: number;
}

export interface ShippingAddress {
  addressLine1: string;
  country: string;
  region: string;
  city: string;
  phoneNumber: number;
}
