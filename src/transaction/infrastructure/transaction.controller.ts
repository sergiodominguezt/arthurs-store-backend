import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { TransactionService } from '../application/service/transaction.service';
import { TransactionDTO } from '../application/dtos/transaction.dto';
import { AllExceptionsFilter } from 'src/shared/filters/all-exceptions.filter';
import { ResourceNaming } from '../constants/resource.constants';
import { DeliveryDTO } from 'src/delivery/application/dtos/delivery.dto';
import { FullTransactionDTO } from '../application/dtos/full.transaction.dto';

@Controller(ResourceNaming.PROCESS_PAYMENT_RESOURCE)
@UseFilters(AllExceptionsFilter)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(
    @Body() transactionDto: FullTransactionDTO,
  ): Promise<{ message: string; status: string }> {
    try {
      const result = await this.transactionService.processTransaction(
        transactionDto.payment,
        transactionDto.delivery,
      );
      return {
        message: 'Transaction processed successfully',
        status: result.status,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'An error ocurred while processing the transaction',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
