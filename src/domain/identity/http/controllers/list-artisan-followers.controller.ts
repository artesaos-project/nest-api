import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ArtisanFollowersRepository } from '@/domain/repositories/artisan-followers.repository';

@Controller('artisans')
export class ListArtisanFollowersController {
  constructor(
        private readonly artisanFollowersRepository: ArtisanFollowersRepository,
  ) {}

  @Get(':id/followers')
  async handle(
    @Param('id') artisanId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const p = Number(page);
    const l = Number(limit);

    const followers = await this.artisanFollowersRepository.findFollowersByArtisanId(
      artisanId,
      p,
      l,
    );

    const total = await this.artisanFollowersRepository.countFollowers(
      artisanId,
    );

    return {
      data: {
        followers,
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
