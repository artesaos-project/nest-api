import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductReviewsRepository } from '@/domain/repositories/product-reviews.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { OperationNotAllowedError } from '../errors/operation-not-allowed.error';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { ReviewNotFoundError } from '../errors/review-not-found.error';

type Input = {
  currentUserId: string;
  productId: string
};

type Output = {
  averageRating: number;
  totalReviews: number
};

@Injectable()
export class DeleteProductReviewUseCase {
  private readonly logger = new Logger(DeleteProductReviewUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewsRepo: ProductReviewsRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async execute(input: Input): Promise<Either<Error, Output>> {
    const startedAt = Date.now();
    const { currentUserId, productId } = input;
    this.logger.debug({
      event: 'start', productId, currentUserId, useCase: 'delete-my',
    });

    try {
      const product = await this.productsRepo.findByIdCore(productId);
      if (!product) return left(new ProductNotFoundError(productId));
      if (!product.isActive) return left(new OperationNotAllowedError('Inactive product'));

      const isDisabled = await this.usersRepo.findIsDisabledById(currentUserId);
      if (isDisabled === null) return left(new OperationNotAllowedError('Invalid user'));
      if (isDisabled) return left(new OperationNotAllowedError('User is disabled'));

      const existing = await this.reviewsRepo.findByUserAndProduct(currentUserId, productId);
      if (!existing) return left(new ReviewNotFoundError());

      const out = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await this.reviewsRepo.clearImages(existing.id, tx);

        await this.reviewsRepo.deleteByUserAndProduct(currentUserId, productId, tx);

        const { avg, count } = await this.reviewsRepo.aggregateByProduct(productId, tx);
        await this.productsRepo.updateAverageRating({ productId, averageRating: avg ?? null }, tx);

        const averageRating = Math.ceil((avg ?? 0) * 10) / 10;
        return { averageRating, totalReviews: count };
      });

      this.logger.debug({
        event: 'success',
        productId,
        currentUserId,
        averageRating: out.averageRating,
        totalReviews: out.totalReviews,
        durationMs: Date.now() - startedAt,
      });

      return right(out);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      this.logger.error({
        event: 'error',
        productId,
        currentUserId,
        message: error.message,
        stack: error.stack,
        durationMs: Date.now() - startedAt,
      });
      return left(error);
    }
  }
}
