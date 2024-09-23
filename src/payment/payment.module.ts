import { Module } from '@nestjs/common';
import { PaymentService } from './application/payment.service';

@Module({
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
