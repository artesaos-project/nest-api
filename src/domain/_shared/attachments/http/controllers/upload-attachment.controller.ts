import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAttachmentUseCase } from '../../core/use-cases/upload-attachment.use-case';
import { InvalidAttachmentTypeError } from '../../core/errors/Invalid-attachment-type.error';

@Controller('attachments')
export class UploadAttachmentController {
  constructor(
    private readonly uploadAttachmentUseCase: UploadAttachmentUseCase,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5, // 5mb
          }),
          new FileTypeValidator({
            fileType: '.(png|jpg|jpeg)',
          }),
        ],
      }),
    )
      file: Express.Multer.File,
  ) {
    const result = await this.uploadAttachmentUseCase.execute({
      fileType: file.mimetype,
      body: file.buffer,
      fileSize: file.size,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case InvalidAttachmentTypeError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { attachment } = result.value;

    return {
      attachmentId: attachment.id,
    };
  }
}
