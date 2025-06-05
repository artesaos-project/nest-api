import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ArtisanProfile } from '@/domain/identity/core/entities/artisan-profile.entity';
import { PrismaArtisanProfileMapper } from '../mappers/prisma-artisan-profile.mapper';

@Injectable()
export class PrismaArtisanProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<ArtisanProfile | null> {
    const artisanProfile = await this.prisma.artisanProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!artisanProfile) {
      return null;
    }

    return PrismaArtisanProfileMapper.toDomain(artisanProfile);
  }

  async listAll(): Promise<ArtisanProfile[]> {
    const artisanProfiles = await this.prisma.artisanProfile.findMany();
    return artisanProfiles.map(PrismaArtisanProfileMapper.toDomain);
  }

  async save(artisanProfile: ArtisanProfile): Promise<void> {
    await this.prisma.artisanProfile.upsert({
      where: {
        id: artisanProfile.id,
      },
      create: PrismaArtisanProfileMapper.toPrisma(artisanProfile),
      update: {
        userId: artisanProfile.userId,
        userName: artisanProfile.userName,
        rawMaterial: artisanProfile.rawMaterial,
        technique: artisanProfile.technique,
        finalityClassification: artisanProfile.finalityClassification,
        sicab: artisanProfile.sicab,
        sicabRegistrationDate: artisanProfile.sicabRegistrationDate,
        sicabValidUntil: artisanProfile.sicabValidUntil,
        isDisabled: artisanProfile.isDisabled,
        updatedAt: artisanProfile.updatedAt,
      },
    });
  }
}
