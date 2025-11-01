import {
  IsOptional, IsString, IsUUID,
  IsNumberString,
} from 'class-validator';

export class ListProductsDto {
  @IsOptional()
  @IsUUID()
    id?: string;

  @IsOptional()
  @IsNumberString()
    categoryId?: number;

  @IsOptional()
  @IsUUID()
    artisanId?: string;

  @IsOptional()
  @IsString()
    title?: string;
}
