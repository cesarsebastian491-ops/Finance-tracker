import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Category } from './entities/category.entity';
import { LogsService } from '../logs/logs.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { BadRequestException, NotFoundException } from "@nestjs/common";

@Injectable()
export class TransactionsService {
  private static readonly DEFAULT_EXPENSE_CATEGORIES = [
    'Food',
    'Groceries',
    'Transport',
    'Shopping',
    'Bills',
    'Entertainment',
    'Others',
  ];

  private static readonly DEFAULT_INCOME_CATEGORIES = [
    'Salary',
    'Freelance',
    'Business',
    'Investment',
    'Rental',
    'Bonus',
    'Gift',
    'Refund',
    'Other',
  ];

  constructor(
    @InjectRepository(Transaction)
    private repo: Repository<Transaction>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    private readonly logsService: LogsService,
    private readonly currenciesService: CurrenciesService,
  ) { }

  private async ensureDefaultCategories(): Promise<void> {
    const defaults: Array<{ type: 'income' | 'expense'; name: string }> = [
      ...TransactionsService.DEFAULT_EXPENSE_CATEGORIES.map((name) => ({ type: 'expense' as const, name })),
      ...TransactionsService.DEFAULT_INCOME_CATEGORIES.map((name) => ({ type: 'income' as const, name })),
    ];

    for (const category of defaults) {
      const exists = await this.categoryRepo.findOne({
        where: { type: category.type, name: category.name },
      });

      if (!exists) {
        await this.categoryRepo.save(
          this.categoryRepo.create({
            type: category.type,
            name: category.name,
            isActive: 1,
          }),
        );
      }
    }
  }

  private async ensureCategoryExists(name: string, type: 'income' | 'expense'): Promise<void> {
    const cleanName = String(name || '').trim();
    if (!cleanName) return;

    const exists = await this.categoryRepo.findOne({ where: { name: cleanName, type } });
    if (!exists) {
      await this.categoryRepo.save(
        this.categoryRepo.create({
          name: cleanName,
          type,
          isActive: 1,
        }),
      );
    } else if (exists.isActive === 0) {
      exists.isActive = 1;
      await this.categoryRepo.save(exists);
    }
  }

  async getCategories(type?: 'income' | 'expense', includeInactive = false) {
    await this.ensureDefaultCategories();

    const where: any = type ? { type } : {};
    if (!includeInactive) {
      where.isActive = 1;
    }
    return this.categoryRepo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async createCategory(name: string, type: 'income' | 'expense') {
    if (!name || !type) return null;

    const cleanName = String(name).trim();
    if (!cleanName) return null;

    await this.ensureCategoryExists(cleanName, type);
    return this.categoryRepo.findOne({ where: { name: cleanName, type } });
  }

  async updateCategory(id: number, name: string, type: 'income' | 'expense') {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const cleanName = String(name || '').trim();
    if (!cleanName || !type) {
      throw new BadRequestException('Category name and type are required');
    }

    const duplicate = await this.categoryRepo.findOne({ where: { name: cleanName, type } });
    if (duplicate && duplicate.id !== category.id) {
      throw new BadRequestException('Category already exists for this type');
    }

    category.name = cleanName;
    category.type = type;
    category.isActive = 1;

    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    category.isActive = 0;
    await this.categoryRepo.save(category);

    return { success: true };
  }

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
    await this.ensureCategoryExists(dto.category, 'expense');

    const expense = await this.repo.save({
      ...dto,
      amount: parseFloat(dto.amount),
      tax: dto.tax ? parseFloat(dto.tax) : null,
      serviceFee: dto.serviceFee ? parseFloat(dto.serviceFee) : null,
      discount: dto.discount ? parseFloat(dto.discount) : null,
      otherCharge: dto.otherCharge ? parseFloat(dto.otherCharge) : null,

      isRecurring: dto.isRecurring ?? false,
      recurringType: dto.recurringType ?? null,
      recurringEndDate: dto.recurringEndDate ?? null,
      nextDueDate: dto.nextDueDate ?? null,
    });

    const activeCurrency = await this.currenciesService.getActiveCurrency();
    const currencySymbol = activeCurrency?.symbol || '$';
    await this.logsService.create({
      userId: dto.user.id,
      action: 'ADD_EXPENSE',
      message: `Added expense '${dto.expense}' for ${currencySymbol}${dto.amount}`,
    });

    return expense;
  }

