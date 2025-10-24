import { IsUUID } from 'class-validator';

export class ReportIdParamDto {
  @IsUUID()
    id!: string;
}
