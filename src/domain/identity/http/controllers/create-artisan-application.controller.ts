import {
  BadRequestException,
  Body, ConflictException, Controller, NotFoundException, Post, UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { CreateArtisanApplicationUseCase } from '../../core/use-cases/create-artisan-application.use-case';
import { CreateArtisanApplicationDto } from '../dtos/create-artisan-application.dto';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { PendingApplicationAlreadyExistsError } from '../../core/errors/pending-application-already-exists.error';

@Controller('artisan-applications')
@UseGuards(JwtAuthGuard)
export class CreateArtisanApplicationController {
  constructor(
    private readonly createArtisanApplicationUseCase: CreateArtisanApplicationUseCase,
  ) {}

  @Post()
  async handle(@CurrentUser() user: UserPayload, @Body() body: CreateArtisanApplicationDto) {
    const result = await this.createArtisanApplicationUseCase.execute({
      userId: user.sub,
      ...body,
      sicabRegistrationDate: new Date(body.sicabRegistrationDate),
      sicabValidUntil: new Date(body.sicabValidUntil),
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        case PendingApplicationAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return {
      message: 'Application submitted successfully',
    };
  }
}
