import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryRepository } from 'src/delivery/domain/repository/delivery.repository';
import { DeliveryEntity } from '../entity/delivery.entity';
import { Repository } from 'typeorm';
import { Delivery } from 'src/delivery/domain/model/delivery.model';
import { ProductEntity } from 'src/product/infrastructure/entity/product.entity';
import { ProductRepository } from 'src/product/domain/repository/product.repository';

export class DeliveryRepositoryImpl implements DeliveryRepository {
  constructor(
    @InjectRepository(DeliveryEntity)
    private deliveryRepository: Repository<DeliveryEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async save(delivery: Delivery): Promise<void> {
    const entity = new DeliveryEntity();
    entity.address = delivery.address;
    entity.city = delivery.city;
    entity.customerName = delivery.customerName;

    if (delivery.productId) {
      entity.product = await this.productRepository.findOne({
        where: { id: delivery.productId },
      });
    }

    if (!entity.product) {
      throw new Error('Product not found');
    }

    await this.deliveryRepository.save(entity);
  }
}
