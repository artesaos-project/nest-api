import {
  BadRequestException, Body, Controller, NotFoundException, Post, UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { CreateProductRatingReportUseCase } from '../../core/use-cases/create-product-review-report.use-case';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { CreateProductRatingDto } from '../dtos/create-product-rating-report.dto';
import { TargetNotFoundError } from '../../core/errors/target-not-found.error';
import { DuplicateReportError } from '../../core/errors/duplicate-report.error';
import { SelfReportNotAllowedError } from '../../core/errors/self-report-not-allowed.error';

@Controller('reports/product-ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreateProductRatingReportController {
  constructor(private readonly useCase: CreateProductRatingReportUseCase) {}

  @Post()
  @Roles(PrismaRoles.USER, PrismaRoles.ARTISAN)
  async handle(@CurrentUser() user: TokenPayload, @Body() body: CreateProductRatingDto) {
    const result = await this.useCase.execute({
      reporterId: user.sub,
      productRatingId: body.productRatingId,
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
