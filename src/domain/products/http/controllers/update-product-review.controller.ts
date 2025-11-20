import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { UpdateProductReviewUseCase } from '../../core/use-cases/update-product-review.use-case';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { CreateOrUpdateReviewDto } from '../dtos/create-or-update-review.dto';
import { InvalidRatingError } from '../../core/errors/invalid-rating.error';
import { OperationNotAllowedError } from '../../core/errors/operation-not-allowed.error';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { ReviewNotFoundError } from '../../core/errors/review-not-found.error';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { ReviewImagesLimitExceededError } from '../../core/errors/review-images-limit-exceeded.error';
import { ReviewImageRaceConflictError } from '../../core/errors/review-image-race-conflict.error';

@Controller('products/:id/reviews')
@UseGuards(RolesGuard)
export class UpdateProductReviewController {
  constructor(private readonly useCase: UpdateProductReviewUseCase) {}

  @Put()
  @Roles(PrismaRoles.USER, PrismaRoles.ADMIN, PrismaRoles.MODERATOR, PrismaRoles.ARTISAN)
  async handle(
    @Param('id') productId: string,
    @CurrentUser() user: TokenPayload,
    @Body() body: CreateOrUpdateReviewDto,
  ) {
    const result = await this.useCase.execute({
      currentUserId: user.sub,
      productId,
      rating: body.rating,
      comment: body.comment ?? null,
      imageIds: body.imageIds ?? [],
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ProductNotFoundError:
          throw new NotFoundException(error.message);
        case OperationNotAllowedError:
          throw new ForbiddenException(error.message);
        case InvalidRatingError:
          throw new BadRequestException(error.message);
        case ReviewNotFoundError:
          throw new NotFoundException(error.message);
        case ReviewImagesLimitExceededError:
          throw new BadRequestException(error.message);
        case ReviewImageRaceConflictError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
