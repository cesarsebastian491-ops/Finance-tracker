import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  ip: string;

  @Column()
  userAgent: string;

  @Column({ type: "timestamp" })
  createdAt: Date;

  @Column({ type: "timestamp" })
  lastActive: Date;

  @Column({ default: false })
  isRevoked: boolean;
}