import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LogsController } from './logs/logs.controller';
import { LogsModule } from './logs/logs.module';
import { AdminModule } from './admin/admin.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { SessionsModule } from './sessions/sessions.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SystemModule } from './system/system.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LastActiveInterceptor } from './auth/last-active.interceptor';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'finance-system',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production' && process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.NODE_ENV !== 'production',
    }),

    TransactionsModule,
    UsersModule,
    AuthModule,
    LogsModule,
    AdminModule,
    SystemSettingsModule,
    SessionsModule,
    MaintenanceModule,
    AnalyticsModule,
    SystemModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [LogsController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LastActiveInterceptor,
    },
  ],
})
export class AppModule { }
