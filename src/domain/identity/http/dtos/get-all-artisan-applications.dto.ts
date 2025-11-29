import { ApplicationType, RequestStatus, FormStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional, IsEnum, Min, IsString,
  IsInt,
} from 'class-validator';

export class GetAllArtisanApplicationsQueryDto {
  @IsOptional()
  @IsEnum(ApplicationType, {
    message: 'Tipo de aplicação inválido',
  })
    type?: ApplicationType;

  @IsOptional()
  @IsEnum(RequestStatus, {
    message: 'Status da solicitação inválido',
  })
    status?: RequestStatus;

  @IsOptional()
  @IsEnum(FormStatus, {
    message: 'Status do formulário inválido',
  })
    formStatus?: FormStatus;

  @IsOptional()
  @IsInt({
    message: 'Página deve ser um número inteiro',
  })
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = Number(value);
    return Number.isNaN(num) ? 20 : num;
  })
  @Min(1, {
    message: 'Página deve ser no mínimo 1',
  })
    page?: number;

  @IsOptional()
  @IsInt({
    message: 'Limit deve ser um número inteiro',
  })
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = Number(value);
    return Number.isNaN(num) ? 20 : num;
  })
  @Min(1, {
    message: 'Limit deve ser no mínimo 1',
  })
    limit?: number;

  @IsOptional()
  @IsString({
    message: 'Busca deve ser um texto',
  })
    search?: string;
}
