import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '@/app.module';
import { UserFactory } from './factories/make-user';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { left } from '@/domain/_shared/utils/either';
import { UserRole } from '@/domain/identity/core/entities/user.entity';
import { AddModeratorRoleUseCase } from '@/domain/identity/core/use-cases/add-moderator-role.use-case';

describe('add moderator role (E2E)', () => {
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

  test('[PATCH] /users/:id/add-moderator-role', async () => {
    const user = await factory.makePrismaUser();

    const adminUser = await factory.makePrismaUser({ roles: [UserRole.ADMIN] });

    const accessToken = jwt.sign({ sub: adminUser.id, roles: adminUser.roles });

    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id}/add-moderator-role`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      userId: user.id,
      roles: [UserRole.USER, UserRole.MODERATOR],
    });
  });

  test('[PATCH] /users/:id/add-moderator-role - BadRequestException (PropertyAlreadyExistsError)', async () => {
    const user = await factory.makePrismaUser({ roles: [UserRole.MODERATOR] });

    const adminUser = await factory.makePrismaUser({ roles: [UserRole.ADMIN] });

    const accessToken = jwt.sign({ sub: adminUser.id, roles: adminUser.roles });

    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id}/add-moderator-role`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});

describe('add moderator role (E2E) ERROR', () => {
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
      .overrideProvider(AddModeratorRoleUseCase)
      .useValue(mockUseCase)
      .compile();

    app = moduleRef.createNestApplication();

    factory = moduleRef.get(UserFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[PATCH] /users/:id/add-moderator-role', async () => {
    const user = await factory.makePrismaUser();

    const adminUser = await factory.makePrismaUser({ roles: [UserRole.ADMIN] });

    const accessToken = jwt.sign({ sub: adminUser.id, roles: adminUser.roles });

    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id}/add-moderator-role`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});
