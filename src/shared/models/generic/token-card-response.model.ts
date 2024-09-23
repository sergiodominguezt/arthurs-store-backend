export interface CardTokenResponse {
  id: string;
  createdAt: string;
  brand: string;
  name: string;
  lastFour: string;
  bin: string;
  expYear: string;
  expMonth: string;
  cardHolder: string;
  createdWithCvc: boolean;
  expiresAt: string;
  validityEndsAt: string;
}
