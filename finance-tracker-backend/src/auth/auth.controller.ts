import { Controller, Post, Body, Req, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import * as speakeasy from "speakeasy";
import { SessionsService } from '../sessions/sessions.service';
import { JwtAuthGuard } from './jwt-auth.guard'; // adjust path if needed
import { CaptchaGuard } from './captcha.guard';
import { CaptchaService } from './captcha.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly sessionsService: SessionsService,
    private readonly captchaService: CaptchaService,
  ) { }

  @Get('captcha')
  getCaptcha() {
    return this.captchaService.generate();
  }

  @Post('register')
  @UseGuards(CaptchaGuard)
  async register(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('phone') phone: string,
  ) {
    try {
      const user = await this.usersService.register(
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
      );

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }
  @Post('2fa/disable')
  async disable2FA(@Body('userId') userId: number) {
    await this.usersService.disableTwoFactor(userId);
    return { success: true };
  }

  @Post('login')
  @UseGuards(CaptchaGuard)
  async login(@Req() req, @Body() body: any) {
    console.log('LOGIN BODY:', body);

    const rawUser = await this.authService.validateUser(body.email, body.password);

    if (!rawUser) return { success: false, message: 'Invalid email or password' };
    if ((rawUser as any).disabled) return { success: false, message: 'Account is disabled. Contact an administrator.' };

    const user = rawUser as any;

    // ⭐ CREATE SESSION HERE
    const session = await this.sessionsService.createSession(
      user.id,
      req.ip,
      req.headers['user-agent'],
    );

    const token = this.authService.generateJwt(user);

    return {
      success: true,
      access_token: token,
      sessionId: session.id, // ⭐ RETURN SESSION ID
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,     // ⭐ ADD THIS
        lastName: user.lastName,       // ⭐ ADD THIS
        role: user.role,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled,
        twoFactorVerified: user.twoFactorVerified,
      },
    };
  }

  @Post('2fa/generate')
  async generate2FA(@Body('userId') userId: number) {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const result = await this.usersService.generateTwoFactorSecret(userId);

      return {
        success: true,
        ...result,
      };
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Failed to generate 2FA');
    }
  }

  @Post("2fa/verify")
  async verify2FA(@Body() body) {
    const { userId, code, secret } = body;

    const user = await this.usersService.findOne(userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isValid = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!isValid) {
      return { success: false, message: "Invalid code" };
    }

    // 🔥 THIS IS THE PART YOU ARE MISSING
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = true;
    user.twoFactorVerified = true;

    await this.usersService.save(user);

    return { success: true };
  }

  @Post("2fa/login")
  async loginWith2FA(@Req() req, @Body() body) {
    const { userId, code } = body;

    const user = await this.usersService.findOne(userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isValid = this.authService.verifyTwoFactorCode(
      code,
      user.twoFactorSecret
    );

    if (!isValid) {
      return { success: false, message: "Invalid code" };
    }

    const token = this.authService.generateJwt(user);

    // ⭐ CREATE SESSION HERE
    const session = await this.sessionsService.createSession(
      user.id,
      req.ip,
      req.headers["user-agent"],
    );

    return {
      success: true,
      access_token: token,
      sessionId: session.id, // ⭐ RETURN SESSION ID
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,     // ⭐ ADD THIS
        lastName: user.lastName,       // ⭐ ADD THIS
        role: user.role,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled,
        twoFactorVerified: user.twoFactorVerified,
      },
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('ping')
  ping() {
    return { ok: true };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const result = await this.authService.generatePasswordResetCode(email);
    return result;
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
  ) {
    const result = await this.authService.resetPassword(email, code, newPassword);
    return result;
  }
}
