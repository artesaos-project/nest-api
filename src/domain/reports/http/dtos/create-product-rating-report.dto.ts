import { IsUUID } from 'class-validator';
import { CreateReportBaseDto } from './create-report-base.dto';

export class CreateProductRatingDto extends CreateReportBaseDto {
  @IsUUID(4, { message: 'ID da avaliação é inválido' })
    productRatingId!: string;
}
