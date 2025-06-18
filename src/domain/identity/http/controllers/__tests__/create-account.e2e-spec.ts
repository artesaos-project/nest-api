import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { makeUser, UserFactory } from './factories/make-user';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateAccountUseCase } from '@/domain/identity/core/use-cases/create-account.use-case';
import { left } from '@/domain/_shared/utils/either';

describe('create account (E2E)', () => {
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

  test('[POST] /users', async () => {
    const user = makeUser();

    const response = await request(app.getHttpServer()).post('/users').send({
      name: user.name,
      cpf: user.cpf,
      birthDate: user.birthDate,
      phone: user.phone,
      email: user.email,
      password: user.password,
    });

    expect(response.statusCode).toBe(201);
  });

  test('[POST] /users - ConflictException (e-mail)', async () => {
    const user = await factory.makePrismaUser();

    await request(app.getHttpServer()).post('/users').send({
      name: user.name,
      cpf: user.cpf,
      birthDate: user.birthDate,
      phone: user.phone,
      email: user.email,
      password: user.password,
    });

    const response = await request(app.getHttpServer()).post('/users').send({
      name: user.name,
      cpf: '12345678901',
      birthDate: user.birthDate,
      phone: user.phone,
      email: user.email,
      password: user.password,
    });

    expect(response.statusCode).toBe(409);
  });

  test('[POST] /users - ConflictException (cpf)', async () => {
    const user = await factory.makePrismaUser();

    await request(app.getHttpServer()).post('/users').send({
      name: user.name,
      cpf: user.cpf,
      birthDate: user.birthDate,
      phone: user.phone,
      email: user.email,
      password: user.password,
    });

    const response = await request(app.getHttpServer()).post('/users').send({
      name: user.name,
      cpf: user.cpf,
      birthDate: user.birthDate,
      phone: user.phone,
      email: 'another-email@example.com',
      password: user.password,
    });

    expect(response.statusCode).toBe(409);
  });
});

describe('create user (E2E) ERROR', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockUseCase = {
      execute: vi.fn().mockResolvedValue(left(new BadRequestException())),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CreateAccountUseCase)
      .useValue(mockUseCase)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test('[POST] /users - BadRequest', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'John Doe',
      cpf: 'invalid-cpf',
      password: 'Test@123',
      email: 'invalid-email',
      phone: 'invalid-phone',
      birthDate: 'invalid-date',
    });

    expect(response.statusCode).toBe(400);
  });
});
