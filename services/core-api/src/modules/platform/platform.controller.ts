import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlatformService } from './platform.service';
import { EntitlementService } from '../entitlement/entitlement.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { CreatePlanDto } from './dto/plan.dto';
import { SetTenantOverrideDto } from './dto/override.dto';
import { FeatureKey, UsageMetricKey } from '@cole/domain-types';

@ApiTags('Platform Super Admin')
@Controller('platform')
export class PlatformController {
  constructor(
    private readonly platformService: PlatformService,
    private readonly entitlementService: EntitlementService
  ) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get global SaaS platform KPI metrics and executive dashboard overview' })
  getPlatformMetrics() {
    return this.platformService.getPlatformMetrics();
  }

  // --------------------------------------------------
  // TENANTS
  // --------------------------------------------------

  @Post('tenants')
  @ApiOperation({ summary: 'Provision a new school tenant with default subscription' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  createTenant(@Body() dto: CreateTenantDto) {
    return this.platformService.createTenant(dto);
  }

  @Get('tenants')
  @ApiOperation({ summary: 'List all registered school tenants' })
  getTenants() {
    return this.platformService.getTenants();
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Get detailed information, plan and usage of a specific tenant' })
  getTenantById(@Param('id') id: string) {
    return this.platformService.getTenantById(id);
  }

  @Patch('tenants/:id')
  @ApiOperation({ summary: 'Update tenant status, plan or custom domain' })
  updateTenant(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.platformService.updateTenant(id, dto);
  }

  // --------------------------------------------------
  // PLANS CATALOG
  // --------------------------------------------------

  @Post('plans')
  @ApiOperation({ summary: 'Create a new commercial plan tier with features and limits' })
  createPlan(@Body() dto: CreatePlanDto) {
    return this.platformService.createPlan(dto);
  }

  @Get('plans')
  @ApiOperation({ summary: 'List available commercial subscription plans' })
  getPlans() {
    return this.platformService.getPlans();
  }

  // --------------------------------------------------
  // ENTITLEMENT ENGINE & OVERRIDES
  // --------------------------------------------------

  @Post('tenants/:id/overrides')
  @ApiOperation({ summary: 'Set custom feature or limit overrides for a school tenant' })
  setTenantOverride(@Param('id') id: string, @Body() dto: SetTenantOverrideDto) {
    return this.platformService.setTenantOverride(id, dto);
  }

  @Get('tenants/:id/entitlements/check')
  @ApiOperation({ summary: 'Evaluate entitlement access and quotas for a given tenant' })
  @ApiQuery({ name: 'feature', required: false })
  @ApiQuery({ name: 'metric', required: false })
  async checkEntitlement(
    @Param('id') id: string,
    @Query('feature') feature?: FeatureKey,
    @Query('metric') metric?: UsageMetricKey
  ) {
    if (feature) {
      return await this.entitlementService.canAccess(id, feature);
    }
    if (metric) {
      return await this.entitlementService.checkUsage(id, metric, 1);
    }
    return {
      status: 'Specify ?feature=... or ?metric=... to test entitlement evaluation',
    };
  }
}
