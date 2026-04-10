import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from "../auth/roles.decorator";

@Controller('analytics')
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Get('summary')
    async getSummary() {
        return this.analyticsService.getSummary();
    }

    @Get("users")
    getUsersAnalytics() {
        return this.analyticsService.getUsersAnalytics();
    }
    @Get('transactions')
    async getTransactionAnalytics() {
        return this.analyticsService.getTransactionAnalytics();
    }


    @Get('security')
    async getSecurityAnalytics() {
        return this.analyticsService.getSecurityAnalytics();
    }

    @Get('system')
    async getSystemAnalytics() {
        return this.analyticsService.getSystemAnalytics();
    }

    // staff 
    @Get("staff/summary")
    @Roles("staff", "admin")
    async getStaffSummary() {
        return this.analyticsService.getStaffSummary();
    }

    @Get("staff/recent-transactions")
    @Roles("staff", "admin")
    async getStaffRecentTransactions() {
        return this.analyticsService.getStaffRecentTransactions();
    }

    @Get("staff/monthly")
    @Roles("staff", "admin")
    async getStaffMonthly(@Query("month") month: number, @Query("year") year: number) {
        return this.analyticsService.getStaffMonthly(month, year);
    }

    @Get("staff/recent-logs")
    @Roles("staff", "admin")
    async getStaffRecentLogs() {
        return this.analyticsService.getRecentLogs();
    }

    @Get("staff/transactions")
    @Roles("staff", "admin")
    async getStaffTransactions() {
        return this.analyticsService.getStaffTransactions();
    }

    @Get("staff/category-breakdown")
    @Roles("staff", "admin")
    async getStaffCategoryBreakdown() {
        return this.analyticsService.getStaffCategoryBreakdown();
    }

}