import { Product } from '../model/product.model';

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(productId: number): Promise<Product | null>;
  updateStock(id: number, quanty: number): Promise<void>;
  create(product: Product): Promise<void>;
}
