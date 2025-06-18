import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ArtisanApplication, ArtisanApplicationProps, ArtisanApplicationStatus } from '@/domain/identity/core/entities/artisan-application.entity';
import { PrismaArtisanApplicationsMapper } from '@/domain/identity/persistence/prisma/mappers/prisma-artisan-applications.mappers';

export function makeArtisanApplication(
  override: Partial<ArtisanApplicationProps> = {},
) {
  const artisanApplication = ArtisanApplication.create(
    {
      rawMaterial: faker.commerce.productMaterial(),
      technique: faker.commerce.productAdjective(),
      finalityClassification: faker.commerce.product(),
      sicab: faker.string.alphanumeric(10),
      sicabRegistrationDate: faker.date.past(),
      sicabValidUntil: faker.date.future(),
      status: ArtisanApplicationStatus.PENDING,
      userId: randomUUID(),
      ...override,
    },
    randomUUID(),
  );

  return artisanApplication;
}

@Injectable()
export class ArtisanApplicationFactory {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async makePrismaArtisanApplication(
    data: Partial<ArtisanApplicationProps> = {},
  ): Promise<ArtisanApplication> {
    const artisan = makeArtisanApplication(data);

    await this.prisma.artisanApplication.create({
      data: PrismaArtisanApplicationsMapper.toPrisma(artisan),
    });

    return artisan;
  }
}
