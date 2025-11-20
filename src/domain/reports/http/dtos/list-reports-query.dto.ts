import { Transform, Type } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class ListReportsQueryDto {
  @IsOptional()
  @IsBooleanString({ message: 'Campo "isSolved" deve ser booleano (true/false)' })
    isSolved?: string;

  @IsOptional()
  @IsUUID(4, { message: 'ID do autor da denúncia é inválido' })
    reporterId?: string;

  @IsOptional()
  @IsIn(['product', 'productRating', 'user'], {
    message: 'Tipo de alvo é inválido. Valores aceitos: product, productRating, user',
  })
    targetType?: 'product' | 'productRating' | 'user';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser no mínimo 1' })
    page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit deve ser um número inteiro' })
  @Min(1, { message: 'Limit deve ser no mínimo 1' })
  @Max(100, { message: 'Limit deve ser no máximo 100' })
    limit?: number;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    _: unknown;
}
