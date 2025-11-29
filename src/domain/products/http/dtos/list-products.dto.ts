import {
  IsOptional, IsString, IsUUID,
  IsNumberString,
} from 'class-validator';

export class ListProductsDto {
  @IsOptional()
  @IsUUID('4', {
    message: 'ID do produto deve ser um UUID válido',
  })
    id?: string;

  @IsOptional()
  @IsNumberString({}, {
    message: 'ID da categoria deve ser um número',
  })
    categoryId?: number;

  @IsOptional()
  @IsUUID('4', {
    message: 'ID do artesão deve ser um UUID válido',
  })
    artisanId?: string;

  @IsOptional()
  @IsString({
    message: 'Título deve ser um texto',
  })
    title?: string;
}
