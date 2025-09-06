import {
  BadRequestException,
  Controller, NotFoundException, Param, Patch, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { UpdateUserToModeratorDto } from '../dtos/update-user-to-moderator.dto';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '../../core/entities/user.entity';
import { AddModeratorRoleUseCase } from '../../core/use-cases/add-moderator-role.use-case';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { PropertyAlreadyExists } from '../../core/errors/property-already-exists.error';

@Controller('users/:id/add-moderator-role')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AddModeratorRoleController {
  constructor(
    private readonly addModeratorRoleUseCase: AddModeratorRoleUseCase,
  ) { }

  @Patch()
  @Roles(UserRole.ADMIN)
  async handle(@Param() param: UpdateUserToModeratorDto) {
    const userId = param.id;

    const result = await this.addModeratorRoleUseCase.execute({ userId });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        case PropertyAlreadyExists:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return {
      userId: result.value.userId,
      roles: result.value.roles,
    };
  }
}
