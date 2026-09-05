import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://cole_user:cole_password@localhost:5433/cole_platform',
    },
  },
});

async function main() {
  console.log('🚀 Creando alumnos para Pre / Inicial, Primaria y Secundaria...\n');

  // 1. Obtener Tenant y Año Académico
  const tenant = await prisma.tenant.findFirst({
    where: { status: 'ACTIVE' },
  });

  if (!tenant) {
    throw new Error('No se encontró ningún Tenant activo.');
  }
  console.log(`🏫 Colegio / Tenant: ${tenant.name} (${tenant.id})`);

  const academicYear = await prisma.academicYear.findFirst({
    where: { tenantId: tenant.id, isActive: true },
  });

  if (!academicYear) {
    throw new Error('No se encontró ningún Año Académico activo.');
  }
  console.log(`📅 Año Académico: ${academicYear.name} (${academicYear.year})`);

  const campus = await prisma.campus.findFirst({
    where: { tenantId: tenant.id },
  });

  // 2. Asegurar Niveles Educativos: Pre (Inicial), Primaria, Secundaria
  let preLevel = await prisma.educationalLevel.findFirst({
    where: { tenantId: tenant.id, code: { in: ['INI', 'PRE'] } },
  });
  if (!preLevel) {
    preLevel = await prisma.educationalLevel.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        name: 'Inicial / Pre-escolar',
        code: 'INI',
        order: 0,
        isActive: true,
      },
    });
    console.log(`✨ Nivel creado: ${preLevel.name} (${preLevel.code})`);
  } else {
    console.log(`✅ Nivel existente: ${preLevel.name} (${preLevel.code})`);
  }

  let priLevel = await prisma.educationalLevel.findFirst({
    where: { tenantId: tenant.id, code: 'PRI' },
  });
  if (!priLevel) {
    priLevel = await prisma.educationalLevel.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        name: 'Primaria',
        code: 'PRI',
        order: 1,
        isActive: true,
      },
    });
    console.log(`✨ Nivel creado: ${priLevel.name} (${priLevel.code})`);
  } else {
    console.log(`✅ Nivel existente: ${priLevel.name} (${priLevel.code})`);
  }

  let secLevel = await prisma.educationalLevel.findFirst({
    where: { tenantId: tenant.id, code: 'SEC' },
  });
  if (!secLevel) {
    secLevel = await prisma.educationalLevel.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        name: 'Secundaria',
        code: 'SEC',
        order: 2,
        isActive: true,
      },
    });
    console.log(`✨ Nivel creado: ${secLevel.name} (${secLevel.code})`);
  } else {
    console.log(`✅ Nivel existente: ${secLevel.name} (${secLevel.code})`);
  }

  // 3. Asegurar Grados (GradeLevel)
  // Pre: Inicial 5 Años
  let preGrade = await prisma.gradeLevel.findFirst({
    where: { tenantId: tenant.id, levelId: preLevel.id },
  });
  if (!preGrade) {
    preGrade = await prisma.gradeLevel.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        levelId: preLevel.id,
        name: 'Inicial 5 Años (Kinder)',
        code: 'INI-5A',
        order: 1,
        isActive: true,
      },
    });
    console.log(`✨ Grado creado: ${preGrade.name} (${preGrade.code})`);
  } else {
    console.log(`✅ Grado existente: ${preGrade.name} (${preGrade.code})`);
  }

  // Primaria: 1er o 3er Grado
  let priGrade = await prisma.gradeLevel.findFirst({
    where: { tenantId: tenant.id, levelId: priLevel.id },
  });
  if (!priGrade) {
    priGrade = await prisma.gradeLevel.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        levelId: priLevel.id,
        name: '1er Grado Primaria',
        code: 'PRI-1',
        order: 1,
        isActive: true,
      },
    });
    console.log(`✨ Grado creado: ${priGrade.name} (${priGrade.code})`);
  } else {
    console.log(`✅ Grado existente: ${priGrade.name} (${priGrade.code})`);
  }

  // Secundaria: 5to Año o 1er Año
  let secGrade = await prisma.gradeLevel.findFirst({
    where: { tenantId: tenant.id, levelId: secLevel.id },
  });
  if (!secGrade) {
    secGrade = await prisma.gradeLevel.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        levelId: secLevel.id,
        name: '5to Año Secundaria',
        code: 'SEC-5',
        order: 5,
        isActive: true,
      },
    });
    console.log(`✨ Grado creado: ${secGrade.name} (${secGrade.code})`);
  } else {
    console.log(`✅ Grado existente: ${secGrade.name} (${secGrade.code})`);
  }

  // 4. Asegurar Secciones
  // Pre
  let preSection = await prisma.section.findFirst({
    where: { tenantId: tenant.id, academicYearId: academicYear.id, gradeId: preGrade.id },
  });
  if (!preSection) {
    preSection = await prisma.section.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        gradeId: preGrade.id,
        campusId: campus?.id,
        name: 'A (Ardillitas)',
        code: `SEC-${preGrade.code}-A-${academicYear.year}`,
        maxCapacity: 25,
      },
    });
    console.log(`✨ Sección creada: ${preSection.name} (${preSection.code})`);
  }

  // Primaria
  let priSection = await prisma.section.findFirst({
    where: { tenantId: tenant.id, academicYearId: academicYear.id, gradeId: priGrade.id },
  });
  if (!priSection) {
    priSection = await prisma.section.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        gradeId: priGrade.id,
        campusId: campus?.id,
        name: 'A',
        code: `SEC-${priGrade.code}-A-${academicYear.year}`,
        maxCapacity: 30,
      },
    });
    console.log(`✨ Sección creada: ${priSection.name} (${priSection.code})`);
  }

  // Secundaria
  let secSection = await prisma.section.findFirst({
    where: { tenantId: tenant.id, academicYearId: academicYear.id, gradeId: secGrade.id },
  });
  if (!secSection) {
    secSection = await prisma.section.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        gradeId: secGrade.id,
        campusId: campus?.id,
        name: 'A',
        code: `SEC-${secGrade.code}-A-${academicYear.year}`,
        maxCapacity: 35,
      },
    });
    console.log(`✨ Sección creada: ${secSection.name} (${secSection.code})`);
  }

  // 5. Apoderado de prueba para los nuevos alumnos
  let guardian = await prisma.guardian.findFirst({
    where: { tenantId: tenant.id, documentNumber: '10998877' },
  });
  if (!guardian) {
    guardian = await prisma.guardian.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        documentType: 'DNI',
        documentNumber: '10998877',
        firstName: 'Mariana',
        lastName: 'Castro Morales',
        relationship: 'MOTHER',
        email: 'mariana.castro@email.com',
        phone: '+51 987-654-321',
        isFinancialResponsible: true,
        isEmergencyContact: true,
      },
    });
    console.log(`✨ Apoderado creado: ${guardian.firstName} ${guardian.lastName}`);
  }

  // 6. Contar estudiantes para generar correlativos
  const countStudents = await prisma.student.count({ where: { tenantId: tenant.id } });
  const startNum = countStudents + 1;

  // 7. Lista de los 3 Alumnos a crear (Pre, Primaria, Secundaria)
  const studentsToCreate = [
    {
      levelName: 'Pre / Inicial',
      grade: preGrade,
      section: preSection,
      code: `ALU-2026-${String(startNum).padStart(3, '0')}`,
      matCode: `MAT-2026-${String(startNum).padStart(4, '0')}`,
      documentNumber: '78901001',
      firstName: 'Thiago Benjamín',
      lastName: 'Paredes Castro',
      gender: 'M',
      birthDate: new Date('2021-04-12'), // 5 años
      address: 'Av. Primavera 123, Surco, Lima',
      email: 'thiago.paredes@email.com',
    },
    {
      levelName: 'Primaria',
      grade: priGrade,
      section: priSection,
      code: `ALU-2026-${String(startNum + 1).padStart(3, '0')}`,
      matCode: `MAT-2026-${String(startNum + 1).padStart(4, '0')}`,
      documentNumber: '78901002',
      firstName: 'Camila Andrea',
      lastName: 'Paredes Castro',
      gender: 'F',
      birthDate: new Date('2019-08-23'), // 6-7 años
      address: 'Av. Primavera 123, Surco, Lima',
      email: 'camila.paredes@email.com',
    },
    {
      levelName: 'Secundaria',
      grade: secGrade,
      section: secSection,
      code: `ALU-2026-${String(startNum + 2).padStart(3, '0')}`,
      matCode: `MAT-2026-${String(startNum + 2).padStart(4, '0')}`,
      documentNumber: '78901003',
      firstName: 'Joaquín Alonso',
      lastName: 'Paredes Castro',
      gender: 'M',
      birthDate: new Date('2010-11-15'), // 15-16 años
      address: 'Av. Primavera 123, Surco, Lima',
      email: 'joaquin.paredes@email.com',
    },
  ];

  console.log('\n--- Creando Alumnos y Matrículas ---');
  const results = [];

  for (const s of studentsToCreate) {
    // Upsert Student
    const student = await prisma.student.upsert({
      where: {
        tenantId_documentType_documentNumber: {
          tenantId: tenant.id,
          documentType: 'DNI',
          documentNumber: s.documentNumber,
        },
      },
      update: {
        firstName: s.firstName,
        lastName: s.lastName,
        studentCode: s.code,
      },
      create: {
        id: uuidv4(),
        tenantId: tenant.id,
        studentCode: s.code,
        documentType: 'DNI',
        documentNumber: s.documentNumber,
        firstName: s.firstName,
        lastName: s.lastName,
        birthDate: s.birthDate,
        gender: s.gender,
        email: s.email,
        address: s.address,
        status: 'ACTIVE',
      },
    });

    // Vincular Apoderado
    await prisma.studentGuardian.upsert({
      where: {
        tenantId_studentId_guardianId: {
          tenantId: tenant.id,
          studentId: student.id,
          guardianId: guardian.id,
        },
      },
      update: {},
      create: {
        id: uuidv4(),
        tenantId: tenant.id,
        studentId: student.id,
        guardianId: guardian.id,
        isPrimary: true,
      },
    });

    // Matricular
    const enrollment = await prisma.enrollment.upsert({
      where: {
        tenantId_code: {
          tenantId: tenant.id,
          code: s.matCode,
        },
      },
      update: {},
      create: {
        id: uuidv4(),
        tenantId: tenant.id,
        code: s.matCode,
        studentId: student.id,
        academicYearId: academicYear.id,
        gradeId: s.grade.id,
        sectionId: s.section.id,
        status: 'CONFIRMED',
      },
    });

    results.push({
      nivel: s.levelName,
      alumno: `${student.firstName} ${student.lastName}`,
      codigo: student.studentCode,
      dni: student.documentNumber,
      grado: s.grade.name,
      seccion: s.section.name,
      matricula: enrollment.code,
      estado: enrollment.status,
    });

    console.log(`✅ [${s.levelName}] Alumno creado: ${student.firstName} ${student.lastName} (Código: ${student.studentCode}, DNI: ${student.documentNumber}) - Matriculado en: ${s.grade.name} Secc. ${s.section.name}`);
  }

  // Actualizar contador de uso de estudiantes si existe la tabla
  try {
    await prisma.tenantUsage.upsert({
      where: {
        tenantId_metricKey_periodKey: {
          tenantId: tenant.id,
          metricKey: 'students',
          periodKey: 'current',
        },
      },
      update: {
        value: { increment: 3 },
      },
      create: {
        id: uuidv4(),
        tenantId: tenant.id,
        metricKey: 'students',
        value: countStudents + 3,
        periodKey: 'current',
      },
    });
  } catch (e) {
    // Ignorar si no aplica
  }

  console.log('\n🎉 ¡Proceso completado con éxito!');
  console.table(results);
}

main()
  .catch((e) => {
    console.error('❌ Error creando alumnos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
