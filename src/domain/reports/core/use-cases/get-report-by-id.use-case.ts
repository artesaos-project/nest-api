import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ReportRepository } from '../../../repositories/report.repository';
import { UsersRepository } from '../../../repositories/users.repository';
import { ReportNotFoundError } from '../errors/report-not-found.error';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';

type Output = Either<Error, object>;

@Injectable()
export class GetReportByIdUseCase {
  private readonly logger = new Logger(GetReportByIdUseCase.name);

  constructor(
    private readonly reportsRepository: ReportRepository,
    private readonly usersRepository: UsersRepository,
    private readonly s3StorageService: S3StorageService,
  ) {
    this.logger.log('GetReportByIdUseCase initialized');
  }

  async execute(id: string): Promise<Output> {
    try {
      const report = await this.reportsRepository.findById(id);

      if (!report) {
        this.logger.warn('Report not found', { id });
        return left(new ReportNotFoundError());
      }

      const sanitizedReport = {
        id: report.id,
        reason: report.reason,
        isSolved: report.isSolved,
        description: report.description,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        reportType: (() => {
          if (report.product) return 'PRODUCT';
          if (report.productRating) return 'PRODUCT_RATING';
          if (report.ReportUser && report.ReportUser.length > 0) return 'USER';
          return 'UNKNOWN';
        })(),
        reporter: {
          id: report.reporter.id,
          name: report.reporter.name,
          email: report.reporter.email,
          phone: report.reporter.phone,
        },
        product: report.product?.product
          ? {
            id: report.product.product.id,
            title: report.product.product.title,
            image: await this.s3StorageService.getUrlByFileName(
              report.product.product.coverImageId!,
            ).catch(() => null),
            slug: report.product.product.slug,
            description: report.product.product.description,
            priceInCents: Number(report.product.product.priceInCents),
            stock: report.product.product.stock,
            artisanName: await this.usersRepository.findById(
              report.product.product.artisanId,
            ).then((user) => user?.name ?? 'Unknown Artisan'),
            artisanId: report.product.product.artisanId,
          }
          : null,
        productRating: report.productRating?.productRating
          ? {
            id: report.productRating.productRating.id,
            rating: report.productRating.productRating.rating,
            comment: report.productRating.productRating.comment,
            productId: report.productRating.productRating.productId,
            userId: report.productRating.productRating.userId,
            createdAt: report.productRating.productRating.createdAt,
          }
          : null,
        reportedUser:
          report.ReportUser && report.ReportUser.length > 0
            ? {
              id: report.ReportUser[0].user.id,
              name: report.ReportUser[0].user.name,
              email: report.ReportUser[0].user.email,
            }
            : null,
      };

      return right(sanitizedReport);
    } catch (err) {
      const error = err as Error;
      this.logger.error('Error fetching report by id', { id, error: error.message });
      return left(new Error('Internal server error'));
    }
  }
}
