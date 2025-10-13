import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class ArtisanFollowersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    followerId: string,
    followingId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return client.artisanFollower.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async delete(
    followerId: string,
    followingId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return client.artisanFollower.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });
  }

  async findByUserIds(
    followerId: string,
    followingId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.artisanFollower.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async findFollowersByArtisanId(
    followingId: string,
    page?: number,
    limit?: number,
  ) {
    const currentPage = page ?? 1;
    const currentLimit = limit ?? 10;

    return this.prisma.artisanFollower.findMany({
      where: { followingId },
      skip: (currentPage - 1) * currentLimit,
      take: currentLimit,
    });
  }

  async findFollowingByUserId(
    followerId: string,
    page?: number,
    limit?: number,
  ) {
    const currentPage = page ?? 1;
    const currentLimit = limit ?? 10;

    return this.prisma.artisanFollower.findMany({
      where: { followerId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            avatar: true,
            ArtisanProfile: {
              select: {
                artisanUserName: true,
                bio: true,
                followersCount: true,
                productsCount: true,
              },
            },
          },
        },
      },
      skip: (currentPage - 1) * currentLimit,
      take: currentLimit,
    });
  }

  async countFollowers(
    followingId: string,
    tx? : Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.artisanFollower.count({
      where: { followingId },
    });
  }

  async countFollowing(
    followerId: string,
    tx? : Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.artisanFollower.count({
      where: { followerId },
    });
  }
}
