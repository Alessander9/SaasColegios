import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = [
  {
    name: 'global',
    ttl: 60_000, // 1 minute window
    limit: 100,  // 100 requests per minute globally
  },
  {
    name: 'auth',
    ttl: 60_000, // 1 minute window
    limit: 10,   // 10 auth attempts per minute (login, register, password reset)
  },
  {
    name: 'write',
    ttl: 60_000, // 1 minute window
    limit: 30,   // 30 write operations per minute (POST, PUT, PATCH, DELETE)
  },
];
