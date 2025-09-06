import { IsUUID } from 'class-validator';

export class SingleUuidParamDto {
  @IsUUID()
    id: string;
}
