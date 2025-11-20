import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  Length,
  IsMobilePhone,
} from 'class-validator';

export class UpdatePersonalProfileDataDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
    name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nome social deve ter no máximo 100 caracteres' })
    socialName?: string | null;

  @IsOptional()
  @IsString()
  @IsMobilePhone('pt-BR', {}, { message: 'Telefone deve ser um número válido brasileiro' })
    phone?: string;

  @IsOptional()
  @IsString()
    avatarId?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Nome de usuário deve ter pelo menos 3 caracteres' })
  @MaxLength(50, { message: 'Nome de usuário deve ter no máximo 50 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Nome de usuário pode conter apenas letras, números, hífen e underscore',
  })
    artisanUserName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Biografia deve ter no máximo 1000 caracteres' })
    bio?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'SICAB é obrigatório' })
  @MaxLength(50, { message: 'SICAB deve ter no máximo 50 caracteres' })
    sicab?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data de registro SICAB deve ser uma data válida' })
    sicabRegistrationDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data de validade SICAB deve ser uma data válida' })
    sicabValidUntil?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'CEP deve estar no formato XXXXX-XXX ou XXXXXXXX',
  })
    zipCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Endereço deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Endereço deve ter no máximo 200 caracteres' })
    address?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Número do endereço é obrigatório' })
  @MaxLength(20, { message: 'Número do endereço deve ter no máximo 20 caracteres' })
    addressNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Complemento deve ter no máximo 100 caracteres' })
    addressComplement?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Bairro deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Bairro deve ter no máximo 100 caracteres' })
    neighborhood?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Cidade deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Cidade deve ter no máximo 100 caracteres' })
    city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2, { message: 'Estado deve ter exatamente 2 caracteres (UF)' })
  @Matches(/^[A-Z]{2}$/, {
    message: 'Estado deve ser uma UF válida em maiúsculas (ex: SP, RJ, MG)',
  })
    state?: string;
}
