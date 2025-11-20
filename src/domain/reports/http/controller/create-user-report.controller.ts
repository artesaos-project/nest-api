import {
  BadRequestException, Body, Controller, NotFoundException, Post, UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { CreateUserReportUseCase } from '../../core/use-cases/create-user-report.use-case';
import { CreateUserReportDto } from '../dtos/create-user-report.dto';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { TargetNotFoundError } from '../../core/errors/target-not-found.error';
import { DuplicateReportError } from '../../core/errors/duplicate-report.error';
import { SelfReportNotAllowedError } from '../../core/errors/self-report-not-allowed.error';

@Controller('reports/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateUserReportController {
  constructor(private readonly useCase: CreateUserReportUseCase) {}

  @Post()
  @Roles(PrismaRoles.USER)
  async handle(@CurrentUser() user: TokenPayload, @Body() body: CreateUserReportDto) {
    const result = await this.useCase.execute({
      reporterId: user.sub,
      reportedUserId: body.reportedUserId,
      reason: body.reason,
      description: body.description ?? null,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof TargetNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof SelfReportNotAllowedError) throw new BadRequestException(error.message);
      if (error instanceof DuplicateReportError) throw new BadRequestException(error.message);
      throw new BadRequestException(error.message);
    }

    return result.value;
  }
}
