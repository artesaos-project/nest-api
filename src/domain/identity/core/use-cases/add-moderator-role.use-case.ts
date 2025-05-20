import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UserRole } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { PropertyAlreadyExists } from '../errors/property-already-exists.error';

export interface AddModeratorRoleInput {
  userId: string;
}

export interface AddModeratorRoleOutput {
  roles: UserRole[]
  userId: string;
}

type Output = Either<UserAlreadyExistsError, AddModeratorRoleOutput>

@Injectable()
export class AddModeratorRoleUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
  }: AddModeratorRoleInput): Promise<Output> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    const userAlreadyModerator = user.roles.includes(UserRole.MODERATOR);

    if (userAlreadyModerator) {
      return left(new PropertyAlreadyExists(UserRole.MODERATOR));
    }

    user.roles.push(UserRole.MODERATOR);

    await this.usersRepository.save(user);

    return right({
      userId: user.id,
      roles: user.roles,
    });
  }
}
