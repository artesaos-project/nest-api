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
    const result = await this.prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          reporterId: input.reporterId,
          reason: input.reason,
          description: input.description ?? null,
        },
        select: { id: true },
      });

      await tx.reportProduct.create({
        data: {
          reportId: report.id,
          productId: input.productId,
          reporterId: input.reporterId,
        },
      });

      return tx.report.findUniqueOrThrow({
        where: { id: report.id },
        include: {
          product: { include: { product: true } },
          productRating: { include: { productRating: true } },
          ReportUser: { include: { user: true } },
          reporter: true,
        },
      });
    });

    return result;
  }

  async createForProductRating(input: CreateBase & { productRatingId: string }) {
    const result = await this.prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          reporterId: input.reporterId,
          reason: input.reason,
          description: input.description ?? null,
        },
        select: { id: true },
      });

      await tx.reportProductRating.create({
        data: {
          reportId: report.id,
          productRatingId: input.productRatingId,
          reporterId: input.reporterId,
        },
      });

      return tx.report.findUniqueOrThrow({
        where: { id: report.id },
        include: {
          product: { include: { product: true } },
          productRating: { include: { productRating: true } },
          ReportUser: { include: { user: true } },
          reporter: true,
        },
      });
    });

    return result;
  }

  async createForUser(input: CreateBase & { reportedUserId: string }) {
    const result = await this.prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          reporterId: input.reporterId,
          reason: input.reason,
          description: input.description ?? null,
        },
        select: { id: true },
      });

      await tx.reportUser.create({
        data: {
          reportId: report.id,
          reportedUserId: input.reportedUserId,
          reporterId: input.reporterId,
        },
      });

      return tx.report.findUniqueOrThrow({
        where: { id: report.id },
        include: {
          product: { include: { product: true } },
          productRating: { include: { productRating: true } },
          ReportUser: { include: { user: true } },
          reporter: true,
        },
      });
    });

    return result;
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

  async deleteAllProductReports(productId: string) {
    return this.prisma.report.deleteMany({
      where: {
        product: {
          productId,
        },
      },
    });
  }

  async deleteAllUserReports(userId: string) {
    return this.prisma.report.deleteMany({
      where: {
        reporterId: userId,
      },
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

  async listWithPagination(params: {
  isSolved?: boolean;
  reporterId?: string;
  targetType?: 'product' | 'productRating' | 'user';
  take?: number;
  skip?: number;
}) {
    const where: Prisma.ReportWhereInput = { isDeleted: false };

    if (params.isSolved !== undefined) where.isSolved = params.isSolved;
    if (params.reporterId) where.reporterId = params.reporterId;
    if (params.targetType === 'product') where.product = { isNot: null };
    if (params.targetType === 'productRating') where.productRating = { isNot: null };
    if (params.targetType === 'user') where.ReportUser = { some: {} };

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          product: { include: { product: true } },
          productRating: { include: { productRating: true } },
          ReportUser: { include: { user: true } },
          reporter: true,
        },
        orderBy: { createdAt: 'desc' },
        take: params.take ?? 20,
        skip: params.skip ?? 0,
      }),
      this.prisma.report.count({ where }),
    ]);

    return { reports, total };
  }

  async list(params: {
    isSolved?: boolean;
    reporterId?: string;
    targetType?: 'product' | 'productRating' | 'user';
    take?: number;
    skip?: number;
  }) {
    const where: Prisma.ReportWhereInput = { isDeleted: false };
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
