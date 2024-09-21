import { Module } from '@nestjs/common';
import { TransactionService } from './application/service/transaction.service';
import { TransactionController } from './infrastructure/transaction.controller';
import { TransactionRepositoryImpl } from './infrastructure/repository/transaction.repository.impl';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './infrastructure/entity/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  providers: [
    TransactionService,
    { provide: 'TransactionRepository', useClass: TransactionRepositoryImpl },
  ],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
