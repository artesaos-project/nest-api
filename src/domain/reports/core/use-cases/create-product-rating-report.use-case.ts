import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { ReportRepository } from '../../repositories/report.repository';

export interface CreateProductRatingReportInput {
  reporterId: string;
  productRatingId: string;
  reason: $Enums.ReportReason;
  description?: string | null;
}

@Injectable()
export class CreateProductRatingReportUseCase {
  constructor(private readonly repo: ReportRepository) {}

  execute(input: CreateProductRatingReportInput) {
    return this.repo.createForProductRating({
      reporterId: input.reporterId,
      productRatingId: input.productRatingId,
      reason: input.reason,
      description: input.description ?? null,
    });
  }
}
