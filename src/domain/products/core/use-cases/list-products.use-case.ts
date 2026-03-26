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
    private readonly usersRepository: UsersRepository,
    private readonly artisansRepository: ArtisanProfilesRepository,
  ) {}

  async execute({
    id,
    artisanId,
    categoryId,
    title,
  }: ListProductsInput): Promise<Output> {
    try {
      const products = await this.productsRepository.list({
        id,
        artisanId,
        categoryId,
        title,
      });

      if (products.length === 0) {
        this.logger.warn('Nenhum produto encontrado com os filtros fornecidos');
        return right([]);
      }

      const authorsPromise = Promise.all(
        products.map((product) => this.usersRepository.findById(product.artisanId)),
      );

      const artisansPromise = Promise.all(
        products.map((product) => this.artisansRepository.findByUserId(product.artisanId)),
      );

      const [authors, artisans] = await Promise.all([
        authorsPromise,
        artisansPromise,
      ]);

      const output = await Promise.all(
        products.map(async (product, index) => {
          const author = authors[index];
          const artisan = artisans[index];

          const coverPhoto = await this.s3StorageStorage.getUrlByFileName(
            product.coverImageId!,
          );

          return {
            id: product.id,
            authorName: author!.name,
            authorId: author!.id,
            authorUserName: artisan!.artisanUserName,
            title: product.title,
            priceInCents: Number(product.priceInCents),
            categoryId,
            isLiked: false,
            coverPhoto,
          };
        }),
      );

      this.logger.log('Listagem de produtos concluída com sucesso');
      return right(output);
    } catch (error) {
      this.logger.error('Erro ao listar produtos', error.stack);

      return left(error);
    }
  }
}
