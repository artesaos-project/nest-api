import { IsUUID } from 'class-validator';

export class ProductIdParamDto {
  @IsUUID()
    id: string;
}
