import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorators';
import { AuthenticatedUser } from '@cole/domain-types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload: AuthenticatedUser = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'cole-platform-super-secret-jwt-key-change-in-prod',
      });

      // Tenant context resolution
      // If user provided an x-tenant-id header, super admins can switch context; regular users must match their membership
      const requestedTenantId = request.headers['x-tenant-id'] as string;
      if (requestedTenantId) {
        if (payload.isSuperAdmin) {
          payload.tenantId = requestedTenantId;
        } else if (payload.tenantId && payload.tenantId !== requestedTenantId) {
          throw new UnauthorizedException('Cross-tenant data access is strictly forbidden');
        }
      }

      request.user = payload;
      request.tenantId = payload.tenantId;
      return true;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
