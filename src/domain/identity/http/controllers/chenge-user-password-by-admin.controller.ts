import {
  Body,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { ResetUserPasswordDto } from '../dtos/reset-user-password.dto';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { ChangeUserPasswordByAdminUseCase } from '../../core/use-cases/change-user-password-by-admin.use-case';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { NotAllowedError } from '../../core/errors/not-allowed.error';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChangeUserPasswordByAdminController {
  constructor(
      private readonly changeUserPasswordByAdminUseCase: ChangeUserPasswordByAdminUseCase,
  ) {}

  @Put(':id/reset-password')
  @Roles(PrismaRoles.ADMIN, PrismaRoles.MODERATOR)
  async handle(
        @Param('id') targetUserId: string,
        @Body() body: ResetUserPasswordDto,
        @CurrentUser() actor: TokenPayload,
  ) {
    const result = await this.changeUserPasswordByAdminUseCase.execute({
      actorId: actor.sub,
      targetUserId,
      newPassword: body.password,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }

    return {
      data: {
        success: true,
      },
    };
  }
}
