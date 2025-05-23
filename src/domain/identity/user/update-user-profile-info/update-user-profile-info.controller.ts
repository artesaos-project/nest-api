import {
  Body,
  Controller, ForbiddenException, Param, Put,
} from '@nestjs/common';
import { CurrentUser } from '@/domain/auth/current-user.decorator';
import { UserPayload } from '@/domain/auth/jwt.strategy';
import { UpdateUserProfileInfoService } from './update-user-profile-info.service';
import { UpdateUserProfileInfoDto } from './update-user-profile-infor.dto';

@Controller('users/:id')
export class UpdateUserProfileInfoController {
  constructor(
    private readonly updateUserProfileInfo: UpdateUserProfileInfoService,
  ) {}

  @Put()
  async handle(
    @CurrentUser() userId: UserPayload,
    @Param('id') id: string,
    @Body() body: UpdateUserProfileInfoDto,
  ) {
    if (userId.sub !== id) {
      throw new ForbiddenException('You cannot edit another person\'s profile');
    }

    await this.updateUserProfileInfo.execute({ ...body, userId: userId.sub });
  }
}
