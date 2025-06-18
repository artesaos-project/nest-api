import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ArtisanProfile, ArtisanProfileProps } from '@/domain/identity/core/entities/artisan-profile.entity';
import { PrismaArtisanProfileMapper } from '@/domain/identity/persistence/prisma/mappers/prisma-artisan-profile.mapper';

export function makeArtisan(
  override: Partial<ArtisanProfileProps> = {},
) {
  const artisan = ArtisanProfile.create(
    {
      userId: randomUUID(),
      rawMaterial: faker.commerce.productMaterial(),
      technique: faker.commerce.productAdjective(),
      finalityClassification: faker.commerce.product(),
      sicab: faker.string.alphanumeric(10),
      sicabRegistrationDate: faker.date.past(),
      sicabValidUntil: faker.date.future(),
      userName: faker.person.fullName(),
      ...override,
    },
    randomUUID(),
  );

  return artisan;
}

@Injectable()
export class ArtisanFactory {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async makePrismaArtisan(data: Partial<ArtisanProfile> = {}): Promise<ArtisanProfile> {
    const artisan = makeArtisan(data);

    await this.prisma.artisanProfile.create({
      data: PrismaArtisanProfileMapper.toPrisma(artisan),
    });

    return artisan;
  }
}
