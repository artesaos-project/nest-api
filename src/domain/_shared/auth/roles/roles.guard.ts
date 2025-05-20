import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@/domain/identity/core/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!requiredRoles) return true;

    if (!user || !user.roles || !Array.isArray(user.roles)) {
      throw new UnauthorizedException('User not authenticated or without defined role');
    }

    const hasRole = user.roles.some((role: UserRole) => requiredRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to access this route');
    }

    return true;
  }
}
