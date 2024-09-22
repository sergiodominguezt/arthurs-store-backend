import { Inject, Injectable } from '@nestjs/common';
import { Product } from 'src/product/domain/model/product.model';
import { ProductRepository } from 'src/product/domain/repository/product.repository';
import { ProductRepositoryImpl } from 'src/product/infrastructure/repository/product.repository.impl';
import { Either, left, right } from 'src/utils/either';

@Injectable()
export class ProductService {
  constructor(
    @Inject('ProductRepository') private productRepository: ProductRepository,
  ) {}

  async listProducts(): Promise<Either<Error, Product[]>> {
    try {
      return right(await this.productRepository.findAll());
    } catch (error) {
      return left(new Error('Failed to list products'));
    }
  }

  async findById(productId: number): Promise<Product | null> {
    return this.productRepository.findById(productId);
  }

  async updateStock(productId: number, quantity: number): Promise<void> {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const newStock = product.stock - quantity;
    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    await this.productRepository.updateStock(productId, newStock);
  }

  async seedDummyData(): Promise<void> {
    const products: Product[] = [
      new Product(0, 'Product 1', 'Description 1', 10.99, 100),
      new Product(0, 'Product 2', 'Description 2', 20.49, 50),
      new Product(0, 'Product 3', 'Description 3', 15.75, 75),
      new Product(0, 'Product 4', 'Description 4', 12.0, 60),
      new Product(0, 'Product 5', 'Description 5', 41.5, 2),
      new Product(0, 'Product 6', 'Description 6', 13.45, 55),
    ];

    for (const product of products) {
      await this.productRepository.create(product);
    }

    console.log('Dummy data seeded successfully!');
  }
}
