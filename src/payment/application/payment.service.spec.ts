import { PaymentService } from './payment.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { TransactionDTO } from 'src/transaction/application/dtos/transaction.dto';
import * as dotenv from 'dotenv';
import mockAxios from 'jest-mock-axios';
import { PaymentTraceMessage } from '../constants/payment-trace-message.constant';

dotenv.config();

jest.mock('axios');
jest.mock('crypto');

jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mockSignature'),
  }),
}));

describe('PaymentService', () => {
  let paymentService: PaymentService;
  const transactionDTO: TransactionDTO = {
    userEmail: 'test@example.com',
    cardNumber: '4111111111111111',
    cvc: '123',
    expirationMonth: '12',
    expirationYear: '25',
    cardHolder: 'John Doe',
    installments: 1,
    productId: 1,
    productQuantity: 5,
  };
  const totalAmount = 1000;

  beforeEach(() => {
    paymentService = new PaymentService();

    process.env.API_URL = 'https://api.example.com';
    process.env.ACCEPTANCE_TOKEN = '/acceptance-token';
    process.env.PUBLIC_KEY = 'public-key';
    process.env.SECRET_KEY = 'secret-key';
    process.env.TOKENIZATION_CARDS = '/tokenization-cards';
    process.env.TRANSACTIONS = '/transactions';
    process.env.INTEGRITY_KEY = 'integrity-key';
    mockAxios.reset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process payment successfully', async () => {
    jest
      .spyOn(paymentService, 'getAcceptanceToken')
      .mockResolvedValue('mockAcceptanceToken');
    jest
      .spyOn(paymentService, 'getCardToken')
      .mockResolvedValue('mockCardToken');
    jest
      .spyOn(paymentService, 'sendPaymentRequest')
      .mockResolvedValueOnce({ id: '12345', status: 'APPROVED' });

    jest
      .spyOn(paymentService, 'sendPaymentRequest')
      .mockResolvedValueOnce({ id: '12345', status: 'APPROVED' });

    const result = await paymentService.processPayment(
      transactionDTO,
      totalAmount,
    );

    expect(result).toEqual({ id: '12345', status: 'APPROVED' });

    expect(paymentService.sendPaymentRequest).toHaveBeenCalledWith(
      expect.any(Object),
    );
  });

  it('should throw an error if card token is not received', async () => {
    jest
      .spyOn(paymentService, 'getAcceptanceToken')
      .mockResolvedValue('mockAcceptanceToken');
    jest.spyOn(paymentService, 'getCardToken').mockResolvedValue(null);
    await expect(
      paymentService.processPayment(transactionDTO, totalAmount),
    ).rejects.toThrowError('Error fetching card token');
  });

  it('should generate payment data correctly', () => {
    const reference = 'testReference';
    const signature = 'testSignature';
    const cardToken = 'mockCardToken';
    const acceptanceToken = 'mockAcceptanceToken';

    const paymentData = paymentService.generatePaymentData(
      transactionDTO,
      reference,
      signature,
      cardToken,
      acceptanceToken,
      totalAmount,
    );

    expect(paymentData).toEqual({
      amountInCents: totalAmount * 100,
      currency: 'COP',
      reference,
      signature,
      customerEmail: transactionDTO.userEmail,
      paymentMethod: {
        type: 'CARD',
        installments: 1,
        token: cardToken,
      },
      acceptanceToken,
    });
  });

  it('should generate reference correctly', () => {
    const reference = paymentService.generateReference();
    const referenceRegex = /^ART\d{8}T\d{5}[A-Z0-9]{6}$/;
    expect(reference).toMatch(referenceRegex);
  });

  it('should generate signature correctly', () => {
    const reference = 'testReference';
    const amount = 1000;
    const signature = paymentService.generateSignature(reference, amount);

    expect(crypto.createHash).toHaveBeenCalledWith('sha256');
    expect(signature).toBe('mockSignature');
  });

  it('should get acceptance token successfully', async () => {
    const mockResponse = {
      data: {
        data: {
          presignedAcceptance: {
            acceptanceToken: 'mockAcceptanceToken',
          },
        },
      },
    };
    mockAxios.get.mockResolvedValue(mockResponse);

    const acceptanceToken = await paymentService.getAcceptanceToken();
    expect(acceptanceToken).toBe('mockAcceptanceToken');
  });
  it('should throw an error if acceptance token is not retrieved', async () => {
    jest
      .spyOn(paymentService, 'getAcceptanceToken')
      .mockResolvedValueOnce(null);

    jest
      .spyOn(paymentService, 'getCardToken')
      .mockResolvedValueOnce('mockCardToken');

    await expect(
      paymentService.processPayment(transactionDTO, totalAmount),
    ).rejects.toThrow(PaymentTraceMessage.ERROR_ACCEPTANCE_TOKEN);

    expect(paymentService.getAcceptanceToken).toHaveBeenCalled();
  });

  it('should handle error in getAcceptanceToken', async () => {
    mockAxios.get.mockRejectedValue(new Error('Network error'));
    await expect(paymentService.getAcceptanceToken()).rejects.toThrowError(
      'Error fetching acceptance token',
    );
  });

  it('should log error response data and throw an error with the message', () => {
    const mockMessage = 'Test error message';
    const mockError = {
      response: {
        data: 'Some error response data',
      },
    };

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => paymentService.handleError(mockMessage, mockError)).toThrow(
      Error,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      mockMessage,
      'Some error response data',
    );

    consoleErrorSpy.mockRestore();
  });
});
