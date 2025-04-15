import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    //extrai diretamente o parâmetro da query
    const roleFromQuery = request.query.role as string;

    //Simulação de usuário autenticado com role da query (REMOVER QUANDO TIVERMOS O JWT)
    request.user = {
      id: 'fake-id',
      role: roleFromQuery?.toUpperCase() as Role || Role.USER,
    };

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Usuário não autenticado ou sem papel definido');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException('Você não tem permissão para acessar essa rota');
    }

    return true;
  }
}
