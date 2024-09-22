import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TransactionService } from '../application/service/transaction.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('transaction-status')
  async handleTransactionStatus(@Body() payload: any) {
    try {
      const { event, data } = payload;

      if (event !== 'transaction.updated') {
        throw new HttpException('Invalid event type', HttpStatus.BAD_REQUEST);
      }

      const transaction = data.transaction;

      if (!transaction || !transaction.id || !transaction.status) {
        throw new HttpException(
          'Invalid transaction data',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.transactionService.handleTransactionUpdate(
        transaction.id,
        transaction.status,
      );

      // Procesa la transacción
      console.log('webhook received');

      return { message: 'Webhook processed successfully' };
    } catch (error) {
      throw new HttpException(
        'Error processing webhook',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
