import { Module } from '@nestjs/common';
import { ProductService } from './application/services/product.service';
import { ProductController } from './infrastructure/product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './infrastructure/entity/product.entity';
import { ProductRepositoryImpl } from './infrastructure/repository/product.repository.impl';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  providers: [
    ProductService,
    { provide: 'ProductRepository', useClass: ProductRepositoryImpl },
  ],
  controllers: [ProductController],
  exports: [ProductService, 'ProductRepository', TypeOrmModule],
})
export class ProductModule {}
