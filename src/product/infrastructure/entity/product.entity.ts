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

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.product)
  deliveries: DeliveryEntity[];
}
