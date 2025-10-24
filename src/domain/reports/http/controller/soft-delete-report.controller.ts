import {
  BadRequestException,
  Controller,
  Delete,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { SoftDeleteReportUseCase } from '../../core/use-cases/soft-delete-report.use-case';
import { ReportIdParamDto } from '../dtos/report-id-param.dto';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { ReportNotFoundError } from '../../core/errors/report-not-found.error';

@Controller('reports/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SoftDeleteReportController {
  constructor(private readonly softDeleteReportUseCase: SoftDeleteReportUseCase) {}

  @Delete()
  @Roles(PrismaRoles.USER, PrismaRoles.ARTISAN, PrismaRoles.MODERATOR, PrismaRoles.ADMIN)
  async handle(@Param() { id }: ReportIdParamDto) {
    try {
      return await this.softDeleteReportUseCase.execute({ reportId: id });
    } catch (error) {
      if (error instanceof ReportNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
