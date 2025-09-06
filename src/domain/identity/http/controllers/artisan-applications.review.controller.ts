import {
  Controller, Patch, Param, Body,
  UseGuards, ConflictException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { ReviewDisableArtisanUseCase } from '../../core/use-cases/review-disable-artisan.use-case';
import { ReviewDisableArtisanDto } from '../dtos/disable-artisan.dto';
import { ArtisanApplicationNotFoundError } from '../../core/errors/artisan-application-not-found.error';
import { ArtisanApplicationAlreadyModeratedError } from '../../core/errors/artisan-application-already-moderated.error';
import { PropertyMissingError } from '../../core/errors/property-missing.error';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '../../core/entities/user.entity';
import { SingleUuidParamDto } from '../dtos/single-uuid-param.dto';

@Controller('artisan-applications')
export class ReviewArtisanController {
  constructor(
    private readonly reviewUseCase: ReviewDisableArtisanUseCase,
  ) {}

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  async review(
    @Param(){ id }: SingleUuidParamDto,
    @Body() dto: ReviewDisableArtisanDto,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.reviewUseCase.execute({
      applicationId: id,
      reviewerId: user.sub,
      status: dto.status,
      rejectionReason: dto.rejectionReason,
    });
    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof ArtisanApplicationNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ArtisanApplicationAlreadyModeratedError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof PropertyMissingError) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(error.message);
    }
    return { message: 'Disable request reviewed successfully' };
  }
}
