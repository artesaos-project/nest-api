import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '@/app.module';
import { UserFactory } from './factories/make-user';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { left } from '@/domain/_shared/utils/either';
import { makeArtisan } from './factories/make-artisan';
import { CreateArtisanApplicationUseCase } from '@/domain/identity/core/use-cases/create-artisan-application.use-case';

describe('create artisan application (E2E)', () => {
  let app: INestApplication;
  let factory: UserFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory, PrismaService],
    }).compile();

    app = moduleRef.createNestApplication();

    factory = moduleRef.get(UserFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[POST] /artisan-applications', async () => {
    const user = await factory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const artisanApplication = makeArtisan();

    const response = await request(app.getHttpServer())
      .post('/artisan-applications')
      .send({
        rawMaterial: artisanApplication.rawMaterial,
        technique: artisanApplication.technique,
        finalityClassification: artisanApplication.finalityClassification,
        sicab: artisanApplication.sicab,
        sicabRegistrationDate: artisanApplication.sicabRegistrationDate,
        sicabValidUntil: artisanApplication.sicabValidUntil,
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: 'Application submitted successfully',
    });
  });

  test('[POST] /artisan-applications - ConflictException (ArtisanApplicationPendingAlreadyExists)', async () => {
    const user = await factory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const artisanApplication = makeArtisan();

    await request(app.getHttpServer())
      .post('/artisan-applications')
      .send({
        rawMaterial: artisanApplication.rawMaterial,
        technique: artisanApplication.technique,
        finalityClassification: artisanApplication.finalityClassification,
        sicab: artisanApplication.sicab,
        sicabRegistrationDate: artisanApplication.sicabRegistrationDate,
        sicabValidUntil: artisanApplication.sicabValidUntil,
      })
      .set('Authorization', `Bearer ${accessToken}`);

    const response = await request(app.getHttpServer())
      .post('/artisan-applications')
      .send({
        rawMaterial: artisanApplication.rawMaterial,
        technique: artisanApplication.technique,
        finalityClassification: artisanApplication.finalityClassification,
        sicab: artisanApplication.sicab,
        sicabRegistrationDate: artisanApplication.sicabRegistrationDate,
        sicabValidUntil: artisanApplication.sicabValidUntil,
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(409);
    expect(response.body).toEqual({
      error: 'Conflict',
      message: 'A pending artisan application already exists for this user.',
      statusCode: 409,
    });
  });
});

describe('create artisan application (E2E) ERROR', () => {
  let app: INestApplication;
  let factory: UserFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const mockUseCase = {
      execute: vi.fn().mockResolvedValue(left(new BadRequestException())),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory, PrismaService],
    })
      .overrideProvider(CreateArtisanApplicationUseCase)
      .useValue(mockUseCase)
      .compile();

    app = moduleRef.createNestApplication();

    factory = moduleRef.get(UserFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[POST] /artisan-applications - BadRequest', async () => {
    const user = await factory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const artisanApplication = makeArtisan();

    const response = await request(app.getHttpServer())
      .post('/artisan-applications')
      .send({
        rawMaterial: artisanApplication.rawMaterial,
        technique: artisanApplication.technique,
        finalityClassification: artisanApplication.finalityClassification,
        sicab: artisanApplication.sicab,
        sicabRegistrationDate: artisanApplication.sicabRegistrationDate,
        sicabValidUntil: artisanApplication.sicabValidUntil,
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});
