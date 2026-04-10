import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../transactions/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Log } from '../logs/log.entity';
import { Session } from '../sessions/session.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(Transaction)
        private transactionRepo: Repository<Transaction>,

        @InjectRepository(Log)
        private securityRepo: Repository<Log>,

        @InjectRepository(Session)
        private readonly sessionsRepo: Repository<Session>,

    ) { }

    isOnline(lastActive: Date): boolean {
        if (!lastActive) return false;

        const diff = Date.now() - new Date(lastActive).getTime();
        return diff < 5 * 60 * 1000; // 5 minutes
    }

    async getSummary() {
        const totalUsers = await this.userRepo.count();

        const newUsers = await this.userRepo.count({
            where: {
                createdAt: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
            },
        });

        const totalTransactions = await this.transactionRepo.count();

        const failedLogins = await this.securityRepo.count({
            where: { action: 'FAILED_LOGIN' },
        });

        return {
            totalUsers,
            newUsers,
            totalTransactions,
            failedLogins,
        };
    }

    async getUsersAnalytics() {
        const totalUsers = await this.userRepo.count();

        const newUsers = await this.userRepo.count({
            where: {
                createdAt: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
            },
        });

        const users = await this.userRepo.find();

        const activeUsers = users.filter(u => this.isOnline(u.lastActive)).length;

        const usersByRole = await this.userRepo
            .createQueryBuilder("user")
            .select("user.role", "role")
            .addSelect("COUNT(*)", "count")
            .groupBy("user.role")
            .getRawMany();

        const usersByStatus = await this.userRepo
            .createQueryBuilder("user")
            .select("user.status", "status")
            .addSelect("COUNT(*)", "count")
            .groupBy("user.status")
            .getRawMany();

        return {
            totalUsers,
            newUsers,
            activeUsers,
            usersByRole,
            usersByStatus,
        };
    }

    async getTransactionAnalytics() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch all transactions with user info
        const allTransactions = await this.transactionRepo.find({
            relations: ['user'],
            order: { date: 'DESC' },
        });

        // Separate income and expense
        const incomeList = allTransactions.filter(t => t.type === 'income');
        const expenseList = allTransactions.filter(t => t.type === 'expense');

        // This month lists
        const thisMonthIncomeList = incomeList.filter(
            t => new Date(t.date) >= startOfMonth,
        );
        const thisMonthExpenseList = expenseList.filter(
            t => new Date(t.date) >= startOfMonth,
        );

        // Totals
        const totalIncome = incomeList.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenseList.reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalIncome - totalExpense;

        const thisMonthIncome = thisMonthIncomeList.reduce(
            (sum, t) => sum + t.amount,
            0,
        );
        const thisMonthExpense = thisMonthExpenseList.reduce(
            (sum, t) => sum + t.amount,
            0,
        );

        // Income vs Expense by month (last 12 months)
        const incomeVsExpense: { month: string; income: number; expense: number }[] = [];

        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });

            const monthIncome = incomeList
                .filter(t => new Date(t.date).getMonth() === date.getMonth())
                .reduce((sum, t) => sum + t.amount, 0);

            const monthExpense = expenseList
                .filter(t => new Date(t.date).getMonth() === date.getMonth())
                .reduce((sum, t) => sum + t.amount, 0);

            incomeVsExpense.unshift({
                month: monthName,
                income: monthIncome,
                expense: monthExpense,
            });
        }

        // Category breakdown (expense only)
        // Category breakdown (THIS MONTH ONLY)
        const categories = {};
        for (const t of thisMonthExpenseList) {
            if (!categories[t.category]) categories[t.category] = 0;
            categories[t.category] += t.amount;
        }

        const categoryBreakdown = Object.entries(categories).map(
            ([category, amount]) => ({
                category,
                amount,
            }),
        );

        // Recent transactions (last 10)
        const recentTransactions = allTransactions.slice(0, 10);

        return {
            totalIncome,
            totalExpense,
            netBalance,
            totalTransactions: allTransactions.length,

            thisMonthIncome,
            thisMonthExpense,

            incomeList,
            expenseList,
            thisMonthIncomeList,
            thisMonthExpenseList,
            allTransactionsList: allTransactions,

            incomeVsExpense,
            categoryBreakdown,
            recentTransactions,
        };
    }

    async getSecurityAnalytics() {
        const totalLogins = await this.securityRepo.count({
            where: { action: 'LOGIN' },
        });

        const failedLogins = await this.securityRepo.count({
            where: { action: 'FAILED_LOGIN' },
        });

        const activeSessions = await this.sessionsRepo.count({
            where: { isRevoked: false },
        });

        const recentSecurityLogs = await this.securityRepo.find({
            relations: ['user'],
            order: { timestamp: 'DESC' },
            take: 10,
        });

        return {
            totalLogins,
            failedLogins,
            activeSessions,
            recentSecurityLogs,
        };
    }

    async getSystemAnalytics() {
        const logs = await this.securityRepo.find();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const requestsToday = logs.filter(l => new Date(l.timestamp) >= today).length;

        const errors = logs.filter(l =>
            l.action === 'ERROR' ||
            l.message.includes('500') ||
            l.message.includes('Exception')
        ).length;

        const slowEndpoints = logs
            .filter(l => l.message.includes('Slow'))
            .slice(0, 10);

        const endpointCounts = {};
        logs.forEach(l => {
            if (!endpointCounts[l.action]) endpointCounts[l.action] = 0;
            endpointCounts[l.action]++;
        });

        const mostUsed: { endpoint: string; count: number }[] =
            Object.entries(endpointCounts).map(([endpoint, count]) => ({
                endpoint,
                count: Number(count),
            }));

        mostUsed.sort((a, b) => b.count - a.count);

        return {
            requestsToday,
            errors,
            slowEndpoints,
            mostUsed,
        };
    }

    // staff
    async getStaffSummary() {
        const allTransactions = await this.transactionRepo.find();
        console.log("ALL TRANSACTION DATES:", allTransactions.map(t => t.date));

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const income = allTransactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = allTransactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        const thisMonthIncome = allTransactions
            .filter(t => {
                const d = new Date(t.date);
                return (
                    t.type === "income" &&
                    d.getMonth() === thisMonth &&
                    d.getFullYear() === thisYear
                );
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const thisMonthExpense = allTransactions
            .filter(t => {
                const d = new Date(t.date);
                return (
                    t.type === "expense" &&
                    d.getMonth() === thisMonth &&
                    d.getFullYear() === thisYear
                );
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const activeUsers = await this.userRepo.count({
            where: { status: "active" },
        });

        return {
            totalTransactions: allTransactions.length,
            income,
            expense,
            thisMonthIncome,
            thisMonthExpense,
            activeUsers,
        };
    }

    async getStaffRecentTransactions() {
        return this.transactionRepo.find({
            order: { date: "DESC" },
            take: 5,
            relations: ["user"],
        });
    }

    async getStaffMonthly(month: number, year: number) {
        const all = await this.transactionRepo.find();

        const filtered = all.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year);
        });

        const income = filtered
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = filtered
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        return { income, expense };
    }


    async getRecentLogs() {
        return this.securityRepo.find({
            relations: ["user"],
            order: { timestamp: "DESC" },
            take: 10,
        });
    }

    async getStaffTransactions() {
        return this.transactionRepo.find({
            relations: ["user"],
            order: { date: "DESC" },
        });
    }

    async getStaffCategoryBreakdown() {
        const all = await this.transactionRepo.find();

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const filtered = all.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });

        const breakdown = {};

        filtered.forEach(t => {
            if (!t.category) return;
            breakdown[t.category] = (breakdown[t.category] || 0) + Number(t.amount);
        });

        return Object.entries(breakdown).map(([category, amount]) => ({
            category,
            amount,
        }));
    }

}

