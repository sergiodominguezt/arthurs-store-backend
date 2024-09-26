import { Module } from '@nestjs/common';
import { TransactionService } from './application/service/transaction.service';
import { TransactionController } from './infrastructure/transaction.controller';
import { TransactionRepositoryImpl } from './infrastructure/repository/transaction.repository.impl';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './infrastructure/entity/transaction.entity';
import { ProductModule } from 'src/product/product.module';
import { WebhookController } from './infrastructure/webhook.controller';
import { DeliveryModule } from 'src/delivery/delivery.module';
import { PaymentModule } from 'src/payment/payment.module';
import { WebhookService } from './application/service/webhook.service';
import { NotificationGateway } from 'src/utils/notification-gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity]),
    ProductModule,
    DeliveryModule,
    PaymentModule,
  ],
  providers: [
    TransactionService,
    WebhookService,
    NotificationGateway,
    { provide: 'TransactionRepository', useClass: TransactionRepositoryImpl },
  ],
  controllers: [TransactionController, WebhookController],
  exports: [TransactionService, WebhookService, NotificationGateway],
})
export class TransactionModule {}
