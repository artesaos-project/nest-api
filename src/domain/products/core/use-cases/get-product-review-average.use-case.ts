import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductReviewsRepository } from '@/domain/repositories/product-reviews.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { ProductNotFoundError } from '../errors/product-not-found.error';

type Input = { productId: string };
type Output = { averageRating: number; totalReviews: number };

@Injectable()
export class GetProductReviewAverageUseCase {
  private readonly logger = new Logger(GetProductReviewAverageUseCase.name);

  constructor(
    private readonly reviewsRepo: ProductReviewsRepository,
    private readonly productsRepo: ProductsRepository,
  ) {}

  async execute(input: Input): Promise<Either<Error, Output>> {
    const startedAt = Date.now();
    this.logger.debug({ event: 'start', productId: input.productId });

    try {
      const product = await this.productsRepo.findByIdCore(input.productId);
      if (!product) return left(new ProductNotFoundError(input.productId));

      const { avg, count } = await this.reviewsRepo.aggregateByProduct(input.productId);

      const averageRatingRaw = avg ?? 0;
      const averageRating = Math.ceil(averageRatingRaw * 10) / 10; // 1 casa, arredonda para cima
      const totalReviews = count;

      const out: Output = { averageRating, totalReviews };

      this.logger.debug({
        event: 'success',
        durationMs: Date.now() - startedAt,
        productId: input.productId,
        averageRating,
        totalReviews,
      });
      return right(out);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      this.logger.error({
        event: 'error',
        productId: input.productId,
        message: error.message,
        stack: error.stack,
        durationMs: Date.now() - startedAt,
      });
      return left(error);
    }
  }
}
