import { Delivery } from '../model/delivery.model';

export interface DeliveryRepository {
  save(delivery: Delivery): Promise<void>;
}
