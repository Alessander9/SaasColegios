import { db as prisma } from '../src';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log('🌱 Seeding database...');

  // ---------------------------------------------------------------
  // 1. PLANS
  // ---------------------------------------------------------------
  const basicPlan = await prisma.plan.upsert({
    where: { code: 'PLAN-BASIC' },
    update: {},
    create: {
      id: uuidv4(),
      code: 'PLAN-BASIC',
      name: 'Básico',
      description: 'Plan para colegios pequeños (hasta 200 alumnos)',
      maxStudents: 200,
      maxTeachers: 20,
      maxStorageGb: 10,
      features: ['academic', 'enrollment', 'finance'],
      monthlyPrice: 99.00,
      annualPrice: 990.00,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { code: 'PLAN-PRO' },
    update: {},
    create: {
      id: uuidv4(),
      code: 'PLAN-PRO',
      name: 'Profesional',
      description: 'Plan para colegios medianos (hasta 1000 alumnos)',
      maxStudents: 1000,
      maxTeachers: 50,
      maxStorageGb: 50,
      features: ['academic', 'enrollment', 'finance', 'commerce', 'activities', 'hr', 'payroll', 'reporting', 'notifications'],
      monthlyPrice: 199.00,
      annualPrice: 1990.00,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { code: 'PLAN-ENTERPRISE' },
    update: {},
    create: {
      id: uuidv4(),
      code: 'PLAN-ENTERPRISE',
      name: 'Enterprise',
      description: 'Plan ilimitado para redes de colegios',
      maxStudents: 5000,
      maxTeachers: 200,
      maxStorageGb: 200,
      features: ['academic', 'enrollment', 'finance', 'commerce', 'activities', 'hr', 'payroll', 'reporting', 'notifications', 'documents', 'advanced_analytics'],
      monthlyPrice: 499.00,
      annualPrice: 4990.00,
    },
  });

  console.log(`  ✅ Plans created: ${basicPlan.name}, ${proPlan.name}, ${enterprisePlan.name}`);

  // ---------------------------------------------------------------
  // 2. TENANT (Demo School)
  // ---------------------------------------------------------------
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'colegio-san-jose' },
    update: {},
    create: {
      id: uuidv4(),
      slug: 'colegio-san-jose',
      name: 'Colegio San José',
      subdomain: 'sanjose',
      status: 'ACTIVE',
      planId: proPlan.id,
    },
  });

  console.log(`  ✅ Tenant created: ${tenant.name}`);

  // ---------------------------------------------------------------
  // 3. SCHOOL PROFILE
  // ---------------------------------------------------------------
  await prisma.schoolProfile.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      id: uuidv4(),
      tenantId: tenant.id,
      legalName: 'Institución Educativa San José S.A.C.',
      taxId: '20512345678',
      phone: '+51 1 555-0100',
      email: 'admin@sanjose.edu.pe',
      address: 'Av. Las Palmeras 450, San Isidro, Lima',
      currency: 'PEN',
      timezone: 'America/Lima',
      gradingScale: 'NUMERIC_0_20',
    },
  });

  // ---------------------------------------------------------------
  // 4. USERS & MEMBERSHIPS
  // ---------------------------------------------------------------
  const passwordHash = await bcrypt.hash('Cole2026!', 10);

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@cole.pe' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@cole.pe',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      isSuperAdmin: true,
    },
  });

  // Director
  const director = await prisma.user.upsert({
    where: { email: 'director@sanjose.edu.pe' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'director@sanjose.edu.pe',
      passwordHash,
      firstName: 'Roberto',
      lastName: 'Méndez Vargas',
    },
  });

  // Teachers
  const teacher1 = await prisma.user.upsert({
    where: { email: 'elena.torres@sanjose.edu.pe' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'elena.torres@sanjose.edu.pe',
      passwordHash,
      firstName: 'Elena',
      lastName: 'Torres Valencia',
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'carlos.mendoza@sanjose.edu.pe' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'carlos.mendoza@sanjose.edu.pe',
      passwordHash,
      firstName: 'Carlos',
      lastName: 'Mendoza Ríos',
    },
  });

  // Secretary
  const secretary = await prisma.user.upsert({
    where: { email: 'ana.gomez@sanjose.edu.pe' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'ana.gomez@sanjose.edu.pe',
      passwordHash,
      firstName: 'Ana Lucía',
      lastName: 'Gómez Paz',
    },
  });

  // Parent
  const parent = await prisma.user.upsert({
    where: { email: 'padre.garcia@email.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'padre.garcia@email.com',
      passwordHash,
      firstName: 'Luis',
      lastName: 'García Rojas',
    },
  });

  // Store & Products Manager
  const storeManager = await prisma.user.upsert({
    where: { email: 'tienda@sanjose.edu.pe' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'tienda@sanjose.edu.pe',
      passwordHash,
      firstName: 'Mateo',
      lastName: 'Alarcón (Gestor Tienda)',
    },
  });

  // Memberships
  const membershipData = [
    { userId: director.id, tenantId: tenant.id, roles: ['DIRECTOR'] },
    { userId: teacher1.id, tenantId: tenant.id, roles: ['TEACHER'] },
    { userId: teacher2.id, tenantId: tenant.id, roles: ['TEACHER'] },
    { userId: secretary.id, tenantId: tenant.id, roles: ['SECRETARY'] },
    { userId: parent.id, tenantId: tenant.id, roles: ['PARENT'] },
    { userId: storeManager.id, tenantId: tenant.id, roles: ['STORE_MANAGER'] },
  ];

  for (const m of membershipData) {
    await prisma.membership.upsert({
      where: { userId_tenantId: { userId: m.userId, tenantId: m.tenantId } },
      update: {},
      create: { id: uuidv4(), ...m },
    });
  }

  console.log(`  ✅ Users & memberships created`);

  // ---------------------------------------------------------------
  // 5. SCHOOL STRUCTURE
  // ---------------------------------------------------------------

  // Campus
  const campus = await prisma.campus.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      name: 'Sede Principal - San Isidro',
      code: 'SEDE-01',
      address: 'Av. Las Palmeras 450, Lima',
      isMain: true,
    },
  });

  // Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      year: 2026,
      name: 'Año Lectivo 2026',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-12-15'),
      isActive: true,
    },
  });

  // Academic Periods (Bimestres)
  const periods = [];
  for (let i = 1; i <= 4; i++) {
    const period = await prisma.academicPeriod.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        name: `${i}° Bimestre`,
        code: `B${i}`,
        order: i,
        type: 'BIMESTER',
        startDate: new Date(`2026-0${2 + i}-01`),
        endDate: new Date(`2026-0${3 + i}-30`),
      },
    });
    periods.push(period);
  }

  // Educational Levels
  const primaryLevel = await prisma.educationalLevel.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      name: 'Primaria',
      code: 'PRI',
      order: 1,
    },
  });

  const secondaryLevel = await prisma.educationalLevel.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      name: 'Secundaria',
      code: 'SEC',
      order: 2,
    },
  });

  // Grade Levels
  const grade1 = await prisma.gradeLevel.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      levelId: primaryLevel.id,
      name: '1er Grado',
      code: 'PRI-1',
      order: 1,
    },
  });

  const grade5 = await prisma.gradeLevel.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      levelId: secondaryLevel.id,
      name: '5to Año',
      code: 'SEC-5',
      order: 5,
    },
  });

  // Sections
  const section1A = await prisma.section.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      academicYearId: academicYear.id,
      gradeId: grade1.id,
      campusId: campus.id,
      name: 'A',
      code: 'SEC-1-A-2026',
      maxCapacity: 30,
    },
  });

  const section5A = await prisma.section.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      academicYearId: academicYear.id,
      gradeId: grade5.id,
      campusId: campus.id,
      name: 'A',
      code: 'SEC-5-A-2026',
      maxCapacity: 35,
    },
  });

  console.log(`  ✅ School structure created: campus, year, periods, levels, grades, sections`);

  // ---------------------------------------------------------------
  // 6. STUDENTS & GUARDIANS
  // ---------------------------------------------------------------
  const studentData = [
    { firstName: 'Mateo', lastName: 'García López', documentNumber: '71234568', gender: 'M' },
    { firstName: 'Sofía', lastName: 'Rodríguez Pérez', documentNumber: '71234569', gender: 'F' },
    { firstName: 'Santiago', lastName: 'Hernández Cruz', documentNumber: '71234570', gender: 'M' },
    { firstName: 'Valentina', lastName: 'Morales Díaz', documentNumber: '71234571', gender: 'F' },
    { firstName: 'Sebastián', lastName: 'López García', documentNumber: '71234572', gender: 'M' },
  ];

  const students = [];
  for (let i = 0; i < studentData.length; i++) {
    const s = studentData[i];
    const student = await prisma.student.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        studentCode: `ALU-2026-${String(i + 1).padStart(3, '0')}`,
        documentNumber: s.documentNumber,
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        birthDate: new Date(`20${14 - i}-06-15`),
        status: 'ACTIVE',
      },
    });
    students.push(student);
  }

  // Guardians
  const guardian = await prisma.guardian.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      userId: parent.id,
      documentNumber: '10234567',
      firstName: 'Luis',
      lastName: 'García Rojas',
      relationship: 'FATHER',
      email: 'padre.garcia@email.com',
      phone: '+51 999-111-222',
    },
  });

  // Link first student to guardian
  await prisma.studentGuardian.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      studentId: students[0].id,
      guardianId: guardian.id,
      isPrimary: true,
    },
  });

  console.log(`  ✅ ${students.length} students & 1 guardian created`);

  // ---------------------------------------------------------------
  // 7. ENROLLMENTS
  // ---------------------------------------------------------------
  for (let i = 0; i < students.length; i++) {
    await prisma.enrollment.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        code: `MAT-2026-${String(i + 1).padStart(4, '0')}`,
        studentId: students[i].id,
        academicYearId: academicYear.id,
        gradeId: i < 3 ? grade1.id : grade5.id,
        sectionId: i < 3 ? section1A.id : section5A.id,
        status: 'CONFIRMED',
      },
    });
  }

  console.log(`  ✅ ${students.length} enrollments confirmed`);

  // ---------------------------------------------------------------
  // 8. EMPLOYEES
  // ---------------------------------------------------------------
  const employee1 = await prisma.employee.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      userId: teacher1.id,
      employeeCode: 'EMP-2026-001',
      documentNumber: '10928374',
      firstName: 'Elena',
      lastName: 'Torres Valencia',
      email: 'elena.torres@sanjose.edu.pe',
      phone: '+51 988-112-233',
      type: 'TEACHER',
      baseSalary: 2800.00,
      pensionSystem: 'ONP',
    },
  });

  const employee2 = await prisma.employee.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      userId: teacher2.id,
      employeeCode: 'EMP-2026-002',
      documentNumber: '10928375',
      firstName: 'Carlos',
      lastName: 'Mendoza Ríos',
      email: 'carlos.mendoza@sanjose.edu.pe',
      phone: '+51 988-112-234',
      type: 'TEACHER',
      baseSalary: 3100.00,
      pensionSystem: 'AFP_INTEGRA',
    },
  });

  await prisma.employee.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      employeeCode: 'EMP-2026-003',
      documentNumber: '10928376',
      firstName: 'Marcos',
      lastName: 'Rivas Soto',
      phone: '+51 988-112-235',
      type: 'TEACHER',
      baseSalary: 2900.00,
    },
  });

  await prisma.employee.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      userId: secretary.id,
      employeeCode: 'EMP-2026-004',
      documentNumber: '10928377',
      firstName: 'Ana Lucía',
      lastName: 'Gómez Paz',
      email: 'ana.gomez@sanjose.edu.pe',
      phone: '+51 988-112-236',
      type: 'ADMINISTRATIVE',
      baseSalary: 2200.00,
    },
  });

  console.log(`  ✅ 4 employees created`);

  // ---------------------------------------------------------------
  // 9. FEE CONCEPTS
  // ---------------------------------------------------------------
  await prisma.feeConcept.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      code: 'MAT-2026',
      name: 'Matrícula 2026',
      category: 'ENROLLMENT_FEE',
      defaultAmount: 500.00,
    },
  });

  await prisma.feeConcept.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      code: 'PEN-MENSUAL',
      name: 'Pensión Mensual',
      category: 'TUITION_PENSION',
      defaultAmount: 450.00,
    },
  });

  console.log(`  ✅ Fee concepts created`);

  // ---------------------------------------------------------------
  // 10. CURRICULUM
  // ---------------------------------------------------------------
  const mathArea = await prisma.curricularArea.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      levelId: primaryLevel.id,
      name: 'Matemática',
      code: 'AREA-MAT',
      order: 1,
    },
  });

  const commArea = await prisma.curricularArea.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      levelId: primaryLevel.id,
      name: 'Comunicación',
      code: 'AREA-COM',
      order: 2,
    },
  });

  const mathCourse = await prisma.course.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      areaId: mathArea.id,
      gradeId: grade1.id,
      name: 'Álgebra y Aritmética',
      code: 'CUR-MAT-101',
      hoursPerWeek: 5,
    },
  });

  const communicationCourse = await prisma.course.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      areaId: commArea.id,
      gradeId: grade1.id,
      name: 'Comprensión Lectora',
      code: 'CUR-COM-101',
      hoursPerWeek: 5,
    },
  });

  console.log(`  ✅ Curriculum areas & courses created`);

  const mathAssignment = await prisma.courseSection.create({
    data: {
      id: uuidv4(), tenantId: tenant.id, courseId: mathCourse.id, sectionId: section1A.id, teacherId: teacher1.id,
    },
  });
  await prisma.courseSection.create({
    data: {
      id: uuidv4(), tenantId: tenant.id, courseId: communicationCourse.id, sectionId: section1A.id, teacherId: teacher1.id,
    },
  });
  const evaluation = await prisma.evaluation.create({
    data: {
      id: uuidv4(), tenantId: tenant.id, courseSectionId: mathAssignment.id, academicPeriodId: periods[0].id,
      name: 'Evaluación diagnóstica', type: 'PRACTICE', weight: 1, maxScore: 20,
      evaluationDate: new Date('2026-03-15'),
    },
  });
  console.log(`  ✅ Course assignments & evaluation created: ${evaluation.name}`);

  // ---------------------------------------------------------------
  // 11. ACTIVITIES
  // ---------------------------------------------------------------
  await prisma.activity.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      title: 'Taller de Robótica y Programación',
      code: 'ACT-ROB-2026',
      type: 'WORKSHOP',
      description: 'Taller extracurricular de robótica con Arduino y programación Python',
      location: 'Laboratorio STEM',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-06-30'),
      price: 150.00,
      maxCapacity: 20,
      requiresConsent: true,
      status: 'OPEN_REGISTRATION',
    },
  });

  await prisma.activity.create({
    data: {
      id: uuidv4(),
      tenantId: tenant.id,
      title: 'Paseo a Granja Villa',
      code: 'ACT-PASEO-01',
      type: 'TRIP',
      description: 'Paseo educativo a la Granja Villa para alumnos de primaria',
      location: 'Chorrillos, Lima',
      startDate: new Date('2026-05-15'),
      endDate: new Date('2026-05-15'),
      price: 80.00,
      maxCapacity: 40,
      requiresConsent: true,
      status: 'OPEN_REGISTRATION',
    },
  });

  console.log(`  ✅ Activities created`);

  const uniformCategory = await prisma.productCategory.create({
    data: {
      id: uuidv4(), tenantId: tenant.id, name: 'Uniformes', code: 'CAT-UNIF',
      description: 'Uniformes oficiales del colegio',
    },
  });
  const polo = await prisma.product.create({
    data: {
      id: uuidv4(), tenantId: tenant.id, categoryId: uniformCategory.id,
      name: 'Polo de Educación Física', code: 'PROD-POLO-EF', isActive: true,
    },
  });
  await prisma.productVariant.create({
    data: {
      id: uuidv4(), tenantId: tenant.id, productId: polo.id, sku: 'POLO-EF-T12',
      name: 'Talla 12', price: 45, stock: 10, minStock: 2,
    },
  });
  console.log(`  ✅ Commerce catalog created`);

  console.log('\n🎉 Seed completed successfully!');
  console.log(`\n📋 Login credentials:`);
  console.log(`  Super Admin: admin@cole.pe / Cole2026!`);
  console.log(`  Director:    director@sanjose.edu.pe / Cole2026!`);
  console.log(`  Teacher:     elena.torres@sanjose.edu.pe / Cole2026!`);
  console.log(`  Parent:      padre.garcia@email.com / Cole2026!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
