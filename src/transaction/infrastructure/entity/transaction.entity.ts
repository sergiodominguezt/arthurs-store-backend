import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transaction_number' })
  transactionNumber: string;

  @Column()
  status: string;

  @Column({ name: 'user_email' })
  userEmail: string;

  @Column('decimal')
  amount: number;
}
