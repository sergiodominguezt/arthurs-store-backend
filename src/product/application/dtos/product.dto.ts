export class ProductDTO {
  productId: number;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  quantity?: number;
  urlImage?: string;

  constructor(
    productId: number,
    name?: string,
    description?: string,
    price?: number,
    stock?: number,
    urlImage?: string,
  ) {
    this.productId = productId;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.urlImage = urlImage;
  }
}
