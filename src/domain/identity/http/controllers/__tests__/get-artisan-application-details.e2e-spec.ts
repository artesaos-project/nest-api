import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { AppModule } from '@/app.module';
import { UserFactory } from './factories/make-user';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { left } from '@/domain/_shared/utils/either';
import { ArtisanApplicationFactory } from './factories/make-artisan-application';
import { UserRole } from '@/domain/identity/core/entities/user.entity';
import { GetArtisanApplicationDetailsUseCase } from '@/domain/identity/core/use-cases/get-artisan-application-details.use-case';

describe('get artisan application details (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let artisanApplicationFactory: ArtisanApplicationFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [ArtisanApplicationFactory, UserFactory, PrismaService],
    }).compile();

    app = moduleRef.createNestApplication();

    artisanApplicationFactory = moduleRef.get(ArtisanApplicationFactory);
    userFactory = moduleRef.get(UserFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[GET] /artisan-applications/:id - NotFoundException (ArtisanApplicationNotFoundError)', async () => {
    const user1 = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });

    const accessToken = jwt.sign({ sub: user1.id, roles: user1.roles });

    const invalidArtisanApplicationId = randomUUID();

    const response = await request(app.getHttpServer())
      .get(`/artisan-applications/${invalidArtisanApplicationId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      message: `Artisan application with ID "${invalidArtisanApplicationId}" not found.`,
      error: 'Not Found',
      statusCode: 404,
    });
  });

  test('[GET] /artisan-applications/:id', async () => {
    const user1 = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });
    const user2 = await userFactory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user1.id, roles: user1.roles });

    const artisanApplication = await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user2.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/artisan-applications/${artisanApplication.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      artisanApplication:
        {
          userId: user2.id,
          userName: user2.name,
          userEmail: user2.email,
          userPhone: user2.phone,
          rawMaterial: artisanApplication.rawMaterial,
          technique: artisanApplication.technique,
          finalityClassification: artisanApplication.finalityClassification,
          sicab: artisanApplication.sicab,
          sicabRegistrationDate: artisanApplication.sicabRegistrationDate.toISOString(),
          sicabValidUntil: artisanApplication.sicabValidUntil.toISOString(),
          status: artisanApplication.status,
        },
    });
  });
});

describe('get artisan application details (E2E) ERROR', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let artisanApplicationFactory: ArtisanApplicationFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const mockUseCase = {
      execute: vi.fn().mockResolvedValue(left(new BadRequestException())),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory, ArtisanApplicationFactory, PrismaService],
    })
      .overrideProvider(GetArtisanApplicationDetailsUseCase)
      .useValue(mockUseCase)
      .compile();

    app = moduleRef.createNestApplication();

    userFactory = moduleRef.get(UserFactory);
    artisanApplicationFactory = moduleRef.get(ArtisanApplicationFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[GET] /artisan-applications/:id', async () => {
    const user1 = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });
    const user2 = await userFactory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user1.id, roles: user1.roles });

    const artisanApplication = await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user2.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/artisan-applications/${artisanApplication.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});
