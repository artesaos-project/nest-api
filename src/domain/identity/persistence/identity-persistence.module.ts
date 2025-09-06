import { Module } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users.repository';
import { PrismaArtisanApplicationsRepository } from './prisma/repositories/prisma-artisan-applications.repository';
import { PrismaArtisanProfilesRepository } from './prisma/repositories/prisma-artisan-profiles.repository';

@Module({
  providers: [
    PrismaService,
    PrismaArtisanApplicationsRepository,
    PrismaArtisanProfilesRepository,
    PrismaUsersRepository,
  ],
  exports: [
    PrismaArtisanApplicationsRepository,
    PrismaArtisanProfilesRepository,
    PrismaUsersRepository,
  ],
})
export class IdentityPersistenceModule {}
