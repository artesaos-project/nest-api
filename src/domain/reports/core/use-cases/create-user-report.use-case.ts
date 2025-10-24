import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { ReportRepository } from '../../repositories/report.repository';

export interface CreateUserReportInput {
  reporterId: string;
  reportedUserId: string;
  reason: $Enums.ReportReason;
  description?: string | null;
}

@Injectable()
export class CreateUserReportUseCase {
  constructor(private readonly repo: ReportRepository) {}

  execute(input: CreateUserReportInput) {
    return this.repo.createForUser(input);
  }
}
