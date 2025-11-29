import {
  Controller, Get, NotFoundException, Param, Query,
} from '@nestjs/common';
import { ListProductReviewsUseCase } from '../../core/use-cases/list-product-reviews.use-case';
import { PaginateReviewsDto } from '../dtos/paginate-reviews.dto';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';

@Controller('products/:id/reviews')
export class ListProductReviewsController {
  constructor(private readonly useCase: ListProductReviewsUseCase) {}

  @Get()
  @Public()
  async handle(
    @Param('id') productId: string,
    @Query() q: PaginateReviewsDto,
  ) {
    const page = q.page ? Number(q.page) : undefined;
    const limit = q.limit ? Number(q.limit) : undefined;

    const result = await this.useCase.execute({ productId, page, limit });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ProductNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw error;
      }
    }
    return {
      reviews: result.value.reviews,
      pagination: result.value.pagination,
    };
  }
}
