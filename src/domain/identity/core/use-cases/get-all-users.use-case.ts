import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { User, UserRole } from '../entities/user.entity';
import { NoUsersFoundError } from '../errors/no-users-found.error';
import { PrismaUsersRepository } from '../../persistence/prisma/repositories/prisma-users.repository';

export interface GetAllUsersOutput {
  name: string;
  email: string;
  cpf: string;
  socialName?: string;
  birthDate: string;
  phone: string;
  roles: UserRole[];
  isActive: boolean;
}

type Output = Either<NoUsersFoundError, { users: GetAllUsersOutput[] }>

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    private readonly usersRepository: PrismaUsersRepository,
  ) {}

  async execute(): Promise<Output> {
    const users = await this.usersRepository.listAll();

    if (users.length === 0) {
      return left(new NoUsersFoundError());
    }

    return right({
      users: users.map((user: User) => ({
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        socialName: user.socialName,
        birthDate: user.birthDate,
        phone: user.phone,
        roles: user.roles,
        isActive: user.isActive,
      })),
    });
  }
}
