import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { ObservabilityInterceptor } from './shared/interceptors/observability.interceptor';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { logger } from '@cole/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ---------------------------------------------------------------
  // SECURITY: Rate Limiting (Throttler)
  // ---------------------------------------------------------------
  // Global rate limit: 100 req/min per IP
  // Auth endpoints: 10 req/min per IP
  // Write operations: 30 req/min per IP
  // Rate limit: higher in development/test to avoid 429s during test suites
  const isDev = process.env.NODE_ENV !== 'production';
  app.use(
    require('express-rate-limit')({
      windowMs: 60 * 1000, // 1 minute
      max: isDev ? 1000 : 100, // 1000 in dev/test, 100 in production
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        statusCode: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
    }),
  );

  // ---------------------------------------------------------------
  // SECURITY: Helmet (Security Headers)
  // ---------------------------------------------------------------
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Swagger UI
    crossOriginEmbedderPolicy: false,
  }));

  // ---------------------------------------------------------------
  // PERFORMANCE: Response Compression (gzip)
  // ---------------------------------------------------------------
  app.use(compression({
    level: 6,           // Balanced speed/compression ratio
    threshold: 1024,    // Only compress responses > 1KB
  }));

  // ---------------------------------------------------------------
  // CORS Configuration
  // ---------------------------------------------------------------
  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Correlation-Id', 'Idempotency-Key'],
    credentials: true,
    maxAge: 86400, // 24 hours preflight cache
  });

  // ---------------------------------------------------------------
  // API Prefix & Validation
  // ---------------------------------------------------------------
  app.setGlobalPrefix('api/v1');

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new ObservabilityInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // ---------------------------------------------------------------
  // Graceful Shutdown
  // ---------------------------------------------------------------
  app.enableShutdownHooks();

  // ---------------------------------------------------------------
  // OpenAPI / Swagger Documentation
  // ---------------------------------------------------------------
  const config = new DocumentBuilder()
    .setTitle('Cole Educational SaaS Platform API')
    .setDescription('Multi-tenant Modular School Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' }, 'TenantId')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // ---------------------------------------------------------------
  // Start Server
  // ---------------------------------------------------------------
  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.info(`Core API service running on http://localhost:${port}/api/v1 (Docs at /docs)`, {
    port,
    nodeEnv: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });

  // Log startup metrics
  const mem = process.memoryUsage();
  logger.info(`Startup memory usage`, {
    rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
  });
}

bootstrap();
