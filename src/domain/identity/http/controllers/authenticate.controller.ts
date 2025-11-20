import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
  Req,
  HttpCode,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticateDto } from '../dtos/authenticate.dto';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';
import { AuthenticateUseCase } from '../../core/use-cases/authenticate.use-case';
import { InvalidCredentialsError } from '../../core/errors/invalid-credentials.error';

@Controller('auth')
export class AuthenticateController {
  constructor(private readonly authenticateUseCase: AuthenticateUseCase) {}

  @Post('login')
  @Public()
  @HttpCode(200)
  async handle(
    @Body() body: AuthenticateDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const ipHost = request.ip || request.socket.remoteAddress || 'unknown';
    const userAgent = request.get('User-Agent') || 'unknown';

    const result = await this.authenticateUseCase.execute({
      ...body,
      ipHost,
      userAgent,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException(error.message);
        default:
          throw new UnauthorizedException('Erro de autenticação');
      }
    }

    const { user, session } = result.value;

    response.cookie('access_token', session.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    response.json({
      user: {
        id: user.id,
        name: user.name,
        socialName: user.socialName,
        email: user.email,
        avatar: user.avatar,
        artisanUsername: user.artisanUsername,
        applicationId: user.applicationId,
        applicationStatus: user.applicationStatus,
        roles: user.roles,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });
  }
}
