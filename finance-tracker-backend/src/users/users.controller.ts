import {
  Controller,
  Put,
  Param,
  Patch,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // USER — can edit ONLY themselves
  @UseGuards(AuthGuard('jwt'))
  @Put('me')
  updateSelf(@Req() req, @Body() dto: UpdateUserDto) {
    console.log("USER:", req.user);
    return this.usersService.updateSelf(req.user.id, dto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Put('change-password')
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword
    );
  }

  // ADMIN — can edit ANY user
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put(':id')
  async adminUpdateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateUser(id, dto);
    return { success: true, user: updatedUser };
  }

  // STAFF — can edit USERS only
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('staff', 'admin')
  @Put(':id/staff-edit')
  async staffEditUser(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.staffEditUser(req.user, id, dto);
  }

  // ROLE CHANGE — admin only
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    return this.usersService.updateRole(id, role);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async updateStatus(
    @Param('id') id: number,
    @Body('status') status: 'active' | 'disabled',
  ) {
    return this.usersService.updateStatus(id, status);
  }

  @Get('online')
  findOnline() {
    return this.usersService.findOnlineUsers();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  getUserProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
@Patch('last-active')
updateLastActive(@Req() req) {
  return this.usersService.updateLastActive(req.user.id);
}
}