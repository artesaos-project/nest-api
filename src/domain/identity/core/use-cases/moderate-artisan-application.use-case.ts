import { Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { PrismaArtisanApplicationsRepository } from '../../persistence/prisma/repositories/prisma-artisan-applications.repository';
import { PrismaArtisanProfilesRepository } from '../../persistence/prisma/repositories/prisma-artisan-profiles.repository';
import { ArtisanApplication, ArtisanApplicationStatus } from '../entities/artisan-application.entity';
import { ArtisanProfile } from '../entities/artisan-profile.entity';
import { PrismaUsersRepository } from '../../persistence/prisma/repositories/prisma-users.repository';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { ArtisanApplicationNotFoundError } from '../errors/artisan-application-not-found.error';
import { ArtisanApplicationAlreadyModeratedError } from '../errors/artisan-application-already-moderated.error';
import { PropertyMissingError } from '../errors/property-missing.error';
import { User, UserRole } from '../entities/user.entity';

export interface ModerateArtisanApplicationInput {
  applicationId: string;
  status: ArtisanApplicationStatus.APPROVED | ArtisanApplicationStatus.REJECTED;
  rejectionReason: string | null;
  reviewerId: string;
}

type Output = Either<
  ArtisanApplicationNotFoundError
  | ArtisanApplicationAlreadyModeratedError
  | PropertyMissingError
  | UserNotFoundError,
  void
>

@Injectable()
export class ModerateArtisanApplicationUseCase {
  constructor(
    private readonly artisanApplicationRepository: PrismaArtisanApplicationsRepository,
    private readonly artisanRepository: PrismaArtisanProfilesRepository,
    private readonly userRepository: PrismaUsersRepository,
  ) {}

  async execute({
    applicationId,
    status,
    rejectionReason,
    reviewerId,
  }: ModerateArtisanApplicationInput): Promise<Output> {
    const application = await this.artisanApplicationRepository.findById(applicationId);

    if (!application) {
      return left(new ArtisanApplicationNotFoundError(applicationId));
    }

    if (application.status !== ArtisanApplicationStatus.PENDING) {
      return left(new ArtisanApplicationAlreadyModeratedError(applicationId));
    }

    if (status === ArtisanApplicationStatus.APPROVED) {
      const user = await this.userRepository.findById(application.userId);

      if (!user) {
        return left(new UserNotFoundError(application.userId));
      }

      await this.approveApplication(application, reviewerId, user);
    } else {
      if (!rejectionReason) {
        return left(new PropertyMissingError('rejectionReason'));
      }

      await this.rejectApplication(application, rejectionReason, reviewerId);
    }

    return right(undefined);
  }

  private async approveApplication(
    application: ArtisanApplication,
    reviewerId: string,
    user: User,
  ): Promise<void> {
    const artisanProfile = await this.artisanRepository.findByUserId(application.userId);

    if (artisanProfile) {
      const updatedArtisanProfile = ArtisanProfile.create(
        {
          userId: artisanProfile.userId,
          userName: artisanProfile.userName,
          rawMaterial: application.rawMaterial,
          technique: application.technique,
          finalityClassification: application.finalityClassification,
          sicab: application.sicab,
          sicabRegistrationDate: application.sicabRegistrationDate,
          sicabValidUntil: application.sicabValidUntil,
          isDisabled: false,
        },
        artisanProfile.id,
        artisanProfile.createdAt,
        artisanProfile.updatedAt,
      );

      await this.artisanRepository.save(updatedArtisanProfile);
    } else {
      const allArtisanProfiles = await this.artisanRepository.listAll();

      const userName = await this.generateUniqueUserName(user.name, allArtisanProfiles);

      const newArtisanProfile = ArtisanProfile.create({
        userId: application.userId,
        userName,
        rawMaterial: application.rawMaterial,
        technique: application.technique,
        finalityClassification: application.finalityClassification,
        sicab: application.sicab,
        sicabRegistrationDate: application.sicabRegistrationDate,
        sicabValidUntil: application.sicabValidUntil,
      });

      await this.artisanRepository.save(newArtisanProfile);
    }

    application.approveApplication(reviewerId);
    await this.artisanApplicationRepository.save(application);

    if (!user.roles.includes(UserRole.ARTISAN)) {
      user.roles.push(UserRole.ARTISAN);
    }
    await this.userRepository.save(user);
  }

  private async rejectApplication(
    application: ArtisanApplication,
    rejectionReason: string,
    reviewerId: string,
  ): Promise<void> {
    application.reject(rejectionReason, reviewerId);
    await this.artisanApplicationRepository.save(application);
  }

  private async generateUniqueUserName(baseName: string, artisanProfiles: ArtisanProfile[]) {
    const slugBase = slugify(baseName, { lower: true });
    let candidate = slugBase;
    let counter = 1;

    let isDuplicate = artisanProfiles.some((profile) => profile.userName === candidate);

    while (isDuplicate) {
      candidate = `${slugBase}-${counter}`;
      counter += 1;
      const currentCandidate = candidate;
      isDuplicate = artisanProfiles.some((profile) => profile.userName === currentCandidate);
    }

    return candidate;
  }
}
