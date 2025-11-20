import { Injectable, Logger } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ReportRepository } from '../../../repositories/report.repository';
import { TargetNotFoundError } from '../errors/target-not-found.error';
import { DuplicateReportError } from '../errors/duplicate-report.error';
import { SelfReportNotAllowedError } from '../errors/self-report-not-allowed.error';
import { ProductReviewsRepository } from '@/domain/repositories/product-reviews.repository';

export interface CreateProductRatingReportInput {
  reporterId: string;
  productRatingId: string;
  reason: $Enums.ReportReason;
  description?: string | null;
}

export interface CreateReportOutput { id: string }
type Output = Either<Error, CreateReportOutput>;
type PrismaErrorWithCode = { message: string; stack?: string; code?: string };

@Injectable()
export class CreateProductRatingReportUseCase {
  private readonly logger = new Logger(CreateProductRatingReportUseCase.name);

  constructor(
    private readonly reports: ReportRepository,
    private readonly review: ProductReviewsRepository,
  ) {
    this.logger.log('CreateProductRatingReportUseCase initialized');
  }

  async execute({
    reporterId,
    productRatingId,
    reason,
    description,
  }: CreateProductRatingReportInput): Promise<Output> {
    const ctx = { reporterId, productRatingId, reason };

    try {
      const rating = await this.review.findById(productRatingId);
      if (!rating) {
        this.logger.warn('Product rating not found', ctx);
        return left(new TargetNotFoundError('productRating', productRatingId));
      }

      if (rating.userId === reporterId) {
        this.logger.warn('Self-report blocked', ctx);
        return left(new SelfReportNotAllowedError());
      }

      const created = await this.reports.createForProductRating({
        reporterId,
        productRatingId,
        reason,
        description: description ?? null,
      });

      this.logger.log('Product rating report created', { ...ctx, reportId: created.id });
      return right({ id: created.id });
    } catch (e) {
      const err = e as PrismaErrorWithCode;
      this.logger.error('Error creating product rating report', {
        error: err.message,
        stack: err.stack,
        code: err.code,
        ...ctx,
      });

      if (err.code === 'P2002') {
        return left(new DuplicateReportError());
      }
      return left(new Error('Internal server error'));
    }
  }
}
