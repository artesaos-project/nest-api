import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { AttachmentsRepository } from '@/domain/repositories/attachments.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { UnauthorizedProductAccessError } from '../errors/unauthorized-product-access.error';
import { ReportRepository } from '@/domain/repositories/report.repository';
import { UsersRepository } from '@/domain/repositories/users.repository';

export interface DeleteProductInput {
  productId: string;
  userId: string;
}

export interface DeleteProductOutput {
  message: string;
  deletedResources: {
    attachments: number;
    likes: number;
    ratings: number;
  };
}

type Output = Either<
  ProductNotFoundError | UnauthorizedProductAccessError,
  DeleteProductOutput
>;

@Injectable()
export class DeleteProductUseCase {
  private readonly logger = new Logger(DeleteProductUseCase.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly reportsRepository: ReportRepository,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async execute({ productId, userId }: DeleteProductInput): Promise<Output> {
    this.logger.log('Starting product deletion', { productId, userId });

    try {
      const product = await this.productsRepository.findByIdCore(productId);
      const user = await this.usersRepository.findById(userId);

      if (!product) {
        this.logger.warn('Product not found', { productId });
        return left(new ProductNotFoundError(productId));
      }

      if (product.artisanId !== userId && !user?.roles.includes('MODERATOR')) {
        this.logger.warn('Unauthorized product access', { productId, userId, ownerId: product.artisanId });
        return left(new UnauthorizedProductAccessError());
      }

      const deletedAttachments = await this.deleteProductAttachments(productId);

      const fullProduct = await this.productsRepository.findById(productId);
      if (fullProduct?.coverImageId) {
        await this.deleteFromS3(fullProduct.coverImageId);
      }

      await this.productsRepository.deleteProductLikes(productId);
      const likesCount = fullProduct?.likesCount || 0;

      const deletedRatings = await this.deleteProductRatings(productId);

      await this.reportsRepository.deleteAllProductReports(product.id);

      await this.productsRepository.delete(productId);

      this.logger.log('Product deleted successfully', {
        productId,
        deletedAttachments,
        deletedRatings,
      });

      return right({
        message: 'Product deleted successfully',
        deletedResources: {
          attachments: deletedAttachments,
          likes: likesCount,
          ratings: deletedRatings,
        },
      });
    } catch (error) {
      this.logger.error('Error deleting product', error.stack);
      throw error;
    }
  }

  private async deleteProductAttachments(productId: string): Promise<number> {
    this.logger.log('Deleting product attachments', { productId });

    const attachments = await this.attachmentsRepository.findByEntityId(productId);

    await Promise.all(
      attachments.map(async (attachment) => {
        await this.deleteFromS3(attachment.id);
        await this.attachmentsRepository.delete(attachment.id);
      }),
    );

    return attachments.length;
  }

  private async deleteProductRatings(productId: string): Promise<number> {
    this.logger.log('Deleting product ratings', { productId });

    const ratings = await this.attachmentsRepository.findRatingsByProductId(productId);

    await Promise.all(
      ratings.map(async (rating) => {
        const ratingImages = await this.attachmentsRepository.findByReviewId(rating.id!);

        await Promise.all(
          ratingImages.map(async (image) => {
            await this.deleteFromS3(image.id);
            await this.attachmentsRepository.delete(image.id);
          }),
        );
      }),
    );

    await this.productsRepository.deleteProductRatings(productId);

    return ratings.length;
  }

  private async deleteFromS3(key: string): Promise<void> {
    try {
      this.logger.log('Deleting from S3', { key });
      await this.s3StorageService.delete(key);
    } catch (error) {
      this.logger.error('Error deleting from S3', { key, error: error.message });
    }
  }
}
