import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductEntity } from "../entity/product.entity";
import { Product } from "src/product/domain/model/product.model";
import { ProductRepository } from "src/product/domain/repository/product.repository";

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
    constructor(
        @InjectRepository(ProductEntity)
        private productRepository: Repository<ProductEntity>
    ){}

    async findAll(): Promise<Product[]> {
        const entities = await this.productRepository.find();
        return entities.map(entity => new Product(
            entity.id,
            entity.name,
            entity.description,
            entity.price,
            entity.stock,
        ));
    }

    async findOne(id: number): Promise<Product> {
        const entity = await this.productRepository.findOneBy({ id });
        if (!entity) return null;
        return new Product(
            entity.id,
            entity.name,
            entity.description,
            entity.price,
            entity.stock
        );
    }

    async updateStock(id: number, quantity: number): Promise<void> {
        await this.productRepository.update(id, { stock: quantity });
    }

    async create(product: Product): Promise<void> {
        const entity = new ProductEntity();
        entity.id = product.id;
        entity.name = product.name;
        entity.description = product.description;
        entity.price = product.price;
        entity.stock = product.stock

        await this.productRepository.save(entity);
    }
}