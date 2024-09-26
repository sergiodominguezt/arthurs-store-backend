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
        'Laptop Backpack',
        'A cool laptop backpack',
        700000,
        50,
        'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
      ),
      new Product(
        0,
        'Casual T-Shirt for Men',
        'Slim-fitting style, t-shoty for men',
        30000,
        20,
        'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
      ),
      new Product(
        0,
        'Mens Cotton Jacket',
        'Great outerwear jackets for spring, autumn, or winter',
        135000,
        75,
        'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
      ),
      new Product(
        0,
        'Mens Casual Slim Fit',
        'An aweome shirt for men',
        35000,
        60,
        'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg',
      ),
      new Product(
        0,
        "Women's Gold & Silver Bracelet",
        'A very cool bracelet',
        200000,
        2,
        'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg',
      ),
      new Product(
        0,
        'Solid Gold Petite Micropave',
        'A very cool jewlery for women',
        149000,
        55,
        'https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg',
      ),
      new Product(
        0,
        'White Gold Plated Princess',
        'A great diamond engagement ring for her',
        1300000,
        3,
        'https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg',
      ),
      new Product(
        0,
        'Gold-plated Earrings',
        'Rose Gold Plated Double Flared Tunnel Plug Earrings',
        149000,
        55,
        'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg',
      ),
    ];

    for (const product of products) {
      await this.productRepository.create(product);
    }

    console.log('Dummy data seeded successfully!');
  }
}
