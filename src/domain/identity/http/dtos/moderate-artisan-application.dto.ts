import {
  IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import { ArtisanApplicationStatus } from '../../core/entities/artisan-application.entity';

export class ModerateArtisanApplicationDto {
  @IsString()
  @IsNotEmpty()
    status: ArtisanApplicationStatus.APPROVED | ArtisanApplicationStatus.REJECTED;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
    rejectionReason?: string;
}
