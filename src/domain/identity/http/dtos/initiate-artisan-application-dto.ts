import { IsBoolean } from 'class-validator';

export class InitiateArtisanApplicationDto {
  @IsBoolean({
    message: 'Campo "wantsToCompleteNow" deve ser um booleano (true/false)',
  })
    wantsToCompleteNow: boolean;
}
