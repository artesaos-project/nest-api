import {
  IsString, IsNotEmpty, IsIn,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ArtisanApplicationStatus } from '../../core/entities/artisan-application.entity';

export const REVIEWED_STATUSES = [
  ArtisanApplicationStatus.APPROVED,
  ArtisanApplicationStatus.REJECTED,
] as const;
export type ReviewStatus = (typeof REVIEWED_STATUSES)[number];

export class ReviewDisableArtisanDto {
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsIn(REVIEWED_STATUSES, { message: 'status must be PENDING, APPROVED or REJECTED' })
    status: ReviewStatus;

  @ValidateIf((o) => o.status === ArtisanApplicationStatus.REJECTED)
  @IsString()
  @IsNotEmpty({ message: 'rejectionReason is required when status is REJECTED' })
    rejectionReason?: string;
}
