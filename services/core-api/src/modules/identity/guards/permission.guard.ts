import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators/auth.decorators';
import { PermissionKey, AuthenticatedUser } from '@cole/domain-types';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionKey[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions && !requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      throw new ForbiddenException('User context is not authenticated');
    }

    // Super Admin bypasses role & permission restrictions
    if (user.isSuperAdmin) {
      return true;
    }

    // Check roles
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = user.roles.some((r) => requiredRoles.includes(r));
      if (!hasRole) {
        throw new ForbiddenException(`Missing required role: ${requiredRoles.join(', ')}`);
      }
    }

    // Check permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = new Set(user.permissions || []);
      const hasAllPermissions = requiredPermissions.every((p) => userPermissions.has(p));
      if (!hasAllPermissions) {
        throw new ForbiddenException(
          `Missing required permission: ${requiredPermissions.join(', ')}`
        );
      }
    }

    return true;
  }
}
