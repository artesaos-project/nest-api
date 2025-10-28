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
  constructor(private readonly useCase: ListReportsUseCase) {}

  @Get()
  @Roles(PrismaRoles.MODERATOR, PrismaRoles.ADMIN)
  async handle(@Query() q: ListReportsQueryDto) {
    const result = await this.useCase.execute({
      isSolved: q.isSolved !== undefined ? q.isSolved === 'true' : undefined,
      reporterId: q.reporterId,
      targetType: q.targetType,
      take: q.take,
      skip: q.skip,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }
}
