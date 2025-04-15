import { Controller, Get, UseGuards, Req} from "@nestjs/common";
import { TestService }  from "./test.service";
import { RolesGuard } from "@/shared/roles/roles.guard";
import { Roles } from "@/shared/roles/roles.decorator";
import { Role } from "@prisma/client";

@Controller("test")
@UseGuards(RolesGuard)
export class TestController {
    constructor(private readonly testService: TestService) {}

    @Get()
    getLivre(): string {
        return this.testService.getLivre();
    }

    @Get("admin")
    @Roles(Role.ADMIN)
    getAdmin(): string {
        return this.testService.getAdmin();
    }

    @Get("artisan")
    @Roles(Role.ARTISAN, Role.ADMIN)
    getArtisan(): string {
        return this.testService.getArtisan();
    }

    @Get("misto")
    @Roles(Role.ARTISAN, Role.USER)
    getMisto(): string {
        return this.testService.getMisto();
    }

}