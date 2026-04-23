import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  code: string; // e.g., 'USD', 'PHP', 'EUR'

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g., 'US Dollar', 'Philippine Peso'

  @Column({ type: 'varchar', length: 5 })
  symbol: string; // e.g., '$', '₱'

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  exchangeRate: number; // Exchange rate to base currency (USD)

  @Column({ type: 'boolean', default: false })
  isActive: boolean; // Current active currency

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
