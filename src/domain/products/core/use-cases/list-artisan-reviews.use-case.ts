import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductReviewsRepository } from '@/domain/repositories/product-reviews.repository';
import { ArtisanProfilesRepository } from '@/domain/repositories/artisan-profiles.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';
import { ArtisanNotFoundError } from '../errors/artisan-not-found.error';

type Input = {
  artisanId: string;
  page?: number;
  limit?: number;
};

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  product: {
    id: string;
    title: string;
    slug: string;
  };
  images: string[];
};

type Output = {
  reviews: ReviewItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class ListArtisanReviewsUseCase {
  private readonly logger = new Logger(ListArtisanReviewsUseCase.name);

  constructor(
    private readonly reviewsRepo: ProductReviewsRepository,
    private readonly artisanProfilesRepo: ArtisanProfilesRepository,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async execute(input: Input): Promise<Either<Error, Output>> {
    const startedAt = Date.now();
    const page = Number(input.page ?? 1);
    const requestedLimit = Number(input.limit ?? 10);
    const limit = Math.min(50, Math.max(1, Number.isNaN(requestedLimit) ? 10 : requestedLimit));

    this.logger.debug({
      event: 'start',
      artisanId: input.artisanId,
      page,
      limit,
    });

    try {
      const artisan = await this.artisanProfilesRepo.findByUserId(input.artisanId);
      if (!artisan) {
        return left(new ArtisanNotFoundError());
      }

      const [total, items] = await Promise.all([
        this.reviewsRepo.countByArtisan(input.artisanId),
        this.reviewsRepo.listByArtisanWithDetails(input.artisanId, page, limit),
      ]);

      const reviews: ReviewItem[] = await Promise.all(
        items.map(async (r) => {
          const [userAvatar, reviewImages] = await Promise.all([
            r.user.avatar
              ? this.s3StorageService.getUrlByFileName(r.user.avatar)
              : Promise.resolve(null),
            Promise.all(
              (r.images ?? []).map((img) => this.s3StorageService.getUrlByFileName(img.id)),
            ),
          ]);

          return {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            user: {
              id: r.user.id,
              name: r.user.name,
              avatar: userAvatar,
            },
            product: {
              id: r.product.id,
              title: r.product.title,
              slug: r.product.slug,
            },
            images: reviewImages,
          };
        }),
      );

      const totalPages = Math.max(1, Math.ceil(total / limit));
      const out: Output = {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };

      this.logger.debug({
        event: 'success',
        durationMs: Date.now() - startedAt,
        artisanId: input.artisanId,
        count: reviews.length,
        total,
      });

      return right(out);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      this.logger.error({
        event: 'error',
        artisanId: input.artisanId,
        message: error.message,
        stack: error.stack,
        durationMs: Date.now() - startedAt,
      });
      return left(error);
    }
  }
}
