import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { db } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    $queryRaw: jest.fn(),
  },
}));

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /health (liveness)', () => {
    it('should return health status with uptime and memory', () => {
      const result = controller.check();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('cole-core-api');
      expect(typeof result.uptime).toBe('number');
      expect(result.memory).toBeDefined();
      expect(typeof result.memory.rss).toBe('number');
      expect(typeof result.memory.heapUsed).toBe('number');
    });
  });

  describe('GET /health/ready (readiness)', () => {
    it('should return ok when database is reachable', async () => {
      (db.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.readiness();
      expect(result.status).toBe('ok');
      expect(result.checks.database.status).toBe('ok');
      expect(result.checks.database.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should return degraded when database is unreachable', async () => {
      (db.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection refused'));

      const result = await controller.readiness();
      expect(result.status).toBe('degraded');
      expect(result.checks.database.status).toBe('error');
      expect(result.checks.database.error).toBe('Connection refused');
    });
  });

  describe('GET /health/info', () => {
    it('should return service metadata', () => {
      const result = controller.info();
      expect(result.service).toBe('cole-core-api');
      expect(result.nodeVersion).toBeDefined();
      expect(result.environment).toBeDefined();
    });
  });
});
