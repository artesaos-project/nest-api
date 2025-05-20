import {
  IsEmail, IsNotEmpty, IsString,
} from 'class-validator';

export class AuthenticateDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
    email: string;

  @IsNotEmpty()
  @IsString()
    password: string;
}
