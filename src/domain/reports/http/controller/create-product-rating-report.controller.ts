import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { CreateProductRatingReportUseCase } from '../../core/use-cases/create-product-rating-report.use-case';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { CreateProductRatingDto } from '../dtos/create-product-rating-report.dto';

@Controller('reports/product-ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateProductRatingReportController {
  constructor(
    private readonly createProductRatingReportUseCase: CreateProductRatingReportUseCase,
  ) {}

  @Post()
  @Roles(PrismaRoles.USER, PrismaRoles.ARTISAN)
  async handle(
    @CurrentUser() user: TokenPayload,
    @Body() body: CreateProductRatingDto,
  ) {
    const result = await this.createProductRatingReportUseCase.execute({
      reporterId: user.sub,
      productRatingId: body.productRatingId,
      reason: body.reason,
      description: body.description ?? null,
    });

    if (!result) {
      throw new BadRequestException('Failed to create product rating report.');
    }

    return result;
  }
}
