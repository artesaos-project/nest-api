import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { ArtisanProfilesRepository } from '@/domain/repositories/artisan-profiles.repository';
import { ProductNotFoundError } from '../errors/product-not-found.error';

export interface GetProductByIdInput {
  id: string;
}

export interface GetProductByIdOutput {
  id: string;
  authorName: string;
  authorUserName: string;
  authorId: string;
  authorPhoneNumber: string;
  authorAvatarUrl?: string;
  authorProductsCount?: number;
  authorFollowersCount?: number;
  title: string;
  description: string;
  priceInCents: number;
  categoryIds: number[];
  stock: number;
  likesCount: number;
  averageRating: number;
  photos: string[];
  photosIds: string[];
  coverPhoto?: string;
}

type Output = Either<Error, GetProductByIdOutput>;

@Injectable()
export class GetProductByIdUseCase {
  private readonly logger = new Logger(GetProductByIdUseCase.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly s3StorageService: S3StorageService,
    private readonly usersRepository: UsersRepository,
    private readonly artisanProfilesRepository: ArtisanProfilesRepository,
  ) {}

  async execute({ id }: GetProductByIdInput): Promise<Output> {
    try {
      const product = await this.productsRepository.findById(id);

      if (!product) {
        this.logger.warn(`Produto com ID ${id} não encontrado`);
        return left(new ProductNotFoundError(id));
      }

      const photos = product.photos
        ? await Promise.all(
          product
            .photos
            .map((photo) => this.s3StorageService.getUrlByFileName(photo.attachmentId)),
        )
        : [];

      const coverPhoto = product.coverImageId
        ? await this.s3StorageService.getUrlByFileName(product.coverImageId)
        : undefined;

      const author = await this.usersRepository.findById(product.artisanId);
      if (!author) {
        this.logger.error(`Usuário com ID ${product.artisanId} não encontrado`);
        throw new Error(`Usuário com ID ${product.artisanId} não encontrado`);
      }

      const authorProductsCount = (await this.productsRepository.findByArtisanId(author.id)).length;
      const authorAvatarUrl = author.avatar
        ? await this.s3StorageService.getUrlByFileName(author.avatar)
        : undefined;

      const artisanProfile = await this.artisanProfilesRepository.findByUserId(
        product.artisanId,
      );

      if (!artisanProfile) {
        this.logger.error(
          `Perfil de artesão com ID ${product.artisanId} não encontrado`,
        );
        throw new Error(
          `Perfil de artesão com ID ${product.artisanId} não encontrado`,
        );
      }

      const authorFollowersCount = artisanProfile.followersCount ?? 0;

      this.logger.log(`Produto com ID ${id} encontrado com sucesso`);

      return right({
        id: product.id,
        authorName: author.name,
        authorUserName: artisanProfile.artisanUserName,
        authorId: author.id,
        authorPhoneNumber: author.phone,
        authorProductsCount,
        authorAvatarUrl,
        authorFollowersCount,
        title: product.title,
        description: product.description,
        priceInCents: Number(product.priceInCents),
        categoryIds: product.categoryIds.map((c) => Number(c)),
        stock: product.stock,
        likesCount: product.likesCount,
        averageRating: product.averageRating ?? 0,
        photos,
        photosIds: product.photos ? product.photos.map((p) => p.attachmentId) : [],
        coverPhoto,
      });
    } catch (error) {
      // Log de erro
      this.logger.error(
        `Erro ao buscar produto com ID ${id}: ${error.message}`,
        error.stack,
      );

      // Retorna o erro
      return left(error);
    }
  }
}
