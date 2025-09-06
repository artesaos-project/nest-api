import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ArtisanApplication, ArtisanApplicationStatus } from '../entities/artisan-application.entity';
import { PendingApplicationAlreadyExistsError } from '../errors/pending-application-already-exists.error';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { PrismaArtisanApplicationsRepository } from '../../persistence/prisma/repositories/prisma-artisan-applications.repository';
import { PrismaUsersRepository } from '../../persistence/prisma/repositories/prisma-users.repository';

export interface CreateArtisanApplicationInput {
  userId: string;
  rawMaterial: string;
  technique: string;
  finalityClassification: string;
  sicab: string;
  sicabRegistrationDate: Date;
  sicabValidUntil: Date;
}

type Output = Either<PendingApplicationAlreadyExistsError, ArtisanApplication>

@Injectable()
export class CreateArtisanApplicationUseCase {
  constructor(
    private readonly artisanApplicationsRepository: PrismaArtisanApplicationsRepository,
    private readonly usersRepository: PrismaUsersRepository,
  ) {}

  async execute({
    userId,
    rawMaterial,
    technique,
    finalityClassification,
    sicab,
    sicabRegistrationDate,
    sicabValidUntil,
  }: CreateArtisanApplicationInput): Promise<Output> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    const existingApplications = await this.artisanApplicationsRepository.findByUserId(userId);

    if (existingApplications?.some((app) => app.status === ArtisanApplicationStatus.PENDING)) {
      return left(new PendingApplicationAlreadyExistsError());
    }

    const artisanApplication = ArtisanApplication.create({
      userId,
      rawMaterial,
      technique,
      finalityClassification,
      sicab,
      sicabRegistrationDate,
      sicabValidUntil,
    });

    await this.artisanApplicationsRepository.save(artisanApplication);

    return right(artisanApplication);
  }
}
