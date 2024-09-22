import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import axios from 'axios';
import { TransactionRepository } from 'src/transaction/domain/repository/transaction.repository';
import { TransactionDTO } from '../dtos/transaction.dto';

jest.mock('axios');

describe('service', () => {
  let transactionService: TransactionService;
  let transactionRepository: TransactionRepository;

  const mockTransactionRepository = {
    create: jest.fn(),
    updateStatus: jest.fn(),
  };

  const transactionDTO: TransactionDTO = {
    amount: 1000,
    cardNumber: '4111111111111111',
    cvc: '123',
    expirationMonth: '12',
    expirationYear: '25',
    cardHolder: 'John Doe',
    userEmail: 'john@example.com',
    installments: 1,
    productId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: 'TransactionRepository',
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<TransactionRepository>(
      'TransactionRepository',
    );
  });

  it('should be defined', () => {
    expect(TransactionService).toBeDefined();
  });

  // it('should process transaction successfully', async () => {
  //   const mockAcceptanceToken = 'mock-acceptance-token';
  //   const mockCardToken = 'mock-card-token';
  //   const mockReference = 'ART20230912091212';
  //   const mockSignature = 'mock-signature';

  //   jest
  //     .spyOn(transactionService, 'getAcceptanceToken')
  //     .mockResolvedValue(mockAcceptanceToken);
  //   jest
  //     .spyOn(transactionService, 'getCardToken')
  //     .mockResolvedValue(mockCardToken);
  //   jest
  //     .spyOn(transactionService, 'generateReference')
  //     .mockReturnValue(mockReference);
  //   jest
  //     .spyOn(transactionService, 'generateSignature')
  //     .mockReturnValue(mockSignature);

  //   await transactionService.processTransaction(transactionDTO);

  //   expect(transactionService.getAcceptanceToken).toHaveBeenCalled();
  //   expect(transactionService.getCardToken).toHaveBeenCalledWith(
  //     expect.any(Object),
  //   );
  //   expect(transactionService.generateReference).toHaveBeenCalled();
  //   expect(transactionService.generateSignature).toHaveBeenCalledWith(
  //     mockReference,
  //     transactionDTO.amount,
  //   );
  // });
});
