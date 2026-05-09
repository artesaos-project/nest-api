import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { ArtisanProfilesRepository } from '@/domain/repositories/artisan-profiles.repository';

export interface ListProductsInput {
  id?: string;
  categoryId?: number;
  artisanId?: string;
  title?: string;
}

export interface ListProductsOutput {
  id: string;
  authorName: string;
  authorUserName: string;
  authorId: string;
  title: string;
  priceInCents: number;
  categoryId?: number;
  isLiked: boolean;
  coverPhoto?: string;
}

type Output = Either<Error, ListProductsOutput[]>;

@Injectable()
export class ListProductsUseCase {
  private readonly logger = new Logger(ListProductsUseCase.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly s3StorageStorage: S3StorageService,
  ) { }

  async execute({
    id,
    artisanId,
    categoryId,
    title,
  }: ListProductsInput): Promise<Output> {
    try {
      const products = await this.productsRepository.listWithAuthorsAndArtisans({
        id,
        artisanId,
        categoryId,
        title,
      });

      if (products.length === 0) {
        this.logger.warn('Nenhum produto encontrado com os filtros fornecidos');
        return right([]);
      }

      const output = await Promise.all(
        products.map(async (product) => {

          const coverPhoto = await this.s3StorageStorage.getUrlByFileName(
            product.coverImageId!,
          );

          return {
            id: product.id,
            authorName: product.artisan!.user!.name,
            authorId: product.artisan!.user!.id,
            authorUserName: product.artisan!.artisanUserName,
            title: product.title,
            priceInCents: Number(product.priceInCents),
            categoryId,
            isLiked: false,
            coverPhoto,
          };
        }),
      );


      return right(output);
    } catch (error) {
      this.logger.error('Erro ao listar produtos', error.stack);

      return left(error);
    }
  }
}
