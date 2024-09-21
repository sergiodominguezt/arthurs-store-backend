import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TransactionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    transactionNumber: string;

    @Column()
    status: string;

    @Column()
    userEmail: string;

    @Column('decimal')
    amount: number;
}