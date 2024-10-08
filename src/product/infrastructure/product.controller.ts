import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ProductService } from '../application/services/product.service';
import { Product } from '../domain/model/product.model';
import { Left } from 'src/utils/either';
import { ProductDTO } from '../application/dtos/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async listProducts(): Promise<ProductDTO[]> {
    const result = await this.productService.listProducts();
    if (result instanceof Left) {
      throw new HttpException(result.value.message, HttpStatus.BAD_REQUEST);
    }

    return result.value;
  }
}
