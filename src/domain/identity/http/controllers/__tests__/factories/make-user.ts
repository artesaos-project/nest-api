import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User, UserProps, UserRole } from '@/domain/identity/core/entities/user.entity';
import { PrismaUsersMapper } from '@/domain/identity/persistence/prisma/mappers/prisma-users.mapper';
import { PrismaService } from '@/shared/prisma/prisma.service';

export function makeUser(
  override: Partial<UserProps> = {},
) {
  const user = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toString(),
      socialName: faker.person.fullName(),
      cpf: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
      password: faker.internet.password(),
      roles: [UserRole.USER],
      ...override,
    },
    randomUUID(),
  );

  return user;
}

@Injectable()
export class UserFactory {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data);

    await this.prisma.user.create({
      data: PrismaUsersMapper.toPrisma(user),
    });

    return user;
  }
}
