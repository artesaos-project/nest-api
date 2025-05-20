import {
  IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches,
} from 'class-validator';

export class UpdatePersonalProfileDataDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S+(?:\s+\S+)+$/, {
    message: 'name must be the full name',
  })
    newName?: string;

  @IsOptional()
  @IsString()
    newSocialName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
    newPhone?: string;
}
