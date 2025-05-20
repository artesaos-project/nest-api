import {
  Controller, Post, Body, ConflictException, BadRequestException,
} from '@nestjs/common';
import { CreateAccountUseCase } from '../../core/use-cases/create-account.use-case';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { UserAlreadyExistsError } from '../../core/errors/user-already-exists.error';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';

@Controller('users')
export class CreateAccountController {
  constructor(private readonly createAccountUseCase: CreateAccountUseCase) {}

  @Post()
  @Public()
  async handle(@Body() body: CreateAccountDto) {
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

    const user = result.value;

    return user;
  }
}
