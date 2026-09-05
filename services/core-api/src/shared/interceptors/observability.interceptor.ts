import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { StructuredLogger } from '@cole/logger';

@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
  private logger = new StructuredLogger('core-api');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    // Propagate or generate correlationId
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
    const tenantId = (req.headers['x-tenant-id'] as string) || req.user?.tenantId;
    const userId = req.user?.id;

    req.correlationId = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);

    const startTime = Date.now();
    const { method, url } = req;

    this.logger.info(`HTTP Request started: ${method} ${url}`, {
      correlationId,
      tenantId,
      userId,
      method,
      url,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.info(`HTTP Request finished: ${method} ${url} [${res.statusCode}] - ${duration}ms`, {
            correlationId,
            tenantId,
            userId,
            duration,
            statusCode: res.statusCode,
          });
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          this.logger.error(`HTTP Request failed: ${method} ${url} - ${duration}ms`, err, {
            correlationId,
            tenantId,
            userId,
            duration,
          });
        },
      })
    );
  }
}
