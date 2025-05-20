import {
  BadRequestException, Body, Controller, NotFoundException, Put, UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { UpdatePersonalProfileDataDto } from '../dtos/update-personal-profile-data.dto';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { UpdatePersonalProfileDataUseCase } from '../../core/use-cases/update-personal-profile-data.use-case';

@Controller('users/me/profile')
@UseGuards(JwtAuthGuard)
export class UpdatePersonalProfileDataController {
  constructor(
    private readonly updatePersopalProfileDataUseCase: UpdatePersonalProfileDataUseCase,
  ) {}

  @Put()
  async handle(
    @CurrentUser() { sub: userId }: UserPayload,
    @Body() body: UpdatePersonalProfileDataDto,
  ) {
    const updateBody = { ...body };

    if (updateBody.newSocialName === '') {
      updateBody.newSocialName = undefined;
    }

    const result = await this.updatePersopalProfileDataUseCase.execute({ userId, ...updateBody });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
