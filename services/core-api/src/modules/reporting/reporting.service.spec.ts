import { ReportingService } from './reporting.service';
import { db } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    tenant: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    plan: {
      findMany: jest.fn(),
    },
    student: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    payment: {
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    charge: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    enrollment: {
      count: jest.fn(),
    },
    gradeRecord: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    attendanceRecord: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    course: {
      findMany: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
    order: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
    },
    activity: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    activityRegistration: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    activityAttendance: {
      count: jest.fn(),
    },
    employee: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    workAttendance: {
      groupBy: jest.fn(),
    },
    payrollPeriod: {
      findFirst: jest.fn(),
    },
    payrollSlip: {
      count: jest.fn(),
    },
    receipt: {},
  },
  PaymentStatus: { COMPLETED: 'COMPLETED', REVERSED: 'REVERSED' },
  ChargeStatus: {
    PENDING: 'PENDING',
    PARTIALLY_PAID: 'PARTIALLY_PAID',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
  },
  EnrollmentStatus: { CONFIRMED: 'CONFIRMED' },
  OrderStatus: { PAID: 'PAID', PREPARING: 'PREPARING', DELIVERED: 'DELIVERED' },
  ActivityStatus: { CANCELLED: 'CANCELLED' },
  EmployeeStatus: { ACTIVE: 'ACTIVE' },
  PayslipStatus: { APPROVED: 'APPROVED' },
  AttendanceStatus: { PRESENT: 'PRESENT' },
}));

