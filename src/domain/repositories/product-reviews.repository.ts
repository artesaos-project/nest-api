import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, ProductRating } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class ProductReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndProduct(
    userId: string,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<import('@prisma/client').ProductRating | null> {
    const db = (tx ?? this.prisma);
    return db.productRating.findUnique({
      where: { productId_userId: { productId, userId } },
    });
  }

  async create(
    userId: string,
    productId: string,
    rating: number,
    comment?: string | null,
    tx?: Prisma.TransactionClient,
  ): Promise<import('@prisma/client').ProductRating> {
    const db = (tx ?? this.prisma);
    return db.productRating.create({
      data:
      {
        userId,
        productId,
        rating,
        comment: comment ?? null,
      },
    });
  }

  async update(
    id: string,
    rating: number,
    comment?: string | null,
    tx?: Prisma.TransactionClient,
  ): Promise<import('@prisma/client').ProductRating> {
    const db = (tx ?? this.prisma);
    return db.productRating.update({
      where: { id },
      data: { rating, comment: comment ?? null },
    });
  }

  async deleteByUserAndProduct(
    userId: string,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const db = (tx ?? this.prisma);
    const res = await db.productRating.deleteMany({ where: { userId, productId } });
    return res.count;
  }

  async listByProduct(
    productId: string,
    page: number,
    limit: number,
    tx?: Prisma.TransactionClient,
  ): Promise<
    Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
      user: { id: string; name: string; avatar: string | null };
    }>
  > {
    const db = (tx ?? this.prisma);
    const skip = (page - 1) * limit;

    const rows = await db.productRating.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take: limit,
    });

    return rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      user: { id: r.user.id, name: r.user.name, avatar: r.user.avatar },
    }));
  }

  async countByProduct(
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const db = (tx ?? this.prisma);
    return db.productRating.count({ where: { productId } });
  }

  async aggregateByProduct(
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ avg: number | null; count: number }> {
    const db = (tx ?? this.prisma);
    const stats = await db.productRating.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return { avg: stats._avg.rating ?? null, count: stats._count.rating };
  }

  async listByProductWithUsers(
    productId: string,
    page: number,
    limit: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = (tx ?? this.prisma) as PrismaClient;
    return client.productRating.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        images: { select: { id: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async validateAttachableImages(
    imageIds: string[],
    ownerUserId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ok: boolean; found: string[]}> {
    if (!imageIds?.length) {
      return { ok: true, found: [] };
    }

    const client = (tx ?? this.prisma) as PrismaClient;
    const rows = await client.attachment.findMany({
      where: {
        id: { in: imageIds },
        userId: ownerUserId,
        reviewId: null,
        productId: null,
      },
      select: { id: true },
    });
    return { ok: rows.length === imageIds.length, found: rows.map((r) => r.id) };
  }

  async replaceImages(
    reviewId: string,
    imageIds: string[],
    ownerUserId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.attachment.updateMany({
      where: { reviewId },
      data: { reviewId: null },
    });

    if (!imageIds?.length) return;

    await tx.attachment.updateMany({
      where: {
        id: { in: imageIds },
        userId: ownerUserId,
        reviewId: null,
      },
      data: { reviewId },
    });
  }

  async clearImages(
    reviewId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.attachment.updateMany({
      where: { reviewId },
      data: { reviewId: null },
    });
  }

  async replaceImagesReturningCount(
    reviewId: string,
    imageIds: string[],
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    await tx.attachment.updateMany({ where: { reviewId }, data: { reviewId } });

    if (!imageIds?.length) return 0;

    const res = await tx.attachment.updateMany({
      where: {
        id: { in: imageIds },
        reviewId: null,
        productId: null,
      },
      data: { reviewId },
    });

    return res.count;
  }

  async findById(id: string): Promise<ProductRating | null> {
    return this.prisma.productRating.findUnique({ where: { id } });
  }
}
