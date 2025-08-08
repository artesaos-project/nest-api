import {
  IsString, IsNotEmpty, IsOptional, IsIn,
} from 'class-validator';
import { ArtisanApplicationStatus } from '../../core/entities/artisan-application.entity';

export class ReviewDisableArtisanDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([ArtisanApplicationStatus.APPROVED, ArtisanApplicationStatus.REJECTED])
    status: ArtisanApplicationStatus.APPROVED | ArtisanApplicationStatus.REJECTED;

  @IsString()
  @IsOptional()
    rejectionReason?: string;
}