describe('ReportingService', () => {
  let service: ReportingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportingService();
  });

  // ---------------------------------------------------------------
  // PLATFORM ANALYTICS TESTS
  // ---------------------------------------------------------------

  describe('getPlatformOverview', () => {
    it('should return platform-wide metrics including MRR, ARR and plan distribution', async () => {
      (db.tenant.count as jest.Mock).mockResolvedValueOnce(10); // total
      (db.tenant.count as jest.Mock).mockResolvedValueOnce(8);  // active
      (db.student.count as jest.Mock).mockResolvedValue(500);
      (db.user.count as jest.Mock).mockResolvedValue(120);
      (db.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 45000 },
        _count: 320,
      });
      (db.plan.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'plan-basic',
          name: 'Básico',
          monthlyPrice: 99,
          tenants: [{ id: 't1' }, { id: 't2' }, { id: 't3' }, { id: 't4' }, { id: 't5' }],
        },
        {
          id: 'plan-pro',
          name: 'Profesional',
          monthlyPrice: 199,
          tenants: [{ id: 't6' }, { id: 't7' }, { id: 't8' }],
        },
      ]);

      const result = await service.getPlatformOverview();

      expect(result.overview.totalTenants).toBe(10);
      expect(result.overview.activeTenants).toBe(8);
      expect(result.overview.totalStudents).toBe(500);
      expect(result.overview.totalTransactions).toBe(320);
      // MRR = 5*99 + 3*199 = 495 + 597 = 1092
      expect(result.overview.mrr).toBe(1092);
      // ARR = 1092 * 12 = 13104
      expect(result.overview.arr).toBe(13104);
      expect(result.planDistribution).toHaveLength(2);
    });
  });

  describe('getTenantGrowthTimeline', () => {
    it('should build monthly growth timeline from tenants and students', async () => {
      (db.tenant.findMany as jest.Mock).mockResolvedValue([
        { createdAt: new Date('2026-01-15'), status: 'ACTIVE' },
        { createdAt: new Date('2026-01-20'), status: 'ACTIVE' },
        { createdAt: new Date('2026-02-10'), status: 'SUSPENDED' },
      ]);
      (db.student.findMany as jest.Mock).mockResolvedValue([
        { createdAt: new Date('2026-01-20') },
        { createdAt: new Date('2026-01-25') },
        { createdAt: new Date('2026-02-05') },
        { createdAt: new Date('2026-02-15') },
        { createdAt: new Date('2026-02-20') },
      ]);

      const result = await service.getTenantGrowthTimeline();

      expect(result.timeline.length).toBe(2);
      expect(result.timeline[0].month).toBe('2026-01');
      expect(result.timeline[0].tenants).toBe(2);
      expect(result.timeline[0].activeTenants).toBe(2);
      expect(result.timeline[0].newStudents).toBe(2);
      expect(result.timeline[1].month).toBe('2026-02');
      expect(result.timeline[1].tenants).toBe(1);
      expect(result.timeline[1].activeTenants).toBe(0);
      expect(result.timeline[1].newStudents).toBe(3);
    });
  });

  describe('getModuleUsage', () => {
    it('should return record counts per module', async () => {
      (db.student.count as jest.Mock).mockResolvedValue(200);
      (db.enrollment.count as jest.Mock).mockResolvedValue(180);
      (db.payment.count as jest.Mock).mockResolvedValue(150);
      (db.gradeRecord.count as jest.Mock).mockResolvedValue(3000);
      (db.attendanceRecord.count as jest.Mock).mockResolvedValue(5000);
      (db.product.count as jest.Mock).mockResolvedValue(45);
      (db.order.count as jest.Mock).mockResolvedValue(80);
      (db.activity.count as jest.Mock).mockResolvedValue(12);
      (db.activityRegistration.count as jest.Mock).mockResolvedValue(60);
      (db.employee.count as jest.Mock).mockResolvedValue(30);
      (db.payrollSlip.count as jest.Mock).mockResolvedValue(30);

      const result = await service.getModuleUsage();

      expect(result.modules).toHaveLength(8);
      expect(result.modules.find((m: any) => m.key === 'students')?.totalRecords).toBe(200);
      expect(result.modules.find((m: any) => m.key === 'academic')?.totalRecords).toBe(8000);
    });
  });

  // ---------------------------------------------------------------
  // SCHOOL-LEVEL REPORT TESTS
  // ---------------------------------------------------------------

  describe('getSchoolOverview', () => {
    it('should return school KPIs with collection rate calculation', async () => {
      (db.student.count as jest.Mock).mockResolvedValue(250);
      (db.enrollment.count as jest.Mock).mockResolvedValueOnce(230).mockResolvedValueOnce(250);
      (db.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 35000 },
        _count: 200,
      });
      (db.charge.aggregate as jest.Mock).mockResolvedValue({
        _sum: { totalAmount: 50000, paidAmount: 35000 },
        _count: 300,
      });
      (db.employee.count as jest.Mock).mockResolvedValue(25);
      (db.activity.count as jest.Mock).mockResolvedValue(8);

      const result = await service.getSchoolOverview('tenant-1');

      expect(result.students.total).toBe(250);
      expect(result.students.enrolled).toBe(230);
      expect(result.finances.totalRevenue).toBe(35000);
      expect(result.finances.collectionRate).toBe(70);
      expect(result.finances.totalPending).toBe(15000);
      expect(result.staff.totalEmployees).toBe(25);
    });
  });

  describe('getFinancialReport', () => {
    it('should aggregate charges by status and payments by method', async () => {
      (db.charge.groupBy as jest.Mock).mockResolvedValue([
        {
          status: 'PAID',
          _count: 150,
          _sum: { totalAmount: 30000, paidAmount: 30000 },
        },
        {
          status: 'PENDING',
          _count: 50,
          _sum: { totalAmount: 15000, paidAmount: 0 },
        },
      ]);
      (db.payment.groupBy as jest.Mock).mockResolvedValue([
        { method: 'CASH', _count: 100, _sum: { amount: 20000 } },
        { method: 'BANK_TRANSFER', _count: 50, _sum: { amount: 10000 } },
      ]);
      (db.charge.findMany as jest.Mock).mockResolvedValue([
        { id: 'ch1', title: 'Pension Feb', totalAmount: 800, paidAmount: 0, dueDate: new Date('2026-02-15') },
        { id: 'ch2', title: 'Pension Mar', totalAmount: 800, paidAmount: 400, dueDate: new Date('2026-03-15') },
      ]);
      (db.payment.findMany as jest.Mock).mockResolvedValue([
        { amount: 800, paidAt: new Date('2026-01-10') },
        { amount: 800, paidAt: new Date('2026-01-15') },
        { amount: 600, paidAt: new Date('2026-02-05') },
      ]);

      const result = await service.getFinancialReport('tenant-1');

      expect(result.chargesSummary.byStatus).toHaveLength(2);
      expect(result.paymentsSummary.byMethod).toHaveLength(2);
      expect(result.overdue.count).toBe(2);
      expect(result.overdue.totalAmount).toBe(1200); // 800 + (800-400)
      expect(result.monthlyCollection).toHaveLength(2);
    });
  });

  describe('getAcademicReport', () => {
    it('should calculate GPA, course performance and grade distribution', async () => {
      (db.gradeRecord.findMany as jest.Mock).mockResolvedValue([
        {
          score: 18,
          evaluation: { courseSection: { course: { id: 'c1', name: 'Math', area: { name: 'STEM' } } } },
        },
        {
          score: 15,
          evaluation: { courseSection: { course: { id: 'c1', name: 'Math', area: { name: 'STEM' } } } },
        },
        {
          score: 12,
          evaluation: { courseSection: { course: { id: 'c2', name: 'Language', area: { name: 'HUMANITIES' } } } },
        },
        {
          score: 9,
          evaluation: { courseSection: { course: { id: 'c2', name: 'Language', area: { name: 'HUMANITIES' } } } },
        },
      ]);

      const result = await service.getAcademicReport('tenant-1');

      // Overall GPA = (18+15+12+9)/4 = 13.5
      expect(result.overallGpa).toBe(13.5);
      expect(result.totalPublishedGrades).toBe(4);
      expect(result.coursePerformance).toHaveLength(2);
      expect(result.gradeDistribution.excellent).toBe(1);   // >= 18
      expect(result.gradeDistribution.good).toBe(1);        // 14-17
      expect(result.gradeDistribution.satisfactory).toBe(1); // 11-13
      expect(result.gradeDistribution.insufficient).toBe(1); // < 11
    });
  });

  describe('getAttendanceReport', () => {
    it('should calculate attendance rate from status distribution', async () => {
      (db.attendanceRecord.groupBy as jest.Mock).mockResolvedValue([
        { status: 'PRESENT', _count: 800 },
        { status: 'ABSENT', _count: 80 },
        { status: 'TARDY', _count: 90 },
        { status: 'EXCUSED', _count: 30 },
      ]);

      const result = await service.getAttendanceReport('tenant-1');

      expect(result.summary.totalRecords).toBe(1000);
      expect(result.summary.present).toBe(800);
      expect(result.summary.attendanceRate).toBe(80);
      expect(result.distribution).toHaveLength(4);
    });
  });

  describe('getCommerceReport', () => {
    it('should aggregate orders by status and compute top products', async () => {
      (db.order.groupBy as jest.Mock).mockResolvedValue([
        { status: 'PAID', _count: 40, _sum: { totalAmount: 8000 } },
        { status: 'DELIVERED', _count: 25, _sum: { totalAmount: 5000 } },
      ]);
      (db.orderItem.findMany as jest.Mock).mockResolvedValue([
        {
          quantity: 3,
          totalPrice: 150,
          variant: { sku: 'SKU-1', name: 'T12', product: { name: 'Polo EF' } },
        },
        {
          quantity: 2,
          totalPrice: 100,
          variant: { sku: 'SKU-1', name: 'T12', product: { name: 'Polo EF' } },
        },
        {
          quantity: 1,
          totalPrice: 60,
          variant: { sku: 'SKU-2', name: 'T14', product: { name: 'Polo EF' } },
        },
      ]);

      const result = await service.getCommerceReport('tenant-1');

      expect(result.summary.totalOrders).toBe(65);
      expect(result.summary.totalRevenue).toBe(310);
      expect(result.summary.totalItemsSold).toBe(6);
      expect(result.topProducts).toHaveLength(2);
      expect(result.topProducts[0].sku).toBe('SKU-1');
      expect(result.topProducts[0].qty).toBe(5);
      expect(result.topProducts[0].revenue).toBe(250);
    });
  });

  describe('getActivityReport', () => {
    it('should return activity summary with participation rate', async () => {
      (db.activity.count as jest.Mock).mockResolvedValue(12);
      (db.activity.groupBy as jest.Mock).mockResolvedValue([
        { status: 'COMPLETED', _count: 8 },
        { status: 'IN_PROGRESS', _count: 2 },
        { status: 'OPEN_REGISTRATION', _count: 2 },
      ]);
      (db.activityRegistration.groupBy as jest.Mock).mockResolvedValue([
        { status: 'CONFIRMED', _count: 45 },
        { status: 'WAITLISTED', _count: 5 },
      ]);
      (db.activityRegistration.count as jest.Mock).mockResolvedValue(50);
      (db.activityAttendance.count as jest.Mock).mockResolvedValue(40);

      const result = await service.getActivityReport('tenant-1');

      expect(result.summary.totalActivities).toBe(12);
      expect(result.summary.totalRegistrations).toBe(50);
      expect(result.summary.participationRate).toBe(80);
      expect(result.activitiesByStatus).toHaveLength(3);
      expect(result.registrationsByStatus).toHaveLength(2);
    });
  });

  describe('getStaffReport', () => {
    it('should return employee breakdown, attendance and payroll summary', async () => {
      (db.employee.groupBy as jest.Mock)
        .mockResolvedValueOnce([
          { status: 'ACTIVE', _count: 20 },
          { status: 'ON_LEAVE', _count: 3 },
        ])
        .mockResolvedValueOnce([
          { type: 'TEACHER', _count: 15, _sum: { baseSalary: 42000 } },
          { type: 'ADMINISTRATIVE', _count: 5, _sum: { baseSalary: 11000 } },
        ]);
      (db.workAttendance.groupBy as jest.Mock).mockResolvedValue([
        { status: 'PRESENT', _count: 380 },
        { status: 'LATE', _count: 15 },
        { status: 'ABSENT', _count: 5 },
      ]);
      (db.payrollPeriod.findFirst as jest.Mock).mockResolvedValue({
        name: 'Planilla Abril 2026',
        status: 'APPROVED',
        slips: [
          { grossEarnings: 2902.5, totalDeductions: 364, netPay: 2538.5 },
          { grossEarnings: 3202.5, totalDeductions: 416, netPay: 2786.5 },
        ],
      });

      const result = await service.getStaffReport('tenant-1');

      expect(result.employees.byStatus).toHaveLength(2);
      expect(result.employees.byType).toHaveLength(2);
      expect(result.attendance.punctualityRate).toBeCloseTo(95, 0);
      expect(result.lastPayroll.employeesProcessed).toBe(2);
      expect(result.lastPayroll.totalGrossEarnings).toBe(6105);
      expect(result.lastPayroll.totalNetPay).toBe(5325);
    });
  });

  // ---------------------------------------------------------------
  // EXPORT TESTS
  // ---------------------------------------------------------------

  describe('exportStudents', () => {
    it('should return student directory for export', async () => {
      (db.student.findMany as jest.Mock).mockResolvedValue([
        {
          studentCode: 'ALU-001',
          firstName: 'Mateo',
          lastName: 'García',
          documentNumber: '12345678',
          status: 'ACTIVE',
          createdAt: new Date('2026-01-15'),
          enrollments: [{ code: 'MAT-001', status: 'CONFIRMED', grade: { name: '1er Grado' }, section: { name: 'A' } }],
        },
      ]);

      const result = await service.exportStudents('tenant-1');

      expect(result).toHaveLength(1);
      expect(result[0].studentCode).toBe('ALU-001');
      expect(result[0].enrollments[0].grade.name).toBe('1er Grado');
    });
  });

  describe('exportPayments', () => {
    it('should return payment history for export', async () => {
      (db.payment.findMany as jest.Mock).mockResolvedValue([
        {
          code: 'PAY-001',
          amount: 800,
          method: 'CASH',
          status: 'COMPLETED',
          paidAt: new Date('2026-04-10'),
          charge: { title: 'Pension Abril', student: { firstName: 'Mateo', lastName: 'García', studentCode: 'ALU-001' } },
          receipt: { receiptNumber: 'B001-0001234' },
        },
      ]);

      const result = await service.exportPayments('tenant-1');

      expect(result).toHaveLength(1);
      expect(result[0].charge.student.studentCode).toBe('ALU-001');
    });
  });

  describe('exportGrades', () => {
    it('should return published grades for export', async () => {
      (db.gradeRecord.findMany as jest.Mock).mockResolvedValue([
        {
          score: 17.5,
          letterScore: 'A',
          student: { studentCode: 'ALU-001', firstName: 'Mateo', lastName: 'García' },
          evaluation: {
            name: 'Examen Parcial',
            courseSection: {
              course: { name: 'Matemática', code: 'MAT-101' },
              section: { name: 'A', code: 'SEC-1-A' },
            },
          },
          academicPeriod: { name: 'I Bimestre' },
        },
      ]);

      const result = await service.exportGrades('tenant-1');

      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(17.5);
    });
  });

  describe('exportAttendance', () => {
    it('should return attendance records for export', async () => {
      (db.attendanceRecord.findMany as jest.Mock).mockResolvedValue([
        {
          date: new Date('2026-04-15'),
          status: 'PRESENT',
          remarks: null,
          student: { studentCode: 'ALU-001', firstName: 'Mateo', lastName: 'García' },
          section: { name: 'A', code: 'SEC-1-A' },
        },
      ]);

      const result = await service.exportAttendance('tenant-1');

      expect(result).toHaveLength(1);
      expect(result[0].student.studentCode).toBe('ALU-001');
    });
  });
});
