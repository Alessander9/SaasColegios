import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { db, withTransactionAndOutbox, TenantStatus } from '@cole/database';
import { DomainEvent } from '@cole/domain-types';
import { v4 as uuidv4 } from 'uuid';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { CreatePlanDto } from './dto/plan.dto';
import { SetTenantOverrideDto } from './dto/override.dto';
import { EntitlementService } from '../entitlement/entitlement.service';

@Injectable()
export class PlatformService {
  constructor(private entitlementService: EntitlementService) {}

  // --------------------------------------------------
  // TENANTS CRUD & MANAGEMENT
  // --------------------------------------------------

  async createTenant(dto: CreateTenantDto): Promise<any> {
    const existingSlug = await db.tenant.findFirst({
      where: {
        OR: [{ slug: dto.slug }, { subdomain: dto.subdomain }],
      },
    });

    if (existingSlug) {
      throw new ConflictException('Slug or Subdomain already in use by another tenant');
    }

    const plan = await db.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${dto.planId} not found`);
    }

    const tenantId = uuidv4();

    const tenantCreatedEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'TenantCreated.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: tenantId,
      version: 1,
      payload: {
        slug: dto.slug,
        name: dto.name,
        subdomain: dto.subdomain,
        planId: dto.planId,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [tenantCreatedEvent], async (tx) => {
      const tenant = await (tx as typeof db).tenant.create({
        data: {
          id: tenantId,
          slug: dto.slug,
          name: dto.name,
          subdomain: dto.subdomain,
          customDomain: dto.customDomain,
          status: dto.status || TenantStatus.ACTIVE,
          planId: dto.planId,
        },
        include: { plan: true },
      });

      // Automatically create the initial default subscription
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await (tx as typeof db).subscription.create({
        data: {
          id: uuidv4(),
          tenantId: tenant.id,
          planId: tenant.planId,
          status: 'ACTIVE',
          billingCycle: 'MONTHLY',
          currentPeriodStart: now,
          currentPeriodEnd: nextMonth,
        },
      });

      return tenant;
    });
  }

  async getTenants(): Promise<any[]> {
    return await db.tenant.findMany({
      include: {
        plan: true,
        subscriptions: true,
        usageMetrics: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTenantById(id: string): Promise<any> {
    const tenant = await db.tenant.findUnique({
      where: { id },
      include: {
        plan: true,
        subscriptions: { include: { addOns: { include: { addOn: true } } } },
        overrides: true,
        usageMetrics: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async updateTenant(id: string, dto: UpdateTenantDto): Promise<any> {
    await this.getTenantById(id);

    const updated = await db.tenant.update({
      where: { id },
      data: {
        name: dto.name,
        customDomain: dto.customDomain,
        status: dto.status,
        planId: dto.planId,
      },
      include: { plan: true },
    });

    this.entitlementService.invalidate(id);
    return updated;
  }

  // --------------------------------------------------
  // COMMERCIAL PLANS CATALOG
  // --------------------------------------------------

  async createPlan(dto: CreatePlanDto): Promise<any> {
    const existing = await db.plan.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Plan with code ${dto.code} already exists`);
    }

    return await db.plan.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        maxStudents: dto.maxStudents,
        maxTeachers: dto.maxTeachers,
        maxStorageGb: dto.maxStorageGb,
        features: dto.features,
        monthlyPrice: dto.monthlyPrice,
        annualPrice: dto.annualPrice,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async getPlans(): Promise<any[]> {
    return await db.plan.findMany({
      orderBy: { monthlyPrice: 'asc' },
    });
  }

  // --------------------------------------------------
  // TENANT OVERRIDES
  // --------------------------------------------------

  async setTenantOverride(tenantId: string, dto: SetTenantOverrideDto): Promise<any> {
    await this.getTenantById(tenantId);

    const override = await db.tenantOverride.create({
      data: {
        tenantId,
        featureKey: dto.featureKey,
        enabled: dto.enabled,
        metricKey: dto.metricKey,
        limitValue: dto.limitValue,
        reason: dto.reason,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    this.entitlementService.invalidate(tenantId);
    return override;
  }

  // --------------------------------------------------
  // PLATFORM EXECUTIVE METRICS & DASHBOARD
  // --------------------------------------------------

  async getPlatformMetrics() {
    const totalTenants = await db.tenant.count();
    const activeTenants = await db.tenant.count({ where: { status: TenantStatus.ACTIVE } });
    const trialTenants = await db.tenant.count({ where: { status: TenantStatus.TRIAL } });
    const suspendedTenants = await db.tenant.count({ where: { status: TenantStatus.SUSPENDED } });

    const totalStudentsUsage = await db.tenantUsage.aggregate({
      where: { metricKey: 'students', periodKey: 'current' },
      _sum: { value: true },
    });

    const activePlans = await db.plan.count({ where: { isActive: true } });

    return {
      tenants: {
        total: totalTenants,
        active: activeTenants,
        trial: trialTenants,
        suspended: suspendedTenants,
      },
      usage: {
        totalStudentsActive: totalStudentsUsage._sum.value || 0,
      },
      catalog: {
        activePlans,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
