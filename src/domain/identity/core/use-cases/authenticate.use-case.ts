import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { UsersRepository } from '../repositories/users.repository';
import { Cryptography } from '../utils/encryption/cryptography';
import { UserRole } from '../entities/user.entity';
import { JwtEncrypter } from '../utils/encryption/jwt-encrypter';

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
    private readonly usersRepository: UsersRepository,
    private readonly cryptography: Cryptography,
    private readonly jwtEncrypter: JwtEncrypter,
  ) {}

  async execute({ email, password }: AuthenticateInput): Promise<Output> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      return left(new InvalidCredentialsError());
    }

    if (!user.isActive) {
      return left(new InvalidCredentialsError());
    }

    const passwordMatches = await this.cryptography.compare(password, user.password);

    if (!passwordMatches) {
      return left(new InvalidCredentialsError());
    }

    const accessToken = await this.jwtEncrypter.encrypt({ sub: user.id, roles: user.roles });

    return right({
      accessToken,
      roles: user.roles,
      userId: user.id,
      name: user.name,
      socialName: user.socialName,
    });
  }
}
