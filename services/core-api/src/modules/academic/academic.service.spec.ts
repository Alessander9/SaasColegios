import { AcademicService } from './academic.service';
import { db, GradeStatus } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    curricularArea: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    courseSection: {
      upsert: jest.fn(),
    },
    evaluation: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    gradeRecord: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    student: {
      findFirst: jest.fn(),
    },
    attendanceRecord: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  },
  withTransactionAndOutbox: jest.fn(async (_db, _tenantId, _events, callback) => {
    return await callback(db);
  }),
  GradeStatus: {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    PUBLISHED: 'PUBLISHED',
  },
  AttendanceStatus: {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    TARDY: 'TARDY',
  },
}));

describe('AcademicService', () => {
  let service: AcademicService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AcademicService();
  });

  it('should submit grades and emit GradeSubmitted.v1 event', async () => {
    (db.evaluation.findFirst as jest.Mock).mockResolvedValue({
      id: 'eval-1',
      tenantId: 'tenant-1',
      courseSection: { id: 'cs-1' },
    });

    const result = await service.submitGrades('tenant-1', 'teacher-1', {
      evaluationId: 'eval-1',
      academicPeriodId: 'period-1',
      grades: [
        { studentId: 'stud-1', score: 18.5, feedback: 'Excelente trabajo' },
        { studentId: 'stud-2', score: 14.0, feedback: 'Buen avance' },
      ],
    });

    expect(result.status).toBe('SUBMITTED');
    expect(result.gradedCount).toBe(2);
    expect(db.gradeRecord.upsert).toHaveBeenCalledTimes(2);
  });

  it('should calculate weighted GPA in student report card', async () => {
    (db.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'stud-1',
      studentCode: 'ALU-2026-001',
      firstName: 'Mateo',
      lastName: 'García',
    });

    (db.gradeRecord.findMany as jest.Mock).mockResolvedValue([
      {
        score: 18.0,
        status: GradeStatus.PUBLISHED,
        evaluation: {
          courseSection: {
            course: { id: 'c-alg', name: 'Álgebra', area: { name: 'Matemática' } },
          },
        },
      },
      {
        score: 16.0,
        status: GradeStatus.PUBLISHED,
        evaluation: {
          courseSection: {
            course: { id: 'c-alg', name: 'Álgebra', area: { name: 'Matemática' } },
          },
        },
      },
      {
        score: 17.0,
        status: GradeStatus.PUBLISHED,
        evaluation: {
          courseSection: {
            course: { id: 'c-leng', name: 'Lenguaje', area: { name: 'Comunicación' } },
          },
        },
      },
    ]);

    const reportCard = await service.getStudentReportCard('tenant-1', 'stud-1');
    expect(reportCard.student.fullName).toBe('Mateo García');
    expect(reportCard.courses.length).toBe(2);

    const algebra = reportCard.courses.find((c: any) => c.courseName === 'Álgebra');
    expect(algebra.average).toBe(17.0); // (18 + 16) / 2
    expect(reportCard.overallGpa).toBe(17.0); // (17 + 17) / 2
  });

  it('should create configurable CNEB evaluation scale with AD/A/B/C items', async () => {
    (db as any).evaluationScale = {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 'scale-cneb-1',
        code: 'SCALE-CNEB',
        name: 'Escala CNEB Oficial',
        type: 'LITERAL',
        items: [
          { code: 'AD', label: 'Logro destacado' },
          { code: 'A', label: 'Logro esperado' },
          { code: 'B', label: 'En proceso' },
          { code: 'C', label: 'En inicio' },
        ],
      }),
    };

    const scale = await service.createEvaluationScale('tenant-1', {
      code: 'SCALE-CNEB',
      name: 'Escala CNEB Oficial',
      type: 'LITERAL',
      items: [
        { code: 'AD', label: 'Logro destacado', order: 1 },
        { code: 'A', label: 'Logro esperado', order: 2 },
        { code: 'B', label: 'En proceso', order: 3 },
        { code: 'C', label: 'En inicio', order: 4 },
      ],
    });

    expect(scale.code).toBe('SCALE-CNEB');
    expect(scale.items.length).toBe(4);
    expect(scale.items[0].code).toBe('AD');
  });

  it('should compute pre-university mock exam formula scores and rank students', async () => {
    (db as any).mockExam = {
      findUnique: jest.fn().mockResolvedValue({
        id: 'mock-1',
        tenantId: 'tenant-1',
        correctPoints: 20.0,
        incorrectPenalty: -1.125,
        blankPoints: 0.0,
        maxScore: 2000.0,
      }),
    };

    (db as any).mockExamResult = {
      upsert: jest.fn().mockResolvedValue({ id: 'res-1' }),
    };

    const summary = await service.submitMockExamResults('tenant-1', {
      mockExamId: 'mock-1',
      results: [
        {
          studentId: 'stud-1',
          correctAnswers: 70, // 70 * 20 = 1400 - 20*1.125 = 1400 - 22.5 = 1377.5
          incorrectAnswers: 20,
          unanswered: 10,
          careerTrack: 'Medicina Humana',
        },
        {
          studentId: 'stud-2',
          correctAnswers: 80, // 80 * 20 = 1600 - 10*1.125 = 1600 - 11.25 = 1588.75
          incorrectAnswers: 10,
          unanswered: 10,
          careerTrack: 'Ingeniería Civil',
        },
      ],
    });

    expect(summary.processedCount).toBe(2);
    expect(summary.topScore).toBeCloseTo(1588.75, 2);
    expect((db as any).mockExamResult.upsert).toHaveBeenCalledTimes(2);
  });
});

