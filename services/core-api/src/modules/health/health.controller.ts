import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { db } from '@cole/database';
import { StructuredLogger } from '@cole/logger';

@ApiTags('System')
@Controller('health')
export class HealthController {
  private logger = new StructuredLogger('health-controller');

  @Get()
  @ApiOperation({ summary: 'Liveness probe — is the service running?' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  check() {
    return {
      status: 'ok',
      service: 'cole-core-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — is the service ready to accept traffic?' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async readiness() {
    const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

    // Database connectivity check
    const dbStart = Date.now();
    try {
      await db.$queryRaw`SELECT 1`;
      checks.database = {
        status: 'ok',
        latencyMs: Date.now() - dbStart,
      };
    } catch (err: any) {
      checks.database = {
        status: 'error',
        latencyMs: Date.now() - dbStart,
        error: err.message || 'Connection failed',
      };
    }

    const allHealthy = Object.values(checks).every((c) => c.status === 'ok');

    if (!allHealthy) {
      this.logger.warn('Readiness check failed', { checks });
    }

    return {
      status: allHealthy ? 'ok' : 'degraded',
      service: 'cole-core-api',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'Service metadata and build information' })
  info() {
    return {
      service: 'cole-core-api',
      version: process.env.npm_package_version || '0.1.0',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
