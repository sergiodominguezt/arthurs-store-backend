import { Test, TestingModule } from '@nestjs/testing';
import { ProductRepositoryImpl } from './product.repository.impl';
import { ProductEntity } from '../entity/product.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/product/domain/model/product.model';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ProductRepositoryImpl', () => {
  let productRepository: ProductRepositoryImpl;
  let mockRepository: jest.Mocked<Partial<Repository<ProductEntity>>>;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepositoryImpl,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    productRepository = module.get<ProductRepositoryImpl>(
      ProductRepositoryImpl,
    );
  });

  it('should find all products', async () => {
    const mockEntities = [
      {
        id: 1,
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        stock: 50,
        urlImage:
          'https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I',
      },
    ];

    (mockRepository.find as jest.Mock).mockResolvedValue(mockEntities);

    const products = await productRepository.findAll();

    expect(products).toEqual([
      new Product(
        1,
        'Product 1',
        'Description 1',
        100,
        50,
        'https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I',
      ),
    ]);
    expect(mockRepository.find).toHaveBeenCalled();
  });

  it('should find a product by id', async () => {
    const mockEntity = {
      id: 1,
      name: 'Product 1',
      description: 'Description 1',
      price: 100,
      stock: 50,
      urlImage:
        'https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I',
    };

    (mockRepository.findOne as jest.Mock).mockResolvedValue(mockEntity);

    const product = await productRepository.findById(1);

    expect(product).toEqual(
      new Product(
        1,
        'Product 1',
        'Description 1',
        100,
        50,
        'https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I',
      ),
    );
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should return null if product not found', async () => {
    (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

    const product = await productRepository.findById(1);

    expect(product).toBeNull();
  });

  it('should update the stock of a product', async () => {
    await productRepository.updateStock(1, 100);

    expect(mockRepository.update).toHaveBeenCalledWith(1, { stock: 100 });
  });

  it('should create a product', async () => {
    const product = new Product(
      1,
      'Product 1',
      'Description 1',
      100,
      50,
      'https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I',
    );

    await productRepository.create(product);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        urlImage: product.urlImage,
      }),
    );
  });
});
