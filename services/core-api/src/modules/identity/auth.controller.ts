import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginDto, ImpersonateDto } from './dto/auth.dto';
import { Public, CurrentUser, RequireRole } from './decorators/auth.decorators';
import { AuthGuard } from './guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { AuthenticatedUser, PlatformRole } from '@cole/domain-types';

@ApiTags('Identity & Auth')
@Controller('auth')
@UseGuards(AuthGuard, PermissionGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user with credentials and return JWT token' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile, roles and permissions' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return {
      user,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('impersonate')
  @ApiBearerAuth()
  @RequireRole(PlatformRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Support Impersonation: Enter a school tenant as another user (Audited strictly)',
  })
  impersonate(
    @CurrentUser() superAdmin: AuthenticatedUser,
    @Body() dto: ImpersonateDto
  ) {
    return this.authService.impersonate(superAdmin, dto);
  }
}
