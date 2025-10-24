import {
  IsBooleanString, IsIn, IsOptional, IsUUID,
} from 'class-validator';

export class ListReportsQueryDto {
  @IsOptional()
  @IsBooleanString()
    isSolved?: string;

  @IsOptional()
  @IsUUID()
    reporterId?: string;

  @IsOptional()
  @IsIn(['product', 'comment', 'user'])
    targetType?: 'product' | 'comment' | 'user';

  @IsOptional()
    take?: number;

  @IsOptional()
    skip?: number;
}
