import {
  IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
    title: string;

  @IsNotEmpty()
  @IsString()
    description: string;

  @IsNotEmpty()
  @IsNumber()
    priceInCents: number;

  @IsNotEmpty()
  @IsNumber()
    categoryId: number;

  @IsNotEmpty()
  @IsNumber()
    stock: number;

  @IsNotEmpty({ each: true })
  @IsArray()
  @IsString({ each: true })
    photoIds: string[];

  @IsOptional()
  @IsString()
  @IsUUID()
    coverPhotoId?: string;
}
