import { Injectable } from '@nestjs/common';
import { User, Roles, Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  socialName?: string;
  phone: string;
  cpf?: string;
}

export interface SearchUsersParams {
  id?: string;
  email?: string;
  cpf?: string;
  search?: string;
  role?: Roles;
  isActive?: boolean;
  page: number;
  limit: number;
  sortBy: 'name' | 'email' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface SearchUsersResult {
  users: User[];
  total: number;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });
  }

  async findByCpf(cpf: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        profile: {
          cpf,
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        profile: {
          phone,
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
  }

  async save(data: CreateUserData): Promise<User> {
    const { phone, cpf, ...userData } = data;

    return this.prisma.user.upsert({
      where: { email: data.email },
      create: {
        ...userData,
        phone,
        roles: [Roles.USER],
        profile: {
          create: {
            phone,
            cpf,
          },
        },
      },
      update: {
        ...userData,
        profile: {
          upsert: {
            create: {
              phone,
              cpf,
            },
            update: {
              phone,
              cpf,
            },
          },
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async searchUsers(params: SearchUsersParams): Promise<SearchUsersResult> {
    const {
      id, email, cpf, search, role, isActive,
      page, limit, sortBy, sortOrder,
    } = params;

    const where: Prisma.UserWhereInput = {};

    if (id) {
      where.id = id;
    } else {
      if (email) {
        where.email = { equals: email, mode: 'insensitive' };
      }

      if (cpf) {
        where.profile = {
          cpf,
        };
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { socialName: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (role) {
        where.roles = { has: role };
      }

      if (isActive !== undefined) {
        where.isDisabled = !isActive;
      }
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          profile: {
            select: {
              cpf: true,
              phone: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findManyByIds(userIds: string[]): Promise<Pick<User, 'id' | 'name' | 'email'>[]> {
    if (userIds.length === 0) {
      return [];
    }

    return this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findManyByIdsWithoutFilter(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];

    return this.prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async updateRoles(id: string, roles: Roles[]): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { roles },
    });
  }

  async findIsDisabledById(id: string): Promise<boolean | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: { isDisabled: true },
    });
    return row ? row.isDisabled : null;
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async deleteProfile(userId: string): Promise<void> {
    await this.prisma.userProfile.delete({
      where: { userId },
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
  }
}
