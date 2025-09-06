import {
  BadRequestException, Controller, Get, NotFoundException, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '../../core/entities/user.entity';
import { GetArtisanApplicationDetailsUseCase } from '../../core/use-cases/get-artisan-application-details.use-case';
import { SingleUuidParamDto } from '../dtos/single-uuid-param.dto';
import { ArtisanApplicationNotFoundError } from '../../core/errors/artisan-application-not-found.error';

@Controller('artisan-applications/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetArtisanApplicationDetailsController {
  constructor(
    private readonly getArtisanApplicationDetailsUseCase: GetArtisanApplicationDetailsUseCase,
  ) {}

  @Get()
  @Roles(UserRole.MODERATOR)
  async handle(@Param() param: SingleUuidParamDto) {
    const artisanApplicationId = param.id;

    const result = await this.getArtisanApplicationDetailsUseCase.execute({ artisanApplicationId });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ArtisanApplicationNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
