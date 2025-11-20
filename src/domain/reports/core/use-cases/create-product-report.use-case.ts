import { Injectable, Logger } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ReportRepository } from '../../../repositories/report.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { TargetNotFoundError } from '../errors/target-not-found.error';
import { DuplicateReportError } from '../errors/duplicate-report.error';
import { SelfReportNotAllowedError } from '../errors/self-report-not-allowed.error';

export interface CreateProductReportInput {
  reporterId: string;
  productId: string;
  reason: $Enums.ReportReason;
  description?: string | null;
}

export interface CreateReportOutput { id: string }
type Output = Either<Error, CreateReportOutput>;
type PrismaErrorWithCode = { message: string; stack?: string; code?: string };

@Injectable()
export class CreateProductReportUseCase {
  private readonly logger = new Logger(CreateProductReportUseCase.name);

  constructor(
    private readonly repo: ReportRepository,
    private readonly products: ProductsRepository,
  ) {
    this.logger.log('CreateProductReportUseCase initialized');
  }

  async execute({
    reporterId,
    productId,
    reason,
    description,
  }: CreateProductReportInput): Promise<Output> {
    const ctx = { reporterId, productId, reason };

    try {
      const product = await this.products.findById(productId);
      if (!product) {
        this.logger.warn('Product not found', ctx);
        return left(new TargetNotFoundError('product', productId));
      }

      if (product.artisanId === reporterId) {
        this.logger.warn('Self-report blocked', ctx);
        return left(new SelfReportNotAllowedError());
      }

      const created = await this.repo.createForProduct({
        reporterId,
        productId,
        reason,
        description: description ?? null,
      });

      this.logger.log('Product report created', { ...ctx, reportId: created.id });
      return right({ id: created.id });
    } catch (e) {
      const err = e as PrismaErrorWithCode;
      this.logger.error('Error creating product report', {
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
