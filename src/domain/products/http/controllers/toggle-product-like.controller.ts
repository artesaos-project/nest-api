import {
  BadRequestException,
  Controller, NotFoundException, Param, Post, UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { ToggleProductLikeUseCase } from '../../core/use-cases/toggle-product-like.use-case';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';

@Controller('products')
export class ToggleProductLikeController {
  constructor(private readonly toggleProductLikeUseCase: ToggleProductLikeUseCase) {}

  @Post(':id/like')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PrismaRoles.USER, PrismaRoles.ARTISAN)
  async handle(@Param('id') productId: string, @CurrentUser() user: TokenPayload) {
    const result = await this.toggleProductLikeUseCase.execute({ productId, userId: user.sub });
    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ProductNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }
    const data = result.value;
    return {
      message: data.action === 'liked'
        ? 'Product liked successfully'
        : 'Product unliked successfully',
      data,
    };
  }
}
