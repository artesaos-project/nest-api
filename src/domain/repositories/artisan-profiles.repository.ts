import { Injectable } from '@nestjs/common';
import { ArtisanProfile, ArtisanProfileAddress } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface ArtisanProfileData {
  userId: string;
  artisanUserName: string;
  comercialName?: string;
  rawMaterial: string[];
  technique: string[];
  finalityClassification: string[];
  sicab: string;
  sicabRegistrationDate: Date;
  sicabValidUntil: Date;
  bio?: string;
  followersCount?: number;
  productsCount?: number;
  isDisabled?: boolean;
  // Dados de endereço separados
  address?: {
    zipCode: string;
    address: string;
    addressNumber: string;
    addressComplement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export interface UpdateArtisanProfileData {
  rawMaterial?: string[];
  technique?: string[];
  finalityClassification?: string[];
  sicab?: string;
  sicabRegistrationDate?: Date;
  sicabValidUntil?: Date;
  bio?: string;
  isDisabled?: boolean;
}

// Tipo para o retorno com endereço
export type ArtisanProfileWithAddress = ArtisanProfile & {
  ArtisanProfileAddress: ArtisanProfileAddress | null;
  user: {
    id: string;
    name: string;
    email: string;
    isDisabled: boolean;
  };
};

export interface FindNewWithProductsParams {
  startDate: Date;
  minProducts: number;
  limit: number;
}

@Injectable()
export class ArtisanProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ArtisanProfileData): Promise<ArtisanProfile> {
  const {
    userId,
    artisanUserName,
    comercialName,
    rawMaterial,
    technique,
    finalityClassification,
    sicab,
    sicabRegistrationDate,
    sicabValidUntil,
    bio,
    followersCount = 0,
    productsCount = 0,
    isDisabled = false,
    address,
  } = data;

  return this.prisma.artisanProfile.create({
    data: {
      artisanUserName,
      comercialName: comercialName || '',
      rawMaterial,
      technique,
      finalityClassification,
      sicab,
      sicabRegistrationDate,
      sicabValidUntil,
      bio,
      followersCount,
      productsCount,
      isDisabled,
      user: {
        connect: { id: userId },
      },
      ...(address && {
        ArtisanProfileAddress: {
          create: {
            zipCode: address.zipCode,
            address: address.address,
            addressNumber: address.addressNumber,
            addressComplement: address.addressComplement || null,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
          },
        },
      }),
    },
    include: {
      ArtisanProfileAddress: true,
    },
  });
}

  async findById(id: string): Promise<ArtisanProfile | null> {
    return this.prisma.artisanProfile.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<ArtisanProfileWithAddress | null> {
    return this.prisma.artisanProfile.findUnique({
      where: { userId },
      include: {
        ArtisanProfileAddress: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isDisabled: true,
          },
        },
      },
    });
  }

  async findManyByUserIds(userIds: string[]): Promise<ArtisanProfile[]> {
    if (userIds.length === 0) return [];

    return this.prisma.artisanProfile.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
    });
  }

  async findByUserName(userName: string): Promise<ArtisanProfile | null> {
    return this.prisma.artisanProfile.findUnique({
      where: { artisanUserName: userName },
    });
  }

  async update(id: string, data: UpdateArtisanProfileData): Promise<ArtisanProfile> {
    return this.prisma.artisanProfile.update({
      where: { id },
      data,
    });
  }

  async updateAddress(
    artisanId: string,
    addressData: {
      zipCode: string;
      address: string;
      addressNumber: string;
      addressComplement?: string;
      neighborhood: string;
      city: string;
      state: string;
    },
  ): Promise<ArtisanProfileAddress> {
    // Verificar se já existe endereço
    const existingAddress = await this.prisma.artisanProfileAddress.findUnique({
      where: { artisanId },
    });

    if (existingAddress) {
      // Atualizar endereço existente
      return this.prisma.artisanProfileAddress.update({
        where: { artisanId },
        data: addressData,
      });
    }

    // Criar novo endereço
    return this.prisma.artisanProfileAddress.create({
      data: {
        artisanId,
        ...addressData,
      },
    });
  }

  async findNewWithProducts({
    startDate,
    minProducts,
    limit,
  }: FindNewWithProductsParams): Promise<ArtisanProfile[]> {
    return this.prisma.artisanProfile.findMany({
      where: {
        createdAt: { gte: startDate },
        productsCount: { gte: minProducts },
        isDisabled: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.artisanProfile.delete({
      where: { userId },
    });
  }

  async deleteAddress(artisanId: string): Promise<void> {
    await this.prisma.artisanProfileAddress.deleteMany({
      where: { artisanId },
    });
  }

  async deleteFollowerRelationships(userId: string): Promise<void> {
    await this.prisma.artisanFollower.deleteMany({
      where: { followerId: userId },
    });
  }

  async deleteFollowingRelationships(userId: string): Promise<void> {
    await this.prisma.artisanFollower.deleteMany({
      where: { followingId: userId },
    });
  }
}
