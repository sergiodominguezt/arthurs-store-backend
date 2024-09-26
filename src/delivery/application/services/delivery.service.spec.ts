import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryService } from './delivery.service';
import { DeliveryRepository } from 'src/delivery/domain/repository/delivery.repository';
import { ProductRepository } from 'src/product/domain/repository/product.repository';
import { Delivery } from 'src/delivery/domain/model/delivery.model';
import { DeliveryDTO } from '../dtos/delivery.dto';
import { DeliveryErrorMessages } from 'src/delivery/constants/delivery.constants';
import { Product } from 'src/product/domain/model/product.model';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let deliveryRepository: DeliveryRepository;
  let productRepository: ProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        {
          provide: 'DeliveryRepository',
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: 'ProductRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeliveryService>(DeliveryService);
    deliveryRepository = module.get<DeliveryRepository>('DeliveryRepository');
    productRepository = module.get<ProductRepository>('ProductRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save delivery information successfully', async () => {
    const deliveryDTO: DeliveryDTO = {
      address: '123 Main St',
      city: 'Anytown',
      customerName: 'John Doe',
    };
    const productId = 1;

    const mockProduct: Product = {
      id: productId,
      name: 'Mock product name',
      description: 'Mock description',
      price: 100,
      stock: 10,
      urlImage: 'http://example.com/image.png',
    };

    jest.spyOn(productRepository, 'findById').mockResolvedValue(mockProduct);

    await service.saveDeliveryInformation(deliveryDTO, productId);

    expect(productRepository.findById).toHaveBeenCalledWith(productId);
    expect(deliveryRepository.save).toHaveBeenCalledWith(
      new Delivery(
        0,
        deliveryDTO.address,
        deliveryDTO.city,
        deliveryDTO.customerName,
        productId,
      ),
    );
  });

  it('should throw an error if product is not found', async () => {
    const deliveryDTO: DeliveryDTO = {
      address: '123 Main St',
      city: 'Anytown',
      customerName: 'John Doe',
    };
    const productId = 1;

    jest.spyOn(productRepository, 'findById').mockResolvedValue(null);

    await expect(
      service.saveDeliveryInformation(deliveryDTO, productId),
    ).rejects.toThrow(DeliveryErrorMessages.ERROR_PRODUCT_NOT_FOUND);

    expect(productRepository.findById).toHaveBeenCalledWith(productId);
    expect(deliveryRepository.save).not.toHaveBeenCalled();
  });
});
