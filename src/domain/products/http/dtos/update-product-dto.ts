import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({
    message: 'Descrição deve ser um texto',
  })
    description?: string;

  @IsOptional()
  @IsNumber({}, {
    message: 'Preço deve ser um número',
  })
    priceInCents?: number;

  @IsOptional()
  @IsNumber({}, {
    message: 'Estoque deve ser um número',
  })
    stock?: number;

  @IsOptional()
  @IsString({
    each: true,
    message: 'IDs das fotos deletadas devem ser textos',
  })
    deletedPhotos?: string[];

  @IsOptional()
  @IsString({
    each: true,
    message: 'IDs das novas fotos devem ser textos',
  })
    newPhotos?: string[];

  @IsOptional()
  @IsString({
    message: 'ID da foto de capa deve ser um texto',
  })
    coverPhotoId?: string;

  @IsOptional()
  @IsNumber({}, {
    message: 'ID da categoria deve ser um número',
  })
    categoryId?: number;
}
