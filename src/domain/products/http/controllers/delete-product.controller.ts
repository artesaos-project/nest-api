import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DeleteProductUseCase } from '../../core/use-cases/delete-product.use-case';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { UnauthorizedProductAccessError } from '../../core/errors/unauthorized-product-access.error';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class DeleteProductController {
  private readonly logger = new Logger(DeleteProductController.name);

  constructor(private readonly deleteProductUseCase: DeleteProductUseCase) {}

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentUser() user: TokenPayload,
    @Param('id') productId: string,
  ) {
    this.logger.log('DELETE /products/:id', { productId, userId: user.sub });

    const result = await this.deleteProductUseCase.execute({
      productId,
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ProductNotFoundError) {
        this.logger.error('Product not found', { productId });
        throw new NotFoundException('Product not found');
      }

      if (error instanceof UnauthorizedProductAccessError) {
        this.logger.error('Unauthorized product access', { productId, userId: user.sub });
        throw new ForbiddenException('You are not authorized to delete this product');
      }

      throw error;
    }

    return {
      message: result.value.message,
      data: result.value.deletedResources,
    };
  }
}
