import { User as PrismaUser, UserProfile as PrismaUserProfile, Prisma } from '@prisma/client';
import { User, UserRole } from '@/domain/identity/core/entities/user.entity';

export class PrismaUsersMapper {
  static toDomain(user: PrismaUser, profile: PrismaUserProfile): User {
    return User.create({
      name: profile.name,
      socialName: profile.socialName ?? undefined,
      email: user.email,
      password: user.password,
      roles: user.role as UserRole[],
      cpf: profile.cpf,
      birthDate: profile.birthDate.toISOString(),
      phone: profile.phone ?? '',
      isActive: user.isDisabled,
    }, user.id, user.createdAt, user.updatedAt);
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.roles as UserRole[],
      isDisabled: user.isActive,
      profile: {
        create: {
          name: user.name,
          socialName: user.socialName ?? undefined,
          cpf: user.cpf,
          birthDate: new Date(user.birthDate),
          phone: user.phone,
        },
      },
    };
  }
}
