import {
  BadRequestException, Body, Controller, Post, Res, UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
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
  async handle(@Body() body: AuthenticateDto, @Res() response: Response) {
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

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    response.send({
      roles: result.value.roles,
      userId: result.value.userId,
      name: result.value.name,
      socialName: result.value.socialName,
    });
  }
}
