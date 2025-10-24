import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../../repositories/report.repository';

@Injectable()
export class GetReportByIdUseCase {
  constructor(private readonly repo: ReportRepository) {}

  execute(id: string) {
    return this.repo.findById(id);
  }
}
