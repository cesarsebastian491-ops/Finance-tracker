import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { LogsService } from '../logs/logs.service';
@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private transactionsService: TransactionsService,
    private logsService: LogsService,
  ) {}

  async getOverview() {
    const users = await this.usersService.findAll();
    const transactions = await this.transactionsService.findAll();
    const logs = await this.logsService.findAll();

    return {
      totalUsers: users.length,
      totalTransactions: transactions.length,
      totalLogs: logs.length,
      users,
      transactions,
      logs,
    };
  }

  async getManagementSummary() {
    const users = await this.usersService.findAll();
    const transactions = await this.transactionsService.findAll();
    const logs = await this.logsService.findAll();

    const totalIncomeTransactions = await this.transactionsService.countIncome();
    const totalExpenseTransactions = await this.transactionsService.countExpense();

    return {
      totalUsers: users.length,
      totalTransactions: transactions.length,
      totalLogs: logs.length,
      totalIncomeTransactions,
      totalExpenseTransactions,
    };
  }
    async findAll() {
    return this.usersService.findAll();
  }

}