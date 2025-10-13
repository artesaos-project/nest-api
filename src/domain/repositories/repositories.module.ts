import { Module } from '@nestjs/common';
import { AttachmentsRepository } from './attachments.repository';
import { ArtisanApplicationsRepository } from './artisan-applications.repository';
import { ArtisanProfilesRepository } from './artisan-profiles.repository';
import { UsersRepository } from './users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ProductsRepository } from './products.repository';
import { ProductLikesRepository } from './product-likes.repository';
import { ArtisanFollowersRepository } from './artisan-followers.repository';

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
  ],
  exports: [PrismaService,
    UsersRepository,
    AttachmentsRepository,
    ArtisanApplicationsRepository,
    ArtisanProfilesRepository,
    ProductsRepository,
    ProductLikesRepository,
    ArtisanFollowersRepository,
  ],
})
export class RepositoriesModule {}
