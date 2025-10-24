import { Injectable } from '@nestjs/common';
import { Prisma, ReportReason } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';

type CreateBase = {
  reporterId: string;
  reason: ReportReason;
  description?: string | null;
};

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createForProduct(input: CreateBase & { productId: string }) {
    return this.prisma.report.create({
      data: {
        reporterId: input.reporterId,
        reason: input.reason,
        description: input.description ?? null,
        product: { create: { productId: input.productId } },
      },
      include: {
        product: { include: { product: true } },
        productRating: { include: { productRating: true } },
        ReportUser: { include: { user: true } },
        reporter: true,
      },
    });
  }

  async createForProductRating(input: CreateBase & { productRatingId: string }) {
    return this.prisma.report.create({
      data: {
        reporterId: input.reporterId,
        reason: input.reason,
        description: input.description ?? null,
        productRating: { create: { productRatingId: input.productRatingId } },
      },
      include: {
        product: { include: { product: true } },
        productRating: { include: { productRating: true } },
        ReportUser: { include: { user: true } },
        reporter: true,
      },
    });
  }

  async createForUser(input: CreateBase & { reportedUserId: string }) {
    return this.prisma.report.create({
      data: {
        reporterId: input.reporterId,
        reason: input.reason,
        description: input.description ?? null,
        ReportUser: { create: { reportedUserId: input.reportedUserId } },
      },
      include: {
        product: { include: { product: true } },
        productRating: { include: { productRating: true } },
        ReportUser: { include: { user: true } },
        reporter: true,
      },
    });
  }

  async solve(reportId: string) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { isSolved: true },
    });
  }

  async softDelete(reportId: string) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { isDeleted: true },
    });
  }

  async findById(reportId: string) {
    return this.prisma.report.findFirst({
      where: { id: reportId, isDeleted: false },
      include: {
        product: { include: { product: true } },
        productRating: { include: { productRating: true } },
        ReportUser: { include: { user: true } },
        reporter: true,
      },
    });
  }

  async list(params: {
    isSolved?: boolean;
    reporterId?: string;
    targetType?: 'product' | 'productRating' | 'user';
    take?: number;
    skip?: number;
  }) {
    const where: Prisma.ReportWhereInput = {
      isDeleted: false,
    };
    if (params.isSolved !== undefined) where.isSolved = params.isSolved;
    if (params.reporterId) where.reporterId = params.reporterId;

    if (params.targetType === 'product') where.product = { isNot: null };
    if (params.targetType === 'productRating') where.productRating = { isNot: null };
    if (params.targetType === 'user') where.ReportUser = { some: {} };

    return this.prisma.report.findMany({
      where,
      include: {
        product: { include: { product: true } },
        productRating: { include: { productRating: true } },
        ReportUser: { include: { user: true } },
        reporter: true,
      },
      orderBy: { createdAt: 'desc' },
      take: params.take ?? 50,
      skip: params.skip ?? 0,
    });
  }
}
