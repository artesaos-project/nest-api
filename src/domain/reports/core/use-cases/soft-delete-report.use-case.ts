import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ReportRepository } from '../../../repositories/report.repository';
import { ReportNotFoundError } from '../errors/report-not-found.error';

export interface SoftDeleteReportInput {
  reportId: string;
}

type Output = Either<Error, void>;

@Injectable()
export class SoftDeleteReportUseCase {
  private readonly logger = new Logger(SoftDeleteReportUseCase.name);

  constructor(private readonly repo: ReportRepository) {
    this.logger.log('SoftDeleteReportUseCase initialized');
  }

  async execute({ reportId }: SoftDeleteReportInput): Promise<Output> {
    try {
      const existed = await this.repo.findById(reportId);
      if (!existed) {
        this.logger.warn('Report not found', { reportId });
        return left(new ReportNotFoundError());
      }

      await this.repo.softDelete(reportId);
      this.logger.log('Report soft-deleted', { reportId });
      return right(undefined);
    } catch (err) {
      const error = err as Error;
      this.logger.error('Error soft-deleting report', { reportId, error: error.message });
      return left(new Error('Internal server error'));
    }
  }
}
