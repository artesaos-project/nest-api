/* eslint-disable lines-between-class-members */
// eslint-disable-next-line max-classes-per-file
import { Injectable, Logger } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { NotAllowedError } from '../errors/not-allowed.error';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';

export class ChangeUserPasswordByAdminInput {
  actorId: string;
  targetUserId: string;
  newPassword: string;
}

export class ChangeUserPasswordByAdminOutput {
  success: boolean;
}

type Output = Either<
  UserNotFoundError | NotAllowedError,
  ChangeUserPasswordByAdminOutput
>;

@Injectable()
export class ChangeUserPasswordByAdminUseCase {
  private readonly logger = new Logger(ChangeUserPasswordByAdminUseCase.name);

  constructor(
        private readonly usersRepository: UsersRepository,
        private readonly prisma: PrismaService,
  ) {}

  async execute(input: ChangeUserPasswordByAdminInput): Promise<Output> {
    const { actorId, targetUserId, newPassword } = input;

    this.logger.log(`Starting password reset: actor=${actorId}, targetUser=${targetUserId}`);

    try {
      const targetUser = await this.usersRepository.findById(targetUserId);
      if (!targetUser) {
        this.logger.warn(`Target user not found: targetUser=${targetUserId}`);
        return left(new UserNotFoundError(targetUserId, 'id'));
      }

      const hashedPassword = await hash(newPassword, 12);

      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: targetUserId },
          data: {
            password: hashedPassword,
            mustChangePassword: true,
          },
        });

        await tx.session.updateMany({
          where: {
            userId: targetUserId,
            isRevoked: false,
            expiresAt: { gt: new Date() },
          },
          data: { isRevoked: true },
        });
      });

      this.logger.log(`Password reset successfully completed: targetUser=${targetUserId}`);
      return right({ success: true });
    } catch (error) {
      this.logger.error(`Error during password reset: targetUser=${targetUserId}`, error.stack);
      return left(error);
    }
  }
}
