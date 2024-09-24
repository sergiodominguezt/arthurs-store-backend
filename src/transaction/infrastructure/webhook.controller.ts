import * as dotenv from 'dotenv';
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { TransactionService } from '../application/service/transaction.service';
import { ResourceNaming } from '../constants/resource.constants';
import { WebhookService } from '../application/service/webhook.service';
import { TransactionEvent } from 'src/shared/models/generic/event-response.model';
import toCamelCase from 'src/utils/to-camel-case';
import { WebhookTraceMessages } from '../constants/webhook.constants';

dotenv.config();

@Controller(ResourceNaming.WEBHOOK_RESOURCE)
export class WebhookController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly webhookService: WebhookService,
  ) {}

  private readonly EVENTS_SECRET = process.env.EVENT_SECRET;
  @Post(ResourceNaming.TRANSACTION_STATUS_RESOURCE)
  async handleTransactionStatus(@Body() event: any) {
    try {
      const camelCaseEvent = toCamelCase(event);

      const generatedChecksum = this.webhookService.verifyWebhook(
        camelCaseEvent,
        this.EVENTS_SECRET,
      );
      const receivedChecksum = camelCaseEvent.signature.checksum;

      if (generatedChecksum.toLowerCase() !== receivedChecksum) {
        throw new BadRequestException('Invalid checksum');
      }

      await this.transactionService.handleTransactionUpdate(
        camelCaseEvent.data.transaction.id,
        camelCaseEvent.data.transaction.status,
      );

      console.log(WebhookTraceMessages.WEBHOOK_RECEIVED);
      return { message: WebhookTraceMessages.WEBHOOK_PROCESSED_SUCCESSFULL };
    } catch (error) {
      throw new HttpException(
        WebhookTraceMessages.ERROR_WEBHOOK,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
