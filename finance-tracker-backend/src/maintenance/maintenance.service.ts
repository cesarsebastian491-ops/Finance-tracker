import { Injectable, BadRequestException } from "@nestjs/common";
import { LogsService } from "../logs/logs.service";
import { TransactionsService } from "../transactions/transactions.service";
import { UsersService } from "../users/users.service";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly logsService: LogsService,
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
  ) { }

  async backupDatabase() {
    const backup = {
      users: await this.usersService.exportAllForBackup(),      // ⭐ plain users
      transactions: await this.transactionsService.findAll(),
      logs: await this.logsService.findAll(),
    };

    const backupDir = path.join(__dirname, "../../backups");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const filePath = path.join(backupDir, "backup.json");
    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

    return { message: "Backup created successfully", file: "backup.json" };
  }

  async restoreDatabase(file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file uploaded");

    const data = JSON.parse(file.buffer.toString());

    this.logsService.disableLogging(); // ⭐ no logs during restore

    try {
      const users = data.users || [];
      const transactions = data.transactions || [];
      const logs = data.logs || [];

      // 1) Clear in FK-safe order
      await this.logsService.clearAll();
      await this.transactionsService.clearAll();
      await this.usersService.clearAll();

      // 2) Restore in FK-safe order
      await this.usersService.replaceAll(users);
      await this.transactionsService.replaceAll(transactions);
      await this.logsService.replaceAll(logs);
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