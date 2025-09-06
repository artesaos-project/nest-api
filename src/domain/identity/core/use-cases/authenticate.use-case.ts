import { Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { UserRole } from '../entities/user.entity';
import { PrismaUsersRepository } from '../../persistence/prisma/repositories/prisma-users.repository';

export interface AuthenticateInput {
  email: string;
  password: string;
}

export interface AuthenticateOutput {
  accessToken: string;
  roles: UserRole[]
  userId: string;
  name: string;
  socialName?: string;
}

type Output = Either<InvalidCredentialsError, AuthenticateOutput>

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private readonly usersRepository: PrismaUsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async execute({ email, password }: AuthenticateInput): Promise<Output> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      return left(new InvalidCredentialsError());
    }

    if (!user.isActive) {
      return left(new InvalidCredentialsError());
    }

    const passwordMatches = await compare(password, user.password);

    if (!passwordMatches) {
      return left(new InvalidCredentialsError());
    }

    const accessToken = this.jwt.sign({ sub: user.id, roles: user.roles });

    return right({
      accessToken,
      roles: user.roles,
      userId: user.id,
      name: user.name,
      socialName: user.socialName,
    });
  }
}
