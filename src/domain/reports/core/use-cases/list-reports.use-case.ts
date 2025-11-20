import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ReportRepository } from '../../../repositories/report.repository';

export interface ListReportsInput {
  isSolved?: boolean;
  reporterId?: string;
  targetType?: 'product' | 'productRating' | 'user';
  page?: number;
  limit?: number;
}

export interface ReportSummary {
  id: string;
  reason: string;
  isSolved: boolean;
  description: string | null;
  reportType: string;
  createdAt: Date;
  updatedAt: Date;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  product: {
    id: string;
    title: string;
    description: string;
    priceInCents: number;
    stock: number;
    slug: string;
    viewsCount: number;
    likesCount: number;
    categoryIds: number[];
    artisanId: string;
  } | null;
  productRating: {
    id: string;
    rating: number;
    comment: string | null;
    productId: string;
    userId: string;
    createdAt: Date;
  } | null;
  reportedUser: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface ListReportsOutput {
  reports: ReportSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type Output = Either<Error, ListReportsOutput>;

@Injectable()
export class ListReportsUseCase {
  private readonly logger = new Logger(ListReportsUseCase.name);

  constructor(private readonly reportsRepository: ReportRepository) {
    this.logger.log('ListReportsUseCase initialized');
  }

  async execute(input: ListReportsInput = {}): Promise<Output> {
    const {
      isSolved,
      reporterId,
      targetType,
      page = 1,
      limit = 20,
    } = input;

    try {
      this.logger.debug('Fetching reports with filters:', {
        isSolved,
        reporterId,
        targetType,
        page,
        limit,
      });

      const validPage = Math.max(1, page);
      const validLimit = Math.max(1, Math.min(100, limit));

      const skip = (validPage - 1) * validLimit;

      const { reports, total } = await this.reportsRepository.listWithPagination({
        isSolved,
        reporterId,
        targetType,
        take: limit,
        skip,
      });

      if (reports.length === 0) {
        this.logger.debug('No reports found');
        return right({
          reports: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      const sanitizedReports: ReportSummary[] = reports.map((report) => ({
        id: report.id,
        reason: report.reason,
        isSolved: report.isSolved,
        description: report.description,
        reportType: this.getReportType(report),
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        reporter: {
          id: report.reporter.id,
          name: report.reporter.name,
          email: report.reporter.email,
        },
        product: report.product?.product
          ? {
            id: report.product.product.id,
            title: report.product.product.title,
            description: report.product.product.description,
            priceInCents: Number(report.product.product.priceInCents),
            stock: report.product.product.stock,
            slug: report.product.product.slug,
            viewsCount: report.product.product.viewsCount,
            likesCount: report.product.product.likesCount,
            categoryIds: report.product.product.categoryIds.map((id) => Number(id)),
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
      }));

      const totalPages = Math.ceil(total / limit);

      this.logger.log(`Retrieved ${reports.length} reports (page ${page}/${totalPages})`);

      return right({
        reports: sanitizedReports,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total),
          totalPages: Number(totalPages),
        },
      });
    } catch (err) {
      const error = err as Error;
      this.logger.error('Error listing reports', { error: error.message, input });
      return left(new Error('Internal server error'));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getReportType(report: any): string {
    if (report.product) return 'PRODUCT';
    if (report.productRating) return 'PRODUCT_RATING';
    if (report.ReportUser && report.ReportUser.length > 0) return 'USER';
    return 'UNKNOWN';
  }
}
