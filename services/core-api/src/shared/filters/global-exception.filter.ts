import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StructuredLogger } from '@cole/logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new StructuredLogger('core-api');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request as any).correlationId || (request.headers['x-correlation-id'] as string);
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = typeof res === 'string' ? res : res.message || message;
      code = typeof res === 'object' && res.error ? res.error : `HTTP_${status}`;
      details = typeof res === 'object' && res.details ? res.details : undefined;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(`Exception caught: ${message}`, exception instanceof Error ? exception : undefined, {
      correlationId,
      tenantId,
      path: request.url,
      method: request.method,
      statusCode: status,
    });

    response.status(status).json({
      statusCode: status,
      code,
      message,
      details,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
