import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ListLikesQueryDto {
  @Type(() => Number)
  @IsInt({
    message: 'Página deve ser um número inteiro',
  })
  @Min(1, {
    message: 'Página deve ser no mínimo 1',
  })
    page: number;

  @Type(() => Number)
  @IsInt({
    message: 'Limit deve ser um número inteiro',
  })
  @Min(1, {
    message: 'Limit deve ser no mínimo 1',
  })
  @Max(50, {
    message: 'Limit deve ser no máximo 50',
  })
    limit: number;
}
