import {
  BadRequestException, Controller, Get, NotFoundException, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { GetAllUsersUseCase } from '../../core/use-cases/get-all-users.use-case';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '../../core/entities/user.entity';
import { NoUsersFoundError } from '../../core/errors/no-users-found.error';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetAllUsersController {
  constructor(private readonly getAllUsersUseCase: GetAllUsersUseCase) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async handle() {
    const result = await this.getAllUsersUseCase.execute();

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NoUsersFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
