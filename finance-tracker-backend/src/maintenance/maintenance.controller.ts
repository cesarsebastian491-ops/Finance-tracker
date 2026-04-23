import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Res,
  StreamableFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MaintenanceService } from "./maintenance.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import type { Response } from "express";

@Controller("maintenance")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin") // ADMIN ONLY ACCESS
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post("backup")
  async backup(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const data = await this.maintenanceService.backupDatabase();
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="backup.json"',
    });
    return new StreamableFile(Buffer.from(JSON.stringify(data, null, 2)));
  }

  @Post("restore")
  @UseInterceptors(FileInterceptor("file"))
  restore(@UploadedFile() file: Express.Multer.File) {
    return this.maintenanceService.restoreDatabase(file);
  }

  @Delete("logs")
  clearLogs() {
    return this.maintenanceService.clearLogs();
  }

  @Delete("transactions")
  clearTransactions() {
    return this.maintenanceService.clearTransactions();
  }
}