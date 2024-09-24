import { ProductEntity } from '../infrastructure/entity/product.entity';
import { ProductDTO } from '../application/dtos/product.dto';

export function toProductDTO(entity: ProductEntity): ProductDTO {
  return {
    productId: entity.id,
    name: entity.name,
    description: entity.description,
    price: entity.price,
    stock: entity.stock,
    urlImage: entity.urlImage,
  };
}
