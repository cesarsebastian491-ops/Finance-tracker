import {
  Controller,
  Put,
  Post,
  Param,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  ParseIntPipe,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // ADMIN — create a new user (no CAPTCHA required)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('admin/create')
  async adminCreateUser(@Body() dto) {
    const user = await this.usersService.createUser(dto);
    return { success: true, user };
  }

  // USER — can get their own data
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getSelf(@Req() req) {
    return this.usersService.findById(req.user.id);
  }

  // USER — can edit ONLY themselves
  @UseGuards(AuthGuard('jwt'))
  @Put('me')
  updateSelf(@Req() req, @Body() dto: UpdateUserDto) {
    console.log("USER:", req.user);
    return this.usersService.updateSelf(req.user.id, dto);
  }

  // USER — upload profile picture
  @UseGuards(AuthGuard('jwt'))
  @Post('me/profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'avatars'),
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only .jpg, .jpeg, .png, .webp files are allowed'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadProfilePicture(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const picturePath = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateProfilePicture(req.user.id, picturePath);
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

  // STAFF — view list of users (no sensitive data)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('staff', 'admin')
  @Get('staff/list')
  async getStaffUserList() {
    const users = await this.usersService.findAll();
    return users.map(u => ({
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      lastActive: u.lastActive,
      online: u.online,
    }));
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