import { Transform } from 'class-transformer';
import {
  IsEnum, IsOptional, IsString, MaxLength,
} from 'class-validator';
import { ReportReason } from '@prisma/client';

export class CreateReportBaseDto {
  @IsEnum(ReportReason, { message: 'Motivo da denúncia é inválido' })
    reason!: ReportReason;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser um texto' })
  @MaxLength(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    description?: string;
}
