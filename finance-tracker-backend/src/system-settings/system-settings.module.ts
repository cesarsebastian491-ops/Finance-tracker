import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './system-setting.entity/system-setting.entity';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettingsController } from './system-settings.controller';
import { User, UserRole } from '../transactions/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Log } from '../logs/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting ,  User, Transaction, Log])],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService ],
  exports: [SystemSettingsService],
  
})
export class SystemSettingsModule {}