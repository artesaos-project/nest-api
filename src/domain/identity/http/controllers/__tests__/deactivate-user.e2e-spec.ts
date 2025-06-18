import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { AppModule } from '@/app.module';
import { UserFactory } from './factories/make-user';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { UserRole } from '@/domain/identity/core/entities/user.entity';
import { left } from '@/domain/_shared/utils/either';
import { DeactivateUserUseCase } from '@/domain/identity/core/use-cases/deactivate-user.use-case';

describe('deactivate user (E2E) - admin', () => {
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

  test('[PATCH] /users/:id/deactivate', async () => {
    const user = await factory.makePrismaUser();
    const adminUser = await factory.makePrismaUser({ roles: [UserRole.ADMIN] });

    const accessToken = jwt.sign({ sub: adminUser.id, roles: adminUser.roles });

    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id}/deactivate`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('user', {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      roles: user.roles,
      isActive: false,
    });
  });

  test('[PATCH] /users/:id/deactivate - NotFoundException', async () => {
    const adminUser = await factory.makePrismaUser({ roles: [UserRole.ADMIN] });

    const accessToken = jwt.sign({ sub: adminUser.id, roles: adminUser.roles });

    const invalidUserId = randomUUID();

    const response = await request(app.getHttpServer())
      .patch(`/users/${invalidUserId}/deactivate`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });
});

describe('deactivate user (E2E) - own user', () => {
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

  test('[PATCH] /users/:id/deactivate', async () => {
    const user = await factory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id}/deactivate`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('user', {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      roles: user.roles,
      isActive: false,
    });
  });
});

describe('deactivate user (E2E) - another user', () => {
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

  test('[PATCH] /users/:id/deactivate', async () => {
    const user1 = await factory.makePrismaUser();
    const user2 = await factory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user1.id, roles: user1.roles });

    const response = await request(app.getHttpServer())
      .patch(`/users/${user2.id}/deactivate`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});

describe('deactivate user (E2E) ERROR', () => {
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
      .overrideProvider(DeactivateUserUseCase)
      .useValue(mockUseCase)
      .compile();

    app = moduleRef.createNestApplication();

    factory = moduleRef.get(UserFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[PATCH] /users/:id/deactivate - BadRequestException - admin', async () => {
    const adminUser = await factory.makePrismaUser({ roles: [UserRole.ADMIN] });

    const accessToken = jwt.sign({ sub: adminUser.id, roles: adminUser.roles });

    const invalidUserId = randomUUID();

    const response = await request(app.getHttpServer())
      .patch(`/users/${invalidUserId}/deactivate`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });

  test('[PATCH] /users/:id/deactivate - BadRequestException - own user', async () => {
    const user = await factory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id}/deactivate`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});
