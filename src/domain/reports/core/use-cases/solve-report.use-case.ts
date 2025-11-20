import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ReportRepository } from '../../../repositories/report.repository';
import { ReportNotFoundError } from '../errors/report-not-found.error';

export interface SolveReportInput {
  reportId: string;
}

type Output = Either<Error, void>;

@Injectable()
export class SolveReportUseCase {
  private readonly logger = new Logger(SolveReportUseCase.name);

  constructor(private readonly repo: ReportRepository) {
    this.logger.log('SolveReportUseCase initialized');
  }

  async execute({ reportId }: SolveReportInput): Promise<Output> {
    try {
      const existed = await this.repo.findById(reportId);
      if (!existed) {
        this.logger.warn('Report not found', { reportId });
        return left(new ReportNotFoundError());
      }

      await this.repo.solve(reportId);
      this.logger.log('Report solved', { reportId });
      return right(undefined);
    } catch (err) {
      const error = err as Error;
      this.logger.error('Error solving report', { reportId, error: error.message });
      return left(new Error('Internal server error'));
    }
  }
}
