import { Module } from '@nestjs/common';
import { TransactionService } from './application/service/transaction.service';
import { TransactionController } from './infrastructure/transaction.controller';

@Module({
  providers: [TransactionService],
  controllers: [TransactionController]
})
export class TransactionModule {}
