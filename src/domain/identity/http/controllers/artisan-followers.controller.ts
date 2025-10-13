import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ToggleArtisanFollowUseCase } from '../../core/use-cases/toggle-artisan-follow.usecase';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';

@Controller('artisans')
@UseGuards(JwtAuthGuard)
export class ToggleArtisanFollowController {
  constructor(
        private readonly toggleArtisanFollowUseCase: ToggleArtisanFollowUseCase,
  ) {}

  @Post(':id/follow')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Param('id') artisanId: string,
    @CurrentUser() currentuser: TokenPayload,
  ) {
    const result = await this.toggleArtisanFollowUseCase.execute(
      currentuser.sub,
      artisanId,
    );
    return { data: result };
  }
}
