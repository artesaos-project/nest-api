import {
  Controller, Post, Param, 
  UseGuards, ConflictException, NotFoundException, BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { ArtisanApplicationNotFoundError } from '../../core/errors/artisan-application-not-found.error';
import { ConfirmDisableArtisanUseCase } from '../../core/use-cases/confirm-disable-artisan.use-case';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '../../core/entities/user.entity';
import { ArtisanApplicationNotApprovedError } from '../../core/errors/artisan-application-not-approved.error';
import { SingleUuidParamDto } from '../dtos/single-uuid-param.dto';

@Controller('artisan-applications')

export class ConfirmDisableArtisanController {
  constructor(
    private readonly confirmUseCase: ConfirmDisableArtisanUseCase
  ) {}

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @HttpCode(200)
  async confirm(
    @Param(){id}:SingleUuidParamDto,
  ): Promise<{ message: string }> {
    const result = await this.confirmUseCase.execute(id);
    if (result.isLeft()) {
      const err = result.value as | ArtisanApplicationNotFoundError
  | ArtisanApplicationNotApprovedError
  | Error;
      if (err instanceof ArtisanApplicationNotFoundError) {
        throw new NotFoundException(err.message);
      }
      if (err instanceof ArtisanApplicationNotApprovedError) {
        throw new ConflictException(err.message);
      }
      throw new BadRequestException(err.message);
    }
    return { message: 'Artisan profile disabled successfully' };
  }
}
