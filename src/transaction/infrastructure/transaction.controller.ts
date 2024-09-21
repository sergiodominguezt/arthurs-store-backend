import { Body, Controller, Post } from '@nestjs/common';
import { TransactionService } from '../application/service/transaction.service';
import { TransactionDTO } from '../application/dtos/transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(
    @Body() transactionDto: TransactionDTO,
  ): Promise<{ message: string }> {
    try {
      await this.transactionService.processTransaction(transactionDto);
      return { message: 'Transaction processed successfully' };
    } catch (error) {
      console.error('Error processing transaction:', error.message);
      throw new Error('Transaction processing failed');
    }
  }
}
