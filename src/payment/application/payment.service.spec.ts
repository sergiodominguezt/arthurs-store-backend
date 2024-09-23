import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentTraceMessage } from '../constants/payment-trace-message.constant';
import { TransactionDTO } from 'src/transaction/application/dtos/transaction.dto';

jest.mock('crypto');

// Mock axios
jest.mock('axios');

// Mock environment variables
process.env.API_URL = 'https://api.example.com';
process.env.ACCEPTANCE_TOKEN = 'mockAcceptanceToken';
process.env.PUBLIC_KEY = 'mockPublicKey';
process.env.SECRET_KEY = 'mockSecretKey';
process.env.TOKENIZATION_CARDS = '/tokenization';
process.env.TRANSACTIONS = '/transactions';
process.env.INTEGRITY_KEY = 'mockIntegrityKey';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });
  const transactionDTO: TransactionDTO = {
    userEmail: 'user@example.com',
    amount: 5000,
    cardNumber: '4111111111111111',
    expirationMonth: '12',
    expirationYear: '2025',
    cardHolder: 'John Doe',
    cvc: '123',
    installments: 3,
    productId: 1, // Example productId
  };
  describe('processPayment', () => {
    it('should process the payment successfully', async () => {
      // Mock token retrievals
      jest.spyOn(service, 'getAcceptanceToken').mockResolvedValue('validToken');
      jest.spyOn(service, 'getCardToken').mockResolvedValue('cardToken');

      // Mock payment request
      jest.spyOn(service, 'sendPaymentRequest').mockResolvedValue({
        id: '12345',
        status: 'PENDING',
      });

      await service.processPayment(transactionDTO, 1000);

      expect(service.getAcceptanceToken).toHaveBeenCalled();
      expect(service.getCardToken).toHaveBeenCalled();
      expect(service.sendPaymentRequest).toHaveBeenCalledWith(
        expect.any(Object),
      );
    });

    it('should throw an error if acceptance token is null', async () => {
      jest.spyOn(service, 'getAcceptanceToken').mockResolvedValue(null);

      await expect(
        service.processPayment(transactionDTO, 1000),
      ).rejects.toThrow(PaymentTraceMessage.ERROR_ACCEPTANCE_TOKEN);
    });
  });

  // Add more tests for other methods...
});
