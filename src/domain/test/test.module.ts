import { Module } from "@nestjs/common";
import { TestController } from "./test.controller";
import { TestService } from "./test.service";   
import { RolesGuard } from "@/shared/roles/roles.guard";
import { APP_GUARD } from "@nestjs/core";

@Module({
  controllers: [TestController],
  providers: [{
    provide: APP_GUARD,
    useClass: RolesGuard,
  }, TestService],
  exports: [TestService],
})
export class TestModule {}