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

  // @Post()
  // async createTransaction(
  //   @Body() transactionDto: TransactionDTO,
  //   @Body() deliveryDTO: DeliveryDTO,
  // ): Promise<{ message: string }> {
  //   try {
  //     await this.transactionService.processTransaction(
  //       transactionDto,
  //       deliveryDTO,
  //     );
  //     return { message: 'Transaction processed successfully' };
  //   } catch (error) {
  //     throw new HttpException(
  //       error.message || 'An error ocurred while processing the transaction',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }
  @Post()
  async createTransaction(
    @Body() transactionDto: FullTransactionDTO,
  ): Promise<{ message: string }> {
    try {
      await this.transactionService.processTransaction(
        transactionDto.payment,
        transactionDto.delivery,
      );
      return { message: 'Transaction processed successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'An error ocurred while processing the transaction',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
