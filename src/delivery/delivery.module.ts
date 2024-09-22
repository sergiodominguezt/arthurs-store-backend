import { Module } from '@nestjs/common';
import { DeliveryService } from './application/services/delivery.service';
import { DeliveryController } from './infrastructure/delivery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryEntity } from './infrastructure/entity/delivery.entity';
import { DeliveryRepositoryImpl } from './infrastructure/repository/delivery.repository.impl';
import { ProductModule } from 'src/product/product.module';
import { ProductRepositoryImpl } from 'src/product/infrastructure/repository/product.repository.impl';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryEntity]), ProductModule],
  providers: [
    DeliveryService,
    { provide: 'DeliveryRepository', useClass: DeliveryRepositoryImpl },
  ],
  controllers: [DeliveryController],
  exports: [DeliveryService],
})
export class DeliveryModule {}
