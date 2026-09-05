import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { db, withTransactionAndOutbox } from '@cole/database';
import { AuthenticatedUser, DomainEvent } from '@cole/domain-types';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterUserDto, LoginDto, ImpersonateDto } from './dto/auth.dto';
import { getPermissionsForRoles } from './rbac/role-permissions.map';
import { StructuredLogger } from '@cole/logger';

@Injectable()
export class AuthService {
  private logger = new StructuredLogger('auth-service');

  constructor(private jwtService: JwtService) {}

  async register(dto: RegisterUserDto): Promise<any> {
    if (!dto || !dto.email || typeof dto.email !== 'string' || !dto.email.trim()) {
      throw new BadRequestException('A valid email address is required');
    }
    const cleanEmail = dto.email.trim().toLowerCase();
    const existing = await db.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      throw new ConflictException('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);
    const userId = uuidv4();

    const userCreatedEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'UserCreated.v1',
      occurredAt: new Date().toISOString(),
      tenantId: dto.tenantId || 'global',
      aggregateId: userId,
      version: 1,
      payload: {
        email: cleanEmail,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    };

    return await withTransactionAndOutbox(db, dto.tenantId || 'global', [userCreatedEvent], async (tx) => {
      const user = await (tx as typeof db).user.create({
        data: {
          id: userId,
          email: cleanEmail,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          isActive: true,
          isSuperAdmin: false,
        },
      });

      if (dto.tenantId) {
        await (tx as typeof db).membership.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            tenantId: dto.tenantId,
            roles: dto.roles || ['STUDENT'],
          },
        });
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    });
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: AuthenticatedUser }> {
    if (!dto || !dto.email || typeof dto.email !== 'string' || !dto.email.trim()) {
      throw new BadRequestException('A valid email address is required');
    }
    const cleanEmail = dto.email.trim().toLowerCase();
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberships: {
          include: { tenant: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Resolve tenant & roles
    let activeTenantId = dto.tenantId;
    let roles: string[] = [];

    if (user.isSuperAdmin) {
      roles = ['SUPER_ADMIN'];
    } else {
      if (user.memberships.length === 0) {
        throw new ForbiddenException('User has no school tenant memberships');
      }

      // If tenantId specified, verify membership; otherwise default to first membership
      const membership = activeTenantId
        ? user.memberships.find((m) => m.tenantId === activeTenantId)
        : user.memberships[0];

      if (!membership) {
        throw new ForbiddenException('User is not a member of the requested school tenant');
      }

      activeTenantId = membership.tenantId;
      roles = membership.roles;
    }

    const permissions = getPermissionsForRoles(roles, user.isSuperAdmin);

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
      permissions,
      tenantId: activeTenantId,
      isSuperAdmin: user.isSuperAdmin,
    };

    const accessToken = await this.jwtService.signAsync(authUser);

    this.logger.info(`User logged in successfully: ${user.email}`, {
      userId: user.id,
      tenantId: activeTenantId,
    });

    return {
      accessToken,
      user: authUser,
    };
  }

  async impersonate(
    superAdmin: AuthenticatedUser,
    dto: ImpersonateDto
  ): Promise<{ accessToken: string; user: AuthenticatedUser }> {
    if (!superAdmin.isSuperAdmin) {
      throw new ForbiddenException('Only Super Admins can initiate support impersonation sessions');
    }

    if (!dto || !dto.targetUserId || typeof dto.targetUserId !== 'string' || !dto.targetUserId.trim()) {
      throw new BadRequestException('A valid targetUserId is required');
    }

    const targetUser = await db.user.findUnique({
      where: { id: dto.targetUserId.trim() },
      include: { memberships: { where: { tenantId: dto.tenantId } } },
    });

    if (!targetUser) {
      throw new NotFoundException(`Target user with ID ${dto.targetUserId} not found`);
    }

    const membership = targetUser.memberships[0];
    const roles = membership ? membership.roles : ['STUDENT'];
    const permissions = getPermissionsForRoles(roles, targetUser.isSuperAdmin);

    // Mandatory Audit Log for Impersonation Session
    await db.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: dto.tenantId,
        actorId: superAdmin.id,
        actorEmail: superAdmin.email,
        action: 'SUPPORT_IMPERSONATION_STARTED',
        resource: 'user',
        resourceId: targetUser.id,
        before: { reason: dto.reason },
        after: { impersonatedUser: targetUser.email },
      },
    });

    this.logger.warn(
      `Support impersonation session initiated by ${superAdmin.email} into ${targetUser.email} (Tenant: ${dto.tenantId})`,
      {
        actorId: superAdmin.id,
        targetUserId: targetUser.id,
        tenantId: dto.tenantId,
        reason: dto.reason,
      }
    );

    const authUser: AuthenticatedUser = {
      id: targetUser.id,
      email: targetUser.email,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      roles,
      permissions,
      tenantId: dto.tenantId,
      isSuperAdmin: false,
      impersonatorId: superAdmin.id,
    };

    const accessToken = await this.jwtService.signAsync(authUser);

    return {
      accessToken,
      user: authUser,
    };
  }
}
