import {
  Controller, Get, NotFoundException, Param, UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { GetReportByIdUseCase } from '../../core/use-cases/get-report-by-id.use-case';
import { ReportIdParamDto } from '../dtos/report-id-param.dto';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { ReportNotFoundError } from '../../core/errors/report-not-found.error';

@Controller('reports/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetReportByIdController {
  constructor(private readonly useCase: GetReportByIdUseCase) {}

  @Get()
  @Roles(PrismaRoles.MODERATOR, PrismaRoles.ADMIN)
  async handle(@Param() { id }: ReportIdParamDto) {
    const result = await this.useCase.execute(id);
    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof ReportNotFoundError) throw new NotFoundException(error.message);
      throw new NotFoundException(error.message);
    }
    return result.value;
  }
}
