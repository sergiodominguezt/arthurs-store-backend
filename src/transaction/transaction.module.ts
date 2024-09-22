import { Module } from '@nestjs/common';
import { TransactionService } from './application/service/transaction.service';
import { TransactionController } from './infrastructure/transaction.controller';
import { TransactionRepositoryImpl } from './infrastructure/repository/transaction.repository.impl';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './infrastructure/entity/transaction.entity';
import { ProductModule } from 'src/product/product.module';
import { WebhookController } from './infrastructure/webhook.controller';
import { DeliveryModule } from 'src/delivery/delivery.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity]),
    ProductModule,
    DeliveryModule,
  ],
  providers: [
    TransactionService,
    { provide: 'TransactionRepository', useClass: TransactionRepositoryImpl },
  ],
  controllers: [TransactionController, WebhookController],
  exports: [TransactionService],
})
export class TransactionModule {}
