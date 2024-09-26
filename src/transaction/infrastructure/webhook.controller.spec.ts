import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { TransactionService } from '../application/service/transaction.service';
import { WebhookService } from '../application/service/webhook.service';
import { NotificationGateway } from 'src/utils/notification-gateway';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { WebhookTraceMessages } from '../constants/webhook.constants';

describe('WebhookController', () => {
  let webhookController: WebhookController;
  let transactionService: TransactionService;
  let webhookService: WebhookService;
  let notificationGateway: NotificationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            handleTransactionUpdate: jest.fn(),
          },
        },
        {
          provide: WebhookService,
          useValue: {
            verifyWebhook: jest.fn(),
          },
        },
        {
          provide: NotificationGateway,
          useValue: {
            notifyTransactionStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    webhookController = module.get<WebhookController>(WebhookController);
    transactionService = module.get<TransactionService>(TransactionService);
    webhookService = module.get<WebhookService>(WebhookService);
    notificationGateway = module.get<NotificationGateway>(NotificationGateway);
  });

  describe('handleTransactionStatus', () => {
    it('should handle a successfull webhook transaction', async () => {
      const event = {
        signature: { checksum: 'validchecksum' },
        data: {
          transaction: {
            id: '12345',
            status: 'APPROVED',
          },
        },
      };
      const generatedChecksum = 'validchecksum';

      jest
        .spyOn(webhookService, 'verifyWebhook')
        .mockReturnValue(generatedChecksum);

      const result = await webhookController.handleTransactionStatus(event);

      expect(webhookService.verifyWebhook).toHaveBeenCalledWith(
        event,
        process.env.EVENT_SECRET,
      );
      expect(transactionService.handleTransactionUpdate).toHaveBeenCalledWith(
        event.data.transaction.id,
        event.data.transaction.status,
      );
      expect(notificationGateway.notifyTransactionStatus).toHaveBeenCalledWith(
        event.data.transaction.id,
        event.data.transaction.status,
      );
      expect(result).toEqual({
        message: WebhookTraceMessages.WEBHOOK_PROCESSED_SUCCESSFULL,
      });
    });

    it('should throw BadRequestException if checksum is invalid', async () => {
      // Arrange
      const event = {
        signature: { checksum: 'invalidchecksum' },
        data: {
          transaction: {
            id: '12345',
            status: 'APPROVED',
          },
        },
      };
      const generatedChecksum = 'validchecksum';

      jest
        .spyOn(webhookService, 'verifyWebhook')
        .mockReturnValue(generatedChecksum);

      await expect(
        webhookController.handleTransactionStatus(event),
      ).rejects.toThrow(new BadRequestException('Error processing webhook'));
      expect(webhookService.verifyWebhook).toHaveBeenCalledWith(
        event,
        process.env.EVENT_SECRET,
      );
      expect(transactionService.handleTransactionUpdate).not.toHaveBeenCalled();
      expect(
        notificationGateway.notifyTransactionStatus,
      ).not.toHaveBeenCalled();
    });

    it('should throw HttpException', async () => {
      const event = {
        signature: { checksum: 'validchecksum' },
        data: {
          transaction: {
            id: '12345',
            status: 'APPROVED',
          },
        },
      };
      const generatedChecksum = 'validchecksum';

      jest
        .spyOn(webhookService, 'verifyWebhook')
        .mockReturnValue(generatedChecksum);
      jest
        .spyOn(transactionService, 'handleTransactionUpdate')
        .mockRejectedValue(new Error('DB Error'));

      await expect(
        webhookController.handleTransactionStatus(event),
      ).rejects.toThrow(
        new HttpException(
          WebhookTraceMessages.ERROR_WEBHOOK,
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(webhookService.verifyWebhook).toHaveBeenCalledWith(
        event,
        process.env.EVENT_SECRET,
      );
      expect(transactionService.handleTransactionUpdate).toHaveBeenCalledWith(
        event.data.transaction.id,
        event.data.transaction.status,
      );
      expect(
        notificationGateway.notifyTransactionStatus,
      ).not.toHaveBeenCalled();
    });
  });
});
