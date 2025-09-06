import { Prisma, Attachment as PrismaAttachment } from '@prisma/client';
import { ProductPhoto } from '@/domain/product/core/entities/product-photo.entity';

export class PrismaProductPhotosMapper {
  static toDomain(raw: PrismaAttachment): ProductPhoto {
    if (!raw.productId) {
      throw new Error('Invalid attachment type.');
    }

    return ProductPhoto.create(
      {
        attachmentId: raw.id,
        productId: raw.productId,
      },
      raw.id,
    );
  }

  static toPrismaUpdateMany(
    attachments: ProductPhoto[],
  ): Prisma.AttachmentUpdateManyArgs {
    const attachmentIds = attachments.map((attachment) => attachment.attachmentId.toString());

    return {
      where: {
        id: {
          in: attachmentIds,
        },
      },
      data: {
        productId: attachments[0].productId,
      },
    };
  }
}
