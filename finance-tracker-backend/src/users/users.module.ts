import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../transactions/entities/user.entity';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), LogsModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService,TypeOrmModule,], 
  
})
export class UsersModule {}
