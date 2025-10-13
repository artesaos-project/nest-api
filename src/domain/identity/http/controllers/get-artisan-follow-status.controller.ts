import {
  Controller, Get, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { ArtisanFollowersRepository } from '@/domain/repositories/artisan-followers.repository';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

@Controller('artisans')
@UseGuards(JwtAuthGuard)
export class GetArtisanFollowStatusController {
  constructor(
        private readonly artisanFollowersRepository: ArtisanFollowersRepository,
  ) {}

  @Get(':id/follow/status')
  async handle(
    @Param('id') artisanId: string,
    @CurrentUser() currentuser: TokenPayload,
  ) {
    const isFollowing = await this.artisanFollowersRepository.findByUserIds(
      currentuser.sub,
      artisanId,
    );

    const followersCount = await this.artisanFollowersRepository.countFollowers(
      artisanId,
    );

    return {
      data: {
        isFollowing: !!isFollowing,
        followersCount,
      },
    };
  }
}
