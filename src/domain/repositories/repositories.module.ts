import { Module } from '@nestjs/common';
import { AttachmentsRepository } from './attachments.repository';
import { ArtisanApplicationsRepository } from './artisan-applications.repository';
import { ArtisanProfilesRepository } from './artisan-profiles.repository';
import { UsersRepository } from './users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ProductsRepository } from './products.repository';
import { ProductLikesRepository } from './product-likes.repository';
import { ArtisanFollowersRepository } from './artisan-followers.repository';
import { ProductReviewsRepository } from './product-reviews.repository';
import { ReportRepository } from './report.repository';

@Module({
  providers: [
    PrismaService,
    UsersRepository,
    AttachmentsRepository,
    ArtisanApplicationsRepository,
    ArtisanProfilesRepository,
    ProductsRepository,
    ProductLikesRepository,
    ArtisanFollowersRepository,
    ProductReviewsRepository,
    ReportRepository,
  ],
  exports: [PrismaService,
    UsersRepository,
    AttachmentsRepository,
    ArtisanApplicationsRepository,
    ArtisanProfilesRepository,
    ProductsRepository,
    ProductLikesRepository,
    ArtisanFollowersRepository,
    ProductReviewsRepository,
    ReportRepository,
  ],
})
export class RepositoriesModule {}
