import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import {
  CreateFeeConceptDto,
  GeneratePensionScheduleDto,
  CreatePaymentDto,
  ReversePaymentDto,
  OpenCashBoxDto,
  CloseCashBoxDto,
  RecordCashMovementDto,
} from './dto/finance.dto';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';
import { ChargeStatus } from '@cole/database';

@ApiTags('Financial Core')
@ApiBearerAuth()
@Controller('finance')
@UseGuards(AuthGuard, PermissionGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for financial operations');
    }
    return user.tenantId;
  }

  // --------------------------------------------------
  // FEE CONCEPTS
  // --------------------------------------------------

  @Post('concepts')
  @RequirePermission(Permissions.FINANCE_RATES_MANAGE)
  @ApiOperation({ summary: 'Create fee concept (Tuition, Enrollment, Activity, Service)' })
  createConcept(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFeeConceptDto
  ) {
    return this.financeService.createConcept(this.extractTenantId(user), dto);
  }

  @Get('concepts')
  @RequirePermission(Permissions.FINANCE_VIEW)
  @ApiOperation({ summary: 'List all fee concepts available in the school' })
  getConcepts(@CurrentUser() user: AuthenticatedUser) {
    return this.financeService.getConcepts(this.extractTenantId(user));
  }

  // --------------------------------------------------
  // CHARGES & PENSION SCHEDULES
  // --------------------------------------------------

  @Post('pension-schedule')
  @RequirePermission(Permissions.FINANCE_RATES_MANAGE)
  @ApiOperation({ summary: 'Generate monthly pension schedule for a student (Emits ChargeCreated.v1)' })
  generateSchedule(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GeneratePensionScheduleDto
  ) {
    return this.financeService.generatePensionSchedule(this.extractTenantId(user), dto);
  }

  @Get('charges')
  @RequirePermission(Permissions.FINANCE_VIEW)
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'status', enum: ChargeStatus, required: false })
  @ApiOperation({ summary: 'List pending/paid financial charges and account statements' })
  getCharges(
    @CurrentUser() user: AuthenticatedUser,
    @Query('studentId') studentId?: string,
    @Query('status') status?: ChargeStatus
  ) {
    return this.financeService.getCharges(this.extractTenantId(user), studentId, status);
  }

  // --------------------------------------------------
  // PAYMENTS & REVERSALS (IDEMPOTENT)
  // --------------------------------------------------

  @Post('payments')
  @RequirePermission(Permissions.FINANCE_COLLECT)
  @ApiOperation({
    summary: 'Process idempotent payment against a charge (Emits PaymentCompleted.v1 & Issues Receipt)',
  })
  recordPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentDto
  ) {
    return this.financeService.recordPayment(this.extractTenantId(user), dto);
  }

  @Post('payments/:id/reverse')
  @RequirePermission(Permissions.FINANCE_REFUND)
  @ApiOperation({
    summary: 'Inmutably reverse payment and issue credit note (Emits PaymentRefunded.v1)',
  })
  reversePayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') paymentId: string,
    @Body() dto: ReversePaymentDto
  ) {
    return this.financeService.reversePayment(this.extractTenantId(user), paymentId, dto);
  }

  // --------------------------------------------------
  // CASH BOX SESSIONS
  // --------------------------------------------------

  @Post('cash-box/open')
  @RequirePermission(Permissions.FINANCE_CASHBOX_MANAGE)
  @ApiOperation({ summary: 'Open a new daily cash box shift/session' })
  openCashBox(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: OpenCashBoxDto
  ) {
    return this.financeService.openCashBox(this.extractTenantId(user), user.id, dto);
  }

  @Post('cash-box/:sessionId/close')
  @RequirePermission(Permissions.FINANCE_CASHBOX_MANAGE)
  @ApiOperation({ summary: 'Close cash box session, calculate balance, income and difference' })
  closeCashBox(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Body() dto: CloseCashBoxDto
  ) {
    return this.financeService.closeCashBox(this.extractTenantId(user), sessionId, dto);
  }

  @Post('cash-box/:sessionId/movements')
  @RequirePermission(Permissions.FINANCE_CASHBOX_MANAGE)
  @ApiOperation({ summary: 'Record manual cash box movement (income or expense)' })
  recordMovement(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Body() dto: RecordCashMovementDto
  ) {
    return this.financeService.recordCashMovement(this.extractTenantId(user), sessionId, dto);
  }
}
