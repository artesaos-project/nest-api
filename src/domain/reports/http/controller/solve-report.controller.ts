import {
  BadRequestException,
  Controller,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { SolveReportUseCase } from '../../core/use-cases/solve-report.use-case';
import { ReportIdParamDto } from '../dtos/report-id-param.dto';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { ReportNotFoundError } from '../../core/errors/report-not-found.error';

@Controller('reports/:id/solve')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SolveReportController {
  constructor(private readonly solveReportUseCase: SolveReportUseCase) {}

  @Patch()
  @Roles(PrismaRoles.MODERATOR, PrismaRoles.ADMIN)
  async handle(@Param() { id }: ReportIdParamDto) {
    try {
      return await this.solveReportUseCase.execute({ reportId: id });
    } catch (error) {
      if (error instanceof ReportNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
