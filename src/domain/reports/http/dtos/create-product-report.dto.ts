import { IsUUID } from 'class-validator';
import { CreateReportBaseDto } from './create-report-base.dto';

export class CreateProductReportDto extends CreateReportBaseDto {
  @IsUUID(4, { message: 'ID do produto é inválido' })
    productId!: string;
}
