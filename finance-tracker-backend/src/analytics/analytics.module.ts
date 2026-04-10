import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User } from '../transactions/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Log } from '../logs/log.entity';
import { Session } from '../sessions/session.entity'; // ⭐ ADD THIS

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transaction, Log, Session]), // ⭐ ADD Session here
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}