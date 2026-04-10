import { Controller, Get, Put, Body ,UseGuards, Req, } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { Res } from '@nestjs/common';
import type { Response } from 'express';
import { Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('system-settings')
export class SystemSettingsController {
    constructor(private readonly service: SystemSettingsService) { }

    @Get('app-name')
    async getAppName() {
        const value = await this.service.getAppName();
        return { value };
    }

    @Put('app-name')
    updateAppName(@Body('value') value: string) {
        return this.service.updateAppName(value);
    }

    @Get('system-info')
    getSystemInfo() {
        return this.service.getSystemInfo();
    }
    @Get('backup/export')
    async exportDatabase(@Res() res: Response) {
        const backup = await this.service.exportDatabase();

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=backup.json');

        return res.send(JSON.stringify(backup, null, 2));
    }

    @Post('backup/restore')
    @UseInterceptors(FileInterceptor('file'))
    async restoreDatabase(@UploadedFile() file: Express.Multer.File) {
        const json = JSON.parse(file.buffer.toString());
        return this.service.restoreDatabase(json);
    }

    @Put("security/change-password")
    @UseGuards(JwtAuthGuard)
    async changeAdminPassword(
        @Req() req,
        @Body() body: { currentPassword: string; newPassword: string }
    ) {
        return this.service.changeAdminPassword(req.user.id, body);
    }
}