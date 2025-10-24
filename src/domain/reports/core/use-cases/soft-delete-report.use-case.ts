import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../../repositories/report.repository';
import { ReportNotFoundError } from '../errors/report-not-found.error';

export interface SoftDeleteReportInput {
  reportId: string;
}

@Injectable()
export class SoftDeleteReportUseCase {
  constructor(private readonly repo: ReportRepository) {}

  async execute({ reportId }: SoftDeleteReportInput) {
    const existed = await this.repo.findById(reportId);
    if (!existed) throw new ReportNotFoundError();
    return this.repo.softDelete(reportId);
  }
}
