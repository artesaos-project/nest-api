import { Transform } from 'class-transformer';
import {
  IsInt, IsOptional, Max, Min,
} from 'class-validator';

export class ListArtisanReviewsDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({
    message: 'Página deve ser um número inteiro',
  })
  @Min(1, {
    message: 'Página deve ser no mínimo 1',
  })
    page: number = 1;

  @IsOptional()
  @Transform(({ value }) => Math.min(Number(value), 50))
  @IsInt({
    message: 'Limit deve ser um número inteiro',
  })
  @Min(1, {
    message: 'Limit deve ser no mínimo 1',
  })
  @Max(50, {
    message: 'Limit deve ser no máximo 50',
  })
    limit: number = 10;
}
