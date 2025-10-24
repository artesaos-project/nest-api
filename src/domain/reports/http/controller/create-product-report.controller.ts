import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { CreateProductReportUseCase } from '../../core/use-cases/create-product-report.use-case';
import { CreateProductReportDto } from '../dtos/create-product-report.dto';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

@Controller('reports/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateProductReportController {
  constructor(private readonly createProductReportUseCase: CreateProductReportUseCase) {}

  @Post()
  @Roles(PrismaRoles.USER)
  async handle(
    @CurrentUser() user: TokenPayload,
    @Body() body: CreateProductReportDto,
  ) {
    const result = await this.createProductReportUseCase.execute({
      reporterId: user.sub,
      productId: body.productId,
      reason: body.reason,
      description: body.description ?? null,
    });

    if (!result) {
      throw new BadRequestException('Failed to create product report.');
    }

    return result;
  }
}
