import {
  BadRequestException,
  Body, ConflictException, Controller, NotFoundException, Param, Post, UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { ModerateArtisanApplicationUseCase } from '../../core/use-cases/moderate-artisan-application.use-case';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { IdParamDto } from '../dtos/id-param.dto';
import { ModerateArtisanApplicationDto } from '../dtos/moderate-artisan-application.dto';
import { ArtisanApplicationNotFoundError } from '../../core/errors/artisan-application-not-found.error';
import { ArtisanApplicationAlreadyModeratedError } from '../../core/errors/artisan-application-already-moderated.error';
import { PropertyMissingError } from '../../core/errors/property-missing.error';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '../../core/entities/user.entity';

@Controller('artisan-applications/:id/moderate')
@UseGuards(RolesGuard)
export class ModerateArtisanApplicationController {
  constructor(
    private readonly moderateArtisanApplicationUseCase: ModerateArtisanApplicationUseCase,
  ) {}

  @Post()
  @Roles(UserRole.MODERATOR)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param() param: IdParamDto,
    @Body() body: ModerateArtisanApplicationDto,
  ) {
    const reviewerId = user.sub;
    const applicationId = param.id;
    const { status, rejectionReason } = body;

    const result = await this.moderateArtisanApplicationUseCase.execute({
      applicationId,
      status,
      rejectionReason: rejectionReason ?? null,
      reviewerId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ArtisanApplicationNotFoundError:
          throw new NotFoundException(error.message);
        case ArtisanApplicationAlreadyModeratedError:
          throw new ConflictException(error.message);
        case PropertyMissingError:
          throw new BadRequestException(error.message);
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return {
      message: 'Artisan application moderated successfully',
    };
  }
}
