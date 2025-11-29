/* eslint-disable lines-between-class-members */
import { Injectable, Logger } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { Either, left, right } from '@/domain/_shared/utils/either';

import { UsersRepository } from '@/domain/repositories/users.repository';
import { UserNotFoundError } from '../errors/user-not-found.error';

export interface UpdateMyPasswordInput {
  userId: string;
  newPassword: string;
}

export interface UpdateMyPasswordOutput {
  success: true;
}

type Output = Either<UserNotFoundError | Error, UpdateMyPasswordOutput>;

@Injectable()
export class UpdateProvisionalPasswordUseCase {
  private readonly logger = new Logger(UpdateProvisionalPasswordUseCase.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(input: UpdateMyPasswordInput): Promise<Output> {
    const { userId, newPassword } = input;

    this.logger.log(`User self-update password: user=${userId}`);

    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        return left(new UserNotFoundError(userId, 'id'));
      }

      const hashed = await hash(newPassword, 12);

      await this.usersRepository.updatePasswordAndDisableFlag(userId, hashed);

      this.logger.log(`Password updated successfully for user=${userId}`);

      return right({ success: true });
    } catch (error) {
      this.logger.error(`Error updating password for user=${userId}`, error.stack);
      return left(error);
    }
  }
}
