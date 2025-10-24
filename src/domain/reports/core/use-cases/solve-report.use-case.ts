import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../../repositories/report.repository';
import { ReportNotFoundError } from '../errors/report-not-found.error';

export interface SolveReportInput {
  reportId: string;
}

@Injectable()
export class SolveReportUseCase {
  constructor(private readonly repo: ReportRepository) {}

  async execute({ reportId }: SolveReportInput) {
    const existed = await this.repo.findById(reportId);
    if (!existed) throw new ReportNotFoundError();
    return this.repo.solve(reportId);
  }
}
