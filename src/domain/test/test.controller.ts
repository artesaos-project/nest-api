import {
  Controller, Get, UseGuards,
} from '@nestjs/common';
import { TestService } from './test.service';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../_shared/auth/jwt/jwt-auth.guard';
import { Public } from '../_shared/auth/decorators/public.decorator';
import { CurrentUser } from '../_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '../_shared/auth/jwt/jwt.strategy';
import { UserRole } from '../identity/core/entities/user.entity';

@Controller('test')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  @Public()
  getLivre(): string {
    return this.testService.getLivre();
  }

  @Get('me')
  getMe(@CurrentUser() user: UserPayload) {
    return {
      id: user.sub,
      roles: user.roles,
    };
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  getAdmin() {
    return this.testService.getAdmin();
  }

  @Get('artisan')
  @Roles(UserRole.ARTISAN, UserRole.ADMIN)
  getArtisan(): string {
    return this.testService.getArtisan();
  }

  @Get('mix')
  @Roles(UserRole.ARTISAN)
  getMix(): string {
    return this.testService.getMisto();
  }
}
