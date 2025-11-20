import {
  Controller, Delete, ForbiddenException, NotFoundException, Param, UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { DeleteProductReviewUseCase } from '../../core/use-cases/delete-product-review.use-case';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { OperationNotAllowedError } from '../../core/errors/operation-not-allowed.error';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { ReviewNotFoundError } from '../../core/errors/review-not-found.error';

@Controller('products/:id/reviews')
@UseGuards(RolesGuard)
export class DeleteProductReviewController {
  constructor(private readonly useCase: DeleteProductReviewUseCase) {}

  @Delete()
  @Roles(PrismaRoles.USER, PrismaRoles.ARTISAN, PrismaRoles.MODERATOR, PrismaRoles.ADMIN)
  async handle(
    @Param('id') productId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    const result = await this.useCase.execute({ currentUserId: user.sub, productId });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ProductNotFoundError:
          throw new NotFoundException(error.message);
        case OperationNotAllowedError:
          throw new ForbiddenException(error.message);
        case ReviewNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw error;
      }
    }

    return result.value;
  }
}
