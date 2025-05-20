import { IsUUID } from 'class-validator';

export class DeactivateUserDto {
  @IsUUID()
    userId: string;
}
