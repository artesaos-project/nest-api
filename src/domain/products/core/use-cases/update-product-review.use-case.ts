import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductReviewsRepository } from '@/domain/repositories/product-reviews.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { InvalidRatingError } from '../errors/invalid-rating.error';
import { OperationNotAllowedError } from '../errors/operation-not-allowed.error';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { ReviewNotFoundError } from '../errors/review-not-found.error';
import { ReviewImagesLimitExceededError } from '../errors/review-images-limit-exceeded.error';
import { ReviewImageRaceConflictError } from '../errors/review-image-race-conflict.error';

type Input = {
  currentUserId: string;
   productId: string;
   rating: number;
   comment?: string | null,
   imageIds?: string[] | null;
  };

type Output = { averageRating: number; totalReviews: number };

@Injectable()
export class UpdateProductReviewUseCase {
  private readonly logger = new Logger(UpdateProductReviewUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewsRepo: ProductReviewsRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async execute(input: Input): Promise<Either<Error, Output>> {
    const t0 = Date.now();
    const {
      currentUserId,
      productId,
      rating,
      comment,
    } = input;
    const imageIdsRaw = input.imageIds;
    const imageIds = Array.isArray(imageIdsRaw) ? Array.from(new Set(imageIdsRaw)) : null;

    this.logger.debug({
      event: 'start',
      productId,
      currentUserId,
      rating,
      commentLength: comment ? comment.length : 0,
      imageIdsCount: imageIds?.length ?? 0,
      useCase: 'update',
    });

    try {
      if (
        !Number.isInteger(rating)
        || rating < 1
        || rating > 5
      ) {
        return left(new InvalidRatingError());
      }
      if (comment && comment.length > 500) {
        return left(new OperationNotAllowedError('Comentário excede 500 caracteres'));
      }

      if ((imageIds?.length ?? 0) > 5) {
        return left(new ReviewImagesLimitExceededError());
      }

      const product = await this.productsRepo.findByIdCore(productId);
      if (!product) {
        return left(new ProductNotFoundError(productId));
      }
      if (!product.isActive) {
        return left(new OperationNotAllowedError('Inactive product'));
      }
      if (product.artisanId === currentUserId) {
        return left(new OperationNotAllowedError('Product owner cannot review'));
      }

      const isDisabled = await this.usersRepo.findIsDisabledById(currentUserId);
      if (isDisabled === null) {
        return left(new OperationNotAllowedError('Invalid user'));
      }
      if (isDisabled) {
        return left(new OperationNotAllowedError('User is disabled'));
      }

      const existing = await this.reviewsRepo.findByUserAndProduct(currentUserId, productId);
      if (!existing) {
        return left(new ReviewNotFoundError());
      }

      const out = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await this.reviewsRepo.update(existing.id, rating, comment ?? null, tx);

        if (imageIds !== null && imageIds.length > 0) {
          const linked = await this.reviewsRepo.replaceImagesReturningCount(
            existing.id,
            imageIds,
            tx,
          );
          if (linked !== imageIds.length) {
            throw new ReviewImageRaceConflictError();
          }
        } else if (imageIds !== null && imageIds.length === 0) {
          await this.reviewsRepo.clearImages(existing.id, tx);
        }

        const { avg, count } = await this.reviewsRepo.aggregateByProduct(productId, tx);
        await this.productsRepo.updateAverageRating({ productId, averageRating: avg ?? null }, tx);

        const averageRating = Math.ceil((avg ?? 0) * 10) / 10;
        return { averageRating, totalReviews: count };
      });

      this.logger.debug({
        event: 'success',
        productId,
        currentUserId,
        action: 'updated',
        averageRating: out.averageRating,
        totalReviews: out.totalReviews,
        imagesCount: imageIds?.length ?? 0,
        durationMs: Date.now() - t0,
      });
      return right(out);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      this.logger.error({
        event: 'error',
        useCase: 'update',
        productId,
        currentUserId,
        err: error.message,
        stack: error.stack,
        durationMs: Date.now() - t0,
      });
      return left(error);
    }
  }
}
