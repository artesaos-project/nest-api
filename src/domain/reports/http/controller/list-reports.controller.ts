import {
  BadRequestException, Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { ListReportsUseCase } from '../../core/use-cases/list-reports.use-case';
import { ListReportsQueryDto } from '../dtos/list-reports-query.dto';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListReportsController {
  constructor(private readonly listReportsUseCase: ListReportsUseCase) {}

  @Get()
  @Roles(PrismaRoles.MODERATOR, PrismaRoles.ADMIN)
  async handle(@Query() q: ListReportsQueryDto) {
    try {
      const targetType = q.targetType === 'comment' ? 'productRating' : q.targetType;

      return await this.listReportsUseCase.execute({
        isSolved: q.isSolved !== undefined ? q.isSolved === 'true' : undefined,
        reporterId: q.reporterId,
        targetType,
        take: q.take ? Number(q.take) : undefined,
        skip: q.skip ? Number(q.skip) : undefined,
      });
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
