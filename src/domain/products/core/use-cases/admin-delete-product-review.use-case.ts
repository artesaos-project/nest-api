import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductReviewsRepository } from '@/domain/repositories/product-reviews.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { ReviewNotFoundError } from '../errors/review-not-found.error';

type Input = {
  actorId: string;
  productId: string;
  targetUserId: string
};

type Output = { averageRating: number; totalReviews: number };

@Injectable()
export class AdminDeleteProductReviewUseCase {
  private readonly logger = new Logger(AdminDeleteProductReviewUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewsRepo: ProductReviewsRepository,
    private readonly productsRepo: ProductsRepository,
  ) {}

  async execute(input: Input): Promise<Either<Error, Output>> {
    const t0 = Date.now();
    const { actorId, productId, targetUserId } = input;
    this.logger.debug({
      event: 'start',
      useCase: 'adminDelete',
      productId,
      targetUserId,
      actorId,
    });

    try {
      const product = await this.productsRepo.findByIdCore(productId);
      if (!product) return left(new ProductNotFoundError(productId));

      const existing = await this.reviewsRepo.findByUserAndProduct(targetUserId, productId);
      if (!existing) return left(new ReviewNotFoundError());

      const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await this.reviewsRepo.clearImages(existing.id, tx);

        await this.reviewsRepo.deleteByUserAndProduct(targetUserId, productId, tx);

        const { avg, count } = await this.reviewsRepo.aggregateByProduct(productId, tx);
        await this.productsRepo.updateAverageRating({ productId, averageRating: avg ?? null }, tx);

        const averageRating = Math.ceil((avg ?? 0) * 10) / 10;
        return { averageRating, totalReviews: count };
      });

      this.logger.debug({
        event: 'success',
        useCase: 'adminDelete',
        productId,
        targetUserId,
        actorId,
        averageRating: result.averageRating,
        totalReviews: result.totalReviews,
        durationMs: Date.now() - t0,
      });

      return right(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      this.logger.error({
        event: 'error',
        useCase: 'adminDelete',
        productId,
        targetUserId,
        actorId,
        message: error.message,
        stack: error.stack,
        durationMs: Date.now() - t0,
      });
      return left(error);
    }
  }
}
