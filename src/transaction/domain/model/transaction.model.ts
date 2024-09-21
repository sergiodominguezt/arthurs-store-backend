export class Transaction {
  constructor(
    public transactionNumber: string,
    public status: string,
    public userEmail: string,
    public amount: number,
  ) {}
}
