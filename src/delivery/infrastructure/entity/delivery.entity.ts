import { ProductEntity } from 'src/product/infrastructure/entity/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('deliveries')
export class DeliveryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ name: 'customer_name' })
  customerName: string;

  @ManyToOne(() => ProductEntity, (product) => product.deliveries)
  product: ProductEntity;
}
