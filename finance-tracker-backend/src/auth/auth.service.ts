import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as speakeasy from "speakeasy";

@Injectable()
export class AuthService {
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
}