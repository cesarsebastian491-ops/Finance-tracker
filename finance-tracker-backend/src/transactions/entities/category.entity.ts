import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('categories')
@Index(['type', 'name'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: ['income', 'expense'] })
  type: 'income' | 'expense';

  @Column({ type: 'tinyint', width: 1, default: 1 })
  isActive: number;
}
