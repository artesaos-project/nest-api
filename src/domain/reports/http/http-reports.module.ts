import { Module } from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';

import { CreateProductReportUseCase } from '../core/use-cases/create-product-report.use-case';
import { CreateUserReportUseCase } from '../core/use-cases/create-user-report.use-case';
import { SolveReportUseCase } from '../core/use-cases/solve-report.use-case';
import { SoftDeleteReportUseCase } from '../core/use-cases/soft-delete-report.use-case';
import { GetReportByIdUseCase } from '../core/use-cases/get-report-by-id.use-case';
import { ListReportsUseCase } from '../core/use-cases/list-reports.use-case';
import { CreateProductReportController } from './controller/create-product-report.controller';
import { CreateProductRatingReportController } from './controller/create-product-rating-report.controller';
import { CreateUserReportController } from './controller/create-user-report.controller';
import { SolveReportController } from './controller/solve-report.controller';
import { SoftDeleteReportController } from './controller/soft-delete-report.controller';
import { GetReportByIdController } from './controller/get-report-by-id.controller';
import { ListReportsController } from './controller/list-reports.controller';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateProductRatingReportUseCase } from '../core/use-cases/create-product-rating-report.use-case';

@Module({
  controllers: [
    CreateProductReportController,
    CreateProductRatingReportController,
    CreateUserReportController,
    SolveReportController,
    SoftDeleteReportController,
    GetReportByIdController,
    ListReportsController,
  ],
  providers: [
    PrismaService,
    ReportRepository,
    CreateProductReportUseCase,
    CreateProductRatingReportUseCase,
    CreateUserReportUseCase,
    SolveReportUseCase,
    SoftDeleteReportUseCase,
    GetReportByIdUseCase,
    ListReportsUseCase,
  ],
})
export class HttpReportsModule {}
