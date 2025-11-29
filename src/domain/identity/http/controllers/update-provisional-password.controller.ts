import {
  Controller,
  Put,
  Body,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { UpdateMyPasswordDto } from '../dtos/update-my-password.dto';
import { UpdateProvisionalPasswordUseCase } from '../../core/use-cases/update-provisional-password.use-case';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UpdateProvisionalPasswordController {
  constructor(private readonly updateMyPasswordUseCase: UpdateProvisionalPasswordUseCase) {}

  @Put('provisional-password')
  async handle(
    @Body() body: UpdateMyPasswordDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    const result = await this.updateMyPasswordUseCase.execute({
      userId: currentUser.sub,
      newPassword: body.newPassword,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case UserNotFoundError:
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException('Erro interno ao alterar senha.');
      }
    }

    return { data: { success: true } };
  }
}
