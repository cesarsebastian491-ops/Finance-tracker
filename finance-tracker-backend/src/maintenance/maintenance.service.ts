import { Injectable, BadRequestException } from "@nestjs/common";
import { LogsService } from "../logs/logs.service";
import { TransactionsService } from "../transactions/transactions.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly logsService: LogsService,
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
  ) { }

  async backupDatabase() {
    const backup = {
      users: await this.usersService.exportAllForBackup(),
      transactions: await this.transactionsService.findAll(),
      logs: await this.logsService.findAll(),
    };
    return backup;
  }

  async restoreDatabase(file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file uploaded");

    let data;
    try {
      data = JSON.parse(file.buffer.toString());
    } catch (err) {
      throw new BadRequestException("Backup file is not valid JSON.");
    }

    this.logsService.disableLogging(); // ⭐ no logs during restore

    try {
      const users = data.users || [];
      const transactions = data.transactions || [];
      const logs = data.logs || [];

      // 1) Clear in FK-safe order (logs, transactions, users)
      await this.logsService.clearAll();
      await this.transactionsService.clearAll();
      await this.usersService.clearAll();

      // 2) Restore in FK-safe order (users, transactions, logs)
      if (users.length > 0) {
        await this.usersService.replaceAll(users);
      }
      if (transactions.length > 0) {
        await this.transactionsService.replaceAll(transactions);
      }
      if (logs.length > 0) {
        await this.logsService.replaceAll(logs);
      }
    } catch (err) {
      // Return error to frontend for debugging
      throw new BadRequestException(`Restore failed: ${(err as any)?.message || String(err)}`);
    } finally {
      this.logsService.enableLogging();
    }

    return { message: "System restored from backup" };
  }

  async clearLogs() {
    await this.logsService.clearAll();
    return { message: "All logs cleared" };
  }

  async clearTransactions() {
    await this.transactionsService.clearAll();
    return { message: "All transactions cleared" };
  }
}