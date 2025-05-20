import { IsNotEmpty, IsString } from 'class-validator';

export class CreateArtisanApplicationDto {
  @IsString()
  @IsNotEmpty()
    rawMaterial: string;

  @IsString()
  @IsNotEmpty()
    technique: string;

  @IsString()
  @IsNotEmpty()
    finalityClassification: string;

  @IsString()
  @IsNotEmpty()
    sicab: string;

  @IsNotEmpty()
    sicabRegistrationDate: string;

  @IsNotEmpty()
    sicabValidUntil: string;
}
