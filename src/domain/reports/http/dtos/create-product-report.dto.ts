import { IsUUID } from 'class-validator';
import { CreateReportBaseDto } from './create-report-base.dto';

export class CreateProductReportDto extends CreateReportBaseDto {
  @IsUUID()
    productId!: string;
}
