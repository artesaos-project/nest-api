import {
  ArrayMaxSize,
  IsArray,
  IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min,
} from 'class-validator';

export class CreateOrUpdateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
    rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
    comment?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUUID('4', { each: true })
    imageIds?: string[];
}
