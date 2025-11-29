import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ListArtisanReviewsUseCase } from '../../core/use-cases/list-artisan-reviews.use-case';
import { ListArtisanReviewsDto } from '../dtos/list-artisan-reviews.dto';
import { ArtisanNotFoundError } from '../../core/errors/artisan-not-found.error';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';

@Controller('artisans')
export class ListArtisanReviewsController {
  private readonly logger = new Logger(ListArtisanReviewsController.name);

  constructor(
    private readonly listArtisanReviewsUseCase: ListArtisanReviewsUseCase,
  ) {}

  @Get(':artisanId/reviews')
  @Public()
  async handle(
    @Param('artisanId') artisanId: string,
    @Query() query: ListArtisanReviewsDto,
  ) {
    this.logger.log('GET /artisans/:artisanId/reviews', { artisanId, query });

    const result = await this.listArtisanReviewsUseCase.execute({
      artisanId,
      page: query.page,
      limit: query.limit,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ArtisanNotFoundError) {
        this.logger.error('Artisan not found', { artisanId });
        throw new NotFoundException('Artesão não encontrado');
      }

      this.logger.error('Failed to list artisan reviews', error.stack);
      throw error;
    }

    return {
      data: result.value.reviews,
      pagination: result.value.pagination,
    };
  }
}
