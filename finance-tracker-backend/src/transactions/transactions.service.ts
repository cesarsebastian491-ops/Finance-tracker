import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { LogsService } from '../logs/logs.service';
import { NotFoundException } from "@nestjs/common";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private repo: Repository<Transaction>,
    private readonly logsService: LogsService,
  ) { }

  create(data: Partial<Transaction>) {
    const transaction = this.repo.create(data);
    return this.repo.save(transaction);
  }

  findAll(filter?: any) {
    return this.repo.find({
      relations: ['user'],
      ...filter,
    });
  }

  async countIncome() {
    return this.repo.count({ where: { type: "income" } });
  }

  async countExpense() {
    return this.repo.count({ where: { type: "expense" } });
  }
  async findAllWithUsers() {
    return this.repo.find({
      relations: ["user"],
      order: { date: "DESC" },
    });
  }


  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<Transaction>) {
    if (data.userId) {
      data.user = { id: data.userId } as any;
      delete data.userId;
    }

    await this.repo.update(id, data);

    return this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  delete(id: number) {
    return this.repo.delete(id);
  }

  // ⭐ Correct implementation
  async findByUser(userId: number) {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
  async addExpense(dto) {
    const expense = await this.repo.save({
      ...dto,
      tax: dto.tax ?? null,
      serviceFee: dto.serviceFee ?? null,
      discount: dto.discount ?? null,
      otherCharge: dto.otherCharge ?? null,

      isRecurring: dto.isRecurring ?? false,
      recurringType: dto.recurringType ?? null,
      recurringEndDate: dto.recurringEndDate ?? null,
    });

    await this.logsService.create({
      userId: dto.user.id,
      action: 'ADD_EXPENSE',
      message: `Added expense '${dto.expense}' for $${dto.amount}`,
    });

    return expense;
  }

  async updateExpense(id: number, dto) {
    await this.repo.update(id, {
      expense: dto.expense,
      category: dto.category,
      date: dto.date,
      amount: dto.amount,
      description: dto.description,
      user: { id: dto.user.id },

      tax: dto.tax ?? null,
      serviceFee: dto.serviceFee ?? null,
      discount: dto.discount ?? null,
      otherCharge: dto.otherCharge ?? null,

      isRecurring: dto.isRecurring ?? false,
      recurringType: dto.recurringType ?? null,
      recurringEndDate: dto.recurringEndDate ?? null,
    });

    await this.logsService.create({
      userId: dto.user.id,
      action: 'EDIT_EXPENSE',
      message: `Updated expense '${dto.expense}' to $${dto.amount}`,
    });

    return this.repo.findOne({ where: { id } });
  }


  async deleteExpense(id: number, userId: number) {
    // Get the expense BEFORE deleting it
    const expense = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });

    await this.repo.delete(id);

    await this.logsService.create({
      userId,
      action: 'DELETE_EXPENSE',
      message: `Deleted expense '${expense?.expense}'`,
    });

    return { success: true };
  }

  async addIncome(dto) {
    const income = await this.repo.save({
      ...dto,
      tax: dto.tax ?? null,
      serviceFee: dto.serviceFee ?? null,
      discount: dto.discount ?? null,
      otherCharge: dto.otherCharge ?? null,

      isRecurring: dto.isRecurring ?? false,
      recurringType: dto.recurringType ?? null,
      recurringEndDate: dto.recurringEndDate ?? null,
    });

    await this.logsService.create({
      userId: dto.user.id,
      action: 'ADD_INCOME',
      message: `Added income '${dto.source}' for $${dto.amount}`,
    });

    return income;
  }

  async updateIncome(id: number, dto) {
    await this.repo.update(id, {
      ...dto,

      tax: dto.tax ?? null,
      serviceFee: dto.serviceFee ?? null,
      discount: dto.discount ?? null,
      otherCharge: dto.otherCharge ?? null,

      isRecurring: dto.isRecurring ?? false,
      recurringType: dto.recurringType ?? null,
      recurringEndDate: dto.recurringEndDate ?? null,
    });

    await this.logsService.create({
      userId: dto.user.id,
      action: 'EDIT_INCOME',
      message: `Updated income '${dto.source}'`,
    });

    return { success: true };
  }

  
  async deleteIncome(id: number, userId: number) {
    const income = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });

    await this.repo.delete(id);

    await this.logsService.create({
      userId,
      action: 'DELETE_INCOME',
      message: `Deleted income '${income?.source}'`,
    });

    return { success: true };
  }

  async updateAsAdmin(id: number, dto, actorId: number) {
    // If admin updates the userId, convert it to a relation
    if (dto.userId) {
      dto.user = { id: dto.userId } as any;
      delete dto.userId;
    }

    await this.repo.update(id, dto);

    await this.logsService.create({
      userId: actorId, // ⭐ actor = admin
      action: "ADMIN_EDIT_TRANSACTION",
      message: `Admin edited transaction ${id}`,
    });

    return this.repo.findOne({
      where: { id },
      relations: ["user"],
    });
  }
  async deleteAsAdmin(id: number) {
    const transaction = await this.repo.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    await this.repo.delete(id);

    await this.logsService.create({
      userId: transaction.user.id,
      action: transaction.type === "expense" ? "DELETE_EXPENSE" : "DELETE_INCOME",
      message:
        transaction.type === "expense"
          ? `Admin deleted expense '${transaction.expense}'`
          : `Admin deleted income '${transaction.source}'`,
    });

    return { success: true };
  }

  async clearAll() {
    return this.repo.clear();
  }

  async replaceAll(newTransactions: any[]) {
    await this.repo.clear();
    return this.repo.save(newTransactions);
  }
}
