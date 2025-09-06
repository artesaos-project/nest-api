import { Injectable } from '@nestjs/common';
import { ArtisanApplication, ArtisanApplicationStatus, ApplicationType } from '../entities/artisan-application.entity';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { NoArtisanApplicationsFoundError } from '../errors/no-artisan-applications-found.error';
import { PrismaArtisanApplicationsRepository } from '../../persistence/prisma/repositories/prisma-artisan-applications.repository';
import { PrismaUsersRepository } from '../../persistence/prisma/repositories/prisma-users.repository';

export interface GetAllArtisanApplicationsWithUserNamesOutput {
  id: string;
  type: ApplicationType;
  artisanName: string;
  email: string;
  rawMaterial: string;
  technique: string;
  sicab: string;
  status: ArtisanApplicationStatus
}

type Output = Either <
  NoArtisanApplicationsFoundError,
  { artisanApplications: GetAllArtisanApplicationsWithUserNamesOutput[] }
>

@Injectable()
export class GetAllArtisanApplicationsWithUserNamesUseCase {
  constructor(
    private readonly artisanApplicationsRepository: PrismaArtisanApplicationsRepository,
    private readonly usersRepository: PrismaUsersRepository,
  ) {}

  async execute(
    type?: ApplicationType,
    status?: ArtisanApplicationStatus,
  ): Promise<Output> {
    const artisanApplications = await this.artisanApplicationsRepository.listAll(type, status);

    if (artisanApplications.length === 0) {
      return left(new NoArtisanApplicationsFoundError());
    }

    const users = await this.usersRepository.findManyByIds(
      artisanApplications.map((ap: ArtisanApplication) => ap.userId),
    );

    const applicationsWithUserName = artisanApplications.map(
      (ap: ArtisanApplication) => {
        const user = users.find((u) => u.id === ap.userId);
        return {
          id: ap.id,
          type: ap.type,
          artisanName: user?.name,
          email: user?.email,
          rawMaterial: ap.rawMaterial,
          technique: ap.technique,
          sicab: ap.sicab,
          status: ap.status,
        } as GetAllArtisanApplicationsWithUserNamesOutput;
      },
    );

    return right({ artisanApplications: applicationsWithUserName });
  }
}
