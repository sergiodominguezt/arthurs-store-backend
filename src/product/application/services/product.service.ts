import { Inject, Injectable } from '@nestjs/common';
import { Product } from 'src/product/domain/model/product.model';
import { ProductRepository } from 'src/product/domain/repository/product.repository';
import { Either, left, right } from 'src/utils/either';
import { ProductDTO } from '../dtos/product.dto';
import { toProductDTO } from 'src/product/mappers/product.mapper';

@Injectable()
export class ProductService {
  constructor(
    @Inject('ProductRepository') private productRepository: ProductRepository,
  ) {}

  async listProducts(): Promise<Either<Error, ProductDTO[]>> {
    try {
      const products = await this.productRepository.findAll();
      const productDTOs = products.map(toProductDTO);
      return right(productDTOs);
    } catch (error) {
      return left(new Error('Failed to list products'));
    }
  }

  // async listProducts(): Promise<Either<Error, Product[]>> {
  //   try {
  //     const products = await this.productRepository.findAll();
  //     const productDTOs = products.map(toProductDTO);
  //     return right(products);
  //   } catch (error) {
  //     return left(new Error('Failed to list products'));
  //   }
  // }

  async findById(productId: number): Promise<ProductDTO | null> {
    const product = await this.productRepository.findById(productId);
    return product ? toProductDTO(product) : null;
  }

  async updateStock(productId: number, quantity: number): Promise<void> {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const newStock = product.stock - quantity;
    if (newStock < 0) {
      console.error('Insufficient stock');
      throw new Error('Insufficient stock');
    }

    await this.productRepository.updateStock(productId, newStock);
  }

  async seedDummyData(): Promise<void> {
    const products: Product[] = [
      new Product(
        0,
        'Product 1',
        'Description 1',
        2000,
        100,
        'https://fastly.picsum.photos/id/26/4209/2769.jpg?hmac=vcInmowFvPCyKGtV7Vfh7zWcA_Z0kStrPDW3ppP0iGI',
      ),
      new Product(
        0,
        'Product 2',
        'Description 2',
        3000,
        50,
        'https://fastly.picsum.photos/id/25/5000/3333.jpg?hmac=yCz9LeSs-i72Ru0YvvpsoECnCTxZjzGde805gWrAHkM',
      ),
      new Product(
        0,
        'Product 3',
        'Description 3',
        400000,
        75,
        'https://fastly.picsum.photos/id/24/4855/1803.jpg?hmac=ICVhP1pUXDLXaTkgwDJinSUS59UWalMxf4SOIWb9Ui4',
      ),
      new Product(
        0,
        'Product 4',
        'Description 4',
        200000,
        60,
        'https://fastly.picsum.photos/id/29/4000/2670.jpg?hmac=rCbRAl24FzrSzwlR5tL-Aqzyu5tX_PA95VJtnUXegGU',
      ),
      new Product(
        0,
        'Product 5',
        'Description 5',
        50000,
        2,
        'https://fastly.picsum.photos/id/29/4000/2670.jpg?hmac=rCbRAl24FzrSzwlR5tL-Aqzyu5tX_PA95VJtnUXegGU',
      ),
      new Product(
        0,
        'Product 6',
        'Description 6',
        75000,
        55,
        'https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I',
      ),
    ];

    for (const product of products) {
      await this.productRepository.create(product);
    }

    console.log('Dummy data seeded successfully!');
  }
}
