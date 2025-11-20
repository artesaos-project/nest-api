import { Injectable, Logger } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ReportRepository } from '../../../repositories/report.repository';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { TargetNotFoundError } from '../errors/target-not-found.error';
import { DuplicateReportError } from '../errors/duplicate-report.error';
import { SelfReportNotAllowedError } from '../errors/self-report-not-allowed.error';

export interface CreateUserReportInput {
  reporterId: string;
  reportedUserId: string;
  reason: $Enums.ReportReason;
  description?: string | null;
}

export interface CreateReportOutput { id: string }
type Output = Either<Error, CreateReportOutput>;
type PrismaErrorWithCode = { message: string; stack?: string; code?: string };

@Injectable()
export class CreateUserReportUseCase {
  private readonly logger = new Logger(CreateUserReportUseCase.name);

  constructor(
    private readonly repo: ReportRepository,
    private readonly users: UsersRepository,
  ) {
    this.logger.log('CreateUserReportUseCase initialized');
  }

  async execute({
    reporterId,
    reportedUserId,
    reason,
    description,
  }: CreateUserReportInput): Promise<Output> {
    const ctx = { reporterId, reportedUserId, reason };

    try {
      const user = await this.users.findById(reportedUserId);
      if (!user) {
        this.logger.warn('User not found', ctx);
        return left(new TargetNotFoundError('user', reportedUserId));
      }

      if (reportedUserId === reporterId) {
        this.logger.warn('Self-report blocked', ctx);
        return left(new SelfReportNotAllowedError());
      }

      const created = await this.repo.createForUser({
        reporterId,
        reportedUserId,
        reason,
        description: description ?? null,
      });

      this.logger.log('User report created', { ...ctx, reportId: created.id });
      return right({ id: created.id });
    } catch (e) {
      const err = e as PrismaErrorWithCode;
      this.logger.error('Error creating user report', {
        error: err.message,
        stack: err.stack,
        code: err.code,
        ...ctx,
      });

      if (err.code === 'P2002') {
        return left(new DuplicateReportError());
      }
      return left(new Error('Internal server error'));
    }
  }
}
