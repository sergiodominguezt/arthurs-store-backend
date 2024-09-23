import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entity/product.entity';
import { Product } from 'src/product/domain/model/product.model';
import { ProductRepository } from 'src/product/domain/repository/product.repository';

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const entities = await this.productRepository.find();
    return entities.map(
      (entity) =>
        new Product(
          entity.id,
          entity.name,
          entity.description,
          entity.price,
          entity.stock,
          entity.imageUrl,
        ),
    );
  }

  async findById(productId: number): Promise<Product | null> {
    const entity = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!entity) return null;

    return new Product(
      entity.id,
      entity.name,
      entity.description,
      entity.price,
      entity.stock,
      entity.imageUrl,
      entity.deliveries,
    );
  }

  async updateStock(productId: number, newStock: number): Promise<void> {
    await this.productRepository.update(productId, { stock: newStock });
  }

  async create(product: Product): Promise<void> {
    const entity = new ProductEntity();
    entity.id = product.id;
    entity.name = product.name;
    entity.description = product.description;
    entity.price = product.price;
    entity.stock = product.stock;
    entity.imageUrl = product.urlImage;

    await this.productRepository.save(entity);
  }
}
