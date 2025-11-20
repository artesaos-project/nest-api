import {
  Controller, Get, NotFoundException, Param,
} from '@nestjs/common';
import { GetProductReviewAverageUseCase } from '../../core/use-cases/get-product-review-average.use-case';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';

@Controller('products/:id/reviews/average')
export class GetProductReviewAverageController {
  constructor(private readonly useCase: GetProductReviewAverageUseCase) {}

  @Get()
  async handle(@Param('id') productId: string) {
    const result = await this.useCase.execute({ productId });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ProductNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw error;
      }
    }

    return result.value;
  }
}
