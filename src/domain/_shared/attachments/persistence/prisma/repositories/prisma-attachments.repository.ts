import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Attachment } from '../../../core/entities/attachment.entity';

@Injectable()
export class PrismaAttachmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(attachment: Attachment): Promise<void> {
    const commonData = {
      id: attachment.id,
      fileType: attachment.mimeType,
      fileSize: attachment.sizeInBytes,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
    };

    await this.prisma.attachment.upsert({
      where: { id: attachment.id },
      create: commonData,
      update: commonData,
    });
  }
}
