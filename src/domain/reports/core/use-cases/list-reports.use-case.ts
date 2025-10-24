import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../../repositories/report.repository';

export interface ListReportsInput {
  isSolved?: boolean;
  reporterId?: string;
  targetType?: 'product' | 'productRating' | 'user';
  take?: number;
  skip?: number;
}

@Injectable()
export class ListReportsUseCase {
  constructor(private readonly repo: ReportRepository) {}

  execute(input: ListReportsInput) {
    return this.repo.list(input);
  }
}
