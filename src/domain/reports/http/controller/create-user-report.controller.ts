import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { CreateUserReportUseCase } from '../../core/use-cases/create-user-report.use-case';
import { CreateUserReportDto } from '../dtos/create-user-report.dto';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

@Controller('reports/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateUserReportController {
  constructor(private readonly createUserReportUseCase: CreateUserReportUseCase) {}

  @Post()
  @Roles(PrismaRoles.USER)
  async handle(
    @CurrentUser() user: TokenPayload,
    @Body() body: CreateUserReportDto,
  ) {
    const result = await this.createUserReportUseCase.execute({
      reporterId: user.sub,
      reportedUserId: body.reportedUserId,
      reason: body.reason,
      description: body.description ?? null,
    });

    if (!result) {
      throw new BadRequestException('Failed to create user report.');
    }

    return result;
  }
}
