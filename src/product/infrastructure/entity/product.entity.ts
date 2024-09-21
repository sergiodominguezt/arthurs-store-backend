import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProductEntity{
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
}