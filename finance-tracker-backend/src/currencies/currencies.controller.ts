import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrenciesService } from './currencies.service';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) { }

  // Get all currencies
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.currenciesService.findAll();
  }

  // Get active currency
  @Get('active')
  @UseGuards(AuthGuard('jwt'))
  async getActiveCurrency() {
    return this.currenciesService.getActiveCurrency();
  }

  // Create new currency (admin only)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async create(@Body() body: { code: string; name: string; symbol: string; exchangeRate?: number }) {
    return this.currenciesService.create(
      body.code,
      body.name,
      body.symbol,
      body.exchangeRate || 1,
    );
  }

  // Set active currency (admin only) — MUST be before :id route
  @Put(':id/activate')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async setActiveCurrency(@Param('id') id: string) {
    try {
      return await this.currenciesService.setActiveCurrency(+id);
    } catch (err) {
      throw new HttpException(err.message || 'Failed to activate currency', HttpStatus.BAD_REQUEST);
    }
  }

  // Update currency (admin only)
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: Partial<{ name: string; symbol: string; exchangeRate: number }>) {
    return this.currenciesService.update(+id, body);
  }

  // Delete currency (admin only)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    try {
      return await this.currenciesService.delete(+id);
    } catch (err) {
      throw new HttpException(err.message || 'Failed to delete currency', HttpStatus.BAD_REQUEST);
    }
  }
}
