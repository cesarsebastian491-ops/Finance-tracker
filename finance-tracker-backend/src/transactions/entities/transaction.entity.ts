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

  @Column({ nullable: true, default: 'Other' })
  category: string;

  @Column({ nullable: true })
  source: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  // ⭐ ADDITIONAL AMOUNTS
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tax: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  serviceFee: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  otherCharge: number | null;

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

  @Column({ type: 'date', nullable: true })
  nextDueDate: Date | null;

  @ManyToOne(() => User, (user) => user.transactions, { nullable: true })
  user: User;
}