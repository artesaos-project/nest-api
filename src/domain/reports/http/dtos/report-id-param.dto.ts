import { IsUUID } from 'class-validator';

export class ReportIdParamDto {
  @IsUUID(4, { message: 'ID do relatório é inválido' })
    id!: string;
}
