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

  @Column()
  price: number;

  @Column()
  stock: number;

  @Column({ name: 'url_image', nullable: true })
  urlImage: string;

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.product)
  deliveries?: DeliveryEntity[];
}
