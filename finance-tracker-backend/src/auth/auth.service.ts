import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as speakeasy from "speakeasy";

@Injectable()
export class AuthService {
  // In-memory store for password reset codes (email -> { code, expiresAt })
  private passwordResetCodes = new Map<string, { code: string; expiresAt: number }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string) {
    return this.usersService.validateUser(email, password);
  }

  async login(user: any) {
    // If 2FA is enabled → require code
    if (user.twoFactorEnabled) {
      return {
        success: true,
        requires2FA: true,
        userId: user.id,
      };
    }

    // Normal login
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async loginWith2FA(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  verifyTwoFactorCode(code: string, secret: string | null) {
    if (!secret) return false;

    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
      window: 1,
    });
  }

  generateJwt(user: any) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async updateLastActive(userId: number) {
    await this.usersService.updateUser(userId, { lastActive: new Date() });
  }

  async generatePasswordResetCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { success: false, message: 'Email not found' };
    }

    // Generate a 6-digit reset code
    const resetCode = String(Math.floor(100000 + Math.random() * 900000));

    // Store with 15-minute expiration
    const expiresAt = Date.now() + 15 * 60 * 1000;
    this.passwordResetCodes.set(email, { code: resetCode, expiresAt });

    // In production, send this code via email
    // TODO: integrate email service before go-live

    return {
      success: true,
      message: 'Reset code sent to email',
    };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const resetData = this.passwordResetCodes.get(email);

    if (!resetData) {
      return { success: false, message: 'No reset request found for this email' };
    }

    if (Date.now() > resetData.expiresAt) {
      this.passwordResetCodes.delete(email);
      return { success: false, message: 'Reset code has expired' };
    }

    if (resetData.code !== code) {
      return { success: false, message: 'Invalid reset code' };
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Update password
    await this.usersService.updatePassword(user.id, newPassword);

    // Clean up reset code
    this.passwordResetCodes.delete(email);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}