export interface LogContext {
  tenantId?: string;
  correlationId?: string;
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface StructuredLogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  tenantId?: string;
  correlationId?: string;
  userId?: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class StructuredLogger {
  private serviceName: string;
  private defaultContext: LogContext;

  constructor(serviceName = 'core-api', defaultContext: LogContext = {}) {
    this.serviceName = serviceName;
    this.defaultContext = defaultContext;
  }

  public child(context: LogContext): StructuredLogger {
    return new StructuredLogger(this.serviceName, {
      ...this.defaultContext,
      ...context,
    });
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const combinedContext = {
      ...this.defaultContext,
      ...context,
    };

    const tenantId = combinedContext.tenantId;
    const correlationId = combinedContext.correlationId;
    const userId = combinedContext.userId;

    delete combinedContext.tenantId;
    delete combinedContext.correlationId;
    delete combinedContext.userId;

    const payload: StructuredLogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      tenantId,
      correlationId,
      userId,
      context: Object.keys(combinedContext).length > 0 ? combinedContext : undefined,
    };

    if (error) {
      payload.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Output strictly as JSON for log aggregators (Datadog, Loki, CloudWatch)
    const jsonStr = JSON.stringify(payload);
    if (level === 'error') {
      console.error(jsonStr);
    } else if (level === 'warn') {
      console.warn(jsonStr);
    } else {
      console.log(jsonStr);
    }
  }

  public debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  public warn(message: string, context?: LogContext, error?: Error): void {
    this.log('warn', message, context, error);
  }

  public error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }
}

export const logger = new StructuredLogger();
