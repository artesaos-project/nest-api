import { Injectable } from '@nestjs/common';
import { Attachment, ProductRating } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateAttachmentData {
  userId?: string | null;
  artisanApplicationId?: string | null;
  fileType: string;
  fileSize: bigint;
}

@Injectable()
export class AttachmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAttachmentData): Promise<Attachment> {
    return this.prisma.attachment.create({
      data: {
        userId: data.userId,
        artisanApplicationId: data.artisanApplicationId,
        fileType: data.fileType,
        fileSize: data.fileSize,
      },
    });
  }

  async findById(id: string): Promise<Attachment | null> {
    return this.prisma.attachment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        artisanApplication: {
          select: {
            id: true,
            status: true,
            formStatus: true,
          },
        },
      },
    });
  }

  async findManyByIds(ids: string[]): Promise<Attachment[]> {
    return this.prisma.attachment.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string): Promise<Attachment[]> {
    return this.prisma.attachment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByArtisanApplicationId(artisanApplicationId: string): Promise<Attachment[]> {
    return this.prisma.attachment.findMany({
      where: { artisanApplicationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async linkToArtisanApplication(
    attachmentIds: string[],
    artisanApplicationId: string,
  ): Promise<void> {
    await this.prisma.attachment.updateMany({
      where: {
        id: {
          in: attachmentIds,
        },
      },
      data: {
        artisanApplicationId,
      },
    });
  }

  async linkToProduct(attachmentIds: string[], productId: string): Promise<void> {
    await this.prisma.attachment.updateMany({
      where: {
        id: {
          in: attachmentIds,
        },
      },
      data: {
        productId,
      },
    });
  }

  async unlinkFromArtisanApplication(attachmentIds: string[]): Promise<void> {
    await this.prisma.attachment.updateMany({
      where: {
        id: {
          in: attachmentIds,
        },
      },
      data: {
        artisanApplicationId: null,
      },
    });
  }

  async findOrphanAttachmentsByUser(userId: string): Promise<Attachment[]> {
    return this.prisma.attachment.findMany({
      where: {
        userId,
        artisanApplicationId: null,
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Mais de 24h
        },
      },
    });
  }

  async findOrphanAttachments(): Promise<Attachment[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.prisma.attachment.findMany({
      where: {
        AND: [
          { userId: null },
          { artisanApplicationId: null },
          { productId: null },
          { reviewId: null },
          {
            createdAt: {
              lt: twentyFourHoursAgo,
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.attachment.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async findByEntityId(entityId: string): Promise<Attachment[]> {
    return this.prisma.attachment.findMany({
      where: { productId: entityId },
    });
  }

  async findByReviewId(reviewId: string): Promise<Attachment[]> {
    return this.prisma.attachment.findMany({
      where: { reviewId },
    });
  }

  async findRatingsByProductId(productId: string): Promise<Partial<ProductRating>[]> {
    return this.prisma.productRating.findMany({
      where: { productId },
      select: {
        id: true,
        comment: true,
        rating: true,
      },
    });
  }
}
