import {
  BadRequestException, Controller, Delete, NotFoundException, Param, UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { AdminDeleteProductReviewUseCase } from '../../core/use-cases/admin-delete-product-review.use-case';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { ReviewNotFoundError } from '../../core/errors/review-not-found.error';

@Controller('/admin/products/:productId/reviews/:userId')
@UseGuards(RolesGuard)
export class AdminDeleteProductReviewController {
  constructor(private readonly useCase: AdminDeleteProductReviewUseCase) {}

  @Delete()
  @Roles(PrismaRoles.ADMIN, PrismaRoles.MODERATOR)
  async handle(
    @Param('productId') productId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() actor: TokenPayload,
  ) {
    const result = await this.useCase.execute({
      actorId: actor.sub,
      productId,
      targetUserId,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ProductNotFoundError:
        case ReviewNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
