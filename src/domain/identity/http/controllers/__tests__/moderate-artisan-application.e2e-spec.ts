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
import { ModerateArtisanApplicationUseCase } from '@/domain/identity/core/use-cases/moderate-artisan-application.use-case';
import { UserRole } from '@/domain/identity/core/entities/user.entity';
import { ArtisanApplicationStatus } from '@/domain/identity/core/entities/artisan-application.entity';
import { ArtisanFactory } from './factories/make-artisan';

describe('moderate artisan application (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let artisanApplicationFactory: ArtisanApplicationFactory;
  let artisanProfileFactory: ArtisanFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [ArtisanFactory, UserFactory, ArtisanApplicationFactory, PrismaService],
    }).compile();

    app = moduleRef.createNestApplication();

    artisanProfileFactory = moduleRef.get(ArtisanFactory);
    userFactory = moduleRef.get(UserFactory);
    artisanApplicationFactory = moduleRef.get(ArtisanApplicationFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[POST] /artisan-applications/:id/moderate - approved', async () => {
    const user = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const artisanApplication = await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/artisan-applications/${artisanApplication.id}/moderate`)
      .send({
        status: 'APPROVED',
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: 'Artisan application moderated successfully',
    });
  });

  test('[POST] /artisan-applications/:id/moderate - same userName', async () => {
    const user1 = await userFactory.makePrismaUser({ name: 'John Doe', roles: [UserRole.MODERATOR] });
    const user2 = await userFactory.makePrismaUser({ name: 'John Doe', roles: [UserRole.MODERATOR] });

    await artisanProfileFactory.makePrismaArtisan({
      userId: user1.id,
      userName: 'john-doe',
    });

    const accessToken = jwt.sign({ sub: user2.id, roles: user2.roles });

    const artisanApplication = await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user2.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/artisan-applications/${artisanApplication.id}/moderate`)
      .send({
        status: 'APPROVED',
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: 'Artisan application moderated successfully',
    });
  });

  test('[POST] /artisan-applications/:id/moderate - rejected', async () => {
    const user = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const artisanApplication = await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/artisan-applications/${artisanApplication.id}/moderate`)
      .send({
        status: 'REJECTED',
        rejectionReason: 'Insufficient documentation',
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: 'Artisan application moderated successfully',
    });
  });

  test('[POST] /artisan-applications/:id/moderate - update', async () => {
    const user = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const artisanApplication1 = await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user.id,
    });

    await request(app.getHttpServer())
      .post(`/artisan-applications/${artisanApplication1.id}/moderate`)
      .send({
        status: 'APPROVED',
      })
      .set('Authorization', `Bearer ${accessToken}`);

    const artisanApplication2 = await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/artisan-applications/${artisanApplication2.id}/moderate`)
      .send({
        status: 'APPROVED',
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: 'Artisan application moderated successfully',
    });
  });

  test('[POST] /artisan-applications/:id/moderate - NotFoundException (ArtisanApplicationNotFoundError)', async () => {
    const user = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const invalidApplicationId = randomUUID();

    const response = await request(app.getHttpServer())
      .post(`/artisan-applications/${invalidApplicationId}/moderate`)
      .send({
        status: 'APPROVED',
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      message: `Artisan application with ID "${invalidApplicationId}" not found.`,
      error: 'Not Found',
      statusCode: 404,
    });
  });

  test('[POST] /artisan-applications/:id/moderate - ConflictException (ArtisanApplicationAlreadyModeratedError)', async () => {
    const user = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const artisanApplication = await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user.id,
      status: ArtisanApplicationStatus.APPROVED,
    });

    const response = await request(app.getHttpServer())
      .post(`/artisan-applications/${artisanApplication.id}/moderate`)
      .send({
        status: 'APPROVED',
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(409);
    expect(response.body).toEqual({
      message: `Artisan application with ID "${artisanApplication.id}" has already been moderated.`,
      error: 'Conflict',
      statusCode: 409,
    });
  });

  test('[POST] /artisan-applications/:id/moderate - BadRequestException (PropertyMissingError)', async () => {
    const user = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const artisanApplication = await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/artisan-applications/${artisanApplication.id}/moderate`)
      .send({
        status: 'REJECTED',
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: 'Property "rejectionReason" is missing.',
      error: 'Bad Request',
      statusCode: 400,
    });
  });
});

describe('moderate artisan application (E2E) ERROR', () => {
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
      .overrideProvider(ModerateArtisanApplicationUseCase)
      .useValue(mockUseCase)
      .compile();

    app = moduleRef.createNestApplication();

    userFactory = moduleRef.get(UserFactory);
    artisanApplicationFactory = moduleRef.get(ArtisanApplicationFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[POST] /artisan-applications/:id/moderate', async () => {
    const user = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const artisanApplication = await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/artisan-applications/${artisanApplication.id}/moderate`)
      .send({
        status: 'APPROVED',
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});
