import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '@/app.module';
import { UserFactory } from './factories/make-user';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { left } from '@/domain/_shared/utils/either';
import { ArtisanApplicationFactory } from './factories/make-artisan-application';
import { UserRole } from '@/domain/identity/core/entities/user.entity';
import { GetAllArtisanApplicationsWithUserNamesUseCase } from '@/domain/identity/core/use-cases/get-all-artisan-applications-with-user-names.use-case';

describe('get all artisan applications (E2E)', () => {
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

  test('[GET] /artisan-applications/ - NotFoundException (NoArtisanApplicationsFoundError)', async () => {
    const user1 = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });

    const accessToken = jwt.sign({ sub: user1.id, roles: user1.roles });

    const response = await request(app.getHttpServer())
      .get('/artisan-applications/')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      message: 'No artisan applications found.',
      error: 'Not Found',
      statusCode: 404,
    });
  });

  test('[GET] /artisan-applications/', async () => {
    const user1 = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });
    const user2 = await userFactory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user1.id, roles: user1.roles });

    const artisanApplication = await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user2.id,
    });

    const response = await request(app.getHttpServer())
      .get('/artisan-applications/')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      artisanApplications: [
        {
          id: artisanApplication.id,
          artisanName: user2.name,
          email: user2.email,
          rawMaterial: artisanApplication.rawMaterial,
          technique: artisanApplication.technique,
          sicab: artisanApplication.sicab,
          status: artisanApplication.status,
        },
      ],
    });
  });
});

describe('get all artisan applications (E2E) ERROR', () => {
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
      .overrideProvider(GetAllArtisanApplicationsWithUserNamesUseCase)
      .useValue(mockUseCase)
      .compile();

    app = moduleRef.createNestApplication();

    userFactory = moduleRef.get(UserFactory);
    artisanApplicationFactory = moduleRef.get(ArtisanApplicationFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[GET] /artisan-applications/', async () => {
    const user1 = await userFactory.makePrismaUser({ roles: [UserRole.MODERATOR] });
    const user2 = await userFactory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user1.id, roles: user1.roles });

    await artisanApplicationFactory.makePrismaArtisanApplication({
      userId: user2.id,
    });

    const response = await request(app.getHttpServer())
      .get('/artisan-applications/')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});
