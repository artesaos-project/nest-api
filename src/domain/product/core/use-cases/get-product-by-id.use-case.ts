import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { PrismaProductsRepository } from '../../persistence/prisma/repositories/prisma-products.repository';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { S3AttachmentsStorage } from '@/domain/_shared/attachments/persistence/storage/s3-attachments.storage';
import { PrismaUsersRepository } from '@/domain/identity/persistence/prisma/repositories/prisma-users.repository';

export interface GetProductByIdInput {
  id: string;
}

export interface GetProductByIdOutput {
  id: string;
  authorName: string;
  authorId: string;
  title: string;
  description: string;
  priceInCents: number;
  categoryId: number;
  stock: number;
  likesCount: number;
  averageRating: number;
  photos: string[];
  coverPhoto?: string;
}

type Output = Either<Error, GetProductByIdOutput>;

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    private readonly productsRepository: PrismaProductsRepository,
    private readonly s3AttachmentStorage: S3AttachmentsStorage,
    private readonly usersProfileRepository: PrismaUsersRepository,
  ) {}

  async execute({
    id,
  }: GetProductByIdInput): Promise<Output> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      return left(new ProductNotFoundError(id));
    }

    const urlPhotos = await Promise.all(
      (product.photos
        ? product.photos.getItems()
        : []
      ).map((photo) => this.s3AttachmentStorage.getUrlByFileName(photo.attachmentId)),
    );

    let coverPhoto: string | undefined;

    if (!product.coverPhotoId) {
      coverPhoto = undefined;
    } else {
      coverPhoto = await this.s3AttachmentStorage.getUrlByFileName(product.coverPhotoId);
    }

    const author = await this.usersProfileRepository.findById(product.artisanId);

    return right({
      id: product.id,
      authorName: author!.name,
      authorId: author!.id,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      categoryId: product.categoryId,
      stock: product.stock,
      likesCount: product.likesCount,
      averageRating: product.averageRating ?? 0,
      photos: urlPhotos,
      coverPhoto,
    });
  }
}
