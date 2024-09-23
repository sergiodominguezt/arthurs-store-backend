import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from 'src/product/domain/repository/product.repository';
import { Product } from 'src/product/domain/model/product.model';
import { Either, right, left, Right, Left } from 'src/utils/either';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: ProductRepository;

  const mockProductRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    updateStock: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: 'ProductRepository',
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get<ProductRepository>('ProductRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listProducts', () => {
    it('should return a list of products', async () => {
      const products = [
        new Product(
          1,
          'Product 1',
          'Desc 1',
          10.99,
          10,
          'https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I',
        ),
      ];
      mockProductRepository.findAll.mockResolvedValue(products);

      const result = await productService.listProducts();

      // Check if it's a Right (success) and extract the value
      if (result instanceof Right) {
        expect(result.value).toEqual(products);
      } else {
        fail('Expected a success, but got an error.');
      }

      expect(mockProductRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an error if the repository throws', async () => {
      mockProductRepository.findAll.mockRejectedValue(new Error());

      const result = await productService.listProducts();

      if (result instanceof Left) {
        expect(result.value).toEqual(new Error('Failed to list products'));
      } else {
        fail('Expected an error, but got a success.');
      }
    });
  });

  describe('findById', () => {
    it('should return a product if found', async () => {
      const product = new Product(
        1,
        'Product 1',
        'Description 1',
        10.99,
        100,
        'https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I',
      );
      mockProductRepository.findById.mockResolvedValue(product);

      const result = await productService.findById(1);

      expect(result).toEqual(product);
    });

    it('should return null if no product is found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      const result = await productService.findById(1);

      expect(result).toBeNull();
    });
  });

  describe('updateStock', () => {
    it('should update stock if the product exists and stock is sufficient', async () => {
      const product = new Product(
        1,
        'Product 1',
        'Description 1',
        10.99,
        100,
        'https://fastly.picsum.photos/id/29/4000/2670.jpg?hmac=rCbRAl24FzrSzwlR5tL-Aqzyu5tX_PA95VJtnUXegGU',
      );
      mockProductRepository.findById.mockResolvedValue(product);

      await productService.updateStock(1, 10);

      expect(mockProductRepository.updateStock).toHaveBeenCalledWith(1, 90);
    });

    it('should throw an error if the product does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.updateStock(1, 10)).rejects.toThrow(
        'Product not found',
      );
    });

    it('should throw an error if stock is insufficient', async () => {
      const product = new Product(
        1,
        'Product 1',
        'Description 1',
        10.99,
        5,
        'https://fastly.picsum.photos/id/29/4000/2670.jpg?hmac=rCbRAl24FzrSzwlR5tL-Aqzyu5tX_PA95VJtnUXegGU',
      );
      mockProductRepository.findById.mockResolvedValue(product);

      await expect(productService.updateStock(1, 10)).rejects.toThrow(
        'Insufficient stock',
      );
    });
  });

  describe('seedDummyData', () => {
    it('should seed dummy data into the repository', async () => {
      await productService.seedDummyData();

      expect(mockProductRepository.create).toHaveBeenCalledTimes(6);
    });
  });
});
