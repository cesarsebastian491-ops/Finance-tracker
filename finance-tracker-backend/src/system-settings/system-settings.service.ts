import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './system-setting.entity/system-setting.entity';
import * as os from 'os';

import { User, UserRole } from '../transactions/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Log } from '../logs/log.entity';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private repo: Repository<SystemSetting>,

    @InjectRepository(SystemSetting)
    private systemSettingsRepo: Repository<SystemSetting>,

    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Transaction)
    private transactionsRepo: Repository<Transaction>,

    @InjectRepository(Log)
    private logsRepo: Repository<Log>,

  ) { }

  async getAppName() {
    const setting = await this.repo.findOne({ where: { key: 'app_name' } });
    return setting?.value ?? 'MyFinanceApp';
  }

  async updateAppName(newName: string) {
    let setting = await this.repo.findOne({ where: { key: 'app_name' } });

    if (!setting) {
      setting = this.repo.create({ key: 'app_name', value: newName });
    } else {
      setting.value = newName;
    }

    return this.repo.save(setting);
  }
  getSystemInfo() {
    return {
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      database: 'connected', // we will replace this later with a real DB check
      environment: process.env.NODE_ENV || 'development',
      server: os.hostname(),
    };
  }

  async exportDatabase() {
    return {
      users: await this.usersRepo.find(),
      transactions: await this.transactionsRepo.find(),
      logs: await this.logsRepo.find(),
      systemSettings: await this.systemSettingsRepo.find(),
    };
  }

  async restoreDatabase(data: any) {
    console.log('--- RESTORE START ---');
    console.log('Incoming keys:', Object.keys(data));

    try {
      // 1. Delete in correct order (child → parent)
      console.log('Deleting logs...');
      await this.logsRepo.createQueryBuilder().delete().where('1=1').execute();

      console.log('Deleting transactions...');
      await this.transactionsRepo.createQueryBuilder().delete().where('1=1').execute();

      console.log('Deleting users...');
      await this.usersRepo.createQueryBuilder().delete().where('1=1').execute();

      console.log('Deleting system settings...');
      await this.systemSettingsRepo.createQueryBuilder().delete().where('1=1').execute();

      // 2. Reset auto-increment
      await this.logsRepo.query('ALTER TABLE logs AUTO_INCREMENT = 1');
      await this.transactionsRepo.query('ALTER TABLE transactions AUTO_INCREMENT = 1');
      await this.usersRepo.query('ALTER TABLE users AUTO_INCREMENT = 1');
      await this.systemSettingsRepo.query('ALTER TABLE system_setting AUTO_INCREMENT = 1');

      // 3. Restore users
      console.log('Restoring users...');
      if (data.users) await this.usersRepo.save(data.users);

      // 4. Restore system settings
      console.log('Restoring system settings...');
      if (data.systemSettings) await this.systemSettingsRepo.save(data.systemSettings);

      // 5. Restore transactions
      console.log('Restoring transactions...');
      if (data.transactions) await this.transactionsRepo.save(data.transactions);

      // 6. Restore logs
      console.log('Restoring logs...');
      if (data.logs) await this.logsRepo.save(data.logs);

      console.log('--- RESTORE COMPLETE ---');
      return { message: 'Database restored successfully' };

    } catch (err) {
      console.error('RESTORE ERROR:', err);
      throw err;
    }
  }

   async changeAdminPassword(
    adminId: number,
    body: { currentPassword: string; newPassword: string }
  ) {
    const { currentPassword, newPassword } = body;

    const admin = await this.usersRepo.findOne({
      where: { id: adminId },
    });

    if (!admin) {
      throw new BadRequestException("Admin not found");
    }

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.usersRepo.update(adminId, { password: hashed });

    return { message: "Password updated successfully" };
  }

  

}