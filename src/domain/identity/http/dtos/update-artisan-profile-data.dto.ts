import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsPhoneNumber,
  Matches,
  IsBoolean,
  IsDateString,
} from "class-validator";

export class UpdateArtisanProfileDataDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S+(?:\s+\S+)+$/, {
    message: "userName must be the full name",
  })
  userName?: string;

  @IsOptional()
  @IsString()
  rawMaterial?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  artisticName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  artType?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  technique?: string;

  @IsOptional()
  @IsString()
  finalityClassification?: string;

  @IsOptional()
  @IsString()
  sicab?: string;

  @IsOptional()
  @IsDateString()
  sicabRegistrationDate?: Date;

  @IsOptional()
  @IsDateString()
  sicabValidUntil?: Date;

  @IsOptional()
  @IsBoolean()
  isDisabled?: boolean;
}
