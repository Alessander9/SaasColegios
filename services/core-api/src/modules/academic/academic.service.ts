import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  db,
  withTransactionAndOutbox,
  GradeStatus,
} from '@cole/database';
import { DomainEvent } from '@cole/domain-types';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateCurricularAreaDto,
  CreateCourseDto,
  AssignTeacherToSectionDto,
  CreateEvaluationDto,
  SubmitGradesDto,
  RecordDailyAttendanceDto,
  CreateEvaluationScaleDto,
  CreateCompetencyDto,
  SubmitDescriptiveConclusionDto,
  CreateMockExamDto,
  SubmitMockExamResultsDto,
  LockAcademicPeriodDto,
} from './dto/academic.dto';

@Injectable()
export class AcademicService {
  // --------------------------------------------------
  // CURRICULAR AREAS & COURSES
  // --------------------------------------------------

  async createCurricularArea(tenantId: string, dto: CreateCurricularAreaDto): Promise<any> {
    const existing = await db.curricularArea.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Curricular area with code ${dto.code} already exists`);
    }

    return await db.curricularArea.create({
      data: {
        tenantId,
        levelId: dto.levelId,
        name: dto.name,
        code: dto.code,
        order: dto.order || 1,
      },
      include: { level: true },
    });
  }

  async getCurricularAreas(tenantId: string): Promise<any[]> {
    return await db.curricularArea.findMany({
      where: { tenantId },
      include: {
        level: true,
        courses: { include: { grade: true } },
      },
      orderBy: [{ level: { order: 'asc' } }, { order: 'asc' }],
    });
  }

  async createCourse(tenantId: string, dto: CreateCourseDto): Promise<any> {
    const existing = await db.course.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Course with code ${dto.code} already exists in this school`);
    }

    return await db.course.create({
      data: {
        tenantId,
        areaId: dto.areaId,
        gradeId: dto.gradeId,
        name: dto.name,
        code: dto.code,
        hoursPerWeek: dto.hoursPerWeek || 4,
      },
      include: {
        area: true,
        grade: { include: { level: true } },
      },
    });
  }

  async getCourses(tenantId: string, gradeId?: string): Promise<any[]> {
    return await db.course.findMany({
      where: {
        tenantId,
        ...(gradeId ? { gradeId } : {}),
        isActive: true,
      },
      include: {
        area: true,
        grade: { include: { level: true } },
        sections: { include: { teacher: true, section: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async getCourseSections(tenantId: string, teacherId?: string): Promise<any[]> {
    return db.courseSection.findMany({
      where: { tenantId, ...(teacherId ? { teacherId } : {}) },
      include: {
        course: true,
        section: { include: { enrollments: { include: { student: true } } } },
        evaluations: { include: { academicPeriod: true }, orderBy: { evaluationDate: 'desc' } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getEvaluations(tenantId: string, courseSectionId?: string): Promise<any[]> {
    return db.evaluation.findMany({
      where: { tenantId, ...(courseSectionId ? { courseSectionId } : {}) },
      include: { academicPeriod: true, courseSection: { include: { course: true, section: true } } },
      orderBy: { evaluationDate: 'desc' },
    });
  }

  async getStudentSchedule(tenantId: string, studentId: string): Promise<any[]> {
    return db.courseSection.findMany({
      where: {
        tenantId,
        section: { enrollments: { some: { studentId, status: 'CONFIRMED' } } },
      },
      include: { course: true, section: { include: { classroom: true } }, teacher: true },
      orderBy: { course: { name: 'asc' } },
    });
  }

  async assignTeacherToSection(tenantId: string, dto: AssignTeacherToSectionDto): Promise<any> {
    return await db.courseSection.upsert({
      where: {
        tenantId_courseId_sectionId: {
          tenantId,
          courseId: dto.courseId,
          sectionId: dto.sectionId,
        },
      },
      update: {
        teacherId: dto.teacherId,
      },
      create: {
        tenantId,
        courseId: dto.courseId,
        sectionId: dto.sectionId,
        teacherId: dto.teacherId,
      },
      include: {
        course: true,
        section: true,
        teacher: true,
      },
    });
  }

  // --------------------------------------------------
  // EVALUATIONS & GRADING LIFECYCLE
  // --------------------------------------------------

  async createEvaluation(tenantId: string, dto: CreateEvaluationDto): Promise<any> {
    return await db.evaluation.create({
      data: {
        tenantId,
        courseSectionId: dto.courseSectionId,
        academicPeriodId: dto.academicPeriodId,
        name: dto.name,
        type: dto.type,
        weight: dto.weight || 1.0,
        maxScore: dto.maxScore || 20.0,
        evaluationDate: new Date(dto.evaluationDate),
      },
      include: {
        courseSection: { include: { course: true, section: true } },
        academicPeriod: true,
      },
    });
  }

  async submitGrades(tenantId: string, teacherUserId: string, dto: SubmitGradesDto): Promise<any> {
    const evaluation = await db.evaluation.findFirst({
      where: { id: dto.evaluationId, tenantId },
      include: { courseSection: true },
    });
    if (!evaluation) throw new NotFoundException('Evaluation not found');

    const gradeSubmittedEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'GradeSubmitted.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: evaluation.id,
      version: 1,
      payload: {
        evaluationId: evaluation.id,
        teacherUserId,
        count: dto.grades.length,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [gradeSubmittedEvent], async (tx) => {
      for (const item of dto.grades) {
        await (tx as typeof db).gradeRecord.upsert({
          where: {
            tenantId_evaluationId_studentId: {
              tenantId,
              evaluationId: dto.evaluationId,
              studentId: item.studentId,
            },
          },
          update: {
            score: item.score,
            letterScore: item.letterScore,
            feedback: item.feedback,
            status: GradeStatus.SUBMITTED,
            gradedAt: new Date(),
          },
          create: {
            tenantId,
            evaluationId: dto.evaluationId,
            studentId: item.studentId,
            academicPeriodId: dto.academicPeriodId,
            score: item.score,
            letterScore: item.letterScore,
            feedback: item.feedback,
            status: GradeStatus.SUBMITTED,
          },
        });
      }

      return {
        evaluationId: evaluation.id,
        status: 'SUBMITTED',
        gradedCount: dto.grades.length,
      };
    });
  }

  async publishGrades(tenantId: string, evaluationId: string): Promise<any> {
    const evaluation = await db.evaluation.findFirst({
      where: { id: evaluationId, tenantId },
    });
    if (!evaluation) throw new NotFoundException('Evaluation not found');

    const gradePublishedEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'GradePublished.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: evaluation.id,
      version: 1,
      payload: {
        evaluationId: evaluation.id,
        publishedAt: new Date().toISOString(),
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [gradePublishedEvent], async (tx) => {
      await (tx as typeof db).gradeRecord.updateMany({
        where: { evaluationId, tenantId },
        data: {
          status: GradeStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      return {
        evaluationId,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
      };
    });
  }

  async getStudentReportCard(
    tenantId: string,
    studentId: string,
    academicPeriodId?: string
  ): Promise<any> {
    const student = await db.student.findFirst({
      where: { id: studentId, tenantId },
    });
    if (!student) throw new NotFoundException('Student not found');

    const grades = await db.gradeRecord.findMany({
      where: {
        tenantId,
        studentId,
        status: GradeStatus.PUBLISHED,
        ...(academicPeriodId ? { academicPeriodId } : {}),
      },
      include: {
        evaluation: {
          include: {
            courseSection: {
              include: { course: { include: { area: true } } },
            },
          },
        },
        academicPeriod: true,
      },
    });

    // Group grades by course and calculate average
    const courseMap = new Map<string, { courseName: string; areaName: string; scores: number[] }>();

    for (const g of grades) {
      const course = g.evaluation.courseSection.course;
      const courseId = course.id;
      const entry = courseMap.get(courseId) || {
        courseName: course.name,
        areaName: course.area.name,
        scores: [],
      };
      entry.scores.push(Number(g.score));
      courseMap.set(courseId, entry);
    }

    const courseAverages = Array.from(courseMap.entries()).map(([courseId, data]) => {
      const avg =
        data.scores.reduce((a, b) => a + b, 0) / (data.scores.length || 1);
      return {
        courseId,
        courseName: data.courseName,
        areaName: data.areaName,
        gradesCount: data.scores.length,
        average: Number(avg.toFixed(2)),
      };
    });

    const overallGpa =
      courseAverages.reduce((acc, c) => acc + c.average, 0) / (courseAverages.length || 1);

    return {
      student: {
        id: student.id,
        code: student.studentCode,
        fullName: `${student.firstName} ${student.lastName}`,
      },
      courses: courseAverages,
      overallGpa: Number(overallGpa.toFixed(2)),
      totalEvaluationsPublished: grades.length,
    };
  }

  // --------------------------------------------------
  // ATTENDANCE TRACKING
  // --------------------------------------------------

  async recordDailyAttendance(tenantId: string, dto: RecordDailyAttendanceDto): Promise<any> {
    const attendanceDate = new Date(dto.date);

    const attendanceRecordedEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'AttendanceRecorded.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: `${dto.sectionId}-${dto.date}`,
      version: 1,
      payload: {
        sectionId: dto.sectionId,
        date: dto.date,
        count: dto.records.length,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [attendanceRecordedEvent], async (tx) => {
      for (const item of dto.records) {
        await (tx as typeof db).attendanceRecord.upsert({
          where: {
            tenantId_sectionId_studentId_date: {
              tenantId,
              sectionId: dto.sectionId,
              studentId: item.studentId,
              date: attendanceDate,
            },
          },
          update: {
            status: item.status,
            remarks: item.remarks,
            recordedAt: new Date(),
          },
          create: {
            tenantId,
            sectionId: dto.sectionId,
            studentId: item.studentId,
            academicPeriodId: dto.academicPeriodId,
            date: attendanceDate,
            status: item.status,
            remarks: item.remarks,
          },
        });
      }

      return {
        sectionId: dto.sectionId,
        date: dto.date,
        recordedCount: dto.records.length,
      };
    });
  }

  async getAttendanceReport(
    tenantId: string,
    sectionId: string,
    date?: string
  ): Promise<any[]> {
    return await db.attendanceRecord.findMany({
      where: {
        tenantId,
        sectionId,
        ...(date ? { date: new Date(date) } : {}),
      },
      include: {
        student: true,
        section: true,
      },
      orderBy: [{ date: 'desc' }, { student: { lastName: 'asc' } }],
    });
  }

  // --------------------------------------------------
  // CONFIGURABLE EVALUATION SCALES
  // --------------------------------------------------

  async getEvaluationScales(tenantId: string): Promise<any[]> {
    return await (db as any).evaluationScale.findMany({
      where: { tenantId, isActive: true },
      include: {
        items: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createEvaluationScale(tenantId: string, dto: CreateEvaluationScaleDto): Promise<any> {
    const existing = await (db as any).evaluationScale.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Evaluation scale with code ${dto.code} already exists`);
    }

    return await (db as any).evaluationScale.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        type: dto.type,
        minValue: dto.minValue,
        maxValue: dto.maxValue,
        decimalPlaces: dto.decimalPlaces || 0,
        isDefault: dto.isDefault || false,
        items: dto.items && dto.items.length > 0 ? {
          create: dto.items.map((item, idx) => ({
            code: item.code,
            label: item.label,
            description: item.description,
            numericMin: item.numericMin,
            numericMax: item.numericMax,
            order: item.order ?? idx + 1,
            color: item.color,
            isPassing: item.isPassing !== undefined ? item.isPassing : true,
          })),
        } : undefined,
      },
      include: { items: true },
    });
  }

  // --------------------------------------------------
  // COMPETENCIES & CRITERIA (CNEB)
  // --------------------------------------------------

  async getCompetencies(tenantId: string, areaId?: string, courseId?: string): Promise<any[]> {
    return await (db as any).competency.findMany({
      where: {
        tenantId,
        ...(areaId ? { areaId } : {}),
        ...(courseId ? { courseId } : {}),
        isActive: true,
      },
      include: {
        criteria: { orderBy: { order: 'asc' } },
      },
      orderBy: { order: 'asc' },
    });
  }

  async createCompetency(tenantId: string, dto: CreateCompetencyDto): Promise<any> {
    const existing = await (db as any).competency.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Competency with code ${dto.code} already exists`);
    }

    return await (db as any).competency.create({
      data: {
        tenantId,
        areaId: dto.areaId,
        courseId: dto.courseId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        order: dto.order || 1,
      },
      include: { criteria: true },
    });
  }

  // --------------------------------------------------
  // DESCRIPTIVE CONCLUSIONS (INICIAL / PRIMARIA)
  // --------------------------------------------------

  async submitDescriptiveConclusion(tenantId: string, dto: SubmitDescriptiveConclusionDto): Promise<any> {
    // Check if period is locked
    const period = await db.academicPeriod.findUnique({
      where: { id: dto.periodId },
    });
    if (period && (period as any).isClosed) {
      throw new ForbiddenException('Cannot modify conclusions in a closed or locked academic period');
    }

    return await (db as any).descriptiveConclusion.upsert({
      where: {
        tenantId_studentId_competencyId_periodId: {
          tenantId,
          studentId: dto.studentId,
          competencyId: dto.competencyId,
          periodId: dto.periodId,
        },
      },
      update: {
        text: dto.text,
        teacherId: dto.teacherId,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        studentId: dto.studentId,
        competencyId: dto.competencyId,
        periodId: dto.periodId,
        teacherId: dto.teacherId,
        text: dto.text,
      },
    });
  }

  async getDescriptiveConclusions(tenantId: string, studentId: string, periodId?: string): Promise<any[]> {
    return await (db as any).descriptiveConclusion.findMany({
      where: {
        tenantId,
        studentId,
        ...(periodId ? { periodId } : {}),
      },
      include: {
        competency: true,
        period: true,
      },
    });
  }

  // --------------------------------------------------
  // MOCK EXAMS & ADMISSION PRE-U
  // --------------------------------------------------

  async createMockExam(tenantId: string, dto: CreateMockExamDto): Promise<any> {
    const existing = await (db as any).mockExam.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Mock exam with code ${dto.code} already exists`);
    }

    return await (db as any).mockExam.create({
      data: {
        tenantId,
        title: dto.title,
        code: dto.code,
        examDate: new Date(dto.examDate),
        durationMinutes: dto.durationMinutes || 180,
        totalQuestions: dto.totalQuestions || 100,
        correctPoints: dto.correctPoints !== undefined ? dto.correctPoints : 20.0,
        incorrectPenalty: dto.incorrectPenalty !== undefined ? dto.incorrectPenalty : -1.125,
        blankPoints: dto.blankPoints !== undefined ? dto.blankPoints : 0.0,
        maxScore: dto.maxScore || 2000.0,
        academicPeriodId: dto.academicPeriodId,
      },
      include: { academicPeriod: true },
    });
  }

  async submitMockExamResults(tenantId: string, dto: SubmitMockExamResultsDto): Promise<any> {
    const exam = await (db as any).mockExam.findUnique({
      where: { id: dto.mockExamId },
    });
    if (!exam || exam.tenantId !== tenantId) {
      throw new NotFoundException('Mock exam not found');
    }

    // 1. Calculate raw and final scores using the configured formula
    const correctVal = Number(exam.correctPoints);
    const incorrectVal = Number(exam.incorrectPenalty);
    const blankVal = Number(exam.blankPoints);
    const maxScoreVal = Number(exam.maxScore);

    const scored = dto.results.map((r) => {
      const finalScore = Math.max(
        0,
        r.correctAnswers * correctVal + r.incorrectAnswers * incorrectVal + r.unanswered * blankVal
      );
      const percentage = (finalScore / maxScoreVal) * 100;
      return {
        ...r,
        finalScore,
        percentage: Math.min(100, Math.max(0, percentage)),
      };
    });

    // 2. Sort by final score desc to compute ranking
    scored.sort((a, b) => b.finalScore - a.finalScore);
    const totalStudents = scored.length;

    // 3. Upsert results into database
    for (let i = 0; i < totalStudents; i++) {
      const item = scored[i];
      const ranking = i + 1;
      const percentile = totalStudents > 1 ? ((totalStudents - ranking) / (totalStudents - 1)) * 100 : 100;

      await (db as any).mockExamResult.upsert({
        where: {
          tenantId_mockExamId_studentId: {
            tenantId,
            mockExamId: dto.mockExamId,
            studentId: item.studentId,
          },
        },
        update: {
          correctAnswers: item.correctAnswers,
          incorrectAnswers: item.incorrectAnswers,
          unanswered: item.unanswered,
          rawScore: item.correctAnswers * correctVal,
          finalScore: item.finalScore,
          percentage: item.percentage,
          ranking,
          totalStudents,
          percentile,
          careerTrack: item.careerTrack,
        },
        create: {
          tenantId,
          mockExamId: dto.mockExamId,
          studentId: item.studentId,
          correctAnswers: item.correctAnswers,
          incorrectAnswers: item.incorrectAnswers,
          unanswered: item.unanswered,
          rawScore: item.correctAnswers * correctVal,
          finalScore: item.finalScore,
          percentage: item.percentage,
          ranking,
          totalStudents,
          percentile,
          careerTrack: item.careerTrack,
        },
      });
    }

    return {
      mockExamId: dto.mockExamId,
      processedCount: totalStudents,
      topScore: scored[0]?.finalScore || 0,
    };
  }

  async getMockExamRankings(tenantId: string, mockExamId: string): Promise<any[]> {
    return await (db as any).mockExamResult.findMany({
      where: { tenantId, mockExamId },
      include: {
        student: true,
        mockExam: true,
      },
      orderBy: { ranking: 'asc' },
    });
  }

  // --------------------------------------------------
  // PERIOD LOCKING & AUDIT
  // --------------------------------------------------

  async lockAcademicPeriod(tenantId: string, dto: LockAcademicPeriodDto): Promise<any> {
    const period = await db.academicPeriod.findUnique({
      where: { id: dto.academicPeriodId },
    });
    if (!period || period.tenantId !== tenantId) {
      throw new NotFoundException('Academic period not found');
    }

    return await db.academicPeriod.update({
      where: { id: dto.academicPeriodId },
      data: {
        isClosed: dto.status === 'LOCKED' || dto.status === 'CLOSED',
      },
    });
  }
}

