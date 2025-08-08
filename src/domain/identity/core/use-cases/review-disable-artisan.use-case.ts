import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ArtisanApplication, ArtisanApplicationStatus } from '../entities/artisan-application.entity';
import { PrismaArtisanApplicationsRepository } from '../../persistence/prisma/repositories/prisma-artisan-applications.repository';
import { ArtisanApplicationNotFoundError } from '../errors/artisan-application-not-found.error';
import { ArtisanApplicationAlreadyModeratedError } from '../errors/artisan-application-already-moderated.error';
import { PropertyMissingError } from '../errors/property-missing.error';

interface Input {
  applicationId: string;
  reviewerId: string;
  status: ArtisanApplicationStatus.APPROVED | ArtisanApplicationStatus.REJECTED;
  rejectionReason?: string;
}
type Output = Either<Error, ArtisanApplication>;

@Injectable()
export class ReviewDisableArtisanUseCase {
  constructor(
    private readonly applicationsRepo: PrismaArtisanApplicationsRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const {
      applicationId, reviewerId, status, rejectionReason,
    } = input;
    const application = await this.applicationsRepo.findById(applicationId);
    if (!application) {
      return left(new ArtisanApplicationNotFoundError(applicationId));
    }
    if (application.status !== ArtisanApplicationStatus.PENDING) {
      return left(new ArtisanApplicationAlreadyModeratedError(applicationId));
    }
    if (status === ArtisanApplicationStatus.REJECTED && !rejectionReason) {
      return left(new PropertyMissingError('rejectionReason'));
    }

    if (status === ArtisanApplicationStatus.APPROVED) {
      application.approve(reviewerId);
    } else {
      application.reject(rejectionReason!, reviewerId);
    }
    await this.applicationsRepo.save(application);
    return right(application);
  }
}
