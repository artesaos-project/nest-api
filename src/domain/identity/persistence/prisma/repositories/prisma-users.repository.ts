import { Injectable } from '@nestjs/common';
import { User } from '@/domain/identity/core/entities/user.entity';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaUsersMapper } from '../mappers/prisma-users.mapper';

@Injectable()
export class PrismaUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    const userProfile = await this.prisma.userProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    return PrismaUsersMapper.toDomain(user, userProfile!);
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const userProfile = await this.prisma.userProfile.findUnique({
      where: {
        cpf,
      },
    });

    if (!userProfile) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userProfile.userId,
      },
    });

    return PrismaUsersMapper.toDomain(user!, userProfile);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    const userProfile = await this.prisma.userProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    return PrismaUsersMapper.toDomain(user, userProfile!);
  }

  async findManyByIds(ids: string[]): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        profile: true,
      },
    });

    return users.map((user) => PrismaUsersMapper.toDomain(user, user.profile!));
  }

  async listAll(): Promise<User[] | []> {
    const users = await this.prisma.user.findMany({
      include: {
        profile: true,
      },
    });

    if (users.length === 0) {
      return [];
    }

    return users.map((user) => PrismaUsersMapper.toDomain(user, user.profile!));
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: {
        id: user.id,
      },
      create: {
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.roles,
        profile: {
          create: {
            name: user.name,
            socialName: user.socialName,
            cpf: user.cpf,
            birthDate: new Date(user.birthDate),
            phone: user.phone,
          },
        },
      },
      update: {
        email: user.email,
        password: user.password,
        role: user.roles,
        profile: {
          update: {
            name: user.name,
            socialName: user.socialName === undefined ? null : user.socialName,
            cpf: user.cpf,
            birthDate: new Date(user.birthDate),
            phone: user.phone,
          },
        },
      },
    });
  }
}
