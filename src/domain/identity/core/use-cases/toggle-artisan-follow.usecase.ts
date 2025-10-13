import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ArtisanFollowersRepository } from '@/domain/repositories/artisan-followers.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class ToggleArtisanFollowUseCase {
  constructor(
        private readonly artisanFollowersRepository: ArtisanFollowersRepository,
        private readonly prisma: PrismaService,
  ) {}

  async execute(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: followingId },
      include: { ArtisanProfile: true },
    });

    if (!target?.ArtisanProfile) {
      throw new ForbiddenException('You can only follow artisans');
    }

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await this.artisanFollowersRepository.findByUserIds(
        followerId,
        followingId,
        tx,
      );

      if (existing) {
        await this.artisanFollowersRepository.delete(followerId, followingId, tx);
        const updated = await tx.artisanProfile.update({
          where: { userId: followingId },
          data: { followersCount: { decrement: 1 } },
          select: { followersCount: true },
        });

        return { action: 'unfollowed', followersCount: updated.followersCount };
      }
      await this.artisanFollowersRepository.create(followerId, followingId, tx);
      const updated = await tx.artisanProfile.update({
        where: { userId: followingId },
        data: { followersCount: { increment: 1 } },
        select: { followersCount: true },
      });

      return { action: 'followed', followersCount: updated.followersCount };
    });

    return result;
  }
}
