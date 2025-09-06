import { Module } from '@nestjs/common';
import { UploadAttachmentController } from './controllers/upload-attachment.controller';
import { UploadAttachmentUseCase } from '../core/use-cases/upload-attachment.use-case';
import { AttachmentPersistenceModule } from '../persistence/attachment-persistence.module';

@Module({
  imports: [AttachmentPersistenceModule],
  controllers: [UploadAttachmentController],
  providers: [UploadAttachmentUseCase],
})
export class HttpModule {}
