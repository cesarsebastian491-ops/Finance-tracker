import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../transactions/entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CaptchaService } from './captcha.service';
import { CaptchaGuard } from './captcha.guard';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { LastActiveInterceptor } from './last-active.interceptor';

@Module({
  imports: [
    UsersModule,
    SessionsModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    CaptchaService,
    CaptchaGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: LastActiveInterceptor,
    },
  ],
  exports: [
    AuthService,
    JwtAuthGuard,   // ⭐ REQUIRED EXPORT
  ],
})
export class AuthModule {}