import { IsUUID } from 'class-validator';

export class ProductIdParamDto {
  @IsUUID('4', {
    message: 'ID do produto deve ser um UUID válido',
  })
    id: string;
}
