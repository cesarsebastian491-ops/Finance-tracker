import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MaintenanceService } from "./maintenance.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("maintenance")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin") // ADMIN ONLY ACCESS
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post("backup")
  backup() {
    return this.maintenanceService.backupDatabase();
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