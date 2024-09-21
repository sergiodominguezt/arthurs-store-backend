import { Module } from '@nestjs/common';
import { DeliveryService } from './application/services/delivery.service';
import { DeliveryController } from './infrastructure/delivery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [DeliveryService],
  controllers: [DeliveryController]
})
export class DeliveryModule {}
