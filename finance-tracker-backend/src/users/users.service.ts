import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../transactions/entities/user.entity';
import { LogsService } from '../logs/logs.service';
import * as bcrypt from 'bcryptjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { Log } from '../logs/log.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private readonly logsService: LogsService,
  ) { }

  findAll() {
    return this.usersRepo.find({
      relations: ['transactions', 'logs']
    }).then(users =>
      users.map(user => ({
        ...user,
        online: this.isOnline(user.lastActive),
      }))
    );
  }

  async register(
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
  ) {
    const hash = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({
      username,
      email,
      password: hash,
      firstName,
      lastName,
      phone,
      role: 'user', // 🔥 force default role
    });

    return this.usersRepo.save(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepo.findOne({
      where: { email },
    });

    console.log("LOGIN ATTEMPT:", email, password);
    console.log("FOUND USER:", user);

    // CASE 1: Email not found
    if (!user) {
      await this.logsService.create({
        userId: null,
        action: 'FAILED_LOGIN',
        message: `Email not found: ${email}`,
      });

      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);

    // CASE 2: Wrong password
    if (!isValid) {
      await this.logsService.create({
        userId: user.id,
        action: 'FAILED_LOGIN',
        message: `Wrong password for email: ${email}`,
      });

      return null;
    }

    // SUCCESS LOGIN
    await this.logsService.create({
      userId: user.id,
      action: 'LOGIN',
      message: `User logged in successfully`,
    });

    return user;
  }

  async createUser(dto) {
    const user = await this.usersRepo.save(dto);

    await this.logsService.create({
      userId: user.id,
      action: 'CREATE_USER',
      message: `User '${user.username}' was created`,
    });

    return user;
  }

  async updateUser(id: number, dto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    console.log("🔥 UPDATE_USER TRIGGERED — DTO:", dto);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ⭐ If ONLY lastActive is being updated → skip logging
    const keys = Object.keys(dto);
    if (keys.length === 1 && keys[0] === "lastActive") {
      await this.usersRepo.update(id, dto);
      return this.usersRepo.findOne({ where: { id } });
    }

    // ⭐ Otherwise, log normally
    await this.usersRepo.update(id, dto);

    await this.logsService.create({
      userId: id,
      action: 'UPDATE_USER',
      message: `User '${user.username}' was updated`,
    });

    return this.usersRepo.findOne({ where: { id } });
  }

  async deleteUser(id: number) {
    await this.usersRepo.delete(id);

    await this.logsService.create({
      userId: id,
      action: 'DELETE_USER',
      message: `User with ID ${id} was deleted`,
    });

    return { success: true };
  }
  async updateRole(id: number, role: string) {
    const validRoles = ['admin', 'staff', 'user'];

    if (!validRoles.includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role as UserRole;
    return this.usersRepo.save(user);
  }

  async updateStatus(id: number, status: string) {
    await this.usersRepo.update(id, { status });
    return this.usersRepo.findOne({ where: { id } });
  }

  // STAFF — can edit only regular users
  async staffEditUser(currentUser, targetId: number, dto) {
    const target = await this.usersRepo.findOne({ where: { id: targetId } });

    if (!target) throw new NotFoundException('User not found');

    if (target.role !== 'user') {
      throw new BadRequestException('Staff can only edit regular users');
    }

    await this.usersRepo.update(targetId, dto);

    return this.usersRepo.findOne({ where: { id: targetId } });
  }

  // USER — can edit only themselves
  async updateSelf(userId: number, dto) {
    console.log("🔥 UPDATE_SELF TRIGGERED — DTO:", dto);  // <-- ADD THIS

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined && v !== null)
    );

    await this.usersRepo.update(userId, cleanDto);
    return this.usersRepo.findOne({ where: { id: userId } });
  }

  async generateTwoFactorSecret(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user) throw new Error('User not found');

    const secret = speakeasy.generateSecret({
      name: `YourApp (${user.email})`,
    });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    await this.usersRepo.update(user.id, {
      twoFactorSecret: secret.base32,
      twoFactorMethod: 'totp',
      twoFactorVerified: false,
    });

    return {
      qrCode,
      secret: secret.base32,
    };
  }

  async verifyTwoFactorCode(userId: number, code: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) return false;

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (verified) {
      await this.usersRepo.update(user.id, {
        twoFactorEnabled: true,
        twoFactorVerified: true,
      });
    }

    return verified;
  }

  async findOne(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async save(user: User) {
    return this.usersRepo.save(user);
  }

  async disableTwoFactor(userId: number) {
    await this.usersRepo.update(userId, {
      twoFactorEnabled: false,
      twoFactorVerified: false,
      twoFactorSecret: null,
      twoFactorMethod: null,
    });
  }

  isOnline(lastActive: Date): boolean {
    if (!lastActive) return false;

    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 5 * 60 * 1000; // 5 minutes
  }

  async findOnlineUsers() {
    const users = await this.usersRepo.find();
    return users.filter(user => this.isOnline(user.lastActive));
  }

  // ⭐ RAW users for backup (no relations, no "online" decoration)
  async exportAllForBackup() {
    return this.usersRepo.find(); // plain users, FK-safe
  }

  // ⭐ Clear all users (used by restore)
  async clearAll() {
    await this.usersRepo.clear();
  }

  // ⭐ Restore users from backup (used by restore)
  async replaceAll(users: any[]) {
    if (!users || users.length === 0) return;
    await this.usersRepo.save(users);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Save new password
    user.password = hashed;
    await this.usersRepo.save(user);

    // Log the action
    await this.logsService.create({
      userId: user.id,
      action: 'CHANGE_PASSWORD',
      message: `User '${user.username}' changed their password`,
    });

    return { message: 'Password updated successfully' };
  }

  async updateLastActive(userId: number) {
    await this.usersRepo.update(userId, { lastActive: new Date() });
    return { success: true };
  }
}
