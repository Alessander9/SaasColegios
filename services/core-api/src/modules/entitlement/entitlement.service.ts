import { Injectable } from '@nestjs/common';
import { db, TenantStatus, SubscriptionStatus } from '@cole/database';
import {
  FeatureKey,
  UsageMetricKey,
  EntitlementCheckResult,
} from '@cole/domain-types';
import { StructuredLogger } from '@cole/logger';

export interface EntitlementCacheEntry {
  tenantStatus: TenantStatus;
  planFeatures: string[];
  limits: Record<string, number>;
  featureOverrides: Record<string, boolean>;
  limitOverrides: Record<string, number>;
  cachedAt: number;
}

@Injectable()
export class EntitlementService {
  private logger = new StructuredLogger('entitlement-engine');
  private cache = new Map<string, EntitlementCacheEntry>();
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute local memory TTL

  public invalidate(tenantId: string): void {
    this.cache.delete(tenantId);
    this.logger.info(`Entitlement cache invalidated for tenant: ${tenantId}`, { tenantId });
  }

  private async getTenantEntitlementData(tenantId: string): Promise<EntitlementCacheEntry | null> {
    const cached = this.cache.get(tenantId);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached;
    }

    // Load tenant with plan, active subscriptions, add-ons and overrides
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: {
        plan: true,
        subscriptions: {
          where: { status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } },
          include: {
            addOns: {
              include: { addOn: true },
            },
          },
        },
        overrides: true,
      },
    });

    if (!tenant) {
      return null;
    }

    const planFeatures: string[] = Array.isArray(tenant.plan.features)
      ? (tenant.plan.features as string[])
      : [];

    const limits: Record<string, number> = {
      students: tenant.plan.maxStudents,
      teachers: tenant.plan.maxTeachers,
      storage_gb: tenant.plan.maxStorageGb,
    };

    // Aggregate add-ons across active subscriptions
    for (const sub of tenant.subscriptions) {
      for (const subAddOn of sub.addOns) {
        if (subAddOn.addOn.featureKey) {
          planFeatures.push(subAddOn.addOn.featureKey);
        }
        if (subAddOn.addOn.metricKey && subAddOn.addOn.extraUnits > 0) {
          limits[subAddOn.addOn.metricKey] =
            (limits[subAddOn.addOn.metricKey] || 0) + subAddOn.addOn.extraUnits * subAddOn.quantity;
        }
      }
    }

    // Parse overrides
    const now = new Date();
    const featureOverrides: Record<string, boolean> = {};
    const limitOverrides: Record<string, number> = {};

    for (const ov of tenant.overrides) {
      if (ov.expiresAt && ov.expiresAt < now) continue;

      if (ov.featureKey && ov.enabled !== null && ov.enabled !== undefined) {
        featureOverrides[ov.featureKey] = ov.enabled;
      }
      if (ov.metricKey && ov.limitValue !== null && ov.limitValue !== undefined) {
        limitOverrides[ov.metricKey] = ov.limitValue;
      }
    }

    const entry: EntitlementCacheEntry = {
      tenantStatus: tenant.status,
      planFeatures,
      limits,
      featureOverrides,
      limitOverrides,
      cachedAt: Date.now(),
    };

    this.cache.set(tenantId, entry);
    return entry;
  }

  public async canAccess(tenantId: string, feature: FeatureKey): Promise<EntitlementCheckResult> {
    const data = await this.getTenantEntitlementData(tenantId);

    if (!data) {
      return { allowed: false, reason: 'FEATURE_NOT_INCLUDED' };
    }

    if (data.tenantStatus === TenantStatus.SUSPENDED || data.tenantStatus === TenantStatus.ARCHIVED) {
      return { allowed: false, reason: 'TENANT_SUSPENDED' };
    }

    // 1. Check specific feature override
    if (data.featureOverrides[feature] !== undefined) {
      const isExplicitlyEnabled = data.featureOverrides[feature];
      return {
        allowed: isExplicitlyEnabled,
        reason: isExplicitlyEnabled ? undefined : 'FEATURE_NOT_INCLUDED',
      };
    }

    // 2. Check plan + add-on features
    const hasFeature = data.planFeatures.includes(feature);
    if (!hasFeature) {
      return { allowed: false, reason: 'FEATURE_NOT_INCLUDED' };
    }

    return { allowed: true };
  }

  public async checkUsage(
    tenantId: string,
    metric: UsageMetricKey,
    requestedDelta = 1
  ): Promise<EntitlementCheckResult> {
    const data = await this.getTenantEntitlementData(tenantId);

    if (!data) {
      return { allowed: false, reason: 'FEATURE_NOT_INCLUDED' };
    }

    if (data.tenantStatus === TenantStatus.SUSPENDED || data.tenantStatus === TenantStatus.ARCHIVED) {
      return { allowed: false, reason: 'TENANT_SUSPENDED' };
    }

    // Effective limit calculation (override takes precedence over base + add-ons)
    const effectiveLimit =
      data.limitOverrides[metric] !== undefined
        ? data.limitOverrides[metric]
        : data.limits[metric] || 0;

    // Get current usage from DB
    const usageRecord = await db.tenantUsage.findUnique({
      where: {
        tenantId_metricKey_periodKey: {
          tenantId,
          metricKey: metric,
          periodKey: 'current',
        },
      },
    });

    const currentUsage = usageRecord ? usageRecord.value : 0;

    if (currentUsage + requestedDelta > effectiveLimit) {
      return {
        allowed: false,
        reason: 'LIMIT_REACHED',
        metric,
        current: currentUsage,
        limit: effectiveLimit,
      };
    }

    return {
      allowed: true,
      metric,
      current: currentUsage,
      limit: effectiveLimit,
    };
  }

  public async recordUsage(
    tenantId: string,
    metric: UsageMetricKey,
    delta: number
  ): Promise<number> {
    const record = await db.tenantUsage.upsert({
      where: {
        tenantId_metricKey_periodKey: {
          tenantId,
          metricKey: metric,
          periodKey: 'current',
        },
      },
      update: {
        value: { increment: delta },
      },
      create: {
        tenantId,
        metricKey: metric,
        periodKey: 'current',
        value: Math.max(0, delta),
      },
    });

    return record.value;
  }
}
