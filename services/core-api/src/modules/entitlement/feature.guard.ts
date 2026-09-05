import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from './decorators/require-feature.decorator';
import { EntitlementService } from './entitlement.service';
import { FeatureKey } from '@cole/domain-types';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private entitlementService: EntitlementService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<FeatureKey>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId || (request.headers['x-tenant-id'] as string) || request.user?.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required to access feature-gated resources');
    }

    const check = await this.entitlementService.canAccess(tenantId, requiredFeature);

    if (!check.allowed) {
      if (check.reason === 'TENANT_SUSPENDED') {
        throw new ForbiddenException('School tenant is suspended. Please contact platform support.');
      }
      throw new ForbiddenException(
        `Feature '${requiredFeature}' is not included in the current subscription plan for this school.`
      );
    }

    return true;
  }
}
