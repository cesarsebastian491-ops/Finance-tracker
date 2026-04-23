import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Log } from '../../logs/log.entity';

export type UserRole = 'admin' | 'staff' | 'user';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  phone!: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'staff', 'user'],
    default: 'user',
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: ['active', 'disabled'],
    default: 'active',
  })
  status!: string;

  // 🔐 2FA FIELDS (TOTP)
  @Column({ default: false })
  twoFactorEnabled!: boolean;

  @Column({ type: 'text', nullable: true })
  twoFactorSecret!: string | null;

  @Column({ default: false })
  twoFactorVerified!: boolean;

  @Column({ type: 'text', nullable: true })
  twoFactorMethod!: string | null; // 'totp' | 'sms' | 'email'

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions!: Transaction[];

  @OneToMany(() => Log, (log) => log.user)
  logs!: Log[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastActive!: Date;

  @Column({ type: 'text', nullable: true })
  profilePicture!: string | null;
}