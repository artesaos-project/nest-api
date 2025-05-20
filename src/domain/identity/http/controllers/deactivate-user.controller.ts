import {
  Controller, UseGuards, Patch, Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { DeactivateUserUseCase } from '../../core/use-cases/deactivate-user.use-case';
import { DeactivateUserDto } from '../dtos/deactivate-user.dto';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';

@Controller('users/:userId/deactivate')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeactivateUserController {
  constructor(private readonly deactivateUserUseCase: DeactivateUserUseCase) {}

  @Patch()
  async handle(
    @Param() param: DeactivateUserDto,
    @CurrentUser() userPayload: UserPayload,
  ) {
    if (userPayload.roles.includes(Role.ADMIN)) {
      const result = await this.deactivateUserUseCase.execute({ userId: param.userId });

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

    if (userPayload.sub === param.userId) {
      const result = await this.deactivateUserUseCase.execute({ userId: param.userId });

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

    return new BadRequestException();
  }
}
