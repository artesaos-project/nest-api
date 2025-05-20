import {
  BadRequestException, Body, Controller, Post, UnauthorizedException,
} from '@nestjs/common';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';
import { AuthenticateUseCase } from '../../core/use-cases/authenticate.use-case';
import { AuthenticateDto } from '../dtos/authenticate.dto';
import { InvalidCredentialsError } from '../../core/errors/invalid-credentials.error';

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private readonly authenticateUseCase: AuthenticateUseCase,
  ) {}

  @Post()
  @Public()
  async handle(@Body() body: AuthenticateDto) {
    const result = await this.authenticateUseCase.execute({ ...body });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { accessToken } = result.value;

    return {
      access_token: accessToken,
      roles: result.value.roles,
      userId: result.value.userId,
      name: result.value.name,
      socialName: result.value.socialName,
    };
  }
}
