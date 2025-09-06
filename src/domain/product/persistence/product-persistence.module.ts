import { Module } from '@nestjs/common';
import { PrismaProductsRepository } from './prisma/repositories/prisma-products.repository';
import { PrismaProductPhotosRepository } from './prisma/repositories/prisma-product-photos.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaProductCategoriesRepository } from './prisma/repositories/prisma-product-categories.repository';
import { PrismaArtisanProfilesRepository } from '@/domain/identity/persistence/prisma/repositories/prisma-artisan-profiles.repository';

@Module({
  providers: [
    PrismaService,
    PrismaProductsRepository,
    PrismaProductPhotosRepository,
    PrismaProductCategoriesRepository,
    PrismaArtisanProfilesRepository,
  ],
  exports: [
    PrismaProductsRepository,
    PrismaProductPhotosRepository,
    PrismaProductCategoriesRepository,
    PrismaArtisanProfilesRepository,
  ],
})
export class ProductPersistenceModule {}
