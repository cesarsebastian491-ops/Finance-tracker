import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { LogsModule } from '../logs/logs.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { UsersModule } from '../users/users.module';   // ⭐ ADD THIS

@Module({
  imports: [
    LogsModule,
    TransactionsModule,
    UsersModule,        // ⭐ REQUIRED
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}