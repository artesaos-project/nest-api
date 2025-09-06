import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { Product } from '../entities/product.entity';
import { PrismaProductsRepository } from '../../persistence/prisma/repositories/prisma-products.repository';
import { ProductPhoto } from '../entities/product-photo.entity';
import { ProductPhotosList } from '../entities/product-photos-list.entity';
import { PrismaArtisanProfilesRepository } from '@/domain/identity/persistence/prisma/repositories/prisma-artisan-profiles.repository';
import { UserNotFoundError } from '@/domain/identity/core/errors/user-not-found.error';
import { PrismaProductCategoriesRepository } from '../../persistence/prisma/repositories/prisma-product-categories.repository';
import { ProductCategoryNotFound } from '../errors/product-category-not-found.error';

export interface CreateProductInput {
  artisanId: string;
  title: string;
  description: string;
  priceInCents: number;
  categoryId: number;
  stock: number;
  photoIds: string[];
  coverPhotoId?: string;
}

export interface CreateProductOutput {
  id: string;
  artisanId: string;
  title: string;
  description: string;
  priceInCents: number;
  categoryId: number;
  stock: number;
  likesCount: number;
  averageRating: number;
  photos: ProductPhoto[];
  coverPhotoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

type Output = Either<Error, CreateProductOutput>;

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productsRepository: PrismaProductsRepository,
    private readonly artisanRepository: PrismaArtisanProfilesRepository,
    private readonly productCategoriesRepository: PrismaProductCategoriesRepository,
  ) {}

  async execute({
    artisanId,
    title,
    description,
    priceInCents,
    categoryId,
    stock,
    photoIds,
    coverPhotoId,
  }: CreateProductInput): Promise<Output> {
    const artisan = await this.artisanRepository.findByUserId(artisanId);

    if (!artisan) {
      return left(new UserNotFoundError(artisanId));
    }

    const productCategoryExists = await this.productCategoriesRepository.findById(categoryId);

    if (!productCategoryExists) {
      return left(new ProductCategoryNotFound(categoryId));
    }

    const product = Product.create({
      artisanId,
      title,
      description,
      priceInCents,
      categoryId,
      stock,
      coverPhotoId,
      likesCount: 0,
    });

    const productPhotos = photoIds.map((photoId) => ProductPhoto.create({
      attachmentId: photoId,
      productId: product.id,
    }));

    if (!coverPhotoId && productPhotos.length > 0) {
      product.coverPhotoId = productPhotos[0].attachmentId;
    }

    product.photos = new ProductPhotosList(productPhotos);

    await this.productsRepository.save(product);

    return right({
      id: product.id,
      artisanId: product.artisanId,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      categoryId: product.categoryId,
      stock: product.stock,
      likesCount: product.likesCount,
      averageRating: product.averageRating ?? 0,
      photos: product.photos.getItems(),
      coverPhotoId: product.coverPhotoId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }
}
