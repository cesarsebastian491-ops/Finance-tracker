import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class SystemSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column()
  value: string;
}