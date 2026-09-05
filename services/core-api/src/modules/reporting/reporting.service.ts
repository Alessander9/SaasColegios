import { Injectable } from '@nestjs/common';
import {
  db,
  ChargeStatus,
  PaymentStatus,
  EnrollmentStatus,
  OrderStatus,
  ActivityStatus,
  EmployeeStatus,
} from '@cole/database';

@Injectable()
export class ReportingService {
  // ================================================================
  // PLATFORM ANALYTICS (SUPER ADMIN DASHBOARD)
  // ================================================================

  async getPlatformOverview(): Promise<any> {
    const [
      totalTenants,
      activeTenants,
      totalStudents,
      totalUsers,
      totalPayments,
      plans,
    ] = await Promise.all([
      db.tenant.count(),
      db.tenant.count({ where: { status: 'ACTIVE' } }),
      db.student.count(),
      db.user.count(),
      db.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
        _count: true,
      }),
      db.plan.findMany({
        select: { id: true, name: true, monthlyPrice: true, tenants: { select: { id: true } } },
        where: { isActive: true },
      }),
    ]);

    // Build plan distribution from tenants grouped by plan
    const planDistribution = plans.map((plan) => ({
      planId: plan.id,
      planName: plan.name,
      schoolCount: plan.tenants.length,
      monthlyPrice: Number(plan.monthlyPrice),
      monthlyMrr: Number(plan.monthlyPrice) * plan.tenants.length,
    }));

    const mrr = planDistribution.reduce((acc, p) => acc + p.monthlyMrr, 0);
    const arr = mrr * 12;

    return {
      overview: {
        totalTenants,
        activeTenants,
        suspendedTenants: totalTenants - activeTenants,
        totalStudents,
        totalActiveUsers: totalUsers,
        mrr: Number(mrr.toFixed(2)),
        arr: Number(arr.toFixed(2)),
        totalRevenue: Number(totalPayments._sum.amount || 0),
        totalTransactions: totalPayments._count,
      },
      planDistribution,
    };
  }

  async getTenantGrowthTimeline(): Promise<any> {
    // Get tenants created per month (last 12 months)
    const tenants = await db.tenant.findMany({
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyGrowth = new Map<string, { total: number; active: number }>();

    for (const t of tenants) {
      const monthKey = t.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const entry = monthlyGrowth.get(monthKey) || { total: 0, active: 0 };
      entry.total++;
      if (t.status === 'ACTIVE') entry.active++;
      monthlyGrowth.set(monthKey, entry);
    }

    // Get student count timeline
    const students = await db.student.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const studentGrowth = new Map<string, number>();
    for (const s of students) {
      const monthKey = s.createdAt.toISOString().slice(0, 7);
      studentGrowth.set(monthKey, (studentGrowth.get(monthKey) || 0) + 1);
    }

    // Combine both into a timeline
    const allMonths = new Set([...monthlyGrowth.keys(), ...studentGrowth.keys()]);
    const timeline = Array.from(allMonths)
      .sort()
      .map((month) => ({
        month,
        tenants: monthlyGrowth.get(month)?.total || 0,
        activeTenants: monthlyGrowth.get(month)?.active || 0,
        newStudents: studentGrowth.get(month) || 0,
      }));

    return { timeline };
  }

  async getModuleUsage(): Promise<any> {
    const [
      studentCount,
      enrollmentCount,
      paymentCount,
      gradeCount,
      attendanceCount,
      orderCount,
      activityRegCount,
      employeeCount,
      payrollSlipCount,
    ] = await Promise.all([
      db.student.count(),
      db.enrollment.count({ where: { status: EnrollmentStatus.CONFIRMED } }),
      db.payment.count({ where: { status: PaymentStatus.COMPLETED } }),
      db.gradeRecord.count(),
      db.attendanceRecord.count(),
      db.order.count(),
      db.activityRegistration.count(),
      db.employee.count(),
      db.payrollSlip.count(),
    ]);

    return {
      modules: [
        { name: 'Students', key: 'students', totalRecords: studentCount },
        { name: 'Enrollment', key: 'enrollment', totalRecords: enrollmentCount },
        { name: 'Finance', key: 'finance', totalRecords: paymentCount },
        { name: 'Academic', key: 'academic', totalRecords: gradeCount + attendanceCount },
        { name: 'Commerce', key: 'commerce', totalRecords: orderCount },
        { name: 'Activities', key: 'activities', totalRecords: activityRegCount },
        { name: 'HR', key: 'hr', totalRecords: employeeCount },
        { name: 'Payroll', key: 'payroll', totalRecords: payrollSlipCount },
      ],
    };
  }

  // ================================================================
  // SCHOOL-LEVEL REPORTS (DASHBOARD DEL COLEGIO)
  // ================================================================

  async getSchoolOverview(tenantId: string, academicYearId?: string): Promise<any> {
    const yearFilter = academicYearId ? { academicYearId } : {};

    const [
      totalStudents,
      activeEnrollments,
      totalEnrollments,
      totalPayments,
      totalCharges,
      totalEmployees,
      activeActivities,
    ] = await Promise.all([
      db.student.count({ where: { tenantId } }),
      db.enrollment.count({
        where: {
          tenantId,
          status: EnrollmentStatus.CONFIRMED,
          ...yearFilter,
        },
      }),
      db.enrollment.count({
        where: { tenantId, ...yearFilter },
      }),
      db.payment.aggregate({
        where: { tenantId, status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
        _count: true,
      }),
      db.charge.aggregate({
        where: { tenantId, ...yearFilter },
        _sum: { totalAmount: true, paidAmount: true },
        _count: true,
      }),
      db.employee.count({ where: { tenantId, status: EmployeeStatus.ACTIVE } }),
      db.activity.count({
        where: { tenantId, status: { not: ActivityStatus.CANCELLED } },
      }),
    ]);

    const totalChargeAmount = Number(totalCharges._sum.totalAmount || 0);
    const totalPaidAmount = Number(totalCharges._sum.paidAmount || 0);
    const totalDebtAmount = totalChargeAmount - totalPaidAmount;

    return {
      students: {
        total: totalStudents,
        enrolled: activeEnrollments,
        totalEnrollmentRecords: totalEnrollments,
      },
      finances: {
        totalRevenue: Number(totalPayments._sum.amount || 0),
        totalCharges: totalChargeAmount,
        totalCollected: totalPaidAmount,
        totalPending: totalDebtAmount,
        collectionRate: totalChargeAmount > 0
          ? Number(((totalPaidAmount / totalChargeAmount) * 100).toFixed(1))
          : 0,
        transactionsCount: totalPayments._count,
      },
      staff: {
        totalEmployees: totalEmployees,
      },
      activities: {
        activeCount: activeActivities,
      },
    };
  }

  async getFinancialReport(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // Charges breakdown
    const chargesByStatus = await db.charge.groupBy({
      by: ['status'],
      where: {
        tenantId,
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
      },
      _count: true,
      _sum: { totalAmount: true, paidAmount: true },
    });

    // Payments by method
    const paymentsByMethod = await db.payment.groupBy({
      by: ['method'],
      where: {
        tenantId,
        status: PaymentStatus.COMPLETED,
        ...(hasDateFilter ? { paidAt: dateFilter } : {}),
      },
      _count: true,
      _sum: { amount: true },
    });

    // Overdue charges (past due date, not fully paid)
    const overdueCharges = await db.charge.findMany({
      where: {
        tenantId,
        status: { in: [ChargeStatus.PENDING, ChargeStatus.PARTIALLY_PAID, ChargeStatus.OVERDUE] },
        dueDate: { lt: new Date() },
      },
      select: { id: true, title: true, totalAmount: true, paidAmount: true, dueDate: true },
    });

    const totalOverdueAmount = overdueCharges.reduce(
      (acc, c) => acc + Number(c.totalAmount) - Number(c.paidAmount),
      0,
    );

    // Monthly collection trend
    const payments = await db.payment.findMany({
      where: {
        tenantId,
        status: PaymentStatus.COMPLETED,
        ...(hasDateFilter ? { paidAt: dateFilter } : {}),
      },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    });

    const monthlyCollection = new Map<string, number>();
    for (const p of payments) {
      const monthKey = p.paidAt.toISOString().slice(0, 7);
      monthlyCollection.set(monthKey, (monthlyCollection.get(monthKey) || 0) + Number(p.amount));
    }

    return {
      chargesSummary: {
        byStatus: chargesByStatus.map((c) => ({
          status: c.status,
          count: c._count,
          totalAmount: Number(c._sum.totalAmount || 0),
          paidAmount: Number(c._sum.paidAmount || 0),
        })),
      },
      paymentsSummary: {
        byMethod: paymentsByMethod.map((p) => ({
          method: p.method,
          count: p._count,
          totalAmount: Number(p._sum.amount || 0),
        })),
      },
      overdue: {
        count: overdueCharges.length,
        totalAmount: Number(totalOverdueAmount.toFixed(2)),
        items: overdueCharges.slice(0, 20), // Top 20 overdue
      },
      monthlyCollection: Array.from(monthlyCollection.entries()).map(([month, amount]) => ({
        month,
        amount: Number(amount.toFixed(2)),
      })),
    };
  }

  async getAcademicReport(
    tenantId: string,
    academicYearId?: string,
    gradeId?: string,
  ): Promise<any> {
    const yearFilter = academicYearId ? { academicYearId } : {};

    // Average grade per course
    const gradeRecords = await db.gradeRecord.findMany({
      where: {
        tenantId,
        status: 'PUBLISHED',
        ...yearFilter,
        ...(gradeId ? { student: { enrollments: { some: { gradeId } } } } : {}),
      },
      select: { score: true, evaluation: { select: { courseSection: { select: { course: { select: { id: true, name: true, area: { select: { name: true } } } } } } } } },
    });

    // Group by course
    const courseMap = new Map<string, { name: string; area: string; scores: number[] }>();
    for (const g of gradeRecords) {
      const course = g.evaluation.courseSection.course;
      const entry = courseMap.get(course.id) || { name: course.name, area: course.area.name, scores: [] };
      entry.scores.push(Number(g.score));
      courseMap.set(course.id, entry);
    }

    const coursePerformance = Array.from(courseMap.entries()).map(([courseId, data]) => ({
      courseId,
      courseName: data.name,
      areaName: data.area,
      average: data.scores.length > 0
        ? Number((data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(2))
        : 0,
      gradesCount: data.scores.length,
    }));

    // Overall GPA
    const allScores = gradeRecords.map((g) => Number(g.score));
    const overallGpa = allScores.length > 0
      ? Number((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2))
      : 0;

    // Grade distribution
    const distribution = {
      excellent: allScores.filter((s) => s >= 18).length,
      good: allScores.filter((s) => s >= 14 && s < 18).length,
      satisfactory: allScores.filter((s) => s >= 11 && s < 14).length,
      insufficient: allScores.filter((s) => s < 11).length,
    };

    return {
      overallGpa,
      totalPublishedGrades: allScores.length,
      coursePerformance,
      gradeDistribution: distribution,
    };
  }

  async getAttendanceReport(
    tenantId: string,
    academicYearId?: string,
    sectionId?: string,
  ): Promise<any> {
    const filters: any = { tenantId };
    if (academicYearId) filters.academicPeriod = { academicYear: { id: academicYearId } };
    if (sectionId) filters.sectionId = sectionId;

    const attendanceByStatus = await db.attendanceRecord.groupBy({
      by: ['status'],
      where: filters,
      _count: true,
    });

    const total = attendanceByStatus.reduce((acc, a) => acc + a._count, 0);
    const presentCount = attendanceByStatus.find((a) => a.status === 'PRESENT')?._count || 0;
    const absentCount = attendanceByStatus.find((a) => a.status === 'ABSENT')?._count || 0;
    const tardyCount = attendanceByStatus.find((a) => a.status === 'TARDY')?._count || 0;
    const excusedCount = attendanceByStatus.find((a) => a.status === 'EXCUSED')?._count || 0;

    return {
      summary: {
        totalRecords: total,
        present: presentCount,
        absent: absentCount,
        tardy: tardyCount,
        excused: excusedCount,
        attendanceRate: total > 0
          ? Number(((presentCount / total) * 100).toFixed(1))
          : 0,
      },
      distribution: attendanceByStatus.map((a) => ({
        status: a.status,
        count: a._count,
        percentage: total > 0
          ? Number(((a._count / total) * 100).toFixed(1))
          : 0,
      })),
    };
  }

  async getCommerceReport(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    const ordersByStatus = await db.order.groupBy({
      by: ['status'],
      where: {
        tenantId,
        ...(hasDateFilter ? { placedAt: dateFilter } : {}),
      },
      _count: true,
      _sum: { totalAmount: true },
    });

    // Top selling products
    const orderItems = await db.orderItem.findMany({
      where: {
        tenantId,
        order: {
          status: { in: [OrderStatus.PAID, OrderStatus.PREPARING, OrderStatus.DELIVERED] },
          ...(hasDateFilter ? { placedAt: dateFilter } : {}),
        },
      },
      select: {
        quantity: true,
        totalPrice: true,
        variant: { select: { sku: true, name: true, product: { select: { name: true } } } },
      },
    });

    const productSales = new Map<string, { name: string; sku: string; qty: number; revenue: number }>();
    for (const item of orderItems) {
      const key = item.variant.sku;
      const entry = productSales.get(key) || { name: item.variant.product.name, sku: key, qty: 0, revenue: 0 };
      entry.qty += item.quantity;
      entry.revenue += Number(item.totalPrice);
      productSales.set(key, entry);
    }

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const totalRevenue = orderItems.reduce((acc, i) => acc + Number(i.totalPrice), 0);
    const totalItemsSold = orderItems.reduce((acc, i) => acc + i.quantity, 0);

    return {
      summary: {
        totalOrders: ordersByStatus.reduce((acc, o) => acc + o._count, 0),
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalItemsSold,
      },
      ordersByStatus: ordersByStatus.map((o) => ({
        status: o.status,
        count: o._count,
        totalAmount: Number(o._sum.totalAmount || 0),
      })),
      topProducts,
    };
  }

  async getActivityReport(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    const totalActivities = await db.activity.count({ where: { tenantId } });

    const activitiesByStatus = await db.activity.groupBy({
      by: ['status'],
      where: {
        tenantId,
        ...(hasDateFilter ? { startDate: dateFilter } : {}),
      },
      _count: true,
    });

    const registrationsByStatus = await db.activityRegistration.groupBy({
      by: ['status'],
      where: {
        tenantId,
        ...(hasDateFilter ? { registeredAt: dateFilter } : {}),
      },
      _count: true,
    });

    // Attendance stats
    const totalRegistered = await db.activityRegistration.count({ where: { tenantId } });
    const totalAttended = await db.activityAttendance.count({
      where: { tenantId, attended: true },
    });

    return {
      summary: {
        totalActivities,
        totalRegistrations: totalRegistered,
        totalAttended,
        participationRate: totalRegistered > 0
          ? Number(((totalAttended / totalRegistered) * 100).toFixed(1))
          : 0,
      },
      activitiesByStatus: activitiesByStatus.map((a) => ({
        status: a.status,
        count: a._count,
      })),
      registrationsByStatus: registrationsByStatus.map((r) => ({
        status: r.status,
        count: r._count,
      })),
    };
  }

  async getStaffReport(tenantId: string): Promise<any> {
    const employeesByStatus = await db.employee.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    });

    const employeesByType = await db.employee.groupBy({
      by: ['type'],
      where: { tenantId },
      _count: true,
      _sum: { baseSalary: true },
    });

    // Work attendance summary for current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const attendanceByStatus = await db.workAttendance.groupBy({
      by: ['status'],
      where: {
        tenantId,
        date: { gte: monthStart },
      },
      _count: true,
    });

    const totalAttendances = attendanceByStatus.reduce((acc, a) => acc + a._count, 0);
    const presentCount = attendanceByStatus.find((a) => a.status === 'PRESENT')?._count || 0;
    const lateCount = attendanceByStatus.find((a) => a.status === 'LATE')?._count || 0;

    // Payroll summary
    const lastPayroll = await db.payrollPeriod.findFirst({
      where: { tenantId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        slips: {
          select: { grossEarnings: true, totalDeductions: true, netPay: true },
        },
      },
    });

    return {
      employees: {
        byStatus: employeesByStatus.map((e) => ({ status: e.status, count: e._count })),
        byType: employeesByType.map((e) => ({
          type: e.type,
          count: e._count,
          totalBaseSalary: Number(e._sum.baseSalary || 0),
        })),
      },
      attendance: {
        totalRecords: totalAttendances,
        present: presentCount,
        late: lateCount,
        punctualityRate: totalAttendances > 0
          ? Number(((presentCount / totalAttendances) * 100).toFixed(1))
          : 0,
      },
      lastPayroll: lastPayroll
        ? {
            period: lastPayroll.name,
            status: lastPayroll.status,
            employeesProcessed: lastPayroll.slips.length,
            totalGrossEarnings: Number(lastPayroll.slips.reduce((acc, s) => acc + Number(s.grossEarnings), 0).toFixed(2)),
            totalNetPay: Number(lastPayroll.slips.reduce((acc, s) => acc + Number(s.netPay), 0).toFixed(2)),
          }
        : null,
    };
  }

  // ================================================================
  // EXPORT DATA (Tabular format for CSV/Excel)
  // ================================================================

  async exportStudents(tenantId: string): Promise<any[]> {
    return db.student.findMany({
      where: { tenantId },
      select: {
        studentCode: true,
        firstName: true,
        lastName: true,
        documentNumber: true,
        status: true,
        createdAt: true,
        enrollments: {
          select: {
            code: true,
            status: true,
            grade: { select: { name: true } },
            section: { select: { name: true } },
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async exportPayments(tenantId: string, startDate?: string, endDate?: string): Promise<any[]> {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    return db.payment.findMany({
      where: {
        tenantId,
        status: PaymentStatus.COMPLETED,
        ...(Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {}),
      },
      select: {
        code: true,
        amount: true,
        method: true,
        status: true,
        paidAt: true,
        charge: {
          select: {
            title: true,
            student: { select: { firstName: true, lastName: true, studentCode: true } },
          },
        },
        receipt: { select: { receiptNumber: true } },
      },
      orderBy: { paidAt: 'desc' },
    });
  }

  async exportGrades(tenantId: string, academicYearId?: string): Promise<any[]> {
    const filters: any = { tenantId, status: 'PUBLISHED' };
    if (academicYearId) filters.academicPeriod = { academicYear: { id: academicYearId } };

    return db.gradeRecord.findMany({
      where: filters,
      select: {
        score: true,
        letterScore: true,
        student: { select: { studentCode: true, firstName: true, lastName: true } },
        evaluation: {
          select: {
            name: true,
            courseSection: {
              select: {
                course: { select: { name: true, code: true } },
                section: { select: { name: true, code: true } },
              },
            },
          },
        },
        academicPeriod: { select: { name: true } },
      },
      orderBy: [{ student: { lastName: 'asc' } }, { evaluation: { courseSection: { course: { code: 'asc' } } } }],
    });
  }

  async exportAttendance(tenantId: string, sectionId?: string): Promise<any[]> {
    return db.attendanceRecord.findMany({
      where: {
        tenantId,
        ...(sectionId ? { sectionId } : {}),
      },
      select: {
        date: true,
        status: true,
        remarks: true,
        student: { select: { studentCode: true, firstName: true, lastName: true } },
        section: { select: { name: true, code: true } },
      },
      orderBy: [{ date: 'desc' }, { student: { lastName: 'asc' } }],
    });
  }
}
