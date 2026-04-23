import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) { }

  @Get('categories')
  async getCategories(
    @Query('type') type?: 'income' | 'expense',
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.service.getCategories(type, includeInactive === 'true');
  }

  @Post('categories')
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin")
  async createCategory(@Body() dto: { name: string; type: 'income' | 'expense' }) {
    return this.service.createCategory(dto.name, dto.type);
  }

  @Put('categories/:id')
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin")
  async updateCategory(
    @Param('id') id: number,
    @Body() dto: { name: string; type: 'income' | 'expense' },
  ) {
    return this.service.updateCategory(id, dto.name, dto.type);
  }

  @Delete('categories/:id')
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin")
  async deleteCategory(@Param('id') id: number) {
    return this.service.deleteCategory(id);
  }

  @Get('user/:id')
  async getUserTransactions(@Param('id') id: number) {
    return this.service.findByUser(id);
  }

  @Get("admin/transactions")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin")
  async getAllTransactionsForAdmin() {
    return this.service.findAllWithUsers();
  }

  @Put("admin/update/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin")
  updateTransactionAsAdmin(
    @Param("id") id: number,
    @Body() body
  ) {
    return this.service.update(id, body);
  }

  // EXPENSE ROUTES
  @Post('add-expense')
  addExpense(@Body() dto) {

    // ⭐ Convert boolean → tinyint for MySQL
    dto.isRecurring = dto.isRecurring ? 1 : 0;

    return this.service.addExpense(dto);
  }

  @Put('update-expense/:id')
  updateExpense(@Param('id') id: number, @Body() dto) {

    // ⭐ Convert boolean → tinyint for MySQL
    if (dto.isRecurring !== undefined) {
      dto.isRecurring = dto.isRecurring ? 1 : 0;
    }

    return this.service.updateExpense(id, dto);
  }

  @Delete('delete-expense/:id/:userId')
  deleteExpense(@Param('id') id: number, @Param('userId') userId: number) {
    return this.service.deleteExpense(id, userId);
  }

  // INCOME ROUTES
  @Post('add-income')
  addIncome(@Body() dto) {
    // ⭐ Convert boolean → tinyint for MySQL
    dto.isRecurring = dto.isRecurring ? 1 : 0;

    return this.service.addIncome(dto);
  }

  @Put('update-income/:id')
  updateIncome(@Param('id') id: number, @Body() dto) {
    // ⭐ Convert boolean → tinyint for MySQL
    if (dto.isRecurring !== undefined) {
      dto.isRecurring = dto.isRecurring ? 1 : 0;
    }

    return this.service.updateIncome(id, dto);
  }

  @Delete('delete-income/:id/:userId')
  deleteIncome(@Param('id') id: number, @Param('userId') userId: number) {
    return this.service.deleteIncome(id, userId);
  }

  @Delete("admin/delete/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin")
  deleteTransactionAsAdmin(@Param("id") id: number) {
    return this.service.deleteAsAdmin(id);
  }
}