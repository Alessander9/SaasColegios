import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { OpenPayrollPeriodDto, CalculatePayrollDto } from './dto/payroll.dto';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';

@ApiTags('Payroll Engine')
@ApiBearerAuth()
@Controller('payroll')
@UseGuards(AuthGuard, PermissionGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for payroll operations');
    }
    return user.tenantId;
  }

  @Post('periods')
  @RequirePermission(Permissions.PAYROLL_PROCESS)
  @ApiOperation({ summary: 'Open a new monthly payroll period' })
  openPeriod(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: OpenPayrollPeriodDto
  ) {
    return this.payrollService.openPeriod(this.extractTenantId(user), dto);
  }

  @Get('periods')
  @RequirePermission(Permissions.PAYROLL_VIEW)
  @ApiOperation({ summary: 'List payroll periods with status and slip counts' })
  getPeriods(@CurrentUser() user: AuthenticatedUser) {
    return this.payrollService.getPeriods(this.extractTenantId(user));
  }

  @Post('calculate')
  @RequirePermission(Permissions.PAYROLL_PROCESS)
  @ApiOperation({
    summary: 'Calculate staff payroll liquidations, earnings and deductions (Emits PayrollCalculated.v1)',
  })
  calculatePayroll(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CalculatePayrollDto
  ) {
    return this.payrollService.calculatePayroll(this.extractTenantId(user), dto);
  }

  @Get('periods/:id/slips')
  @RequirePermission(Permissions.PAYROLL_VIEW)
  @ApiOperation({ summary: 'Get all generated employee payslips with breakdown items' })
  getPayslips(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') periodId: string
  ) {
    return this.payrollService.getPayslips(this.extractTenantId(user), periodId);
  }
}
