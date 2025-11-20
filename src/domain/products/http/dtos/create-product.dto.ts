import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsPositive,
  IsInt,
  MinLength,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @IsString({ message: 'Título deve ser um texto' })
  @MinLength(3, { message: 'Título deve ter pelo menos 3 caracteres' })
  @MaxLength(100, { message: 'Título deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
    title: string;

  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString({ message: 'Descrição deve ser um texto' })
  @MinLength(10, { message: 'Descrição deve ter pelo menos 10 caracteres' })
  @MaxLength(2000, { message: 'Descrição deve ter no máximo 2000 caracteres' })
  @Transform(({ value }) => value?.trim())
    description: string;

  @IsNotEmpty({ message: 'Preço é obrigatório' })
  @IsNumber({}, { message: 'Preço deve ser um número' })
  @IsPositive({ message: 'Preço deve ser maior que zero' })
  @IsInt({ message: 'Preço deve ser um número inteiro em centavos' })
  @Max(999999999, { message: 'Preço muito alto (máximo R$ 9.999.999,99)' })
  @Type(() => Number)
    priceInCents: number;

  @IsNotEmpty({ message: 'Matérias-primas são obrigatórias' })
  @IsArray({ message: 'Matérias-primas devem ser uma lista' })
  @ArrayMinSize(1, { message: 'Pelo menos uma matéria-prima deve ser selecionada' })
  @ArrayMaxSize(10, { message: 'Máximo de 10 matérias-primas permitidas' })
  @IsInt({ each: true, message: 'Cada matéria-prima deve ser um número inteiro' })
  @IsPositive({ each: true, message: 'IDs das matérias-primas devem ser positivos' })
  @Type(() => Number)
    rawMaterialIds: number[];

  @IsNotEmpty({ message: 'Técnicas são obrigatórias' })
  @IsArray({ message: 'Técnicas devem ser uma lista' })
  @ArrayMinSize(1, { message: 'Pelo menos uma técnica deve ser selecionada' })
  @ArrayMaxSize(10, { message: 'Máximo de 10 técnicas permitidas' })
  @IsInt({ each: true, message: 'Cada técnica deve ser um número inteiro' })
  @IsPositive({ each: true, message: 'IDs das técnicas devem ser positivos' })
  @Type(() => Number)
    techniqueIds: number[];

  @IsNotEmpty({ message: 'Estoque é obrigatório' })
  @IsNumber({}, { message: 'Estoque deve ser um número' })
  @IsInt({ message: 'Estoque deve ser um número inteiro' })
  @Min(0, { message: 'Estoque não pode ser negativo' })
  @Max(99999, { message: 'Estoque muito alto (máximo 99.999 unidades)' })
  @Type(() => Number)
    stock: number;

  @IsArray({ message: 'Fotos devem ser uma lista' })
  @ArrayMaxSize(20, { message: 'Máximo de 20 fotos permitidas' })
  @IsUUID(4, { each: true, message: 'Cada foto deve ter um ID válido' })
    photosIds: string[];
}
