import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AttachmentsRepository } from '@/domain/repositories/attachments.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';

export interface CleanupResult {
  deletedFromDatabase: number;
  deletedFromStorage: number;
  errors: number;
}

@Injectable()
export class CleanupOrphanAttachmentsJob {
  private readonly logger = new Logger(CleanupOrphanAttachmentsJob.name);

  private isRunning = false;

  constructor(
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly s3StorageService: S3StorageService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron() {
    if (this.isRunning) {
      this.logger.warn('Job already running, skipping this execution');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    this.logger.log('Starting scheduled cleanup of orphan attachments');

    try {
      await this.execute();

      const duration = Date.now() - startTime;
      this.logger.log(`Scheduled cleanup completed successfully in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Scheduled cleanup failed after ${duration}ms`, error.stack);
    } finally {
      this.isRunning = false;
    }
  }

  async execute(): Promise<CleanupResult> {
    const result: CleanupResult = {
      deletedFromDatabase: 0,
      deletedFromStorage: 0,
      errors: 0,
    };

    try {
      const orphanAttachments = await this.attachmentsRepository.findOrphanAttachments();

      if (orphanAttachments.length === 0) {
        this.logger.log('No orphan attachments found');
        return result;
      }

      this.logger.log(`Found ${orphanAttachments.length} orphan attachments`);

      await Promise.all(
        orphanAttachments.map(async (attachment) => {
          try {
            await this.s3StorageService.delete(attachment.id);
            result.deletedFromStorage += 1;
            this.logger.debug(`Deleted from storage: ${attachment.id}`);
          } catch (error) {
            this.logger.error(
              `Failed to delete from storage: ${attachment.id}`,
              error.message,
            );
            result.errors += 1;
          }
        }),
      );

      const attachmentIds = orphanAttachments.map((a) => a.id);
      try {
        await this.attachmentsRepository.deleteMany(attachmentIds);
        result.deletedFromDatabase = attachmentIds.length;
        this.logger.log(`Deleted ${result.deletedFromDatabase} attachments from database`);
      } catch (error) {
        this.logger.error('Failed to delete attachments from database', error.stack);
        result.errors += 1;
      }

      this.logger.log('Cleanup summary:', result);

      return result;
    } catch (error) {
      this.logger.error('Error during cleanup process', error.stack);
      throw error;
    }
  }
}
