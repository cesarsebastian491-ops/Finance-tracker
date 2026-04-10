import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import dayjs from 'dayjs';

@Injectable()
export class RecurringService {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
  ) {}

  @Cron('0 0 * * *') // Runs every midnight
  async handleRecurring() {
    const recurring = await this.repo.find({
      where: { isRecurring: 1 },
    });

    const today = dayjs().format('YYYY-MM-DD');

    for (const item of recurring) {
      // Stop if end date passed
      if (item.recurringEndDate && dayjs(today).isAfter(item.recurringEndDate)) {
        continue;
      }

      // Prevent duplicates
      if (item.lastGenerated && dayjs(item.lastGenerated).isSame(today, 'day')) {
        continue;
      }

      // Should we generate today?
      if (!this.shouldGenerateToday(item)) continue;

      // Create new transaction
      const newTx = this.repo.create({
        ...item,
        id: undefined, // new record
        date: today,
        lastGenerated: today,
      });

      await this.repo.save(newTx);

      // Update lastGenerated on original recurring template
      await this.repo.update(item.id, { lastGenerated: today });
    }
  }

  shouldGenerateToday(item: Transaction) {
    const last = item.lastGenerated || item.date;
    const today = dayjs();

    switch (item.recurringType) {
      case 'daily':
        return true;

      case 'weekly':
        return today.isSame(dayjs(last).add(1, 'week'), 'day');

      case 'monthly':
        return today.isSame(dayjs(last).add(1, 'month'), 'day');

      case 'yearly':
        return today.isSame(dayjs(last).add(1, 'year'), 'day');

      default:
        return false;
    }
  }
}