import { Prisma, ArtisanProfile as PrismaArtisanProfile } from '@prisma/client';
import { ArtisanProfile } from '@/domain/identity/core/entities/artisan-profile.entity';

export class PrismaArtisanProfileMapper {
  static toDomain(artisanProfile: PrismaArtisanProfile): ArtisanProfile {
    return ArtisanProfile.create({
      userId: artisanProfile.userId,
      userName: artisanProfile.userName,
      rawMaterial: artisanProfile.rawMaterial,
      technique: artisanProfile.technique,
      finalityClassification: artisanProfile.finalityClassification,
      sicab: artisanProfile.sicab,
      sicabRegistrationDate: artisanProfile.sicabRegistrationDate,
      sicabValidUntil: artisanProfile.sicabValidUntil,
    }, artisanProfile.id, artisanProfile.createdAt, artisanProfile.updatedAt);
  }

  static toPrisma(
    artisanProfile: ArtisanProfile,
  ): Prisma.ArtisanProfileUncheckedCreateInput {
    return {
      id: artisanProfile.id,
      userName: artisanProfile.userName,
      userId: artisanProfile.userId,
      rawMaterial: artisanProfile.rawMaterial,
      technique: artisanProfile.technique,
      finalityClassification: artisanProfile.finalityClassification,
      sicab: artisanProfile.sicab,
      sicabRegistrationDate: artisanProfile.sicabRegistrationDate,
      sicabValidUntil: artisanProfile.sicabValidUntil,
      isDisabled: artisanProfile.isDisabled,
      createdAt: artisanProfile.createdAt,
      updatedAt: artisanProfile.updatedAt,
    };
  }
}
