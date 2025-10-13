import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { ArtisanFollowersRepository } from '@/domain/repositories/artisan-followers.repository';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

@Controller('artisans')
@UseGuards(JwtAuthGuard)
export class ListUserFollowingController {
  constructor(
        private readonly artisanFollowersRepository: ArtisanFollowersRepository,
  ) {}

  @Get('following')
  async handle(
    @CurrentUser() currentuser: TokenPayload,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const p = Number(page);
    const l = Number(limit);

    const following = await this.artisanFollowersRepository.findFollowingByUserId(
      currentuser.sub,
      p,
      l,
    );

    const total = await this.artisanFollowersRepository.countFollowing(
      currentuser.sub,
    );

    return {
      data: {
        following,
        pagination: {
          page: p,
          limit: l,
          total,
          totalPages: Math.ceil(total / l),
        },
      },
    };
  }
}
