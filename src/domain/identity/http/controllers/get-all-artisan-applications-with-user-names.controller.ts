import {
  BadRequestException, Controller, Get, NotFoundException, Query, UseGuards,
} from '@nestjs/common';
import { ApplicationType, RequestStatus } from '@prisma/client';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '../../core/entities/user.entity';
import { GetAllArtisanApplicationsWithUserNamesUseCase } from '../../core/use-cases/get-all-artisan-applications-with-user-names.use-case';
import { NoArtisanApplicationsFoundError } from '../../core/errors/no-artisan-applications-found.error';

@Controller('artisan-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetAllArtisanApplicationsWithUserNamesController {
  constructor(
    private readonly getAllArtisanApplicationsWithUserNamesUseCase:
      GetAllArtisanApplicationsWithUserNamesUseCase,
  ) {}

  @Get()
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  async handle(
    @Query('type') type?: ApplicationType,
    @Query('status') status?: RequestStatus,
  ) {
    const result = await this.getAllArtisanApplicationsWithUserNamesUseCase.execute(type, status);

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NoArtisanApplicationsFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
