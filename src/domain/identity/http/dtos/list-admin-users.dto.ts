import { Transform } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class ListAdminUsersDto {
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'page deve ser um número inteiro' })
  @Min(1, { message: 'page deve ser no mínimo 1' })
    page: number;

  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'limit deve ser um número inteiro' })
  @Min(1, { message: 'limit deve ser no mínimo 1' })
  @Max(50, { message: 'limit máximo permitido é 50' })
    limit: number;
}
