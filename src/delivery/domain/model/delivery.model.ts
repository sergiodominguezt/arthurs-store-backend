export class Delivery {
  constructor(
    public id: number,
    public address: string,
    public city: string,
    public customerName: string,
    public productId?: number,
  ) {}
}
