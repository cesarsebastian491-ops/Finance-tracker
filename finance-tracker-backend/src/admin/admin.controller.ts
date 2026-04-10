import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Roles('admin')
  @Get('overview')
  getOverview() {
    return this.adminService.getOverview();
  }
  @Get("management-summary")
  getManagementSummary() {
    return this.adminService.getManagementSummary();
  }
  @Get("users")
  getAllUsers() {
    return this.adminService.findAll();
  }


}