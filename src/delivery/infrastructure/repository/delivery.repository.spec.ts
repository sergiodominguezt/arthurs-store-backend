import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryRepositoryImpl } from './delivery.repository.impl';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeliveryEntity } from '../entity/delivery.entity';
import { ProductEntity } from 'src/product/infrastructure/entity/product.entity';
import { Delivery } from 'src/delivery/domain/model/delivery.model';

describe('DeliveryRepository', () => {
  let deliveryRepository: DeliveryRepositoryImpl;
  let deliveryRepositoryMock: jest.Mocked<Repository<DeliveryEntity>>;
  let productRepositoryMock: jest.Mocked<Repository<ProductEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryRepositoryImpl,
        {
          provide: getRepositoryToken(DeliveryEntity),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    deliveryRepository = module.get<DeliveryRepositoryImpl>(
      DeliveryRepositoryImpl,
    );
    deliveryRepositoryMock = module.get(getRepositoryToken(DeliveryEntity));
    productRepositoryMock = module.get(getRepositoryToken(ProductEntity));
  });

  it('should save delivery successfully', async () => {
    const delivery: Delivery = {
      id: 0,
      address: 'Calle siempre viva',
      city: 'Bucaramanga',
      customerName: 'Sergio Dominguez',
      productId: 1,
    };

    const mockProduct = new ProductEntity();
    mockProduct.id = delivery.productId;

    productRepositoryMock.findOne.mockResolvedValue(mockProduct);

    await deliveryRepository.save(delivery);

    expect(productRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: delivery.productId },
    });
    expect(deliveryRepositoryMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        address: delivery.address,
        city: delivery.city,
        customerName: delivery.customerName,
        product: mockProduct,
      }),
    );
  });

  it('should throw an error if product is not found', async () => {
    const delivery: Delivery = {
      id: 0,
      address: 'Calle siempre viva',
      city: 'Bucaramanga',
      customerName: 'Sergio Dominguez',
      productId: 1,
    };

    productRepositoryMock.findOne.mockResolvedValue(null);

    await expect(deliveryRepository.save(delivery)).rejects.toThrow(
      'Product not found',
    );

    expect(productRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: delivery.productId },
    });
    expect(deliveryRepositoryMock.save).not.toHaveBeenCalled();
  });
});
