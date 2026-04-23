import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './currency.entity';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private currenciesRepo: Repository<Currency>,
  ) { }

  // Get all currencies
  async findAll() {
    return this.currenciesRepo.find({
      order: { isActive: 'DESC', code: 'ASC' },
    });
  }

  // Get active currency
  async getActiveCurrency() {
    return this.currenciesRepo.findOne({
      where: { isActive: true },
    });
  }

  // Create new currency
  async create(code: string, name: string, symbol: string, exchangeRate: number = 1) {
    const currency = this.currenciesRepo.create({
      code,
      name,
      symbol,
      exchangeRate,
      isActive: false,
    });

    return this.currenciesRepo.save(currency);
  }

  // Update currency
  async update(id: number, updateData: Partial<Currency>) {
    await this.currenciesRepo.update(id, updateData);
    return this.currenciesRepo.findOne({ where: { id } });
  }

  // Set active currency
  async setActiveCurrency(currencyId: number) {
    // Verify currency exists
    const currency = await this.currenciesRepo.findOne({ where: { id: currencyId } });
    if (!currency) {
      throw new Error('Currency not found');
    }

    // Deactivate all currencies using query builder to avoid empty-criteria issue
    await this.currenciesRepo
      .createQueryBuilder()
      .update(Currency)
      .set({ isActive: false })
      .execute();

    // Activate the selected currency
    await this.currenciesRepo.update(currencyId, { isActive: true });

    return this.currenciesRepo.findOne({ where: { id: currencyId } });
  }

  // Delete currency
  async delete(id: number) {
    const currency = await this.currenciesRepo.findOne({ where: { id } });

    // Don't allow deleting the active currency
    if (currency?.isActive) {
      throw new Error('Cannot delete active currency');
    }

    await this.currenciesRepo.delete(id);
    return { success: true };
  }

  // Seed default currencies
  async seedCurrencies() {
    const existing = await this.currenciesRepo.count();
    if (existing > 0) return; // Already seeded

    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1, isActive: false },
      { code: 'PHP', name: 'Philippine Peso', symbol: '₱', exchangeRate: 56.5, isActive: true },
      { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92, isActive: false },
      { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79, isActive: false },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 149.5, isActive: false },
    ];

    for (const curr of currencies) {
      await this.currenciesRepo.save(curr);
    }
  }
}
