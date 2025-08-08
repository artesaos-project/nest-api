import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ArtisanApplication, ArtisanApplicationStatus, ApplicationType } from '../entities/artisan-application.entity';
import { PendingDisableRequestAlreadyExistsError } from '../errors/pending-disable-request-already-exists.error';
import { ArtisanProfileNotFoundError } from '../errors/artisan-profile-not-found.error';
import { PrismaArtisanApplicationsRepository } from '../../persistence/prisma/repositories/prisma-artisan-applications.repository';
import { PrismaArtisanProfilesRepository } from '../../persistence/prisma/repositories/prisma-artisan-profiles.repository';

type Input = { userId: string };
type Output = Either<Error, ArtisanApplication>;

@Injectable()
export class RequestDisableArtisanUseCase {
  constructor(
    private readonly applicationsRepo: PrismaArtisanApplicationsRepository,
    private readonly profilesRepo: PrismaArtisanProfilesRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const { userId } = input;
    const existing = await this.applicationsRepo.findByUserId(userId);
    if (existing?.some((a) => a.status === ArtisanApplicationStatus.PENDING)) {
      return left(new PendingDisableRequestAlreadyExistsError(userId));
    }
    const ArtisanProfile = await this.profilesRepo.findByUserId(userId);
    if (!ArtisanProfile) {
      return left(new ArtisanProfileNotFoundError(userId));
    }
    const application = ArtisanApplication.create({
      userId,
      rawMaterial: ArtisanProfile.rawMaterial,
      technique: ArtisanProfile.technique,
      finalityClassification: ArtisanProfile.finalityClassification,
      sicab: ArtisanProfile.sicab,
      sicabRegistrationDate: ArtisanProfile.sicabRegistrationDate,
      sicabValidUntil: ArtisanProfile.sicabValidUntil,
      status: ArtisanApplicationStatus.PENDING,
      type: ApplicationType.DISABLE_PROFILE,
    });
    await this.applicationsRepo.save(application);
    return right(application);
  }
}