  async updateExpense(id: number, dto) {
    await this.ensureCategoryExists(dto.category, 'expense');

    await this.repo.update(id, {
      expense: dto.expense,
      category: dto.category,
      date: dto.date,
      amount: parseFloat(dto.amount),
      description: dto.description,
      user: { id: dto.user.id },

      tax: dto.tax ? parseFloat(dto.tax) : null,
      serviceFee: dto.serviceFee ? parseFloat(dto.serviceFee) : null,
      discount: dto.discount ? parseFloat(dto.discount) : null,
      otherCharge: dto.otherCharge ? parseFloat(dto.otherCharge) : null,

      isRecurring: dto.isRecurring ?? false,
      recurringType: dto.recurringType ?? null,
      recurringEndDate: dto.recurringEndDate ?? null,
      nextDueDate: dto.nextDueDate ?? null,
    });

    const activeCurrency = await this.currenciesService.getActiveCurrency();
    const currencySymbol = activeCurrency?.symbol || '$';
    await this.logsService.create({
      userId: dto.user.id,
      action: 'EDIT_EXPENSE',
      message: `Updated expense '${dto.expense}' to ${currencySymbol}${dto.amount}`,
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
    const incomeTitle = dto.source || null;
    const incomeCategory = dto.category || 'Other';
    await this.ensureCategoryExists(incomeCategory, 'income');

    const income = await this.repo.save({
      ...dto,
      source: incomeTitle,
      category: incomeCategory,
      amount: parseFloat(dto.amount),
      tax: dto.tax ? parseFloat(dto.tax) : null,
      serviceFee: dto.serviceFee ? parseFloat(dto.serviceFee) : null,
      discount: dto.discount ? parseFloat(dto.discount) : null,
      otherCharge: dto.otherCharge ? parseFloat(dto.otherCharge) : null,

      isRecurring: dto.isRecurring ?? false,
      recurringType: dto.recurringType ?? null,
      recurringEndDate: dto.recurringEndDate ?? null,
      nextDueDate: dto.nextDueDate ?? null,
    });

    const activeCurrency = await this.currenciesService.getActiveCurrency();
    const currencySymbol = activeCurrency?.symbol || '$';
    await this.logsService.create({
      userId: dto.user.id,
      action: 'ADD_INCOME',
      message: `Added income '${incomeTitle || 'Untitled'}' for ${currencySymbol}${dto.amount}`,
    });

    return income;
  }

  async updateIncome(id: number, dto) {
    const incomeTitle = dto.source || null;
    const incomeCategory = dto.category || 'Other';
    await this.ensureCategoryExists(incomeCategory, 'income');

    await this.repo.update(id, {
      ...dto,
      source: incomeTitle,
      category: incomeCategory,
      amount: parseFloat(dto.amount),

      tax: dto.tax ? parseFloat(dto.tax) : null,
      serviceFee: dto.serviceFee ? parseFloat(dto.serviceFee) : null,
      discount: dto.discount ? parseFloat(dto.discount) : null,
      otherCharge: dto.otherCharge ? parseFloat(dto.otherCharge) : null,

      isRecurring: dto.isRecurring ?? false,
      recurringType: dto.recurringType ?? null,
      recurringEndDate: dto.recurringEndDate ?? null,
      nextDueDate: dto.nextDueDate ?? null,
    });

    await this.logsService.create({
      userId: dto.user.id,
      action: 'EDIT_INCOME',
      message: `Updated income '${incomeTitle || 'Untitled'}'`,
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
    return this.repo.createQueryBuilder().delete().where('1=1').execute();
  }

  async replaceAll(newTransactions: any[]) {
    await this.repo.createQueryBuilder().delete().where('1=1').execute();
    if (newTransactions && newTransactions.length > 0) {
      const plainTransactions = newTransactions.map(({ user, ...t }) => t);
      return this.repo.save(plainTransactions);
    }
    return [];
  }
}
