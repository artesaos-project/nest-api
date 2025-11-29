import {
  ArrayMaxSize,
  IsArray,
  IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min,
} from 'class-validator';

export class CreateOrUpdateReviewDto {
  @IsInt({
    message: 'Avaliação deve ser um número inteiro',
  })
  @Min(1, {
    message: 'Avaliação deve ser no mínimo 1',
  })
  @Max(5, {
    message: 'Avaliação deve ser no máximo 5',
  })
    rating!: number;

  @IsOptional()
  @IsString({
    message: 'Comentário deve ser um texto',
  })
  @MaxLength(500, {
    message: 'Comentário deve ter no máximo 500 caracteres',
  })
    comment?: string;

  @IsOptional()
  @IsArray({
    message: 'IDs das imagens devem ser um array',
  })
  @ArrayMaxSize(5, {
    message: 'Máximo de 5 imagens permitidas',
  })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de imagem deve ser um UUID válido',
  })
    imageIds?: string[];
}
