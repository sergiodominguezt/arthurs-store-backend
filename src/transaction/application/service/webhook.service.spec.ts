import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import * as crypto from 'crypto';

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookService],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  describe('verifyWebhook', () => {
    it('should generate the correct checksum', () => {
      const event = {
        signature: {
          properties: ['transaction.amount_in_cents', 'transaction.currency'],
        },
        data: {
          transaction: {
            amountInCents: 1000,
            currency: 'COP',
          },
        },
        timestamp: '2024-09-25T10:00:00Z',
      };
      const secret = 'mysecret';
      const expectedChecksum = service.generateChecksum(
        '1000COP2024-09-25T10:00:00Zmysecret',
      );

      const result = service.verifyWebhook(event, secret);

      expect(result).toBe(expectedChecksum);
    });
  });

  describe('concatenateProperties', () => {
    it('should concatenate the properties correctly', () => {
      const event = {
        data: {
          transaction: {
            amountInCents: 1000,
            currency: 'COP',
          },
        },
      };
      const properties = [
        'transaction.amount_in_cents',
        'transaction.currency',
      ];

      const result = service.concatenateProperties(event, properties);

      expect(result).toBe('1000COP');
    });

    it('should log an error if a property is undefined', () => {
      const event = {
        data: {
          transaction: {
            amountInCents: undefined,
            currency: 'COP',
          },
        },
      };
      const properties = [
        'transaction.amount_in_cents',
        'transaction.currency',
      ];

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      service.concatenateProperties(event, properties);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Property transaction.amount_in_cents is undefined',
      );
    });
  });

  describe('concatenateWithTimestamp', () => {
    it('should append the timestamp correctly', () => {
      const concatenatedProperties = '1000COP';
      const timestamp = '2024-09-25T10:00:00Z';

      const result = service.concatenateWithTimestamp(
        concatenatedProperties,
        timestamp,
      );

      expect(result).toBe('1000COP2024-09-25T10:00:00Z');
    });
  });

  describe('concatenateWithSecret', () => {
    it('should append the secret correctly', () => {
      const concatenatedString = '1000COP2024-09-25T10:00:00Z';
      const secret = 'mysecret';

      const result = service.concatenateWithSecret(concatenatedString, secret);

      expect(result).toBe('1000COP2024-09-25T10:00:00Zmysecret');
    });
  });

  describe('generateChecksum', () => {
    it('should generate the correct checksum', () => {
      const concatenatedString = '1000COP2024-09-25T10:00:00Zmysecret';

      const result = service.generateChecksum(concatenatedString);

      const expected = crypto
        .createHash('sha256')
        .update(concatenatedString)
        .digest('hex')
        .toUpperCase();

      expect(result).toBe(expected);
    });
  });
});
