import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '@/app.module';
import { UserFactory } from './factories/make-user';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { UserRole } from '@/domain/identity/core/entities/user.entity';
import { left } from '@/domain/_shared/utils/either';
import { GetAllUsersUseCase } from '@/domain/identity/core/use-cases/get-all-users.use-case';

describe('get all users (E2E)', () => {
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

  test('[GET] /users', async () => {
    await factory.makePrismaUser();
    const adminUser = await factory.makePrismaUser({ roles: [UserRole.ADMIN] });

    const accessToken = jwt.sign({ sub: adminUser.id, roles: adminUser.roles });

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('users');
  });
});

describe('get all users (E2E) ERROR', () => {
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
      .overrideProvider(GetAllUsersUseCase)
      .useValue(mockUseCase)
      .compile();

    app = moduleRef.createNestApplication();

    factory = moduleRef.get(UserFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[GET] /users', async () => {
    await factory.makePrismaUser();
    const adminUser = await factory.makePrismaUser({ roles: [UserRole.ADMIN] });

    const accessToken = jwt.sign({ sub: adminUser.id, roles: adminUser.roles });

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});
