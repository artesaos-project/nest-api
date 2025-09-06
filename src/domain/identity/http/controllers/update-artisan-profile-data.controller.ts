import {
  BadRequestException, Body, Controller, Get, NotFoundException, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '../../core/entities/user.entity';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { UpdateArtisanProfileDataDto } from '../dtos/update-artisan-profile-data.dto';
import { UpdateArtisanProfileDataUseCase } from '../../core/use-cases/update-artisan-profile-data.use-case';

@Controller('artisan-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpdateArtisanProfileDataController {
  constructor(
    private readonly updateArtisanProfileDataUseCase:
    UpdateArtisanProfileDataUseCase,
  ) {}

  @Get()
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  async handle(
    @Body() body: UpdateArtisanProfileDataDto
  ) {
    const result = await this.updateArtisanProfileDataUseCase.execute({...body});

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
