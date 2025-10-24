import { IsUUID } from 'class-validator';
import { CreateReportBaseDto } from './create-report-base.dto';

export class CreateUserReportDto extends CreateReportBaseDto {
  @IsUUID()
    reportedUserId!: string;
}
