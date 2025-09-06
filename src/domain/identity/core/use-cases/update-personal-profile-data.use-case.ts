import { Injectable } from '@nestjs/common';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { PrismaUsersRepository } from '../../persistence/prisma/repositories/prisma-users.repository';

export interface UpdatePersonalProfileDataInput {
  userId: string;
  newName?: string;
  newSocialName?: string;
  newPhone?: string;
}

export interface UpdatePersonalProfileDataOutput {
  name: string;
  socialName?: string;
  phone: string;
}

type Output = Either<UserNotFoundError, { user: UpdatePersonalProfileDataOutput }>;

@Injectable()
export class UpdatePersonalProfileDataUseCase {
  constructor(
    private readonly usersRepository: PrismaUsersRepository,
  ) {}

  async execute({
    userId,
    newName,
    newSocialName,
    newPhone,
  }: UpdatePersonalProfileDataInput): Promise<Output> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    if (newName) {
      user.name = newName;
    }

    if (newSocialName || newSocialName === undefined) {
      user.socialName = newSocialName;
    }

    if (newPhone) {
      user.phone = newPhone;
    }

    await this.usersRepository.save(user);

    return right({
      user: {
        name: user.name,
        socialName: user.socialName,
        phone: user.phone,
      },
    });
  }
}
