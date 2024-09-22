import { Inject, Injectable } from '@nestjs/common';
import { DeliveryRepository } from 'src/delivery/domain/repository/delivery.repository';
import { DeliveryDTO } from '../dtos/delivery.dto';
import { ProductRepository } from 'src/product/domain/repository/product.repository';
import { Delivery } from 'src/delivery/domain/model/delivery.model';
import { DeliveryErrorMessages } from 'src/delivery/constants/delivery.constants';

@Injectable()
export class DeliveryService {
  constructor(
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async saveDeliveryInformation(
    deliveryDTO: DeliveryDTO,
    productId: number,
  ): Promise<void> {
    const product = await this.productRepository.findById(productId);

    if (!product)
      throw new Error(DeliveryErrorMessages.ERROR_PRODUCT_NOT_FOUND);

    const delivery = new Delivery(
      0,
      deliveryDTO.address,
      deliveryDTO.city,
      deliveryDTO.customerName,
      productId,
    );
    await this.deliveryRepository.save(delivery);
  }
}
