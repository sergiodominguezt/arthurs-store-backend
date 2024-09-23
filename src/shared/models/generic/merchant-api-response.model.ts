export interface MerchantData {
  id: number;
  name: string;
  email: string;
  contact_name: string;
  phoneNumber: string;
  active: boolean;
  logoUrl: any;
  legalName: string;
  legalIdType: string;
  legalId: string;
  publicKey: string;
  acceptedCurrencies: string[];
  fraudJavascriptKey: any;
  fraudGroups: any[];
  acceptedPaymentMethods: string[];
  paymentMethods: PaymentMethod[];
  presignedAcceptance: PresignedAcceptance;
}

export interface PaymentMethod {
  name: string;
  paymentProcessors: PaymentProcessor[];
}

export interface PaymentProcessor {
  name: string;
}

export interface PresignedAcceptance {
  acceptanceToken: string;
  permalink: string;
  type: string;
}

export interface Meta {}
