import { Product } from "../model/product.model";

export interface ProductRepository{
    findAll(): Promise<Product[]>;
    findOne(id: number): Promise<Product>;
    updateStock(id: number, quanty: number): Promise<void>;
    create(product: Product): Promise<void>;
}