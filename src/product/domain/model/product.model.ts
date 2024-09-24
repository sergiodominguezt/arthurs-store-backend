import { Delivery } from 'src/delivery/domain/model/delivery.model';

export class Product {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public price: number,
    public stock: number,
    public urlImage: string,
  ) {}
}
