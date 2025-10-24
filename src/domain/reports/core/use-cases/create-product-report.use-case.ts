import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { ReportRepository } from '../../repositories/report.repository';

export interface CreateProductReportInput {
  reporterId: string;
  productId: string;
  reason: $Enums.ReportReason;
  description?: string | null;
}

@Injectable()
export class CreateProductReportUseCase {
  constructor(private readonly repo: ReportRepository) {}

  execute(input: CreateProductReportInput) {
    return this.repo.createForProduct(input);
  }
}
