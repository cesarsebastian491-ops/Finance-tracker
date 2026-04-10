import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LogsController } from './logs/logs.controller';
import { LogsModule } from './logs/logs.module';
// import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from './auth/roles.guard';
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
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'finance-system',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
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
