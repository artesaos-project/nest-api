import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { ArtisanProfilesRepository } from '@/domain/repositories/artisan-profiles.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';
import { AttachmentsRepository } from '@/domain/repositories/attachments.repository';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ArtisanApplicationsRepository } from '@/domain/repositories/artisan-applications.repository';
import { ReportRepository } from '@/domain/repositories/report.repository';

export interface DeleteAccountInput {
  userId: string;
}

export interface DeleteAccountOutput {
  message: string;
  deletedResources: {
    products: number;
    attachments: number;
    sessions: number;
    artisanProfile: boolean;
    userProfile: boolean;
  };
}

type Output = Either<UserNotFoundError, DeleteAccountOutput>;

@Injectable()
export class DeleteAccountUseCase {
  private readonly logger = new Logger(DeleteAccountUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository,
    private readonly artisanProfilesRepository: ArtisanProfilesRepository,
    private readonly artisanApplicationsRepository: ArtisanApplicationsRepository,
    private readonly reportsRepository: ReportRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async execute({ userId }: DeleteAccountInput): Promise<Output> {
    this.logger.log('Starting account deletion', { userId });

    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        this.logger.warn('User not found for deletion', { userId });
        return left(new UserNotFoundError(userId, 'id'));
      }

      // 1. Deletar produtos e seus relacionamentos
      const deletedProducts = await this.deleteUserProducts(userId);

      // 2. Deletar anexos do usuário
      const deletedAttachments = await this.deleteUserAttachments(userId);

      // 3. Deletar avatar do S3
      if (user.avatar) {
        await this.deleteFromS3(user.avatar);
      }

      // 4. Deletar relacionamentos de seguidor
      await this.deleteFollowerRelationships(userId);

      // 5. Deletar interações do usuário (likes, ratings, reports)
      await this.deleteUserInteractions(userId);

      // 6. Deletar sessões
      const deletedSessions = await this.deleteUserSessions(userId);

      // 7. Deletar perfil de artesão (se existir)
      const deletedArtisanProfile = await this.deleteArtisanProfile(userId);

      // 8. Deletar perfil de usuário
      const deletedUserProfile = await this.deleteUserProfile(userId);

      // 9. IMPORTANTE: Deletar aplicações de artesão ANTES de deletar o usuário
      await this.deleteArtisanApplications(userId);

      // 10. Por último, deletar o usuário
      await this.usersRepository.delete(userId);

      this.logger.log('Account deleted successfully', {
        userId,
        deletedProducts,
        deletedAttachments,
      });

      return right({
        message: 'Account deleted successfully',
        deletedResources: {
          products: deletedProducts,
          attachments: deletedAttachments,
          sessions: deletedSessions,
          artisanProfile: deletedArtisanProfile,
          userProfile: deletedUserProfile,
        },
      });
    } catch (error) {
      this.logger.error('Error deleting account', error.stack);
      throw error;
    }
  }

  private async deleteUserProducts(userId: string): Promise<number> {
    this.logger.log('Deleting user products', { userId });

    const products = await this.productsRepository.findByArtisanId(userId);

    if (products.length === 0) {
      return 0;
    }

    await Promise.all(
      products.map(async (product) => {
        const productAttachments = await this.attachmentsRepository.findByEntityId(product.id);

        await Promise.all(
          productAttachments.map((attachment) => Promise.all([
            this.deleteFromS3(attachment.id),
            this.attachmentsRepository.delete(attachment.id),
          ])),
        );

        if (product.coverImageId) {
          await this.deleteFromS3(product.coverImageId);
        }

        await this.productsRepository.deleteProductLikes(product.id);

        await this.productsRepository.deleteProductRatings(product.id);

        await this.productsRepository.delete(product.id);
      }),
    );

    return products.length;
  }

  private async deleteArtisanApplications(userId: string): Promise<void> {
    this.logger.log('Deleting artisan applications', { userId });

    // Buscar todas as aplicações do usuário
    const applications = await this.prisma.artisanApplication.findMany({
      where: { userId },
      select: { id: true },
    });

    // Deletar anexos de cada aplicação
    await Promise.all(
      applications.map(async (app) => {
        const attachments = await this.attachmentsRepository.findByEntityId(app.id);
        await Promise.all(
          attachments.map((attachment) => Promise.all([
            this.deleteFromS3(attachment.id),
            this.attachmentsRepository.delete(attachment.id),
          ])),
        );
      }),
    );

    // Deletar as aplicações
    await this.artisanApplicationsRepository.deleteByUserId(userId);
  }

  private async deleteUserAttachments(userId: string): Promise<number> {
    this.logger.log('Deleting user attachments', { userId });

    const attachments = await this.attachmentsRepository.findByUserId(userId);

    await Promise.all(
      attachments.map((attachment) => Promise.all([
        this.deleteFromS3(attachment.id),
        this.attachmentsRepository.delete(attachment.id),
      ])),
    );

    return attachments.length;
  }

  private async deleteArtisanProfile(userId: string): Promise<boolean> {
    this.logger.log('Deleting artisan profile', { userId });

    const artisanProfile = await this.artisanProfilesRepository.findByUserId(userId);

    if (!artisanProfile) {
      return false;
    }

    await this.artisanApplicationsRepository.deleteByUserId(userId);

    await this.artisanProfilesRepository.deleteAddress(artisanProfile.id);

    await this.artisanProfilesRepository.delete(userId);

    return true;
  }

  private async deleteUserProfile(userId: string): Promise<boolean> {
    this.logger.log('Deleting user profile', { userId });

    try {
      await this.usersRepository.deleteProfile(userId);
      return true;
    } catch {
      this.logger.warn('No user profile found to delete', { userId });
      return false;
    }
  }

  private async deleteUserSessions(userId: string): Promise<number> {
    this.logger.log('Deleting user sessions', { userId });

    const deletedCount = await this.prisma.session.deleteMany({
      where: { userId },
    });

    return deletedCount.count;
  }

  private async deleteFollowerRelationships(userId: string): Promise<void> {
    this.logger.log('Deleting follower relationships', { userId });

    await this.artisanProfilesRepository.deleteFollowerRelationships(userId);

    await this.artisanProfilesRepository.deleteFollowingRelationships(userId);
  }

  private async deleteUserInteractions(userId: string): Promise<void> {
    this.logger.log('Deleting user interactions', { userId });

    await this.productsRepository.deleteUserLikes(userId);

    await this.productsRepository.deleteUserRatings(userId);

    await this.reportsRepository.deleteAllUserReports(userId);
  }

  private async deleteFromS3(key: string): Promise<void> {
    try {
      this.logger.log('Deleting from S3', { key });
      await this.s3StorageService.delete(key);
    } catch (error) {
      this.logger.error('Error deleting from S3', { key, error: error.message });
    }
  }
}
