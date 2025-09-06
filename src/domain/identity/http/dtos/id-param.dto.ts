import { IsUUID } from 'class-validator';

export class IdParamDto {
  @IsUUID()
    id: string;
}
