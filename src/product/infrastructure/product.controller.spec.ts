import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from '../application/services/product.service';
import { Product } from '../domain/model/product.model';
import { Left, Right } from 'src/utils/either';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProductDTO } from '../application/dtos/product.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            listProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a list of products', async () => {
    const result: ProductDTO[] = [
      {
        productId: 1,
        name: 'Product 1',
        description: 'Description 1',
        stock: 100,
        price: 100,
        urlImage:
          'https://fastly.picsum.photos/id/20/3670/2462.jpg?hmac=CmQ0ln-k5ZqkdtLvVO23LjVAEabZQx2wOaT4pyeG10I',
      },
    ];
    jest
      .spyOn(productService, 'listProducts')
      .mockResolvedValue(new Right(result));

    expect(await controller.listProducts()).toBe(result);
  });

  it('should throw an HttpException when service returns a Left', async () => {
    const error = new Error('Error fetching products');
    jest
      .spyOn(productService, 'listProducts')
      .mockResolvedValue(new Left(error));

    await expect(controller.listProducts()).rejects.toThrow(
      new HttpException(error.message, HttpStatus.BAD_REQUEST),
    );
  });
});
