import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { db } from '@cole/database';
import * as bcrypt from 'bcryptjs';

jest.mock('@cole/database', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    membership: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
  withTransactionAndOutbox: jest.fn(async (_db, _tenantId, _events, callback) => {
    return await callback(db);
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService = new JwtService({ secret: 'test-secret' });
    service = new AuthService(jwtService);
  });

  it('should authenticate user and resolve tenant memberships & permissions', async () => {
    const passwordHash = await bcrypt.hash('secret123', 10);

    (db.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'profesor@sanjose.edu.pe',
      passwordHash,
      firstName: 'Juan',
      lastName: 'Pérez',
      isActive: true,
      isSuperAdmin: false,
      memberships: [
        {
          tenantId: 'tenant-sanjose',
          roles: ['TEACHER'],
          tenant: { name: 'Colegio San José' },
        },
      ],
    });

    const result = await service.login({
      email: 'profesor@sanjose.edu.pe',
      password: 'secret123',
    });

    expect(result.accessToken).toBeDefined();
    expect(result.user.email).toBe('profesor@sanjose.edu.pe');
    expect(result.user.tenantId).toBe('tenant-sanjose');
    expect(result.user.roles).toContain('TEACHER');
    expect(result.user.permissions).toContain('academic.grades.input');
  });

  it('should throw UnauthorizedException on invalid password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);

    (db.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'profesor@sanjose.edu.pe',
      passwordHash,
      isActive: true,
      memberships: [],
    });

    await expect(
      service.login({
        email: 'profesor@sanjose.edu.pe',
        password: 'wrong-password',
      })
    ).rejects.toThrow('Invalid credentials');
  });
});
