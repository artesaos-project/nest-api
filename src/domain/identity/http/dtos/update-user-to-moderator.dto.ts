import { IsUUID } from 'class-validator';

export class UpdateUserToModeratorDto {
  @IsUUID()
    id: string;
}
