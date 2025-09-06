import {
  Controller, Post, 
  UseGuards, ConflictException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { RequestDisableArtisanUseCase } from '../../core/use-cases/request-disable-artisan.use-case';
import { PendingDisableRequestAlreadyExistsError } from '../../core/errors/pending-disable-request-already-exists.error';
import { ArtisanProfileNotFoundError } from '../../core/errors/artisan-profile-not-found.error';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '../../core/entities/user.entity';

@Controller('artisan-applications')
export class RequestDisableArtisanController {
  constructor(
    private readonly requestUseCase: RequestDisableArtisanUseCase,
  ) {}

  @Post('disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTISAN)
  async request(@CurrentUser() user: UserPayload) {
    const result = await this.requestUseCase.execute({ userId: user.sub });
    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof PendingDisableRequestAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof ArtisanProfileNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
    return { message: 'Disable request submitted successfully' };
  }
}
