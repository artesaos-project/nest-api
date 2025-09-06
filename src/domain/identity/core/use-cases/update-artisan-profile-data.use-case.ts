import { Injectable } from '@nestjs/common';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { PrismaUsersRepository } from '../../persistence/prisma/repositories/prisma-users.repository';

export class UpdateArtisanProfileDataInput {
  userId: string;
  userName?: string;
  rawMaterial?: string;
  avatar?: string;
  artisticName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  postalCode?: string;
  state?: string;
  city?: string;
  street?: string;
  cnpj?: string;
  number?: string;
}

export interface UpdateArtisanProfileDataOutput {
  userName: string;
  rawMaterial?: string;
  avatar?: string;
  artisticName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  postalCode?: string;
  state?: string;
  city?: string;
  street?: string;
  cnpj?: string;
  number?: string;
}

type Output = Either<UserNotFoundError, { user: UpdateArtisanProfileDataOutput }>;

@Injectable()
export class UpdateArtisanProfileDataUseCase {
  constructor(
    private readonly usersRepository: PrismaUsersRepository,
  ) {}

  async execute(input: UpdateArtisanProfileDataInput): Promise<Output> {
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
