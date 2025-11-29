import { IsString, IsStrongPassword } from 'class-validator';

export class ResetUserPasswordDto {
    @IsString({ message: 'Senha deve ser um texto' })
      @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }, {
        message: 'Senha deve ter pelo menos 8 caracteres, incluindo: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
      })
      password: string;
}
