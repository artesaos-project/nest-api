import {
  Controller,
  Put,
  Body,
  ConflictException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { InvalidUserDataError } from '../../core/errors/invalid-user-data.error';
import { UserAlreadyExistsError } from '../../core/errors/user-already-exists.error';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { ArtisanProfileNotFoundError } from '../../core/errors/artisan-profile-not-found.error';
import { InvalidAttachmentError } from '../../core/errors/invalid-attachment.error';
import { UpdatePersonalProfileDataUseCase } from '../../core/use-cases/update-personal-profile-data.use-case';
import { UpdateArtisanProfileUseCase } from '../../core/use-cases/update-artisan-profile.use-case';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { UpdatePersonalProfileDataDto } from '../dtos/update-personal-profile-data.dto';

@Controller('users')
export class UpdatePersonalProfileDataController {
  constructor(
    private readonly updatePersonalProfileDataUseCase: UpdatePersonalProfileDataUseCase,
    private readonly updateArtisanProfileUseCase: UpdateArtisanProfileUseCase,
  ) {}

  @Put('me/profile')
  async handle(
    @Body() body: UpdatePersonalProfileDataDto,
    @CurrentUser() user: TokenPayload,
  ) {
    const sanitizedName = body.name?.trim();
    const sanitizedSocialName = body.socialName?.trim();
    const sanitizedPhone = body.phone?.trim();
    const sanitizedAvatarId = body.avatarId?.trim();

    const processedBody = {
      name: body.name !== undefined ? sanitizedName || '' : undefined,
      socialName:
        body.socialName !== undefined && sanitizedSocialName === ''
          ? null
          : sanitizedSocialName,
      phone: body.phone !== undefined ? sanitizedPhone || '' : undefined,
      avatarId: body.avatarId !== undefined ? sanitizedAvatarId || '' : undefined,
    };

    const personalProfileResult = await this.updatePersonalProfileDataUseCase.execute({
      userId: user.sub,
      newName: processedBody.name,
      newSocialName: processedBody.socialName === '' ? undefined : processedBody.socialName,
      newPhone: processedBody.phone,
      newAvatarId: processedBody.avatarId,
    });

    if (personalProfileResult.isLeft()) {
      return this.handleError(personalProfileResult.value);
    }

    const { user: updatedUser } = personalProfileResult.value;

    if (user.roles.includes('ARTISAN')) {
      const sanitizedUserName = body.artisanUserName?.trim();
      const sanitizedBio = body.bio?.trim();
      const sanitizedSicab = body.sicab?.trim();

      let newBio: string | null | undefined;
      if (body.bio !== undefined) {
        newBio = sanitizedBio === '' ? undefined : sanitizedBio;
      } else {
        newBio = undefined;
      }

      const artisanProfileResult = await this.updateArtisanProfileUseCase.execute({
        artisanId: user.sub,
        newUserName: body.artisanUserName !== undefined ? sanitizedUserName || '' : undefined,
        newBio,
        newSicab: body.sicab !== undefined ? sanitizedSicab || '' : undefined,
        newSicabRegistrationDate: body.sicabRegistrationDate
          ? new Date(body.sicabRegistrationDate)
          : undefined,
        newSicabValidUntil: body.sicabValidUntil
          ? new Date(body.sicabValidUntil)
          : undefined,
        newZipCode: body.zipCode?.trim(),
        newAddress: body.address?.trim(),
        newAddressNumber: body.addressNumber?.trim(),
        newAddressComplement: body.addressComplement !== undefined
          ? (body.addressComplement?.trim() || null)
          : undefined,
        newNeighborhood: body.neighborhood?.trim(),
        newCity: body.city?.trim(),
        newState: body.state?.trim().toUpperCase(),
      });

      if (artisanProfileResult.isLeft()) {
        return this.handleError(artisanProfileResult.value);
      }

      const { artisan: updatedArtisan } = artisanProfileResult.value;

      return {
        message: 'Perfil de artesão atualizado com sucesso',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          socialName: updatedUser.socialName,
          phone: updatedUser.phone,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          artisanUserName: updatedArtisan.artisanUserName,
          bio: updatedArtisan.bio,
          sicab: updatedArtisan.sicab,
          sicabRegistrationDate: updatedArtisan.sicabRegistrationDate,
          sicabValidUntil: updatedArtisan.sicabValidUntil,
          followersCount: updatedArtisan.followersCount,
          productsCount: updatedArtisan.productsCount,
          address: updatedArtisan.address,
        },
      };
    }

    return {
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        socialName: updatedUser.socialName,
        phone: updatedUser.phone,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    };
  }

  private handleError(error: Error) {
    switch (error.constructor) {
      case UserNotFoundError:
        throw new NotFoundException(error.message);
      case ArtisanProfileNotFoundError:
        throw new NotFoundException(error.message);
      case UserAlreadyExistsError:
        throw new ConflictException(error.message);
      case InvalidUserDataError:
        throw new BadRequestException(error.message);
      case InvalidAttachmentError:
        throw new BadRequestException(error.message);
      default:
        throw new InternalServerErrorException('Erro interno do servidor');
    }
  }
}
