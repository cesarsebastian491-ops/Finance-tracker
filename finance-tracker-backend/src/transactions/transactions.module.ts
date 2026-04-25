import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Category } from './entities/category.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { LogsModule } from '../logs/logs.module';
import { CurrenciesModule } from '../currencies/currencies.module';
import { RecurringService } from './recurring.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Category]), LogsModule, CurrenciesModule],
  controllers: [TransactionsController],
  providers: [TransactionsService , RecurringService ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
