import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { hash } from 'bcryptjs';
import { AppModule } from '@/app.module';
import { UserFactory } from './factories/make-user';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { left } from '@/domain/_shared/utils/either';
import { AuthenticateUseCase } from '@/domain/identity/core/use-cases/authenticate.use-case';

describe('authenticate (E2E)', () => {
  let app: INestApplication;
  let factory: UserFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory, PrismaService],
    }).compile();

    app = moduleRef.createNestApplication();

    factory = moduleRef.get(UserFactory);

    await app.init();
  });

  test('[POST] /sessions', async () => {
    const user = await factory.makePrismaUser({
      password: await hash('Test@123', 10),
    });

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: user.email,
      password: 'Test@123',
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('roles');
    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('name');
  });

  test('[POST] /sessions - UnauthorizedException (wrong e-mail)', async () => {
    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'wrong-email@example.com',
      password: 'Test@123',
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    });
  });

  test('[POST] /sessions - UnauthorizedException (wrong password)', async () => {
    const user = await factory.makePrismaUser({
      password: await hash('Test@123', 10),
    });

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: user.email,
      password: 'wrong-password',
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    });
  });

  test('[POST] /sessions - UnauthorizedException (inactive user)', async () => {
    const user = await factory.makePrismaUser({
      password: await hash('Test@123', 10),
      isActive: false,
    });

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: user.email,
      password: 'Test@123',
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    });
  });
});

describe('authenticate (E2E) ERROR', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockUseCase = {
      execute: vi.fn().mockResolvedValue(left(new BadRequestException())),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthenticateUseCase)
      .useValue(mockUseCase)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test('[POST] /sessions - BadRequest', async () => {
    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'invalid-email',
      password: 'Test@123',
    });

    expect(response.statusCode).toBe(400);
  });
});
