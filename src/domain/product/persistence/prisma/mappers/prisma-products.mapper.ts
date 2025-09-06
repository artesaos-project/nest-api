import { Product as PrismaProduct } from '@prisma/client';
import { Product } from '@/domain/product/core/entities/product.entity';
import { ProductPhoto } from '@/domain/product/core/entities/product-photo.entity';
import { ProductPhotosList } from '@/domain/product/core/entities/product-photos-list.entity';

export class PrismaProductsMapper {
  static toDomain(
    product: PrismaProduct,
    photos: ProductPhoto[],
    likesCount: number,
    averageRating: number | null,
  ): Product {
    return Product.create({
      artisanId: product.artisanId,
      categoryId: Number(product.categoryId),
      title: product.title,
      description: product.description,
      likesCount,
      averageRating: averageRating ?? 0,
      priceInCents: Number(product.priceInCents),
      stock: Number(product.stock),
      coverPhotoId: product.coverageImage ?? undefined,
      photos: new ProductPhotosList(photos),
    }, product.id, product.createdAt, product.updatedAt);
  }
}
