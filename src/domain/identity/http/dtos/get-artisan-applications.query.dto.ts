import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApplicationType, ArtisanApplicationStatus } from '../../core/entities/artisan-application.entity'; 

export class GetArtisanApplicationsQueryDto {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
    @IsEnum(ApplicationType, {message: 'type must be BE_ARTISAN or DISABLE_PROFILE'})
    type?: ApplicationType;

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
    @IsEnum(ArtisanApplicationStatus, {message: 'status must be PENDING, APPROVED, or REJECTED'})
    status?: ArtisanApplicationStatus;
}