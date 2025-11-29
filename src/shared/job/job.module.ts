import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AttachmentsModule } from '@/domain/attachments/attachments.module';
import { PrismaService } from '../prisma/prisma.service';
import { CleanupOrphanAttachmentsJob } from './cleanup-orphan-attachments.job';
import { CleanupOrphanAttachmentsController } from './cleanup-orphan-attachments.controller';
import { RepositoriesModule } from '@/domain/repositories/repositories.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AttachmentsModule,
    RepositoriesModule,
  ],
  providers: [
    PrismaService,
    CleanupOrphanAttachmentsJob,
  ],
  controllers: [
    CleanupOrphanAttachmentsController,
  ],
})
export class JobsModule {}
