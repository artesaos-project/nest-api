import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '@/app.module';
import { makeUser, UserFactory } from './factories/make-user';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { left } from '@/domain/_shared/utils/either';
import { UpdatePersonalProfileDataUseCase } from '@/domain/identity/core/use-cases/update-personal-profile-data.use-case';

describe('update personal profile data (E2E)', () => {
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

  test('[PUT] /users/me/profile', async () => {
    const user = await factory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const newUser = makeUser();

    const response = await request(app.getHttpServer())
      .put('/users/me/profile')
      .send({
        newName: user.name,
        newSocialName: newUser.socialName,
        newPhone: newUser.phone,
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
  });
});

describe('update personal profile data (E2E) ERROR', () => {
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
      .overrideProvider(UpdatePersonalProfileDataUseCase)
      .useValue(mockUseCase)
      .compile();

    app = moduleRef.createNestApplication();

    factory = moduleRef.get(UserFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[PUT] /users/me/profile - BadRequest', async () => {
    const user = await factory.makePrismaUser();

    const accessToken = jwt.sign({ sub: user.id, roles: user.roles });

    const newUser = makeUser();

    const response = await request(app.getHttpServer())
      .put('/users/me/profile')
      .send({
        newName: user.name,
        newSocialName: newUser.socialName,
        newPhone: newUser.phone,
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});
