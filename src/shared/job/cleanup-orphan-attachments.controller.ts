import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { CleanupOrphanAttachmentsJob } from './cleanup-orphan-attachments.job';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';

@Controller('admin/attachments')
@UseGuards(JwtAuthGuard)
export class CleanupOrphanAttachmentsController {
  private readonly logger = new Logger(CleanupOrphanAttachmentsController.name);

  constructor(
    private readonly cleanupJob: CleanupOrphanAttachmentsJob,
  ) {}

  @Post('cleanup-orphans')
  @HttpCode(HttpStatus.OK)
  @Roles(PrismaRoles.ADMIN)
  async handle() {
    this.logger.log('POST /admin/attachments/cleanup-orphans');

    const result = await this.cleanupJob.handleCron();

    return {
      message: 'Cleanup completed',
      data: result,
    };
  }
}
