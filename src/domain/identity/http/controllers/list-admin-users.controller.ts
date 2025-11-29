import {
  Controller,
  Get,
  Query,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { ListAdminUsersDto } from '../dtos/list-admin-users.dto';
import { ListAdminUsersUseCase } from '../../core/use-cases/list-admin-users.use-case';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListAdminUsersController {
  constructor(
    private readonly listAdminUsersUseCase: ListAdminUsersUseCase,
  ) {}

  @Get()
  @Roles(PrismaRoles.ADMIN, PrismaRoles.MODERATOR)
  async handle(
    @Query() query: ListAdminUsersDto,
  ) {
    const result = await this.listAdminUsersUseCase.execute({
      page: query.page,
      limit: query.limit,
    });

    if (result.isLeft()) {
      const error = result.value;

      throw new InternalServerErrorException(
        error.message || 'Erro interno ao listar usuários',
      );
    }

    return {
      data: result.value.users,
      pagination: result.value.pagination,
    };
  }
}
