import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';

@Module({
  controllers: [TestController],
  providers: [{
    provide: APP_GUARD,
    useClass: RolesGuard,
  }, TestService],
  exports: [TestService],
})
export class TestModule {}
