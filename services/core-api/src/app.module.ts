import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { EntitlementModule } from './modules/entitlement/entitlement.module';
import { PlatformModule } from './modules/platform/platform.module';
import { IdentityModule } from './modules/identity/identity.module';
import { SchoolCoreModule } from './modules/school-core/school-core.module';
import { StudentModule } from './modules/student/student.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { FinanceModule } from './modules/finance/finance.module';
import { AcademicModule } from './modules/academic/academic.module';
import { CommerceModule } from './modules/commerce/commerce.module';
import { ActivityModule } from './modules/activity/activity.module';
import { HRModule } from './modules/hr/hr.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DocumentModule } from './modules/document/document.module';
import { AuditModule } from './modules/audit/audit.module';
import { OutboxModule } from './modules/outbox/outbox.module';
import { EventBus } from './shared/events/event-bus.service';

@Module({
  imports: [
    HealthModule,
    EntitlementModule,
    PlatformModule,
    IdentityModule,
    SchoolCoreModule,
    StudentModule,
    EnrollmentModule,
    FinanceModule,
    AcademicModule,
    CommerceModule,
    ActivityModule,
    HRModule,
    PayrollModule,
    ReportingModule,
    NotificationModule,
    DocumentModule,
    AuditModule,
    OutboxModule,
  ],
  providers: [EventBus],
  exports: [EventBus],
})
export class AppModule {}
