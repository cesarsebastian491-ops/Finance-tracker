import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: 'income' | 'expense';

  @Column({ nullable: true })
  expense: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  source: string;

  @Column('decimal')
  amount: number;

  // ⭐ ADDITIONAL AMOUNTS
  @Column({ type: 'decimal', nullable: true })
  tax: number;

  @Column({ type: 'decimal', nullable: true })
  serviceFee: number;

  @Column({ type: 'decimal', nullable: true })
  discount: number;

  @Column({ type: 'decimal', nullable: true })
  otherCharge: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  userId: number;

  // ⭐ RECURRING FIELDS
  @Column({ type: 'tinyint', width: 1, default: 0 })
  isRecurring: number;

  @Column({ nullable: true })
  recurringType: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @Column({ type: 'date', nullable: true })
  recurringEndDate: Date | null;

  // ⭐ REQUIRED FOR AUTOMATION
  @Column({ type: 'date', nullable: true })
  lastGenerated: Date | null;

  @ManyToOne(() => User, (user) => user.transactions, { nullable: true })
  user: User;
}