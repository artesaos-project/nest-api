import {
  Controller, Post, Body, ConflictException, BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateAccountUseCase } from '../../core/use-cases/create-account.use-case';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { UserAlreadyExistsError } from '../../core/errors/user-already-exists.error';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';

@Controller('users')
export class CreateAccountController {
  constructor(private readonly createAccountUseCase: CreateAccountUseCase) {}

  @Post()
  @Public()
  async handle(@Body() body: CreateAccountDto, @Res() response: Response) {
    const result = await this.createAccountUseCase.execute({ ...body });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message);
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
      userId: result.value.id,
      name: result.value.name,
      socialName: result.value.socialName,
    });
  }
}
