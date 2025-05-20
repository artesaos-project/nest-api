import { Module } from '@nestjs/common';
import { UsersRepository } from '../core/repositories/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users.repository';
import { ArtisanApplicationsRepository } from '../core/repositories/artisan-applications.repository';
import { PrismaArtisanApplicationsRepository } from './prisma/repositories/prisma-artisan-applications.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: ArtisanApplicationsRepository,
      useClass: PrismaArtisanApplicationsRepository,
    },
  ],
  exports: [
    UsersRepository,
    ArtisanApplicationsRepository,
  ],
})
export class IdentityPersistenceModule {}
