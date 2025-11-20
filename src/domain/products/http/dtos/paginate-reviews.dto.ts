import { Transform } from 'class-transformer';
import {
  IsInt, IsOptional, Max, Min,
} from 'class-validator';

export class PaginateReviewsDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
    page: number = 1;

  @IsOptional()
  @Transform(({ value }) => Math.min(Number(value), 50))
  @IsInt()
  @Min(1)
  @Max(50)
    limit: number = 10;
}
