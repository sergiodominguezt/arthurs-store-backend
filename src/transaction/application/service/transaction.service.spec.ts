import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import axios from 'axios';
import { TransactionRepository } from 'src/transaction/domain/repository/transaction.repository';
import { TransactionDTO } from '../dtos/transaction.dto';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

fdescribe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: TransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: 'TransactionRepository',
          useValue: {
            create: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<TransactionRepository>(
      'TransactionRepository',
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process a transaction successfully', async () => {
    const transactionDto: TransactionDTO = {
      amount: 100,
      cardNumber: '4111111111111111',
      cvc: '123',
      expirationMonth: '12',
      expirationYear: '2025',
      cardHolder: 'John Doe',
      userEmail: 'john.doe@example.com',
      installments: 1,
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          id: 'transaction-id',
          status: 'APPROVED',
        },
      },
    });

    await service.processTransaction(transactionDto);

    expect(transactionRepository.create).toHaveBeenCalled();
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
      'transaction-id',
      'APPROVED',
    );
  });
});
