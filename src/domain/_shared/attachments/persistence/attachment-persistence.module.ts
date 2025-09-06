import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments.repository';
import { S3AttachmentsStorage } from './storage/s3-attachments.storage';

@Module({
  providers: [
    PrismaService,
    PrismaAttachmentsRepository,
    S3AttachmentsStorage,
    S3Client,
  ],
  exports: [
    PrismaAttachmentsRepository,
    S3AttachmentsStorage,
  ],
})
export class AttachmentPersistenceModule {}
