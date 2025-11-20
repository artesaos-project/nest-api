import {
  Controller,
  Get,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { ListReportsUseCase } from '../../core/use-cases/list-reports.use-case';
import { ListReportsQueryDto } from '../dtos/list-reports-query.dto';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ListReportsController {
  private readonly logger = new Logger(ListReportsController.name);

  constructor(private readonly listReportsUseCase: ListReportsUseCase) {}

  private parseIsSolved(value: string | undefined): boolean | undefined {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  }

  @Get()
  @Roles(PrismaRoles.ADMIN, PrismaRoles.MODERATOR)
  async handle(@Query() query: ListReportsQueryDto) {
    this.logger.log('GET /reports', query);

    const isSolved = this.parseIsSolved(query.isSolved);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;

    const result = await this.listReportsUseCase.execute({
      isSolved,
      reporterId: query.reporterId,
      targetType: query.targetType,
      page,
      limit,
    });

    if (result.isLeft()) {
      const error = result.value;
      this.logger.error('Failed to list reports', error.stack);
      throw error;
    }

    return {
      data: result.value.reports,
      pagination: result.value.pagination,
    };
  }
}
