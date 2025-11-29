import {
  IsEnum, IsString, ValidateIf,
} from 'class-validator';

export enum ModerationStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ModerateArtisanApplicationDto {
  @IsEnum(ModerationStatus, {
    message: 'Status deve ser APPROVED ou REJECTED',
  })
    status: ModerationStatus;

  @ValidateIf((o) => o.status === ModerationStatus.REJECTED)
  @IsString({
    message: 'Motivo da rejeição deve ser um texto',
  })
    rejectionReason?: string;
}
