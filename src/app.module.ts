import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product/application/services/product.service';
import { ProductModule } from './product/product.module';
import { TransactionModule } from './transaction/transaction.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProductModule,
    TransactionModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly productService: ProductService) {}

  onModuleInit() {
    this.productService.seedDummyData();
  }
}
