import { DeliveryEntity } from 'src/delivery/infrastructure/entity/delivery.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal')
  price: number;

  @Column()
  stock: number;

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.product)
  deliveries: DeliveryEntity[];
}
