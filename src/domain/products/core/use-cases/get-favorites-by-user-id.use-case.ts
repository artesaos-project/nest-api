import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductLikesRepository } from '@/domain/repositories/product-likes.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { UserNotFoundError } from '@/domain/identity/core/errors/user-not-found.error';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';

export interface GetFavoritesByUserIdInput {
  userId: string;
  page?: number;
  limit?: number;
}

export interface FavoriteProductOutput {
  id: string;
  title: string;
  description: string;
  priceInCents: number;
  stock: number;
  coverImage: string;
  slug: string;
  viewsCount: number;
  likesCount: number;
  averageRating: number;
  artisan: {
    id: string;
    userId: string;
    userName: string;
    bio: string | null;
    user: {
      id: string;
      name: string;
    };
  };
}

export interface GetFavoritesByUserIdOutput {
  products: FavoriteProductOutput[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface FavoriteWithProduct {
  id: string;
  createdAt: Date;
  product: {
    id: string;
    title: string;
    description: string;
    priceInCents: number | bigint;
    stock: number;
    coverImageId?: string | null;
    coverImage?: { id: string } | null;
    slug: string;
    viewsCount: number;
    likesCount: number;
    averageRating: number | null;
    isActive: boolean;
    artisan: {
      id: string;
      userId: string;
      artisanUserName?: string | null;
      bio?: string | null;
      user: {
        id: string;
        name: string;
      };
    };
  };
}

type Output = Either<UserNotFoundError, GetFavoritesByUserIdOutput>;

@Injectable()
export class GetFavoritesByUserIdUseCase {
  private readonly logger = new Logger(GetFavoritesByUserIdUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly productLikesRepository: ProductLikesRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly s3AttachmentsStorage: S3StorageService,
  ) {}

  async execute({
    userId,
    page = 1,
    limit = 10,
  }: GetFavoritesByUserIdInput): Promise<Output> {
    try {
      this.logger.debug(`Getting favorites for user: ${userId}, page: ${page}, limit: ${limit}`);

      const user = await this.usersRepository.findById(userId);
      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        return left(new UserNotFoundError(userId, 'id'));
      }

      const favoriteProducts = await this.getFavoriteProductsWithPagination(
        userId,
        Number(page),
        Number(limit),
      );

      const totalFavorites = await this.countUserFavorites(userId);

      const processedProducts = await Promise.all(
        favoriteProducts.map(async (favorite: FavoriteWithProduct) => {
            const product = favorite.product;

            if (!product || !product.isActive) {
              return null;
            }

            const coverImageId = product.coverImage?.id ?? product.coverImageId ?? null;
            const coverImage = await this.generateCoverImageUrl(coverImageId);

          return {
            id: product.id,
            title: product.title,
            description: product.description,
            priceInCents: Number(product.priceInCents),
            stock: product.stock,
            coverImage,
            slug: product.slug,
            viewsCount: product.viewsCount,
            likesCount: product.likesCount,
            averageRating: product.averageRating,
            artisan: {
              id: product.artisan.id,
              userId: product.artisan.userId,
              userName: product.artisan.artisanUserName ?? product.artisan.user.name,
              bio: product.artisan.bio,
              user: {
                id: product.artisan.user.id,
                name: product.artisan.user.name,
              },
            },
          };
        }),
      );
      
      const validProducts = processedProducts.filter(
        (product): product is FavoriteProductOutput => product !== null,
      );

      const totalPages = Math.ceil(totalFavorites / limit);
      const currentPage = Number(page);

      const paginationData = {
        currentPage,
        totalPages,
        totalItems: totalFavorites,
        itemsPerPage: Number(limit),
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      };

      this.logger.debug(
        `Successfully retrieved ${validProducts.length} favorites for user: ${userId}`,
      );

      return right({
        products: validProducts,
        pagination: paginationData,
      });
    } catch (error) {
      this.logger.error(`Error getting favorites for user ${userId}:`, error);
      return left(new UserNotFoundError(userId, 'id'));
    }
  }

  private async getFavoriteProductsWithPagination(
    userId: string,
    page: number,
    limit: number,
  ): Promise<FavoriteWithProduct[]> {
    const skip = (page - 1) * limit;

    return this.prisma.productLike.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            priceInCents: true,
            stock: true,
            coverImageId: true,
            slug: true,
            viewsCount: true,
            likesCount: true,
            averageRating: true,
            isActive: true,
            artisan: {
              select: {
                id: true,
                userId: true,
                artisanUserName: true,
                bio: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            coverImage: {
              select: { id: true },
            },
          },
        },
      },
    });
  }

  private async countUserFavorites(userId: string): Promise<number> {
    return this.prisma.productLike.count({
      where: { userId },
    });
  }

  private async generateCoverImageUrl(coverImageId: string | null): Promise<string | null> {
    if (!coverImageId) {
      return null;
    }

    try {
      const url = await this.s3AttachmentsStorage.getUrlByFileName(coverImageId);
      this.logger.debug(`Generated cover image URL for attachment: ${coverImageId}`);
      return url;
    } catch (urlError) {
      this.logger.warn(`Failed to generate cover image URL for attachment ${coverImageId}:`, urlError);
      return null;
    }
  }
}