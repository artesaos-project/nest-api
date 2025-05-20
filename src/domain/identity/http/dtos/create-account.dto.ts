import {
  IsEmail, IsMobilePhone, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
    name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
    socialName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  @MaxLength(11)
    cpf: string;

  @IsEmail()
  @IsNotEmpty()
    email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
    password: string;

  @IsNotEmpty()
    birthDate: string;

  @IsNotEmpty()
  @IsString()
  @IsMobilePhone('pt-BR')
  @IsPhoneNumber('BR')
    phone: string;
}
