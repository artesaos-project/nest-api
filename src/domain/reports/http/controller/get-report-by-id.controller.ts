import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { GetReportByIdUseCase } from '../../core/use-cases/get-report-by-id.use-case';
import { ReportIdParamDto } from '../dtos/report-id-param.dto';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';

@Controller('reports/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetReportByIdController {
  constructor(private readonly getReportByIdUseCase: GetReportByIdUseCase) {}

  @Get()
  @Roles(PrismaRoles.MODERATOR, PrismaRoles.ADMIN)
  async handle(@Param() { id }: ReportIdParamDto) {
    const result = await this.getReportByIdUseCase.execute(id);
    if (!result) throw new NotFoundException('Report not found');
    return result;
  }
}
