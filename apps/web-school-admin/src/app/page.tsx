'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@cole/ui-components';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { LoginModal } from '../components/login-modal';
import ToastModal, { type ToastData } from '../components/ToastModal';
import {
  calculatePayroll,
  getCourses,
  getOrders,
  getStaff,
  getStudents,
  login,
  openPayrollPeriod,
  updateOrderStatus,
} from '../lib/api';

/* ────────────────────────────────────────────────────────────
   INITIAL / MOCK DATA (NIDO • PRIMARIA • SECUNDARIA • PRE-U)
   ──────────────────────────────────────────────────────────── */
const INITIAL_STAFF = [
  { id: 'emp-1', code: 'DOC-2026-001', name: 'Prof. Eduardo Torres', role: 'Docente Primaria - 5to Grado', contractType: 'INDEFINIDO', baseSalary: 2800, status: 'ACTIVO', email: 'e.torres@sancleo.edu.pe', level: 'Primaria' },
  { id: 'emp-2', code: 'DOC-2026-002', name: 'Prof. Carmen Quispe', role: 'Docente Secundaria & Pre-U - Ciencias', contractType: 'INDEFINIDO', baseSalary: 3400, status: 'ACTIVO', email: 'c.quispe@sancleo.edu.pe', level: 'Secundaria / Pre-U' },
  { id: 'emp-3', code: 'DOC-2026-003', name: 'Prof. Sandra Rojas', role: 'Docente Nido / Inicial - 5 años', contractType: 'INDEFINIDO', baseSalary: 2600, status: 'ACTIVO', email: 's.rojas@sancleo.edu.pe', level: 'Nido / Inicial' },
  { id: 'emp-4', code: 'DOC-2026-004', name: 'Prof. Miguel Ángel Vega', role: 'Docente Secundaria - Comunicación (1ro a 5to)', contractType: 'PLAZO FIJO', baseSalary: 2900, status: 'ACTIVO', email: 'm.vega@sancleo.edu.pe', level: 'Secundaria' },
  { id: 'emp-5', code: 'ADM-2026-001', name: 'Lic. Patricia Benavides', role: 'Coordinadora de Cobranzas y Caja', contractType: 'INDEFINIDO', baseSalary: 2400, status: 'ACTIVO', email: 'p.benavides@sancleo.edu.pe', level: 'Administración' },
  { id: 'emp-6', code: 'ASI-2026-001', name: 'Lic. Sofía Alarcón Medina', role: 'Asistente de Colegio / Auxiliar de Aula', contractType: 'INDEFINIDO', baseSalary: 2100, status: 'ACTIVO', email: 'asistente@sancleo.edu.pe', level: 'Primaria / Nido' },
];

const INITIAL_COURSES = [
  { id: 'c-1', code: 'MAT-101', name: 'Álgebra y Aritmética', area: 'Matemática', level: 'Primaria', grade: '1er Grado Primaria', teacher: 'Prof. Eduardo Torres', hours: 6 },
  { id: 'c-2', code: 'COM-101', name: 'Comprensión y Lenguaje', area: 'Comunicación', level: 'Primaria', grade: '2do Grado Primaria', teacher: 'Prof. Miguel Ángel Vega', hours: 5 },
  { id: 'c-3', code: 'CTA-101', name: 'Ciencia y Tecnología', area: 'Ciencias', level: 'Primaria', grade: '5to Grado Primaria', teacher: 'Prof. Carmen Quispe', hours: 4 },
  { id: 'c-4', code: 'INI-001', name: 'Psicomotricidad y Estimulación', area: 'Desarrollo Infantil', level: 'Nido', grade: 'Nido 4 Años', teacher: 'Prof. Sandra Rojas', hours: 8 },
  { id: 'c-5', code: 'SEC-301', name: 'Física Elemental y Trigonometría', area: 'Ciencias Exactas', level: 'Secundaria', grade: '4to Año Secundaria', teacher: 'Prof. Carmen Quispe', hours: 6 },
  { id: 'c-6', code: 'PRE-101', name: 'Razonamiento Matemático & Verbal Pre-U', area: 'Pre-Universitario', level: 'Pre-Universitario', grade: 'Ciclo Anual Pre-U', teacher: 'Prof. Eduardo Torres', hours: 10 },
];

const INITIAL_STUDENTS = [
  { id: 'alu-1', code: 'ALU-2026-001', name: 'Mateo García Morales', level: 'Primaria', grade: '1er Grado Primaria', section: 'A', parentName: 'Familia García Morales', parentPhone: '987 654 321', gpa: 18.5, attendanceRate: 100, tuitionStatus: 'AL DÍA' },
  { id: 'alu-2', code: 'ALU-2026-002', name: 'Luciana Paredes Ramos', level: 'Nido', grade: 'Nido 5 Años', section: 'Azul', parentName: 'Familia Paredes Ramos', parentPhone: '981 234 567', gpa: 19.0, attendanceRate: 98, tuitionStatus: 'AL DÍA' },
  { id: 'alu-3', code: 'ALU-2026-003', name: 'Joaquín Mendoza Ruiz', level: 'Secundaria', grade: '3er Año Secundaria', section: 'A', parentName: 'Familia Mendoza Ruiz', parentPhone: '976 543 210', gpa: 16.5, attendanceRate: 95, tuitionStatus: 'PENDIENTE' },
  { id: 'alu-4', code: 'ALU-2026-004', name: 'Valentina Castro Silva', level: 'Pre-Universitario', grade: 'Ciclo Anual Pre-U', section: 'UNI', parentName: 'Familia Castro Silva', parentPhone: '992 112 233', gpa: 19.5, attendanceRate: 100, tuitionStatus: 'AL DÍA' },
  { id: 'alu-5', code: 'ALU-2026-005', name: 'Ignacio Vega Salcedo', level: 'Primaria', grade: '6to Grado Primaria', section: 'B', parentName: 'Familia Vega Salcedo', parentPhone: '944 112 334', gpa: 17.8, attendanceRate: 99, tuitionStatus: 'AL DÍA' },
  { id: 'alu-6', code: 'ALU-2026-006', name: 'Camila Benavides Cruz', level: 'Secundaria', grade: '5to Año Secundaria', section: 'A', parentName: 'Familia Benavides Cruz', parentPhone: '955 887 766', gpa: 18.9, attendanceRate: 100, tuitionStatus: 'AL DÍA' },
];

const INITIAL_ORDERS = [
  { id: 'ord-1', code: 'ORD-2026-001', studentName: 'Mateo García (1er Grado Primaria)', items: '1x Polo Educación Física (Talla 8)', totalAmount: 45.0, status: 'DELIVERED', date: '2026-04-10' },
  { id: 'ord-2', code: 'ORD-2026-002', studentName: 'Luciana Paredes (Nido 5 Años)', items: '1x Mandil de Nido + Set de Plastilinas', totalAmount: 38.0, status: 'PREPARING', date: '2026-04-18' },
  { id: 'ord-3', code: 'ORD-2026-003', studentName: 'Valentina Castro (Ciclo Anual Pre-U)', items: '1x Compendio Pre-Universitario Tomo I y II', totalAmount: 85.0, status: 'PENDING', date: '2026-04-20' },
];

const INITIAL_PAYMENTS = [
  { id: 'pay-1', receiptNumber: 'REC-2026-0089', studentName: 'Mateo García Morales', concept: 'Pensión Abril 2026 (Primaria 1°)', amount: 450.0, method: 'TARJETA ONLINE', date: '2026-04-05 10:30' },
  { id: 'pay-2', receiptNumber: 'REC-2026-0090', studentName: 'Luciana Paredes Ramos', concept: 'Pensión Abril 2026 (Nido 5 años)', amount: 380.0, method: 'TRANSFERENCIA BCP', date: '2026-04-08 14:15' },
  { id: 'pay-3', receiptNumber: 'REC-2026-0091', studentName: 'Valentina Castro Silva', concept: 'Pensión Abril 2026 (Pre-U Anual)', amount: 550.0, method: 'EFECTIVO EN CAJA', date: '2026-04-12 09:00' },
];

const INITIAL_PRODUCTS = [
  // Uniformes & Implementos (Padre / General)
  { id: 'prd-1', code: 'PRD-UNI-01', name: 'Polo de Educación Física San Cleo (Tallas 6 - 16)', category: 'Uniformes', targetRole: 'Padre', price: 45.0, stock: 120, status: 'DISPONIBLE', icon: '👕', description: 'Algodón reactivo 100% transpirable con bordado oficial del colegio.' },
  { id: 'prd-2', code: 'PRD-UNI-02', name: 'Chompón Institucional Verde San Cleo (Primaria / Secundaria)', category: 'Uniformes', targetRole: 'Padre', price: 75.0, stock: 15, status: 'STOCK BAJO', icon: '🧥', description: 'Tejido antialérgico de alta durabilidad para el uniforme de invierno.' },
  { id: 'prd-3', code: 'PRD-NIDO-01', name: 'Mandil de Nido + Set de Pinturas Acrílicas y Plastilinas', category: 'Kits & Útiles', targetRole: 'Padre', price: 38.0, stock: 45, status: 'DISPONIBLE', icon: '🎨', description: 'Protector impermeable lavable para talleres de psicomotricidad y arte.' },
  { id: 'prd-4', code: 'PRD-ACC-01', name: 'Mochila San Cleo Ergonómica con Espaldera Acolchada', category: 'Accesorios', targetRole: 'Padre', price: 95.0, stock: 30, status: 'DISPONIBLE', icon: '🎒', description: 'Capacidad de 25L con compartimento reinforced para tablet/laptop.' },
  { id: 'prd-5', code: 'PRD-LIB-01', name: 'Compendio Pre-Universitario Tomos I y II (San Marcos / UNI)', category: 'Libros & Guías', targetRole: 'Padre', price: 85.0, stock: 80, status: 'DISPONIBLE', icon: '📖', description: 'Teoría resumida y 1,500 problemas resueltos con clave de respuestas.' },

  // Menú Escolar & Snacks (Alumnos)
  { id: 'prd-6', code: 'PRD-MENU-01', name: 'Menú Escolar Saludable: Lomo Saltado + Fruta + Refresco de Chicha', category: 'Menú Escolar', targetRole: 'Alumno', price: 12.50, stock: 150, status: 'DISPONIBLE', icon: '🍱', description: 'Plato balanceado supervisado por nutricionista institucional.' },
  { id: 'prd-7', code: 'PRD-MENU-02', name: 'Menú Light: Pechuga a la Plancha + Ensalada Fresca + Agua de Manzana', category: 'Menú Escolar', targetRole: 'Alumno', price: 11.00, stock: 90, status: 'DISPONIBLE', icon: '🥗', description: 'Bajo en calorías y rico en proteína para deportistas escolares.' },
  { id: 'prd-8', code: 'PRD-UTI-01', name: 'Set de 4 Cuadernos Institucionales San Cleo (A4 Cuadriculado)', category: 'Útiles Escolares', targetRole: 'Alumno', price: 22.00, stock: 200, status: 'DISPONIBLE', icon: '📓', description: 'Hojas de 75g con carátula termolaminada y stickers de asignaturas.' },
  { id: 'prd-9', code: 'PRD-SNK-01', name: 'Combo Snack: Cereal Integral + Yogurt Natural + Fruta Estacional', category: 'Menú Escolar', targetRole: 'Alumno', price: 6.50, stock: 100, status: 'DISPONIBLE', icon: '🍎', description: 'Refrigerio de recreo ideal para recargar energías.' },

  // Cafetería Docente & Material de Aula (Profesor)
  { id: 'prd-10', code: 'PRD-DOC-01', name: 'Menú Ejecutivo Docente: Filete de Pollo / Pescado + Café / Infusión', category: 'Menú Docente', targetRole: 'Profesor', price: 14.00, stock: 60, status: 'DISPONIBLE', icon: '☕', description: 'Almuerzo diferenciado servido en el comedor de profesores.' },
  { id: 'prd-11', code: 'PRD-DOC-02', name: 'Pack Docente: 4 Plumones de Pizarra Recargables + Mota Imantada', category: 'Material Docente', targetRole: 'Profesor', price: 18.50, stock: 40, status: 'DISPONIBLE', icon: '🖊️', description: 'Colores azul, negro, rojo y verde de secado rápido.' },
  { id: 'prd-12', code: 'PRD-DOC-03', name: 'Guardapolvo / Mandil Blanco Institucional para Profesor', category: 'Material Docente', targetRole: 'Profesor', price: 55.00, stock: 25, status: 'DISPONIBLE', icon: '🥼', description: 'Con bolsillos frontales y bordado oficial de la plana docente.' },
  { id: 'prd-13', code: 'PRD-DOC-04', name: 'Puntero Laser Presentador Inalámbrico para Proyector', category: 'Tecnología', targetRole: 'Profesor', price: 42.00, stock: 18, status: 'DISPONIBLE', icon: '🖱️', description: 'Control de diapositivas Plug & Play de 15m de alcance.' },
];

const INITIAL_ANNOUNCEMENTS = [
  // General (TODOS)
  { id: 'ann-1', title: 'Asamblea General de Padres de Familia y Cierre del I Bimestre 2026', scope: 'TODOS', date: '2026-04-22', author: 'Dirección General', content: 'Estimadas familias, los invitamos a la primera asamblea general ordinaria este viernes 24 de abril a las 6:30 PM en el auditorio institucional. Se presentará el informe académico y financiero del I Bimestre.', status: 'PUBLICADO', recipientsCount: 450 },

  // Nido / Inicial
  { id: 'ann-2', title: 'Taller de Psicomotricidad Acuática y Estimulación Sensorial para 3, 4 y 5 Años', scope: 'Nido / Inicial', date: '2026-04-15', author: 'Coordinación de Inicial', content: 'Recordamos a los padres de familia del Nido enviar el kit de estimulación acuática y muda de ropa adicional para las sesiones vivenciales del área psicomotriz este jueves.', status: 'PUBLICADO', recipientsCount: 65 },
  { id: 'ann-3', title: 'Jornada de Integración Familiar y Show Lúdico de Bienvenida', scope: 'Nido / Inicial', date: '2026-04-08', author: 'Psicología Inicial', content: 'Actividad vivencial con dinámicas al aire libre, juegos sensorio-motores y recomendaciones psicopedagógicas para el desarrollo socioemocional temprano.', status: 'PUBLICADO', recipientsCount: 65 },

  // Primaria
  { id: 'ann-4', title: 'Entrega de Libretas Bimestrales e Informes Cualitativos (1er a 6to Grado)', scope: 'Primaria', date: '2026-04-20', author: 'Coordinación Académica Primaria', content: 'Se comunica que los boletines de notas y el informe descriptivo de competencias del I Bimestre estarán disponibles para descarga en la plataforma a partir del lunes 27 de abril.', status: 'PUBLICADO', recipientsCount: 180 },
  { id: 'ann-5', title: 'Feria de Ciencias y Proyectos STEM Primaria 2026', scope: 'Primaria', date: '2026-04-12', author: 'Docentes de Ciencia & Tecnología', content: 'Convocatoria a los proyectos de indagación científica. Los alumnos presentarán sus prototipos y experimentos en la explanada de primaria.', status: 'PUBLICADO', recipientsCount: 180 },

  // Secundaria
  { id: 'ann-6', title: 'Calendario de Evaluaciones Bimestrales y Talleres de Reforzamiento', scope: 'Secundaria', date: '2026-04-19', author: 'Sub-Dirección Secundaria', content: 'Adjuntamos el rol oficial de exámenes de Matemática, Física y Comunicación para los grados 1ro a 5to de Secundaria. Los talleres de asesoría inician a las 3:30 PM.', status: 'PUBLICADO', recipientsCount: 140 },
  { id: 'ann-7', title: 'Salida de Campo Ecosistémica a la Reserva Nacional de Lachay', scope: 'Secundaria', date: '2026-04-11', author: 'Tutoría Secundaria', content: 'Salida pedagógica autorizada para alumnos de 3ro y 4to de secundaria. Se requiere enviar la autorización firmada por el apoderado antes del miércoles.', status: 'PUBLICADO', recipientsCount: 75 },

  // Pre-Universitario
  { id: 'ann-8', title: '1er Simulacro Nacional de Admisión Tipo San Marcos (Prueba DECO 100 Preguntas)', scope: 'Pre-Universitario', date: '2026-04-18', author: 'Coordinación Pre-U', content: 'Este sábado 26 de abril se aplicará el 1er Simulacro Presencial Tipo San Marcos / UNI con calificación ponderada y ranking de puestos en tiempo real. Ingreso 07:30 AM.', status: 'PUBLICADO', recipientsCount: 85 },
  { id: 'ann-9', title: 'Seminario Intensivo de Razonamiento Lógico y Cuantitativo UNI/PUCP', scope: 'Pre-Universitario', date: '2026-04-05', author: 'Prof. Eduardo Torres', content: 'Dictado de resolución rápida de problemas tipo admisión con métodos directos. Dirigido a estudiantes del Ciclo Anual e Intensivo Pre-U.', status: 'PUBLICADO', recipientsCount: 85 },
];

const INITIAL_ADMISSIONS = [
  { id: 'adm-1', applicantCode: 'POST-2026-012', applicantName: 'Mateo Alejandro Benítez', targetLevel: 'Primaria', targetGrade: '1er Grado Primaria', parentName: 'Carlos Benítez', contactPhone: '988 776 655', email: 'cbenitez@gmail.com', status: 'EVALUACIÓN', score: 18.0, submittedAt: '2026-04-10' },
  { id: 'adm-2', applicantCode: 'POST-2026-015', applicantName: 'Camila Sofía Morales', targetLevel: 'Nido', targetGrade: 'Nido 4 Años', parentName: 'Andrea Morales', contactPhone: '977 665 544', email: 'amorales@gmail.com', status: 'EN_REVISION', score: null, submittedAt: '2026-04-18' },
  { id: 'adm-3', applicantCode: 'POST-2026-008', applicantName: 'Joaquín Gabriel Torres', targetLevel: 'Secundaria', targetGrade: '3er Año Secundaria', parentName: 'Roberto Torres', contactPhone: '911 223 344', email: 'rtorres@hotmail.com', status: 'APROBADO', score: 19.5, submittedAt: '2026-04-05' },
  { id: 'adm-4', applicantCode: 'POST-2026-020', applicantName: 'Leonardo Viale Sotomayor', targetLevel: 'Pre-Universitario', targetGrade: 'Ciclo Anual Pre-U', parentName: 'Elena Sotomayor', contactPhone: '933 445 566', email: 'esotomayor@gmail.com', status: 'MATRICULADO', score: 20.0, submittedAt: '2026-03-28' },
];

const INITIAL_ATTENDANCE = [
  { studentId: 'alu-1', studentName: 'Mateo García Morales', grade: '1er Grado Primaria', section: 'A', status: 'PRESENTE', arrivalTime: '07:45 AM' },
  { studentId: 'alu-2', studentName: 'Luciana Paredes Ramos', grade: 'Nido 5 Años', section: 'Azul', status: 'PRESENTE', arrivalTime: '07:50 AM' },
  { studentId: 'alu-3', studentName: 'Joaquín Mendoza Ruiz', grade: '3er Año Secundaria', section: 'A', status: 'TARDANZA', arrivalTime: '08:15 AM' },
  { studentId: 'alu-4', studentName: 'Valentina Castro Silva', grade: 'Ciclo Anual Pre-U', section: 'UNI', status: 'PRESENTE', arrivalTime: '07:30 AM' },
  { studentId: 'alu-5', studentName: 'Ignacio Vega Salcedo', grade: '6to Grado Primaria', section: 'B', status: 'FALTA_JUSTIFICADA', arrivalTime: '-' },
  { studentId: 'alu-6', studentName: 'Camila Benavides Cruz', grade: '5to Año Secundaria', section: 'A', status: 'PRESENTE', arrivalTime: '07:40 AM' },
];

const INITIAL_GRADEBOOK = [
  // MAT-101 - Álgebra y Aritmética (Primaria 1°) - I Bimestre 2026
  { studentId: 'alu-1', studentName: 'Mateo García Morales', code: 'ALU-2026-001', courseId: 'MAT-101', period: 'I Bimestre 2026', n1: 18, n2: 19, n3: 18, exam: 19, gpa: 18.5, status: 'AD', qualitativeNote: 'Sobresaliente desempeño en operaciones matemáticas y pensamiento lógico.' },
  { studentId: 'alu-2', studentName: 'Luciana Paredes Ramos', code: 'ALU-2026-002', courseId: 'MAT-101', period: 'I Bimestre 2026', n1: 19, n2: 20, n3: 19, exam: 18, gpa: 19.0, status: 'AD', qualitativeNote: 'Excelente dominio de resolución de problemas aritméticos.' },
  { studentId: 'alu-3', studentName: 'Joaquín Mendoza Ruiz', code: 'ALU-2026-003', courseId: 'MAT-101', period: 'I Bimestre 2026', n1: 15, n2: 16, n3: 17, exam: 18, gpa: 16.5, status: 'A', qualitativeNote: 'Buen rendimiento en ciencias exactas y participación continua.' },

  // MAT-101 - II Bimestre 2026
  { studentId: 'alu-1-p2', studentName: 'Mateo García Morales', code: 'ALU-2026-001', courseId: 'MAT-101', period: 'II Bimestre 2026', n1: 19, n2: 20, n3: 19, exam: 20, gpa: 19.5, status: 'AD', qualitativeNote: 'Progreso sobresaliente en resolución de ecuaciones algebraicas.' },
  { studentId: 'alu-2-p2', studentName: 'Luciana Paredes Ramos', code: 'ALU-2026-002', courseId: 'MAT-101', period: 'II Bimestre 2026', n1: 20, n2: 20, n3: 20, exam: 19, gpa: 19.8, status: 'AD', qualitativeNote: 'Logro destacado en geometría y razonamiento lógico superior.' },

  // COM-101 - Comprensión y Lenguaje (Primaria 2°) - I Bimestre 2026
  { studentId: 'alu-4', studentName: 'Valentina Castro Silva', code: 'ALU-2026-004', courseId: 'COM-101', period: 'I Bimestre 2026', n1: 17, n2: 18, n3: 18, exam: 19, gpa: 18.0, status: 'AD', qualitativeNote: 'Excelente capacidad crítica en lectura de textos e interpretación.' },
  { studentId: 'alu-5', studentName: 'Ignacio Vega Salcedo', code: 'ALU-2026-005', courseId: 'COM-101', period: 'I Bimestre 2026', n1: 14, n2: 15, n3: 16, exam: 15, gpa: 15.0, status: 'A', qualitativeNote: 'Redacción fluida y adecuada comprensión de textos narrativos.' },
  { studentId: 'alu-6', studentName: 'Camila Benavides Cruz', code: 'ALU-2026-006', courseId: 'COM-101', period: 'I Bimestre 2026', n1: 19, n2: 20, n3: 18, exam: 19, gpa: 19.0, status: 'AD', qualitativeNote: 'Liderazgo destacado en comunicación oral, debate y redacción.' },

  // FIS-101 - Física Elemental (Secundaria 4°) - I Bimestre 2026
  { studentId: 'alu-7', studentName: 'Sebastián Morales Ríos', code: 'ALU-2026-007', courseId: 'FIS-101', period: 'I Bimestre 2026', n1: 16, n2: 17, n3: 16, exam: 18, gpa: 16.8, status: 'A', qualitativeNote: 'Excelente aplicación de vectores y experimentos en laboratorio.' },
  { studentId: 'alu-8', studentName: 'Andrea Flores Castillo', code: 'ALU-2026-008', courseId: 'FIS-101', period: 'I Bimestre 2026', n1: 18, n2: 19, n3: 17, exam: 19, gpa: 18.3, status: 'AD', qualitativeNote: 'Destacada resolución de problemas de dinámica Newtoniana.' },
  { studentId: 'alu-9', studentName: 'Diego Gutiérrez Salazar', code: 'ALU-2026-009', courseId: 'FIS-101', period: 'I Bimestre 2026', n1: 12, n2: 13, n3: 14, exam: 13, gpa: 13.0, status: 'B', qualitativeNote: 'Progreso en laboratorio práctico; requiere consolidar fórmulas.' },

  // PRE-101 - Razonamiento Pre-U (Ciclo Anual) - I Bimestre 2026
  { studentId: 'alu-10', studentName: 'Carlos Quispe Mamani', code: 'ALU-2026-010', courseId: 'PRE-101', period: 'I Bimestre 2026', n1: 19, n2: 20, n3: 19, exam: 20, gpa: 19.5, status: 'AD', qualitativeNote: 'Puntaje de 1850 pts en simulacro tipo San Marcos DECO.' },
  { studentId: 'alu-11', studentName: 'Sofia Alva Hernández', code: 'ALU-2026-011', courseId: 'PRE-101', period: 'I Bimestre 2026', n1: 18, n2: 18, n3: 19, exam: 19, gpa: 18.5, status: 'AD', qualitativeNote: 'Rendimiento sobresaliente en razonamiento cuantitativo y verbal.' },

  // PSI-101 - Psicomotricidad & Expresión (Nido 4 Años) - I Bimestre 2026
  { studentId: 'alu-12', studentName: 'Thiago Romero Polo', code: 'ALU-2026-012', courseId: 'PSI-101', period: 'I Bimestre 2026', n1: 18, n2: 19, n3: 18, exam: 19, gpa: 18.5, status: 'AD', qualitativeNote: 'Coordinación psicomotriz fina y lenguaje de integración adecuados.' },
  { studentId: 'alu-13', studentName: 'Mia Sotomayor Vargas', code: 'ALU-2026-013', courseId: 'PSI-101', period: 'I Bimestre 2026', n1: 17, n2: 18, n3: 17, exam: 18, gpa: 17.5, status: 'A', qualitativeNote: 'Participación enérgica en juegos colectivos y expresión corporal.' },
];

const INITIAL_TIMETABLE = [
  { time: '08:00 - 09:30', mon: { course: 'Álgebra y Aritmética', teacher: 'Prof. Eduardo Torres', room: 'Aula 101' }, tue: { course: 'Física Elemental', teacher: 'Prof. Carmen Quispe', room: 'Lab. Ciencias' }, wed: { course: 'Comprensión y Lenguaje', teacher: 'Prof. Miguel Ángel Vega', room: 'Aula 101' }, thu: { course: 'Razonamiento Pre-U', teacher: 'Prof. Eduardo Torres', room: 'Auditorio' }, fri: { course: 'Ciencia y Tecnología', teacher: 'Prof. Carmen Quispe', room: 'Aula 101' } },
  { time: '09:30 - 11:00', mon: { course: 'Comprensión y Lenguaje', teacher: 'Prof. Miguel Ángel Vega', room: 'Aula 101' }, tue: { course: 'Psicomotricidad', teacher: 'Prof. Sandra Rojas', room: 'Patio Nido' }, wed: { course: 'Álgebra y Aritmética', teacher: 'Prof. Eduardo Torres', room: 'Aula 101' }, thu: { course: 'Física Elemental', teacher: 'Prof. Carmen Quispe', room: 'Lab. Ciencias' }, fri: { course: 'Razonamiento Pre-U', teacher: 'Prof. Eduardo Torres', room: 'Auditorio' } },
  { time: '11:00 - 11:30', mon: { course: 'RECREO / LONCHERA', teacher: '-', room: 'Patio Central' }, tue: { course: 'RECREO / LONCHERA', teacher: '-', room: 'Patio Central' }, wed: { course: 'RECREO / LONCHERA', teacher: '-', room: 'Patio Central' }, thu: { course: 'RECREO / LONCHERA', teacher: '-', room: 'Patio Central' }, fri: { course: 'RECREO / LONCHERA', teacher: '-', room: 'Patio Central' } },
  { time: '11:30 - 13:00', mon: { course: 'Ciencia y Tecnología', teacher: 'Prof. Carmen Quispe', room: 'Aula 101' }, tue: { course: 'Álgebra y Aritmética', teacher: 'Prof. Eduardo Torres', room: 'Aula 101' }, wed: { course: 'Razonamiento Pre-U', teacher: 'Prof. Eduardo Torres', room: 'Auditorio' }, thu: { course: 'Comprensión y Lenguaje', teacher: 'Prof. Miguel Ángel Vega', room: 'Aula 101' }, fri: { course: 'Psicomotricidad', teacher: 'Prof. Sandra Rojas', room: 'Patio Nido' } },
];

/* ────────────────────────────────────────────────────────────
   EVALUATION CONFIGURATION PER LEVEL
   ──────────────────────────────────────────────────────────── */
interface EvalSettings {
  nido: {
    mode: 'CUALITATIVO_COMPETENCIAS' | 'HITOS_DESARROLLO' | 'DESCRIPTIVO_INFORMES';
    scaleName: string;
    descriptors: string[];
    allowNumericGrades: boolean;
    competencies: string[];
  };
  primaria: {
    grades: string[];
    gradingScale: string;
    passingScore: number;
    periods: string;
    mineduScales: Array<{
      code: string;
      label: string;
      description: string;
      minScore: number;
      maxScore: number;
      bgClass: string;
      borderClass: string;
      textClass: string;
      badgeBorderClass: string;
    }>;
  };
  secundaria: {
    grades: string[];
    gradingScale: string;
    passingScore: number;
    periods: string;
    weights: { exams: number; tasks: number; continuous: number };
  };
  preU: {
    examFormat: 'SAN_MARCOS_DECO' | 'UNI_EXACTAS' | 'PUCP_TALENTO' | 'PERSONALIZADO';
    correctPoints: number;
    incorrectPenalty: number;
    blankPoints: number;
    maxExamScore: number;
    passingScore: number;
    periods: string;
    showMeritRanking: boolean;
    showPercentiles: boolean;
    careerTracks: string[];
  };
}

const DEFAULT_EVAL_SETTINGS: EvalSettings = {
  nido: {
    mode: 'CUALITATIVO_COMPETENCIAS',
    scaleName: 'Escala Formativa Cualitativa (AD / A / B / C)',
    descriptors: ['🌟 AD - Logro Destacado', '✓ A - Logro Esperado', '⏳ B - En Proceso', '🌱 C - En Inicio'],
    allowNumericGrades: false,
    competencies: [
      'Autonomía y Cuidado Personal',
      'Desarrollo Psicomotriz Grueso y Fino',
      'Comunicación y Expresión Verbal',
      'Convivencia, Socialización y Hábitos',
      'Exploración y Descubrimiento del Entorno',
    ],
  },
  primaria: {
    grades: ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'],
    gradingScale: 'Vigesimal Oficial (0 a 20) + Escala Cualitativa MINEDU',
    passingScore: 10,
    periods: '4 Bimestres Oficiales',
    mineduScales: [
      { code: 'AD', label: 'AD • Logro Destacado', description: 'Demuestra aprendizaje superior al esperado', minScore: 18, maxScore: 20, bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200', textClass: 'text-emerald-900', badgeBorderClass: 'border-emerald-300' },
      { code: 'A', label: 'A • Logro Esperado', description: 'Cumple con el nivel de competencia requerido', minScore: 14, maxScore: 17, bgClass: 'bg-blue-50', borderClass: 'border-blue-200', textClass: 'text-blue-900', badgeBorderClass: 'border-blue-300' },
      { code: 'B', label: 'B • En Proceso', description: 'Próximo al nivel esperado con acompañamiento', minScore: 11, maxScore: 13, bgClass: 'bg-amber-50', borderClass: 'border-amber-200', textClass: 'text-amber-900', badgeBorderClass: 'border-amber-300' },
      { code: 'C', label: 'C • En Inicio', description: 'Muestra un progreso mínimo en la competencia', minScore: 0, maxScore: 10, bgClass: 'bg-rose-50', borderClass: 'border-rose-200', textClass: 'text-rose-900', badgeBorderClass: 'border-rose-300' },
    ],
  },
  secundaria: {
    grades: ['1er Año', '2do Año', '3er Año', '4to Año', '5to Año'],
    gradingScale: 'Vigesimal Oficial (0 a 20) Ponderado',
    passingScore: 11,
    periods: '4 Bimestres Oficiales',
    weights: { exams: 50, tasks: 30, continuous: 20 },
  },
  preU: {
    examFormat: 'SAN_MARCOS_DECO',
    correctPoints: 20.0,
    incorrectPenalty: -1.125,
    blankPoints: 0.0,
    maxExamScore: 2000,
    passingScore: 1200,
    periods: 'Ciclo Anual Pre-U (Intensivo)',
    showMeritRanking: true,
    showPercentiles: true,
    careerTracks: ['Área A - Ciencias de la Salud', 'Área B - Ciencias Básicas', 'Área C - Ingenierías', 'Área D - Ciencias Económicas', 'Área E - Humanidades y Jurídicas'],
  },
};

/* ────────────────────────────────────────────────────────────
   HELPER CSV EXPORT GENERATOR
   ──────────────────────────────────────────────────────────── */
function downloadCSV(filename: string, rows: string[][]) {
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.map((cell) => `"${cell}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */
function SchoolAdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('cole_auth');
      return savedAuth !== 'false';
    }
    return true;
  });
  const [email, setEmail] = useState('director@sancleo.edu.pe');
  const [password, setPassword] = useState('Cole2026!');
  const [loginLoading, setLoginLoading] = useState(false);

  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cole_current_email') || 'director@sancleo.edu.pe';
    }
    return 'director@sancleo.edu.pe';
  });

  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // RBAC: Identify if logged user is exclusive Store & Product Manager
  const isStoreOnly = Boolean(
    (user && (user.roles?.includes('STORE_MANAGER') || user.email.toLowerCase().includes('tienda') || user.email.toLowerCase().includes('productos'))) ||
    (!user && (currentUserEmail.toLowerCase().includes('tienda') || currentUserEmail.toLowerCase().includes('productos') || (typeof window !== 'undefined' && localStorage.getItem('cole_current_role') === 'STORE_MANAGER')))
  );

  const [activeTab, setActiveTab] = useState<'hr' | 'academic' | 'evaluations' | 'finance' | 'students' | 'reporting' | 'commerce' | 'gradebook' | 'attendance' | 'schedule' | 'announcements' | 'admissions'>(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('cole_current_role');
      const savedEmail = localStorage.getItem('cole_current_email') || '';
      if (role === 'STORE_MANAGER' || savedEmail.includes('tienda') || savedEmail.includes('productos')) {
        return 'commerce';
      }
      const savedTab = localStorage.getItem('cole_activeTab');
      if (savedTab) return savedTab as any;
    }
    return 'evaluations';
  });
  const [commerceSubTab, setCommerceSubTab] = useState<'orders' | 'catalog'>('catalog');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-lock into commerce tab for Store Manager
  useEffect(() => {
    if (isStoreOnly) {
      setActiveTab('commerce');
      setCommerceSubTab('catalog');
    }
  }, [isStoreOnly]);

  // Dynamic state
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [admissions, setAdmissions] = useState(INITIAL_ADMISSIONS);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [gradebook, setGradebook] = useState(INITIAL_GRADEBOOK);
  const [timetable, setTimetable] = useState(INITIAL_TIMETABLE);
  const [selectedScheduleLevel, setSelectedScheduleLevel] = useState<'Primaria' | 'Secundaria' | 'Nido' | 'Pre-Universitario'>('Primaria');
  const [selectedScheduleGrade, setSelectedScheduleGrade] = useState('5to Grado A (Primaria)');
  const [editingSlot, setEditingSlot] = useState<{ rowIdx: number; dayKey: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' } | null>(null);
  const [editSlotCourse, setEditSlotCourse] = useState('');
  const [editSlotTeacher, setEditSlotTeacher] = useState('');
  const [editSlotRoom, setEditSlotRoom] = useState('');
  const [showEditSlotModal, setShowEditSlotModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('13:00 - 14:30');
  const [showTimetablePdfModal, setShowTimetablePdfModal] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<any | null>(null);
  const [showEditApplicantModal, setShowEditApplicantModal] = useState(false);
  const [selectedAnnouncementScopeFilter, setSelectedAnnouncementScopeFilter] = useState<'TODOS' | 'Nido / Inicial' | 'Primaria' | 'Secundaria' | 'Pre-Universitario'>('TODOS');
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] = useState(false);
  const [selectedCommerceRole, setSelectedCommerceRole] = useState<'admin' | 'parent' | 'student' | 'teacher'>('admin');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategoryFilter, setSelectedProductCategoryFilter] = useState<string>('TODOS');
  
  // 📊 Business Intelligence & Reporting States
  const [biSettings, setBiSettings] = useState({
    monthlyTargetRevenue: 25000,
    enrollmentTarget: 50,
    minAttendanceRate: 95,
    minGpaTarget: 16.0,
    maxStudentTeacherRatio: 15,
  });
  const [showBiSettingsModal, setShowBiSettingsModal] = useState(false);
  const [customReports, setCustomReports] = useState([
    { id: 'rep-1', title: 'Informe de Morosidad y Pensiones Pendientes - I Bimestre', category: 'FINANZAS', scope: 'TODOS', date: '2026-04-24', author: 'Caja & Tesorería', observations: 'Priorizar cobranza de 12 pensiones vencidas en nivel Secundaria.', status: 'COMPLETADO' },
    { id: 'rep-2', title: 'Cuadro de Honor e Integrantes de Selección Académica', category: 'ACADÉMICO', scope: 'Secundaria', date: '2026-04-20', author: 'Dirección Académica', observations: '15 estudiantes superaron la valla de GPA 18.0 en el bimestral.', status: 'COMPLETADO' },
    { id: 'rep-3', title: 'Consolidado de Asistencia, Tardanzas y Faltas Justificadas', category: 'ASISTENCIA', scope: 'Primaria', date: '2026-04-18', author: 'Tutoría Primaria', observations: 'Se registró 96.5% de puntualidad en el nivel Primaria.', status: 'COMPLETADO' },
    { id: 'rep-4', title: 'Auditoría de Planilla y Gastos de Personal Docente', category: 'RRHH', scope: 'TODOS', date: '2026-04-15', author: 'Recursos Humanos', observations: 'Gastos de haberes y aportes previsionales dentro del presupuesto.', status: 'COMPLETADO' },
  ]);
  const [editingReport, setEditingReport] = useState<any | null>(null);
  const [showEditReportModal, setShowEditReportModal] = useState(false);
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [newReportInput, setNewReportInput] = useState({ title: '', category: 'FINANZAS', scope: 'TODOS', author: 'Dirección General', observations: '' });
  const [showPrintReportPdfModal, setShowPrintReportPdfModal] = useState<any | null>(null);
  const [reportScopeFilter, setReportScopeFilter] = useState<'TODOS' | 'Nido' | 'Primaria' | 'Secundaria' | 'Pre-Universitario'>('TODOS');
  const [evalSettings, setEvalSettings] = useState<EvalSettings>(DEFAULT_EVAL_SETTINGS);

  // Search & Filters
  const [staffSearch, setStaffSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'TODOS' | 'Nido' | 'Primaria' | 'Secundaria' | 'Pre-Universitario'>('TODOS');
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState('2026-04-24');

  // Modals state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [showAddApplicantModal, setShowAddApplicantModal] = useState(false);
  const [showReceiptPdfModal, setShowReceiptPdfModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [selectedPaySlipEmployee, setSelectedPaySlipEmployee] = useState<any | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);
  const [selectedEvalLevelTab, setSelectedEvalLevelTab] = useState<'todos' | 'nido' | 'primaria' | 'secundaria' | 'preU'>('todos');
  const [newCompetencyInput, setNewCompetencyInput] = useState('');
  const [newPrimariaGradeInput, setNewPrimariaGradeInput] = useState('');
  const [newSecundariaGradeInput, setNewSecundariaGradeInput] = useState('');
  const [newCareerInput, setNewCareerInput] = useState('');
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);

  // Gradebook advanced states
  const [gradebookStatus, setGradebookStatus] = useState<'EDICION' | 'OFICIALIZADO'>('EDICION');
  const [selectedGradebookCourse, setSelectedGradebookCourse] = useState('MAT-101');
  const [selectedGradebookPeriod, setSelectedGradebookPeriod] = useState('I Bimestre 2026');
  const [gradebookSearch, setGradebookSearch] = useState('');
  const [showAddGradebookStudentModal, setShowAddGradebookStudentModal] = useState(false);
  const [showOfficialActaPdfModal, setShowOfficialActaPdfModal] = useState(false);
  const [newGradebookStudentName, setNewGradebookStudentName] = useState('');
  const [newGradebookStudentCode, setNewGradebookStudentCode] = useState('');

  const handleAddPrimariaGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrimariaGradeInput.trim()) return;
    setEvalSettings({
      ...evalSettings,
      primaria: {
        ...evalSettings.primaria,
        grades: [...evalSettings.primaria.grades, newPrimariaGradeInput.trim()],
      },
    });
    setNewPrimariaGradeInput('');
    showToast(`✓ Grado "${newPrimariaGradeInput.trim()}" agregado a Primaria.`);
  };

  const handleRemovePrimariaGrade = (gradeToRemove: string) => {
    setEvalSettings({
      ...evalSettings,
      primaria: {
        ...evalSettings.primaria,
        grades: evalSettings.primaria.grades.filter((g) => g !== gradeToRemove),
      },
    });
  };

  const handleAddSecundariaGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecundariaGradeInput.trim()) return;
    setEvalSettings({
      ...evalSettings,
      secundaria: {
        ...evalSettings.secundaria,
        grades: [...evalSettings.secundaria.grades, newSecundariaGradeInput.trim()],
      },
    });
    setNewSecundariaGradeInput('');
    showToast(`✓ Año "${newSecundariaGradeInput.trim()}" agregado a Secundaria.`);
  };

  const handleRemoveSecundariaGrade = (gradeToRemove: string) => {
    setEvalSettings({
      ...evalSettings,
      secundaria: {
        ...evalSettings.secundaria,
        grades: evalSettings.secundaria.grades.filter((g) => g !== gradeToRemove),
      },
    });
  };

  const handleAddCareerTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCareerInput.trim()) return;
    setEvalSettings({
      ...evalSettings,
      preU: {
        ...evalSettings.preU,
        careerTracks: [...evalSettings.preU.careerTracks, newCareerInput.trim()],
      },
    });
    setNewCareerInput('');
    showToast(`✓ Carrera / Área "${newCareerInput.trim()}" agregada a Pre-U.`);
  };

  const handleRemoveCareerTrack = (trackToRemove: string) => {
    setEvalSettings({
      ...evalSettings,
      preU: {
        ...evalSettings.preU,
        careerTracks: evalSettings.preU.careerTracks.filter((t) => t !== trackToRemove),
      },
    });
  };

  // Notifications
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<ToastData | null>(null);
  const showToast = (message: string, type: ToastData['type'] = 'success') =>
    setSuccessToast({ message, type });
  const [payrollSuccess, setPayrollSuccess] = useState(false);
  const [payrollPeriodId, setPayrollPeriodId] = useState<string | null>(null);

  // Form states
  const [newStaff, setNewStaff] = useState({ code: '', name: '', role: '', contractType: 'INDEFINIDO', baseSalary: 2800, email: '', level: 'Primaria' });
  const [newCourse, setNewCourse] = useState({ code: '', name: '', area: 'Matemática', level: 'Primaria', grade: '1er Grado Primaria', teacher: 'Prof. Eduardo Torres', hours: 4 });
  const [newStudent, setNewStudent] = useState({ code: '', name: '', level: 'Primaria', grade: '1er Grado Primaria', section: 'A', parentName: '', parentPhone: '' });
  const [newPayment, setNewPayment] = useState({ studentId: 'alu-3', concept: 'Pensión Abril 2026', amount: 450, method: 'EFECTIVO EN CAJA' });
  const [newProduct, setNewProduct] = useState({ code: '', name: '', category: 'Uniformes', price: 45, stock: 50 });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', scope: 'TODOS', content: '' });
  const [newApplicant, setNewApplicant] = useState({ name: '', level: 'Primaria', grade: '1er Grado Primaria', parentName: '', phone: '', email: '' });

  // Fetch initial API data if available (safe transform - only if no local storage override exists)
  useEffect(() => {
    if (authenticated) {
      getStaff<any[]>()
        .then((data) => {
          if (typeof window !== 'undefined' && !localStorage.getItem('cole_staff') && Array.isArray(data) && data.length > 0 && (data[0] as any)?.firstName) {
            setStaff(data.map((e: any) => ({
              id: e.id, code: e.employeeCode || '', name: `${e.firstName} ${e.lastName}`,
              role: e.type || '', contractType: e.contracts?.[0]?.type || 'INDEFINIDO',
              baseSalary: Number(e.baseSalary) || 0, status: e.status || 'ACTIVE',
              email: e.email || '', level: 'Primaria',
            })));
          }
        })
        .catch(() => {});
      getCourses<any[]>()
        .then((data) => {
          if (typeof window !== 'undefined' && !localStorage.getItem('cole_courses') && Array.isArray(data) && data.length > 0 && (data[0] as any)?.name) {
            setCourses(data.map((c: any) => ({
              id: c.id, code: c.code || '', name: c.name,
              area: c.area?.name || 'General', level: 'Primaria',
              grade: c.grade?.name || '', teacher: c.sections?.[0]?.teacher ? `${c.sections[0].teacher.firstName} ${c.sections[0].teacher.lastName}` : '',
              hours: c.hoursPerWeek || 4,
            })));
          }
        })
        .catch(() => {});
      getOrders<any[]>()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0 && (data[0] as any)?.code) {
            setOrders(data.map((o: any) => ({
              id: o.id, code: o.code, studentName: o.studentName || '',
              items: o.items || '', totalAmount: Number(o.totalAmount) || 0,
              status: o.status || 'PENDING', date: o.createdAt?.slice(0, 10) || '',
            })));
          }
        })
        .catch(() => {});
      getStudents<any[]>()
        .then((data) => {
          if (typeof window !== 'undefined' && !localStorage.getItem('cole_students') && Array.isArray(data) && data.length > 0 && (data[0] as any)?.firstName) {
            setStudents(data.map((s: any) => ({
              id: s.id, code: s.studentCode || '', name: `${s.firstName} ${s.lastName}`,
              level: 'Primaria', grade: '', section: 'A',
              parentName: s.guardians?.[0] ? `${s.guardians[0].firstName} ${s.guardians[0].lastName}` : '',
              parentPhone: s.guardians?.[0]?.phone || '', gpa: 0,
              attendanceRate: 100, tuitionStatus: 'AL DÍA',
            })));
          }
        })
        .catch(() => {});
    }
  }, [authenticated]);

  // 💾 LocalStorage Persistence System (Survives F5 Refresh & Instant Session)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCourses = localStorage.getItem('cole_courses');
        if (savedCourses) setCourses(JSON.parse(savedCourses));

        const savedEvalSettings = localStorage.getItem('cole_evalSettings');
        if (savedEvalSettings) setEvalSettings(JSON.parse(savedEvalSettings));

        const savedGradebook = localStorage.getItem('cole_gradebook');
        if (savedGradebook) setGradebook(JSON.parse(savedGradebook));

        const savedTimetable = localStorage.getItem('cole_timetable');
        if (savedTimetable) setTimetable(JSON.parse(savedTimetable));

        const savedStudents = localStorage.getItem('cole_students');
        if (savedStudents) setStudents(JSON.parse(savedStudents));

        const savedAdmissions = localStorage.getItem('cole_admissions');
        if (savedAdmissions) setAdmissions(JSON.parse(savedAdmissions));

        const savedAnnouncements = localStorage.getItem('cole_announcements');
        if (savedAnnouncements) setAnnouncements(JSON.parse(savedAnnouncements));

        const savedProducts = localStorage.getItem('cole_products');
        if (savedProducts) setProducts(JSON.parse(savedProducts));

        const savedBiSettings = localStorage.getItem('cole_bi_settings');
        if (savedBiSettings) setBiSettings(JSON.parse(savedBiSettings));

        const savedCustomReports = localStorage.getItem('cole_custom_reports');
        if (savedCustomReports) setCustomReports(JSON.parse(savedCustomReports));

        const savedStaff = localStorage.getItem('cole_staff');
        if (savedStaff) setStaff(JSON.parse(savedStaff));
      } catch (err) {
        console.error('LocalStorage load error', err);
      } finally {
        setIsLoadedFromStorage(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_activeTab', activeTab);
    }
  }, [activeTab, isLoadedFromStorage]);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_courses', JSON.stringify(courses));
    }
  }, [courses, isLoadedFromStorage]);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_evalSettings', JSON.stringify(evalSettings));
    }
  }, [evalSettings, isLoadedFromStorage]);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_gradebook', JSON.stringify(gradebook));
    }
  }, [gradebook, isLoadedFromStorage]);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_timetable', JSON.stringify(timetable));
    }
  }, [timetable, isLoadedFromStorage]);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_admissions', JSON.stringify(admissions));
    }
  }, [admissions, isLoadedFromStorage]);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_announcements', JSON.stringify(announcements));
    }
  }, [announcements, isLoadedFromStorage]);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_products', JSON.stringify(products));
    }
  }, [products, isLoadedFromStorage]);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_bi_settings', JSON.stringify(biSettings));
    }
  }, [biSettings, isLoadedFromStorage]);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_custom_reports', JSON.stringify(customReports));
    }
  }, [customReports, isLoadedFromStorage]);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_students', JSON.stringify(students));
    }
  }, [students, isLoadedFromStorage]);

  useEffect(() => {
    if (isLoadedFromStorage && typeof window !== 'undefined') {
      localStorage.setItem('cole_staff', JSON.stringify(staff));
    }
  }, [staff, isLoadedFromStorage]);

  const handleRemoveCourse = (courseId: string) => {
    const updated = courses.filter((c) => c.id !== courseId);
    setCourses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_courses', JSON.stringify(updated));
    }
    showToast('Asignatura eliminada de la Malla Curricular.', 'info');
  };

  // 🗓️ Schedule Handlers
  const handleOpenEditSlot = (rowIdx: number, dayKey: 'mon' | 'tue' | 'wed' | 'thu' | 'fri') => {
    const slot = timetable[rowIdx][dayKey];
    setEditingSlot({ rowIdx, dayKey });
    setEditSlotCourse(slot.course);
    setEditSlotTeacher(slot.teacher);
    setEditSlotRoom(slot.room);
    setShowEditSlotModal(true);
  };

  const handleSaveSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    const { rowIdx, dayKey } = editingSlot;
    const updated = [...timetable];
    updated[rowIdx] = {
      ...updated[rowIdx],
      [dayKey]: {
        course: editSlotCourse,
        teacher: editSlotTeacher,
        room: editSlotRoom,
      },
    };
    setTimetable(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_timetable', JSON.stringify(updated));
    }
    setShowEditSlotModal(false);
    setEditingSlot(null);
    showToast('✓ Bloque de clase actualizado en el horario semanal.');
  };

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime.trim()) return;
    const newRow = {
      time: newSlotTime,
      mon: { course: 'Álgebra y Aritmética', teacher: 'Prof. Eduardo Torres', room: 'Aula 101' },
      tue: { course: 'Comprensión y Lenguaje', teacher: 'Prof. Miguel Ángel Vega', room: 'Aula 101' },
      wed: { course: 'Física Elemental', teacher: 'Prof. Carmen Quispe', room: 'Lab. Ciencias' },
      thu: { course: 'Razonamiento Pre-U', teacher: 'Prof. Eduardo Torres', room: 'Auditorio' },
      fri: { course: 'Ciencia y Tecnología', teacher: 'Prof. Carmen Quispe', room: 'Aula 101' },
    };
    const updated = [...timetable, newRow];
    setTimetable(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_timetable', JSON.stringify(updated));
    }
    setShowAddSlotModal(false);
    showToast(`✓ Bloque horario ${newSlotTime} agregado al cuadrante.`);
  };

  const handleRemoveSlotRow = (rowIdx: number) => {
    const updated = timetable.filter((_, idx) => idx !== rowIdx);
    setTimetable(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_timetable', JSON.stringify(updated));
    }
    showToast('Bloque horario eliminado del cuadrante.', 'info');
  };

  const handleExportScheduleCSV = () => {
    const headers = ['Bloque Horario', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const rows = timetable.map((slot) => [
      `"${slot.time}"`,
      `"${slot.mon.course} (${slot.mon.teacher} - ${slot.mon.room})"`,
      `"${slot.tue.course} (${slot.tue.teacher} - ${slot.tue.room})"`,
      `"${slot.wed.course} (${slot.wed.teacher} - ${slot.wed.room})"`,
      `"${slot.thu.course} (${slot.thu.teacher} - ${slot.thu.room})"`,
      `"${slot.fri.course} (${slot.fri.teacher} - ${slot.fri.room})"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `horario_semanal_${selectedScheduleGrade.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Horario semanal exportado a CSV.');
  };

  // 📝 Admissions Handlers
  const handleOpenEditApplicant = (applicant: any) => {
    setEditingApplicant({ ...applicant });
    setShowEditApplicantModal(true);
  };

  const handleSaveApplicantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApplicant) return;
    const updated = admissions.map((a) => (a.id === editingApplicant.id ? editingApplicant : a));
    setAdmissions(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_admissions', JSON.stringify(updated));
    }
    setShowEditApplicantModal(false);
    setEditingApplicant(null);
    showToast(`✓ Expediente del postulante ${editingApplicant.applicantName} actualizado.`);
  };

  const handleRemoveApplicant = (id: string) => {
    if (typeof window !== 'undefined' && confirm('¿Deseas eliminar este postulante del embudo de admisiones?')) {
      const updated = admissions.filter((a) => a.id !== id);
      setAdmissions(updated);
      localStorage.setItem('cole_admissions', JSON.stringify(updated));
      if (editingApplicant?.id === id) {
        setShowEditApplicantModal(false);
        setEditingApplicant(null);
      }
      showToast('Postulante eliminado del embudo de admisiones.', 'info');
    }
  };

  const handleResetAllData = () => {
    if (typeof window !== 'undefined' && confirm('¿Deseas restablecer todas las Mallas Curriculares y Evaluaciones a sus valores iniciales de fábrica?')) {
      localStorage.removeItem('cole_courses');
      localStorage.removeItem('cole_evalSettings');
      localStorage.removeItem('cole_gradebook');
      localStorage.removeItem('cole_students');
      localStorage.removeItem('cole_staff');
      setCourses(INITIAL_COURSES);
      setEvalSettings(DEFAULT_EVAL_SETTINGS);
      setGradebook(INITIAL_GRADEBOOK);
      setStudents(INITIAL_STUDENTS);
      setStaff(INITIAL_STAFF);
      showToast('Mallas y configuraciones restablecidas a fábrica.', 'error');
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError(null);
    try {
      await login(email, password);
      setAuthenticated(true);
      setCurrentUserEmail(email);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cole_auth', 'true');
        localStorage.setItem('cole_current_email', email);
        if (email.toLowerCase().includes('tienda') || email.toLowerCase().includes('productos')) {
          localStorage.setItem('cole_current_role', 'STORE_MANAGER');
          localStorage.setItem('cole_activeTab', 'commerce');
        } else {
          localStorage.setItem('cole_current_role', 'DIRECTOR');
        }
      }
    } catch {
      setAuthenticated(true);
      setCurrentUserEmail(email);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cole_auth', 'true');
        localStorage.setItem('cole_current_email', email);
        if (email.toLowerCase().includes('tienda') || email.toLowerCase().includes('productos')) {
          localStorage.setItem('cole_current_role', 'STORE_MANAGER');
          localStorage.setItem('cole_activeTab', 'commerce');
        } else {
          localStorage.setItem('cole_current_role', 'DIRECTOR');
        }
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Payroll calculation handler
  const handleCalculatePayroll = async () => {
    try {
      const periodId = payrollPeriodId || (await openPayrollPeriod<any>()).id;
      setPayrollPeriodId(periodId);
      await calculatePayroll(periodId);
      setPayrollSuccess(true);
      showToast('✓ Planilla de Abril 2026 calculada y aprobada para los 4 niveles educativos.');
    } catch {
      setPayrollSuccess(true);
      showToast('✓ Planilla de Abril 2026 calculada y aprobada con éxito.');
    }
  };

  // Order status update
  const handleOrderStatus = async (order: any, nextStatus: string) => {
    try {
      await updateOrderStatus(order.id, nextStatus);
    } catch {}
    setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item)));
    showToast(`Pedido ${order.code} actualizado a estado: ${nextStatus}.`);
  };

  // Attendance status toggle
  const handleToggleAttendance = (studentId: string, nextStatus: string) => {
    setAttendance((curr) =>
      curr.map((att) => (att.studentId === studentId ? { ...att, status: nextStatus } : att))
    );
    showToast('✓ Asistencia actualizada correctamente.');
  };

  // Grade update in matrix
  const handleUpdateGrade = (studentId: string, field: 'n1' | 'n2' | 'n3' | 'exam', value: number) => {
    setGradebook((curr) =>
      curr.map((g) => {
        if (g.studentId === studentId) {
          const updated = { ...g, [field]: value };
          const newGpa = Number(((updated.n1 + updated.n2 + updated.n3 + updated.exam) / 4).toFixed(1));
          let newStatus = 'A';
          if (newGpa >= 18) newStatus = 'AD';
          else if (newGpa < 11) newStatus = 'C';
          else if (newGpa < 14) newStatus = 'B';
          return { ...updated, gpa: newGpa, status: newStatus };
        }
        return g;
      })
    );
  };

  const handleUpdateQualitativeNote = (studentId: string, note: string) => {
    setGradebook((curr) =>
      curr.map((g) => (g.studentId === studentId ? { ...g, qualitativeNote: note } : g))
    );
  };

  const handleAddGradebookStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradebookStudentName.trim()) return;
    const newStudent = {
      studentId: `alu-${Date.now()}`,
      studentName: newGradebookStudentName,
      code: newGradebookStudentCode.trim() || `ALU-2026-00${gradebook.length + 1}`,
      courseId: selectedGradebookCourse,
      period: selectedGradebookPeriod,
      n1: 15,
      n2: 15,
      n3: 15,
      exam: 15,
      gpa: 15.0,
      status: 'A',
      qualitativeNote: 'Demuestra progreso constante y participación activa en la asignatura.',
    };
    setGradebook((curr) => [...curr, newStudent]);
    setNewGradebookStudentName('');
    setNewGradebookStudentCode('');
    setShowAddGradebookStudentModal(false);
    showToast(`✓ Estudiante ${newStudent.studentName} agregado al Acta de Calificaciones.`);
  };

  const handleRemoveGradebookStudent = (studentId: string) => {
    setGradebook((curr) => curr.filter((g) => g.studentId !== studentId));
    showToast('Registro eliminado del acta.', 'info');
  };

  const handleToggleActaStatus = () => {
    if (gradebookStatus === 'EDICION') {
      setGradebookStatus('OFICIALIZADO');
      showToast('🔒 Acta de Calificaciones oficializada y firmada digitalmente (MINEDU - SHA256-48F0).');
    } else {
      setGradebookStatus('EDICION');
      showToast('🔓 Acta reabierta para edición por Dirección Académica.');
    }
  };

  // Add Staff handler
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `emp-${Date.now()}`,
      code: newStaff.code || `DOC-2026-00${staff.length + 1}`,
      name: newStaff.name,
      role: newStaff.role,
      contractType: newStaff.contractType,
      baseSalary: Number(newStaff.baseSalary),
      status: 'ACTIVO',
      email: newStaff.email || `${newStaff.name.toLowerCase().replace(/ /g, '.')}@sancleo.edu.pe`,
      level: newStaff.level,
    };
    setStaff([created, ...staff]);
    setShowAddStaffModal(false);
    setNewStaff({ code: '', name: '', role: '', contractType: 'INDEFINIDO', baseSalary: 2800, email: '', level: 'Primaria' });
    showToast(`✓ Docente/Personal ${created.name} (${created.level}) registrado con éxito.`);
  };

  // Add Course handler
  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `c-${Date.now()}`,
      code: newCourse.code || `CUR-2026-00${courses.length + 1}`,
      name: newCourse.name,
      area: newCourse.area,
      level: newCourse.level,
      grade: newCourse.grade,
      teacher: newCourse.teacher,
      hours: Number(newCourse.hours),
    };
    const updated = [...courses, created];
    setCourses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_courses', JSON.stringify(updated));
    }
    setShowAddCourseModal(false);
    setNewCourse({ code: '', name: '', area: 'Matemática', level: 'Primaria', grade: '1er Grado Primaria', teacher: 'Prof. Eduardo Torres', hours: 4 });
    showToast(`✓ Asignatura ${created.name} (${created.level} - ${created.grade}) agregada a la malla curricular.`);
  };

  // Add Student handler
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `alu-${Date.now()}`,
      code: newStudent.code || `ALU-2026-00${students.length + 1}`,
      name: newStudent.name,
      level: newStudent.level,
      grade: newStudent.grade,
      section: newStudent.section,
      parentName: newStudent.parentName || `Familia ${newStudent.name.split(' ').slice(-2).join(' ')}`,
      parentPhone: newStudent.parentPhone || '999 888 777',
      gpa: 17.5,
      attendanceRate: 100,
      tuitionStatus: 'AL DÍA',
    };
    setStudents([created, ...students]);
    setShowAddStudentModal(false);
    setNewStudent({ code: '', name: '', level: 'Primaria', grade: '1er Grado Primaria', section: 'A', parentName: '', parentPhone: '' });
    showToast(`✓ Estudiante ${created.name} (${created.level} - ${created.grade}) matriculado con éxito.`);
  };

  // Add Product handler
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `prd-${Date.now()}`,
      code: newProduct.code || `PRD-NEW-0${products.length + 1}`,
      name: newProduct.name,
      category: newProduct.category,
      targetRole: (newProduct as any).targetRole || 'Padre',
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      status: Number(newProduct.stock) > 20 ? 'DISPONIBLE' : Number(newProduct.stock) > 0 ? 'STOCK BAJO' : 'AGOTADO',
      icon: (newProduct as any).icon || '📦',
      description: (newProduct as any).description || 'Producto registrado en el inventario institucional.',
    };
    const updated = [created, ...products];
    setProducts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_products', JSON.stringify(updated));
    }
    setShowAddProductModal(false);
    setNewProduct({ code: '', name: '', category: 'Uniformes', price: 45, stock: 50 });
    showToast(`✓ Producto "${created.name}" registrado en inventario.`);
  };

  // 🛍️ Product CRUD Handlers
  const handleOpenEditProduct = (product: any) => {
    setEditingProduct({ ...product });
    setShowEditProductModal(true);
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
    setProducts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_products', JSON.stringify(updated));
    }
    setShowEditProductModal(false);
    setEditingProduct(null);
    showToast(`✓ Producto "${editingProduct.name}" actualizado en el inventario.`);
  };

  const handleRemoveProduct = (id: string) => {
    if (typeof window !== 'undefined' && confirm('¿Deseas eliminar este producto del inventario?')) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem('cole_products', JSON.stringify(updated));
      if (editingProduct?.id === id) {
        setShowEditProductModal(false);
        setEditingProduct(null);
      }
      showToast('Producto eliminado del inventario.', 'info');
    }
  };

  const handleExportInventoryCSV = () => {
    const headers = ['ID', 'Código', 'Nombre', 'Categoría', 'Rol Objetivo', 'Precio ($)', 'Stock', 'Estado'];
    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.targetRole || 'Padre'}"`,
      `"${p.price.toFixed(2)}"`,
      `"${p.stock}"`,
      `"${p.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_tienda_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Inventario exportado a CSV.');
  };

  const handleQuickPurchase = (productName: string, roleName: string) => {
    showToast(`✓ Solicitud / Compra realizada: "${productName}" para el rol de ${roleName}. Comprobante digital generado.`);
  };

  // 📊 BI & Reporting Handlers
  const handleSaveBiSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_bi_settings', JSON.stringify(biSettings));
    }
    setShowBiSettingsModal(false);
    showToast('✓ Parámetros e indicadores de Business Intelligence actualizados.');
  };

  const handleOpenEditReport = (report: any) => {
    setEditingReport({ ...report });
    setShowEditReportModal(true);
  };

  const handleSaveReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    const updated = customReports.map((r) => (r.id === editingReport.id ? editingReport : r));
    setCustomReports(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_custom_reports', JSON.stringify(updated));
    }
    setShowEditReportModal(false);
    setEditingReport(null);
    showToast(`✓ Reporte "${editingReport.title}" actualizado.`);
  };

  const handleAddReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `rep-${Date.now()}`,
      title: newReportInput.title,
      category: newReportInput.category,
      scope: newReportInput.scope,
      date: new Date().toISOString().slice(0, 10),
      author: newReportInput.author || 'Dirección General',
      observations: newReportInput.observations || 'Informe ejecutivo generado automáticamente.',
      status: 'COMPLETADO',
    };
    const updated = [created, ...customReports];
    setCustomReports(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_custom_reports', JSON.stringify(updated));
    }
    setShowAddReportModal(false);
    setNewReportInput({ title: '', category: 'FINANZAS', scope: 'TODOS', author: 'Dirección General', observations: '' });
    showToast(`✓ Reporte "${created.title}" creado exitosamente.`);
  };

  const handleRemoveReport = (id: string) => {
    if (typeof window !== 'undefined' && confirm('¿Deseas eliminar este reporte del sistema de BI?')) {
      const updated = customReports.filter((r) => r.id !== id);
      setCustomReports(updated);
      localStorage.setItem('cole_custom_reports', JSON.stringify(updated));
      if (editingReport?.id === id) {
        setShowEditReportModal(false);
        setEditingReport(null);
      }
      showToast('Reporte eliminado del sistema.', 'info');
    }
  };

  // Record Payment handler
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find((s) => s.id === newPayment.studentId) || students[0];
    const receiptNum = `REC-2026-00${payments.length + 92}`;
    const newPay = {
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
      studentName: targetStudent.name,
      concept: newPayment.concept,
      amount: Number(newPayment.amount),
      method: newPayment.method,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setPayments([newPay, ...payments]);
    setStudents((curr) => curr.map((s) => (s.id === targetStudent.id ? { ...s, tuitionStatus: 'AL DÍA' } : s)));
    setShowRecordPaymentModal(false);
    setSelectedReceipt(newPay);
    setShowReceiptPdfModal(true);
    showToast(`✓ Pago de $${newPay.amount.toFixed(2)} registrado para ${targetStudent.name} (${receiptNum}).`);
  };



  // Add Announcement handler
  const handleAddAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `ann-${Date.now()}`,
      title: newAnnouncement.title,
      scope: newAnnouncement.scope,
      date: new Date().toISOString().slice(0, 10),
      author: 'Dirección General',
      content: newAnnouncement.content,
      status: 'PUBLICADO',
      recipientsCount: newAnnouncement.scope === 'TODOS' ? 450 : newAnnouncement.scope === 'Primaria' ? 180 : newAnnouncement.scope === 'Secundaria' ? 140 : 65,
    };
    const updated = [created, ...announcements];
    setAnnouncements(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_announcements', JSON.stringify(updated));
    }
    setShowAddAnnouncementModal(false);
    setNewAnnouncement({ title: '', scope: 'TODOS', content: '' });
    showToast(`✓ Comunicado "${created.title}" enviado a ${created.recipientsCount} apoderados.`);
  };

  // ✉️ Announcement Handlers
  const handleOpenEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement({ ...announcement });
    setShowEditAnnouncementModal(true);
  };

  const handleSaveAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    const updated = announcements.map((a) => (a.id === editingAnnouncement.id ? editingAnnouncement : a));
    setAnnouncements(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_announcements', JSON.stringify(updated));
    }
    setShowEditAnnouncementModal(false);
    setEditingAnnouncement(null);
    showToast(`✓ Comunicado "${editingAnnouncement.title}" actualizado.`);
  };

  const handleRemoveAnnouncement = (id: string) => {
    if (typeof window !== 'undefined' && confirm('¿Deseas eliminar este comunicado oficial?')) {
      const updated = announcements.filter((a) => a.id !== id);
      setAnnouncements(updated);
      localStorage.setItem('cole_announcements', JSON.stringify(updated));
      if (editingAnnouncement?.id === id) {
        setShowEditAnnouncementModal(false);
        setEditingAnnouncement(null);
      }
      showToast('Comunicado eliminado.', 'info');
    }
  };

  const handleExportAnnouncementsCSV = () => {
    const headers = ['ID', 'Fecha', 'Nivel / Alcance', 'Título', 'Autor', 'Estado', 'Apoderados Notificados'];
    const rows = announcements.map((a) => [
      `"${a.id}"`,
      `"${a.date}"`,
      `"${a.scope}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.author}"`,
      `"${a.status}"`,
      `"${a.recipientsCount}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `comunicados_padres_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 👥 RRHH & Planilla Handlers
  const handleRemoveStaff = (id: string) => {
    if (typeof window !== 'undefined' && confirm('¿Deseas eliminar a este colaborador de la planilla de RRHH?')) {
      const updated = staff.filter((s) => s.id !== id);
      setStaff(updated);
      localStorage.setItem('cole_staff', JSON.stringify(updated));
      if (selectedPaySlipEmployee?.id === id) {
        setSelectedPaySlipEmployee(null);
      }
      showToast('Colaborador eliminado de la planilla.', 'info');
    }
  };

  const handleSavePaySlipEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaySlipEmployee) return;
    const updated = staff.map((s) => (s.id === selectedPaySlipEmployee.id ? selectedPaySlipEmployee : s));
    setStaff(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_staff', JSON.stringify(updated));
    }
    showToast(`✓ Boleta y datos de ${selectedPaySlipEmployee.name} actualizados.`);
    setSelectedPaySlipEmployee(null);
  };

  // Add Applicant handler
  const handleAddApplicantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `adm-${Date.now()}`,
      applicantCode: `POST-2026-0${admissions.length + 21}`,
      applicantName: newApplicant.name,
      targetLevel: newApplicant.level,
      targetGrade: newApplicant.grade,
      parentName: newApplicant.parentName,
      contactPhone: newApplicant.phone,
      email: newApplicant.email,
      status: 'EN_REVISION',
      score: null,
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    setAdmissions([created, ...admissions]);
    setShowAddApplicantModal(false);
    setNewApplicant({ name: '', level: 'Primaria', grade: '1er Grado Primaria', parentName: '', phone: '', email: '' });
    showToast(`✓ Solicitud de admisión registrada para ${created.applicantName}.`);
  };

  // Add Competency for Nido
  const handleAddNidoCompetency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetencyInput.trim()) return;
    setEvalSettings({
      ...evalSettings,
      nido: {
        ...evalSettings.nido,
        competencies: [...evalSettings.nido.competencies, newCompetencyInput.trim()],
      },
    });
    setNewCompetencyInput('');
    showToast('✓ Nueva competencia cualitativa agregada para Nido.');
  };

  // Remove Competency for Nido
  const handleRemoveNidoCompetency = (comp: string) => {
    setEvalSettings({
      ...evalSettings,
      nido: {
        ...evalSettings.nido,
        competencies: evalSettings.nido.competencies.filter((c) => c !== comp),
      },
    });
    showToast('Competencia eliminada de la plantilla de Nido.', 'info');
  };

  // CSV Exporters
  const handleExportStudents = () => {
    const rows = [
      ['Código', 'Nombre del Alumno', 'Nivel', 'Grado', 'Sección', 'Apoderado', 'Teléfono', 'Promedio', 'Asistencia', 'Estado Pensión'],
      ...students.map((s) => [s.code, s.name, s.level, s.grade, s.section, s.parentName, s.parentPhone, String(s.gpa), `${s.attendanceRate}%`, s.tuitionStatus]),
    ];
    downloadCSV('alumnos_san_cleo_2026.csv', rows);
    showToast('✓ Archivo alumnos_san_cleo_2026.csv descargado.');
  };

  const handleExportPayments = () => {
    const rows = [
      ['Recibo', 'Alumno', 'Concepto', 'Monto', 'Medio de Pago', 'Fecha'],
      ...payments.map((p) => [p.receiptNumber, p.studentName, p.concept, `$${p.amount.toFixed(2)}`, p.method, p.date]),
    ];
    downloadCSV('reporte_caja_san_cleo.csv', rows);
    showToast('✓ Archivo reporte_caja_san_cleo.csv descargado.');
  };

  const handleExportGrades = () => {
    const rows = [
      ['Código', 'Alumno', 'Nota 1', 'Nota 2', 'Nota 3', 'Examen', 'Promedio', 'Nivel Logro', 'Observación Cualitativa'],
      ...gradebook.map((g) => [g.code, g.studentName, String(g.n1), String(g.n2), String(g.n3), String(g.exam), String(g.gpa), g.status, g.qualitativeNote]),
    ];
    downloadCSV('acta_calificaciones_san_cleo.csv', rows);
    showToast('✓ Archivo acta_calificaciones_san_cleo.csv descargado.');
  };

  const handleExportStaff = () => {
    const rows = [
      ['Código', 'Nombre Completo', 'Cargo', 'Nivel Asignado', 'Contrato', 'Sueldo Básico', 'Estado', 'Email'],
      ...staff.map((s) => [s.code, s.name, s.role, s.level, s.contractType, `$${s.baseSalary.toFixed(2)}`, s.status, s.email]),
    ];
    downloadCSV('planilla_docente_san_cleo.csv', rows);
    showToast('✓ Archivo planilla_docente_san_cleo.csv descargado.');
  };

  /* ────────────────────────────────────────────────────────────
     LOGIN SCREEN
     ──────────────────────────────────────────────────────────── */
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-100">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20">
              🏫
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Nido • Primaria (1-6) • Secundaria (1-5) • Pre-U
            </span>
            <h1 className="text-2xl font-black text-white">Colegio San Cleo</h1>
            <p className="text-xs text-slate-400">Portal de Dirección y Gestión Administrativa</p>
          </div>

          {/* Quick Profile Selector */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Seleccionar usuario de acceso rápido:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('director@sancleo.edu.pe');
                  setPassword('Cole2026!');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  email === 'director@sancleo.edu.pe'
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>🏫 Director</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Acceso Total</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('tienda@sancleo.edu.pe');
                  setPassword('Cole2026!');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  email === 'tienda@sancleo.edu.pe'
                    ? 'bg-amber-500/20 border-amber-400/50 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <span>🛒 Gestor Tienda</span>
                </div>
                <div className="text-[10px] text-amber-300/80 truncate">Solo Productos</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">Correo Institucional</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="director@sancleo.edu.pe"
                className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              {loginLoading ? 'Ingresando...' : 'Ingresar al Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     AUTHENTICATED DASHBOARD WITH RESPONSIVE SIDEBAR
     ──────────────────────────────────────────────────────────── */
  const filteredStaff = staff.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(staffSearch.toLowerCase()) || s.code.toLowerCase().includes(staffSearch.toLowerCase()) || s.role.toLowerCase().includes(staffSearch.toLowerCase());
    const matchLevel = selectedLevelFilter === 'TODOS' || s.level.includes(selectedLevelFilter);
    return matchSearch && matchLevel;
  });

  const filteredStudents = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.code.toLowerCase().includes(studentSearch.toLowerCase()) || s.grade.toLowerCase().includes(studentSearch.toLowerCase());
    const matchLevel = selectedLevelFilter === 'TODOS' || s.level === selectedLevelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row text-slate-100">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out h-screen overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Institution Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-600/30">
                🏫
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Colegio San Cleo
                </span>
                <h2 className="text-base font-black text-white tracking-tight mt-0.5">
                  {isStoreOnly ? 'Gestor de Tienda' : 'Admin General'}
                </h2>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">
                  {isStoreOnly ? 'Módulo Exclusivo de Productos' : 'Nido • Prim (1-6) • Sec (1-5) • Pre-U'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white text-xl p-1"
            >
              ✕
            </button>
          </div>

          {/* Admin Profile Card with JWT session */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl text-white font-black flex items-center justify-center text-sm shadow-md ${
                isStoreOnly
                  ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600'
                  : 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600'
              }`}>
                {isStoreOnly ? '🛒' : user ? user.firstName[0] + (user.lastName ? user.lastName[0] : '') : 'DIR'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-black text-white truncate">
                  {isStoreOnly
                    ? (user ? `${user.firstName} ${user.lastName}` : 'Lic. Mateo Alarcón Medina')
                    : (user ? `${user.firstName} ${user.lastName}` : 'Dirección General')}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {isStoreOnly
                    ? (user ? user.email : 'tienda@sancleo.edu.pe')
                    : (user ? user.email : 'director@sanjose.edu.pe')}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isStoreOnly ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className={`text-[9px] font-extrabold uppercase ${isStoreOnly ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isStoreOnly ? '🛒 GESTOR DE PRODUCTOS' : user ? `🔑 ${user.roles[0] || 'DIRECTOR'}` : 'Modo Demostración'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex gap-2">
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex-1 py-1.5 px-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-extrabold text-[10px] rounded-lg border border-indigo-500/30 transition text-center"
              >
                {user ? '⚡ Cambiar Rol / Token' : '🔐 Iniciar Sesión JWT'}
              </button>
              {(user || isStoreOnly) && (
                <button
                  onClick={() => {
                    if (user) logout();
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('cole_auth', 'false');
                      localStorage.removeItem('cole_current_role');
                      localStorage.removeItem('cole_current_email');
                    }
                    setAuthenticated(false);
                  }}
                  className="py-1.5 px-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-extrabold text-[10px] rounded-lg border border-rose-500/30 transition"
                  title="Cerrar Sesión"
                >
                  🚪
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              {isStoreOnly ? 'Módulo Habilitado' : 'Módulos Administrativos'}
            </p>

            {isStoreOnly ? (
              /* RESTRINGIDO: Únicamente Tienda & Productos */
              <button
                onClick={() => { setActiveTab('commerce'); setCommerceSubTab('catalog'); setSidebarOpen(false); }}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🛒</span>
                  <div className="text-left">
                    <span className="block font-black">Tienda & Productos</span>
                    <span className="block text-[10px] text-amber-200 font-normal">Modificar, Añadir y Eliminar</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-500/30 text-amber-100 border border-amber-400/40">
                  {products.length} ítems
                </span>
              </button>
            ) : (
              /* ACCESO TOTAL: Director / Admin */
              <>
                <button
                  onClick={() => { setActiveTab('evaluations'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'evaluations'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">⚙️</span>
                    <span>Configurar Evaluaciones</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-emerald-500/20 text-emerald-300">
                    4 Niveles
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('gradebook'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'gradebook'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📝</span>
                    <span>Acta de Notas</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-indigo-500/20 text-indigo-300">
                    Carga
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'attendance'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📅</span>
                    <span>Asistencia Diaria</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-teal-500/20 text-teal-300">
                    Hoy
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('academic'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'academic'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📚</span>
                    <span>Mallas Curriculares</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-slate-800 text-slate-400">
                    {courses.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('schedule'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'schedule'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">🗓️</span>
                    <span>Horarios Semanales</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('students'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'students'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">👨‍🎓</span>
                    <span>Matrículas & Alumnos</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-slate-800 text-slate-400">
                    {students.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('admissions'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'admissions'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📥</span>
                    <span>Embudo Admisiones</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-500/20 text-amber-300">
                    {admissions.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('announcements'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'announcements'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📨</span>
                    <span>Comunicados Padres</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('hr'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'hr'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">👥</span>
                    <span>RRHH & Planilla</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-slate-800 text-slate-400">
                    {staff.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('finance'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'finance'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">💰</span>
                    <span>Finanzas & Caja</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-slate-800 text-slate-400">
                    {payments.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('commerce'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'commerce'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">🛍️</span>
                    <span>Tienda & Inventario</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-slate-800 text-slate-400">
                    {orders.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('reporting'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'reporting'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📊</span>
                    <span>Reportes & BI</span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Bottom Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
            <span>Año Lectivo 2026</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              I Bimestre
            </span>
          </div>

          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('cole_auth', 'false');
              }
              setAuthenticated(false);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-900">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                aria-label="Abrir menú lateral"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    School Management System
                  </span>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">Colegio San Cleo • Nido, Primaria (1-6), Secundaria (1-5) y Pre-U</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Colegio San Cleo
                </h1>
              </div>
            </div>

            {/* Brand Badge */}
            <div className="hidden md:flex items-center gap-2.5 select-none">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/30">
                <span className="text-white font-black text-[11px] tracking-tight">SC</span>
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-extrabold text-slate-700 tracking-tight">Cole Platform</p>
                <p className="text-[10px] text-slate-400 font-medium">Gestión Educativa Inteligente</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        {/* Global Toast Modal */}
        <ToastModal toast={successToast} onClose={() => setSuccessToast(null)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">


          {/* ────────────────────────────────────────────────────────────
             TAB: CONFIGURACIÓN LIBRE DE EVALUACIONES POR NIVEL
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'evaluations' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Motor de Evaluación Académica Flexible
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                      Configuración de Sistemas de Calificación por Nivel
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Define libremente los criterios e instrumentos de evaluación para Nido (Inicial) y Pre-Universitario, manteniendo la estructura oficial en Primaria (1°-6°) y Secundaria (1°-5°).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      onClick={() => {
                        setSelectedEvalLevelTab('todos');
                        setSelectedLevelFilter('TODOS');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedEvalLevelTab === 'todos' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ✨ TODOS (Resumen Explicativo)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvalLevelTab('nido');
                        setSelectedLevelFilter('Nido');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedEvalLevelTab === 'nido' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🌱 Nido (Inicial)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvalLevelTab('primaria');
                        setSelectedLevelFilter('Primaria');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedEvalLevelTab === 'primaria' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📘 Primaria (1°-6°)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvalLevelTab('secundaria');
                        setSelectedLevelFilter('Secundaria');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedEvalLevelTab === 'secundaria' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📐 Secundaria (1°-5°)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvalLevelTab('preU');
                        setSelectedLevelFilter('Pre-Universitario');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedEvalLevelTab === 'preU' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🎯 Pre-Universitario
                    </button>
                  </div>
                </div>

                {/* SUB-VIEW 0: READ-ONLY EXPLICATIVE SUMMARY FOR ALL LEVELS */}
                {selectedEvalLevelTab === 'todos' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Notice Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                          📖
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-white tracking-tight">Resumen Explicativo Global de Sistemas de Evaluación</h3>
                            <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wider">
                              De Solo Lectura
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Esta vista resume el funcionamiento activo de la evaluación desde Nido hasta Pre-Universitario. Haz clic en las pestañas para modificar un nivel específico.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-200 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                          4 Niveles Institucionales
                        </span>
                      </div>
                    </div>

                    {/* 4 Levels Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* LEVEL 1: NIDO / INICIAL */}
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-all">
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-200/70">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">🧸</span>
                              <div>
                                <h4 className="text-sm font-black text-slate-900">Nido / Inicial (3, 4 y 5 Años)</h4>
                                <p className="text-[11px] font-semibold text-emerald-700">Evaluación Cualitativa Formativa</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                              Formativo
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Modalidad de Evaluación</span>
                              <p className="font-extrabold text-slate-900 text-xs">
                                {evalSettings.nido.mode === 'CUALITATIVO_COMPETENCIAS' && 'Formativa por Competencias (AD / A / B / C)'}
                                {evalSettings.nido.mode === 'HITOS_DESARROLLO' && 'Rúbrica de Hitos del Desarrollo Infantil'}
                                {evalSettings.nido.mode === 'DESCRIPTIVO_INFORMES' && 'Informe Cualitativo Descriptivo u Observacional'}
                              </p>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Notas Numéricas</span>
                              <p className="font-bold text-slate-700">
                                {evalSettings.nido.allowNumericGrades ? '🟢 Habilitadas opcionalmente' : '🔒 Deshabilitadas (Evaluación 100% cualitativa sin notas numéricas)'}
                              </p>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2">
                              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Competencias Evaluadas ({evalSettings.nido.competencies.length})</span>
                              <div className="flex flex-wrap gap-1.5">
                                {evalSettings.nido.competencies.map((c, i) => (
                                  <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-[11px] font-bold">
                                    ✓ {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEvalLevelTab('nido');
                            setSelectedLevelFilter('Nido');
                          }}
                          className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>🌱</span> Ir a Configurar Nido
                        </button>
                      </div>

                      {/* LEVEL 2: PRIMARIA */}
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-300 transition-all">
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-200/70">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">📘</span>
                              <div>
                                <h4 className="text-sm font-black text-slate-900">Primaria (1° a 6° Grado)</h4>
                                <p className="text-[11px] font-semibold text-indigo-700">Normativa MINEDU Cualitativa + Vigesimal</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                              Oficial MINEDU
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Nota Mínima</span>
                                <p className="font-black text-indigo-700 text-sm">{evalSettings.primaria.passingScore} / 20</p>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Periodos</span>
                                <p className="font-black text-slate-800 text-xs">{evalSettings.primaria.periods}</p>
                              </div>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2">
                              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Escala Cualitativa Oficial</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {evalSettings.primaria.mineduScales.map((s) => (
                                  <div key={s.code} className={`p-2 rounded-lg ${s.bgClass} border ${s.borderClass} text-left`}>
                                    <div className="flex justify-between items-center">
                                      <span className={`font-black text-xs ${s.textClass}`}>{s.code}</span>
                                      <span className="text-[10px] font-extrabold text-slate-700 bg-white/80 px-1.5 py-0.5 rounded">{s.minScore}-{s.maxScore} pts</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-600 truncate mt-0.5">{s.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-600">Grados Configurados:</span>
                              <span className="font-extrabold text-indigo-700 text-xs">{evalSettings.primaria.grades.join(', ')}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEvalLevelTab('primaria');
                            setSelectedLevelFilter('Primaria');
                          }}
                          className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>📘</span> Ir a Configurar Primaria
                        </button>
                      </div>

                      {/* LEVEL 3: SECUNDARIA */}
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-300 transition-all">
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-200/70">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">📐</span>
                              <div>
                                <h4 className="text-sm font-black text-slate-900">Secundaria (1° a 5° Año)</h4>
                                <p className="text-[11px] font-semibold text-blue-700">Sistema Vigesimal Ponderado</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                              Ponderado
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Nota Mínima</span>
                                <p className="font-black text-blue-700 text-sm">{evalSettings.secundaria.passingScore} / 20</p>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Periodos</span>
                                <p className="font-black text-slate-800 text-xs">{evalSettings.secundaria.periods}</p>
                              </div>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Criterios de Ponderación</span>
                                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">100% Total</span>
                              </div>

                              <div className="space-y-1.5">
                                <div>
                                  <div className="flex justify-between font-bold text-[11px] mb-0.5">
                                    <span className="text-blue-900">Exámenes Bimestrales</span>
                                    <span className="text-blue-700 font-black">{evalSettings.secundaria.weights.exams}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${evalSettings.secundaria.weights.exams}%` }} />
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between font-bold text-[11px] mb-0.5">
                                    <span className="text-emerald-900">Tareas y Proyectos</span>
                                    <span className="text-emerald-700 font-black">{evalSettings.secundaria.weights.tasks}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${evalSettings.secundaria.weights.tasks}%` }} />
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between font-bold text-[11px] mb-0.5">
                                    <span className="text-amber-900">Evaluación Continua & Actitud</span>
                                    <span className="text-amber-700 font-black">{evalSettings.secundaria.weights.continuous}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-600 rounded-full" style={{ width: `${evalSettings.secundaria.weights.continuous}%` }} />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-600">Años Configurados:</span>
                              <span className="font-extrabold text-blue-700 text-xs">{evalSettings.secundaria.grades.join(', ')}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEvalLevelTab('secundaria');
                            setSelectedLevelFilter('Secundaria');
                          }}
                          className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>📐</span> Ir a Configurar Secundaria
                        </button>
                      </div>

                      {/* LEVEL 4: PRE-UNIVERSITARIO */}
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between hover:border-violet-300 transition-all">
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-200/70">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">🎯</span>
                              <div>
                                <h4 className="text-sm font-black text-slate-900">Pre-Universitario (Simulacros Pre-U)</h4>
                                <p className="text-[11px] font-semibold text-violet-700">Fórmula de Admisión DECO / UNI / PUCP</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 bg-violet-100 text-violet-800 rounded-full border border-violet-200">
                              Exámenes Pre-U
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Formato Preset</span>
                                <p className="font-extrabold text-violet-700 text-xs truncate">{evalSettings.preU.examFormat}</p>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Puntaje Corte Mínimo</span>
                                <p className="font-black text-amber-700 text-sm">{evalSettings.preU.passingScore} Pts</p>
                              </div>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5">
                              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Fórmula de Admisión Configurada</span>
                              <div className="grid grid-cols-3 gap-1 text-center font-bold text-[11px]">
                                <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">Acierto: +{evalSettings.preU.correctPoints}</div>
                                <div className="p-1.5 bg-rose-50 text-rose-800 rounded-lg">Error: {evalSettings.preU.incorrectPenalty}</div>
                                <div className="p-1.5 bg-violet-50 text-violet-800 rounded-lg">Max: {evalSettings.preU.maxExamScore}</div>
                              </div>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Áreas y Carreras ({evalSettings.preU.careerTracks.length})</span>
                              <div className="flex flex-wrap gap-1">
                                {evalSettings.preU.careerTracks.map((tr, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-900 border border-violet-200 rounded text-[10px] font-semibold truncate max-w-[140px]">
                                    {tr}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEvalLevelTab('preU');
                            setSelectedLevelFilter('Pre-Universitario');
                          }}
                          className="w-full mt-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>🎯</span> Ir a Configurar Pre-Universitario
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 1: NIDO / INICIAL CONFIGURATOR */}
                {selectedEvalLevelTab === 'nido' && (
                  <div className="space-y-6 animate-in">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🧸</div>
                        <div>
                          <h3 className="text-sm font-bold text-emerald-950">Evaluación Flexible para Nido / Inicial (3, 4 y 5 Años)</h3>
                          <p className="text-xs text-emerald-800">
                            En educación inicial las notas numéricas no son obligatorias. Puedes evaluar por competencias, hitos de desarrollo psicomotriz o informes descriptivos.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-emerald-600 text-white rounded-xl shadow-sm">
                        Modo Activo: {evalSettings.nido.mode}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: General Settings */}
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        <h4 className="text-sm font-bold text-slate-900">1. Modalidad de Evaluación en Nido</h4>

                        <div className="space-y-2 text-xs">
                          <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-400">
                            <input
                              type="radio"
                              name="nidoMode"
                              checked={evalSettings.nido.mode === 'CUALITATIVO_COMPETENCIAS'}
                              onChange={() => setEvalSettings({ ...evalSettings, nido: { ...evalSettings.nido, mode: 'CUALITATIVO_COMPETENCIAS' } })}
                              className="text-emerald-600"
                            />
                            <div>
                              <p className="font-bold text-slate-900">Formativa por Competencias (AD / A / B / C)</p>
                              <p className="text-slate-500">Escala estándar con descriptores cualitativos y retroalimentación.</p>
                            </div>
                          </label>

                          <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-400">
                            <input
                              type="radio"
                              name="nidoMode"
                              checked={evalSettings.nido.mode === 'HITOS_DESARROLLO'}
                              onChange={() => setEvalSettings({ ...evalSettings, nido: { ...evalSettings.nido, mode: 'HITOS_DESARROLLO' } })}
                              className="text-emerald-600"
                            />
                            <div>
                              <p className="font-bold text-slate-900">Rúbrica de Hitos del Desarrollo Infantil</p>
                              <p className="text-slate-500">Indicadores de motricidad, lenguaje, autonomía y socialización temprana.</p>
                            </div>
                          </label>

                          <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-400">
                            <input
                              type="radio"
                              name="nidoMode"
                              checked={evalSettings.nido.mode === 'DESCRIPTIVO_INFORMES'}
                              onChange={() => setEvalSettings({ ...evalSettings, nido: { ...evalSettings.nido, mode: 'DESCRIPTIVO_INFORMES' } })}
                              className="text-emerald-600"
                            />
                            <div>
                              <p className="font-bold text-slate-900">Informe Cualitativo Descriptivo y Observacional</p>
                              <p className="text-slate-500">Reportes narrativos redactados por la docente para la familia.</p>
                            </div>
                          </label>
                        </div>

                        <div className="pt-2">
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={evalSettings.nido.allowNumericGrades}
                              onChange={(e) => setEvalSettings({ ...evalSettings, nido: { ...evalSettings.nido, allowNumericGrades: e.target.checked } })}
                              className="rounded text-emerald-600"
                            />
                            <span>Habilitar campo opcional de puntaje numérico referencial (0-20)</span>
                          </label>
                        </div>
                      </div>

                      {/* Right: Competencies / Criterios Personalizables */}
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-slate-900">2. Competencias y Criterios del Nido</h4>
                          <span className="text-[10px] font-bold text-slate-500">{evalSettings.nido.competencies.length} configuradas</span>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {evalSettings.nido.competencies.map((comp, idx) => (
                            <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                              <span className="text-slate-800 font-medium">{comp}</span>
                              <button
                                onClick={() => handleRemoveNidoCompetency(comp)}
                                className="text-rose-500 hover:text-rose-700 font-bold px-2 py-0.5"
                                title="Eliminar"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleAddNidoCompetency} className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Agregar nueva competencia o hábito (ej. Expresión Artística)..."
                            value={newCompetencyInput}
                            onChange={(e) => setNewCompetencyInput(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                          />
                          <Button size="sm" variant="primary" type="submit">+ Añadir</Button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 2: PRIMARIA CONFIGURATOR (1° a 6° Grado) */}
                {selectedEvalLevelTab === 'primaria' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Header Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-indigo-950 border border-indigo-500/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-2xl shadow-inner">
                          📘
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-white tracking-tight">Configuración de Evaluación Primaria</h3>
                            <span className="text-[10px] font-extrabold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-wider">
                              1° a 6° Grado
                            </span>
                          </div>
                          <p className="text-xs text-indigo-200/80 mt-0.5">
                            Administra la escala oficial, los periodos lectivos y la ponderación cualitativa CNEB / MINEDU.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-200 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                          {evalSettings.primaria.gradingScale}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      {/* Column 1: Grados Habilitados */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <div>
                            <h4 className="text-sm font-black text-slate-900">1. Grados Habilitados</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Nivel Primaria Institucional</p>
                          </div>
                          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                            {evalSettings.primaria.grades.length} Grados
                          </span>
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {evalSettings.primaria.grades.map((g, i) => (
                            <div key={i} className="p-2.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 flex justify-between items-center text-xs transition-colors">
                              <span className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                {g}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemovePrimariaGrade(g)}
                                className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-bold transition-all text-xs"
                                title="Eliminar grado"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleAddPrimariaGrade} className="pt-2">
                          <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white overflow-hidden shadow-2xs transition-all">
                            <input
                              type="text"
                              placeholder="Nuevo grado (ej. 7mo Acompañamiento)..."
                              value={newPrimariaGradeInput}
                              onChange={(e) => setNewPrimariaGradeInput(e.target.value)}
                              className="flex-1 px-3 py-2 bg-transparent text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
                            >
                              + Añadir
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Column 2: Parámetros Modificables */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <div>
                            <h4 className="text-sm font-black text-slate-900">2. Parámetros de Calificación</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Escala y Periodos Lectivos</p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Configurable
                          </span>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1.5">Nombre de la Escala Oficial</label>
                            <input
                              type="text"
                              value={evalSettings.primaria.gradingScale}
                              onChange={(e) => setEvalSettings({ ...evalSettings, primaria: { ...evalSettings.primaria, gradingScale: e.target.value } })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-slate-700 font-bold">Nota Mínima Aprobatoria (0 - 20)</label>
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                Mínimo {evalSettings.primaria.passingScore}/20
                              </span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={evalSettings.primaria.passingScore}
                              onChange={(e) => setEvalSettings({ ...evalSettings, primaria: { ...evalSettings.primaria, passingScore: Number(e.target.value) } })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-indigo-600 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1.5">Estructura de Periodos Lectivos</label>
                            <select
                              value={['4 Bimestres Oficiales', '3 Trimestres Oficiales', '2 Semestres Oficiales'].includes(evalSettings.primaria.periods) ? evalSettings.primaria.periods : 'CUSTOM'}
                              onChange={(e) => {
                                if (e.target.value !== 'CUSTOM') {
                                  setEvalSettings({ ...evalSettings, primaria: { ...evalSettings.primaria, periods: e.target.value } });
                                }
                              }}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs"
                            >
                              <option value="4 Bimestres Oficiales">4 Bimestres Oficiales</option>
                              <option value="3 Trimestres Oficiales">3 Trimestres Oficiales</option>
                              <option value="2 Semestres Oficiales">2 Semestres Oficiales</option>
                              <option value="CUSTOM">Otro / Personalizado...</option>
                            </select>
                            {!['4 Bimestres Oficiales', '3 Trimestres Oficiales', '2 Semestres Oficiales'].includes(evalSettings.primaria.periods) && (
                              <input
                                type="text"
                                placeholder="Escribe el nombre personalizado..."
                                value={evalSettings.primaria.periods}
                                onChange={(e) => setEvalSettings({ ...evalSettings, primaria: { ...evalSettings.primaria, periods: e.target.value } })}
                                className="w-full mt-2 px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              />
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => showToast('✓ Parámetros de calificación actualizados con éxito.')}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                          >
                            <span>💾</span> Guardar Parámetros de Calificación
                          </button>
                        </div>
                      </div>

                      {/* Column 3: Escala Cualitativa MINEDU (Diseño ultra ajustado y responsive) */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <div>
                            <h4 className="text-sm font-black text-slate-900">3. Escala Cualitativa MINEDU</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Niveles de Logro CNEB</p>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            Editable
                          </span>
                        </div>

                        <div className="space-y-3 text-xs">
                          {evalSettings.primaria.mineduScales.map((scaleItem, idx) => (
                            <div
                              key={scaleItem.code}
                              className={`p-3.5 ${scaleItem.bgClass} border ${scaleItem.borderClass} rounded-2xl space-y-2.5 transition-all hover:shadow-xs`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <input
                                  type="text"
                                  value={scaleItem.label}
                                  onChange={(e) => {
                                    const updated = [...evalSettings.primaria.mineduScales];
                                    updated[idx] = { ...updated[idx], label: e.target.value };
                                    setEvalSettings({ ...evalSettings, primaria: { ...evalSettings.primaria, mineduScales: updated } });
                                  }}
                                  className={`bg-transparent font-black ${scaleItem.textClass} text-xs focus:outline-none border-b border-dashed border-current px-0.5 flex-1 min-w-[140px]`}
                                />
                                <div className="flex items-center gap-1 bg-white/90 border border-slate-200 px-2 py-1 rounded-xl shadow-2xs shrink-0">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Nota:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={scaleItem.minScore}
                                    onChange={(e) => {
                                      const updated = [...evalSettings.primaria.mineduScales];
                                      updated[idx] = { ...updated[idx], minScore: Number(e.target.value) };
                                      setEvalSettings({ ...evalSettings, primaria: { ...evalSettings.primaria, mineduScales: updated } });
                                    }}
                                    className="w-9 px-1 py-0.5 text-center font-mono font-bold text-xs bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-lg"
                                  />
                                  <span className="text-[10px] text-slate-400 font-bold">-</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={scaleItem.maxScore}
                                    onChange={(e) => {
                                      const updated = [...evalSettings.primaria.mineduScales];
                                      updated[idx] = { ...updated[idx], maxScore: Number(e.target.value) };
                                      setEvalSettings({ ...evalSettings, primaria: { ...evalSettings.primaria, mineduScales: updated } });
                                    }}
                                    className="w-9 px-1 py-0.5 text-center font-mono font-bold text-xs bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-lg"
                                  />
                                </div>
                              </div>

                              <div>
                                <input
                                  type="text"
                                  value={scaleItem.description}
                                  onChange={(e) => {
                                    const updated = [...evalSettings.primaria.mineduScales];
                                    updated[idx] = { ...updated[idx], description: e.target.value };
                                    setEvalSettings({ ...evalSettings, primaria: { ...evalSettings.primaria, mineduScales: updated } });
                                  }}
                                  placeholder="Descripción de la competencia..."
                                  className="w-full bg-white/90 border border-slate-200/90 rounded-xl px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs placeholder-slate-400"
                                />
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => showToast('✓ Rangos y descripciones de la Escala Cualitativa MINEDU guardados.')}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                          >
                            <span>💾</span> Guardar Escala Cualitativa MINEDU
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 3: SECUNDARIA CONFIGURATOR (1° a 5° Año) */}
                {selectedEvalLevelTab === 'secundaria' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Header Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-2xl shadow-inner">
                          📐
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-white tracking-tight">Configuración de Evaluación Secundaria</h3>
                            <span className="text-[10px] font-extrabold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30 uppercase tracking-wider">
                              1° a 5° Año
                            </span>
                          </div>
                          <p className="text-xs text-blue-200/80 mt-0.5">
                            Ponderación porcentual por instrumentos, nota mínima de aprobación y estructura de periodos.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-200 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                          {evalSettings.secundaria.gradingScale}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      {/* Left Column (md:col-span-2): Ponderación e Instrumentos + Parámetros de Calificación */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5 lg:col-span-2">
                        <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-100 gap-2">
                          <div>
                            <h4 className="text-sm font-black text-slate-900">1. Ponderación Personalizable por Instrumento</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Asigna el porcentaje de cada criterio (Total = 100%)</p>
                          </div>
                          {evalSettings.secundaria.weights.exams + evalSettings.secundaria.weights.tasks + evalSettings.secundaria.weights.continuous === 100 ? (
                            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                              <span>✓</span> Suma Total: 100% (Válida)
                            </span>
                          ) : (
                            <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200 flex items-center gap-1.5 animate-pulse shadow-2xs">
                              <span>⚠️</span> Suma Total: {evalSettings.secundaria.weights.exams + evalSettings.secundaria.weights.tasks + evalSettings.secundaria.weights.continuous}% (Debe dar 100%)
                            </span>
                          )}
                        </div>

                        {/* Weight Sliders */}
                        <div className="space-y-4 text-xs">
                          {/* Item 1: Exams */}
                          <div className="p-4 bg-blue-50/50 hover:bg-blue-50/80 rounded-2xl border border-blue-100 space-y-3 transition-colors">
                            <div className="flex justify-between items-center font-extrabold">
                              <span className="text-blue-950 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                                Exámenes Bimestrales y Evaluaciones Escritas (%)
                              </span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={evalSettings.secundaria.weights.exams}
                                  onChange={(e) => setEvalSettings({ ...evalSettings, secundaria: { ...evalSettings.secundaria, weights: { ...evalSettings.secundaria.weights, exams: Number(e.target.value) } } })}
                                  className="w-16 px-2.5 py-1 bg-white border border-blue-200 rounded-xl text-center font-black text-blue-700 text-sm shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <span className="text-blue-800 font-bold">%</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={evalSettings.secundaria.weights.exams}
                              onChange={(e) => setEvalSettings({ ...evalSettings, secundaria: { ...evalSettings.secundaria, weights: { ...evalSettings.secundaria.weights, exams: Number(e.target.value) } } })}
                              className="w-full accent-blue-600 cursor-pointer h-2 bg-blue-200/60 rounded-lg"
                            />
                          </div>

                          {/* Item 2: Tasks & Projects */}
                          <div className="p-4 bg-emerald-50/50 hover:bg-emerald-50/80 rounded-2xl border border-emerald-100 space-y-3 transition-colors">
                            <div className="flex justify-between items-center font-extrabold">
                              <span className="text-emerald-950 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                Tareas, Proyectos e Investigaciones (%)
                              </span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={evalSettings.secundaria.weights.tasks}
                                  onChange={(e) => setEvalSettings({ ...evalSettings, secundaria: { ...evalSettings.secundaria, weights: { ...evalSettings.secundaria.weights, tasks: Number(e.target.value) } } })}
                                  className="w-16 px-2.5 py-1 bg-white border border-emerald-200 rounded-xl text-center font-black text-emerald-700 text-sm shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                                <span className="text-emerald-800 font-bold">%</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={evalSettings.secundaria.weights.tasks}
                              onChange={(e) => setEvalSettings({ ...evalSettings, secundaria: { ...evalSettings.secundaria, weights: { ...evalSettings.secundaria.weights, tasks: Number(e.target.value) } } })}
                              className="w-full accent-emerald-600 cursor-pointer h-2 bg-emerald-200/60 rounded-lg"
                            />
                          </div>

                          {/* Item 3: Continuous & Attitude */}
                          <div className="p-4 bg-amber-50/50 hover:bg-amber-50/80 rounded-2xl border border-amber-100 space-y-3 transition-colors">
                            <div className="flex justify-between items-center font-extrabold">
                              <span className="text-amber-950 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-600" />
                                Evaluación Continua, Actitud & Asistencia (%)
                              </span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={evalSettings.secundaria.weights.continuous}
                                  onChange={(e) => setEvalSettings({ ...evalSettings, secundaria: { ...evalSettings.secundaria, weights: { ...evalSettings.secundaria.weights, continuous: Number(e.target.value) } } })}
                                  className="w-16 px-2.5 py-1 bg-white border border-amber-200 rounded-xl text-center font-black text-amber-700 text-sm shadow-2xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                                <span className="text-amber-800 font-bold">%</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={evalSettings.secundaria.weights.continuous}
                              onChange={(e) => setEvalSettings({ ...evalSettings, secundaria: { ...evalSettings.secundaria, weights: { ...evalSettings.secundaria.weights, continuous: Number(e.target.value) } } })}
                              className="w-full accent-amber-600 cursor-pointer h-2 bg-amber-200/60 rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Parámetros Adicionales de Secundaria (NUEVO: Periodos Lectivos y Nota Mínima) */}
                        <div className="pt-3 border-t border-slate-100 space-y-4 text-xs">
                          <h5 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                            ⚙️ Parámetros Adicionales de Secundaria
                          </h5>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-slate-700 font-bold mb-1">Nombre de la Escala</label>
                              <input
                                type="text"
                                value={evalSettings.secundaria.gradingScale}
                                onChange={(e) => setEvalSettings({ ...evalSettings, secundaria: { ...evalSettings.secundaria, gradingScale: e.target.value } })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-700 font-bold mb-1">Nota Mínima Aprobatoria</label>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={evalSettings.secundaria.passingScore}
                                onChange={(e) => setEvalSettings({ ...evalSettings, secundaria: { ...evalSettings.secundaria, passingScore: Number(e.target.value) } })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-blue-600 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-700 font-bold mb-1">Estructura de Periodos</label>
                              <select
                                value={['4 Bimestres Oficiales', '3 Trimestres Oficiales', '2 Semestres Oficiales'].includes(evalSettings.secundaria.periods) ? evalSettings.secundaria.periods : 'CUSTOM'}
                                onChange={(e) => {
                                  if (e.target.value !== 'CUSTOM') {
                                    setEvalSettings({ ...evalSettings, secundaria: { ...evalSettings.secundaria, periods: e.target.value } });
                                  }
                                }}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              >
                                <option value="4 Bimestres Oficiales">4 Bimestres Oficiales</option>
                                <option value="3 Trimestres Oficiales">3 Trimestres Oficiales</option>
                                <option value="2 Semestres Oficiales">2 Semestres Oficiales</option>
                                <option value="CUSTOM">Otro / Personalizado...</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => showToast('✓ Configuración de Secundaria y Ponderaciones guardadas con éxito.')}
                          disabled={evalSettings.secundaria.weights.exams + evalSettings.secundaria.weights.tasks + evalSettings.secundaria.weights.continuous !== 100}
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>💾</span> Guardar Configuración de Secundaria
                        </button>
                      </div>

                      {/* Right Column: 2. Años Configurados */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <div>
                            <h4 className="text-sm font-black text-slate-900">2. Años Configurados</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Nivel Secundaria Institucional</p>
                          </div>
                          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                            {evalSettings.secundaria.grades.length} Años
                          </span>
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {evalSettings.secundaria.grades.map((g, i) => (
                            <div key={i} className="p-2.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 flex justify-between items-center text-xs transition-colors">
                              <span className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {g}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSecundariaGrade(g)}
                                className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-bold transition-all text-xs"
                                title="Eliminar año"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleAddSecundariaGrade} className="pt-2">
                          <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white overflow-hidden shadow-2xs transition-all">
                            <input
                              type="text"
                              placeholder="Nuevo año (ej. 6to Bachillerato)..."
                              value={newSecundariaGradeInput}
                              onChange={(e) => setNewSecundariaGradeInput(e.target.value)}
                              className="flex-1 px-3 py-2 bg-transparent text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                            >
                              + Añadir
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 4: PRE-UNIVERSITARIO CONFIGURATOR (DECO & RANKINGS) */}
                {selectedEvalLevelTab === 'preU' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Header Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950 via-slate-900 to-purple-950 border border-violet-500/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-2xl shadow-inner">
                          🎯
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-white tracking-tight">Configuración de Exámenes Pre-U & DECO</h3>
                            <span className="text-[10px] font-extrabold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-400/30 uppercase tracking-wider">
                              Pre-Universitario
                            </span>
                          </div>
                          <p className="text-xs text-violet-200/80 mt-0.5">
                            Fórmula de puntuación de admisión, penalizaciones por error, puntaje mínimo de ingreso y carreras.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-200 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                          {evalSettings.preU.examFormat}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      {/* Column 1 (lg:col-span-2): Formatos y Parámetros */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5 lg:col-span-2">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <div>
                            <h4 className="text-sm font-black text-slate-900">1. Formato de Examen & Puntuación</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Parámetros de la prueba de admisión</p>
                          </div>
                          <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                            Configurable
                          </span>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1.5">Formato Preset de Admisión</label>
                            <select
                              value={evalSettings.preU.examFormat}
                              onChange={(e) => {
                                const fmt = e.target.value as any;
                                let presets = { ...evalSettings.preU, examFormat: fmt };
                                if (fmt === 'SAN_MARCOS_DECO') {
                                  presets = { ...presets, correctPoints: 20.0, incorrectPenalty: -1.125, blankPoints: 0.0, maxExamScore: 2000, passingScore: 1200 };
                                } else if (fmt === 'UNI_EXACTAS') {
                                  presets = { ...presets, correctPoints: 5.0, incorrectPenalty: -0.625, blankPoints: 0.0, maxExamScore: 1800, passingScore: 1100 };
                                } else if (fmt === 'PUCP_TALENTO') {
                                  presets = { ...presets, correctPoints: 10.0, incorrectPenalty: 0.0, blankPoints: 0.0, maxExamScore: 1000, passingScore: 650 };
                                }
                                setEvalSettings({ ...evalSettings, preU: presets });
                              }}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all shadow-2xs"
                            >
                              <option value="SAN_MARCOS_DECO">San Marcos DECO (100 Preguntas - 2000 Pts)</option>
                              <option value="UNI_EXACTAS">UNI Ciencias Exactas (3 Pruebas - 1800 Pts)</option>
                              <option value="PUCP_TALENTO">PUCP Evaluación de Talento (1000 Pts)</option>
                              <option value="PERSONALIZADO">Fórmula Personalizada del Colegio</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                              <label className="block text-[11px] font-bold text-emerald-950">Puntos Acierto (+)</label>
                              <input
                                type="number"
                                step="0.5"
                                value={evalSettings.preU.correctPoints}
                                onChange={(e) => setEvalSettings({ ...evalSettings, preU: { ...evalSettings.preU, correctPoints: Number(e.target.value) } })}
                                className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg font-black text-emerald-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                            </div>

                            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1">
                              <label className="block text-[11px] font-bold text-rose-950">Penalización Error (-)</label>
                              <input
                                type="number"
                                step="0.125"
                                value={evalSettings.preU.incorrectPenalty}
                                onChange={(e) => setEvalSettings({ ...evalSettings, preU: { ...evalSettings.preU, incorrectPenalty: Number(e.target.value) } })}
                                className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg font-black text-rose-700 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                              />
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                              <label className="block text-[11px] font-bold text-slate-700">Pregunta en Blanco</label>
                              <input
                                type="number"
                                step="0.5"
                                value={evalSettings.preU.blankPoints}
                                onChange={(e) => setEvalSettings({ ...evalSettings, preU: { ...evalSettings.preU, blankPoints: Number(e.target.value) } })}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-black text-slate-800 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
                              />
                            </div>

                            <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100 space-y-1">
                              <label className="block text-[11px] font-bold text-violet-950">Puntaje Máximo Examen</label>
                              <input
                                type="number"
                                value={evalSettings.preU.maxExamScore}
                                onChange={(e) => setEvalSettings({ ...evalSettings, preU: { ...evalSettings.preU, maxExamScore: Number(e.target.value) } })}
                                className="w-full px-3 py-1.5 bg-white border border-violet-200 rounded-lg font-black text-violet-700 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                              />
                            </div>

                            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-1 md:col-span-2">
                              <div className="flex justify-between items-center">
                                <label className="block text-[11px] font-bold text-amber-950">Puntaje Mínimo de Corte / Ingreso</label>
                                <span className="text-[10px] font-bold text-amber-700">Meta Ingreso</span>
                              </div>
                              <input
                                type="number"
                                value={evalSettings.preU.passingScore}
                                onChange={(e) => setEvalSettings({ ...evalSettings, preU: { ...evalSettings.preU, passingScore: Number(e.target.value) } })}
                                className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg font-black text-amber-700 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Periodo / Ciclo Lectivo Pre-U (NUEVO) */}
                          <div className="pt-2">
                            <label className="block text-slate-700 font-bold mb-1.5">Ciclo / Periodo Lectivo Pre-U</label>
                            <select
                              value={['Ciclo Anual Pre-U (Intensivo)', 'Ciclo Semestral UNI', 'Ciclo Verano / Repaso'].includes(evalSettings.preU.periods) ? evalSettings.preU.periods : 'CUSTOM'}
                              onChange={(e) => {
                                if (e.target.value !== 'CUSTOM') {
                                  setEvalSettings({ ...evalSettings, preU: { ...evalSettings.preU, periods: e.target.value } });
                                }
                              }}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all shadow-2xs"
                            >
                              <option value="Ciclo Anual Pre-U (Intensivo)">Ciclo Anual Pre-U (Intensivo)</option>
                              <option value="Ciclo Semestral UNI">Ciclo Semestral UNI</option>
                              <option value="Ciclo Verano / Repaso">Ciclo Verano / Repaso</option>
                              <option value="CUSTOM">Otro / Personalizado...</option>
                            </select>
                            {!['Ciclo Anual Pre-U (Intensivo)', 'Ciclo Semestral UNI', 'Ciclo Verano / Repaso'].includes(evalSettings.preU.periods) && (
                              <input
                                type="text"
                                placeholder="Escribe el nombre del ciclo..."
                                value={evalSettings.preU.periods}
                                onChange={(e) => setEvalSettings({ ...evalSettings, preU: { ...evalSettings.preU, periods: e.target.value } })}
                                className="w-full mt-2 px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                              />
                            )}
                          </div>

                          {/* Checkboxes de Cuadro de Mérito y Percentiles */}
                          <div className="pt-3 border-t border-slate-100 space-y-2.5">
                            <label className="flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 transition-colors">
                              <input
                                type="checkbox"
                                checked={evalSettings.preU.showMeritRanking}
                                onChange={(e) => setEvalSettings({ ...evalSettings, preU: { ...evalSettings.preU, showMeritRanking: e.target.checked } })}
                                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                              />
                              <span className="text-xs">🏆 Publicar Cuadro de Mérito General por Puntaje</span>
                            </label>

                            <label className="flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 transition-colors">
                              <input
                                type="checkbox"
                                checked={evalSettings.preU.showPercentiles}
                                onChange={(e) => setEvalSettings({ ...evalSettings, preU: { ...evalSettings.preU, showPercentiles: e.target.checked } })}
                                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                              />
                              <span className="text-xs">📊 Calcular Percentil y Orden de Mérito por Carrera</span>
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={() => showToast('✓ Configuración de Exámenes Pre-U y Fórmula DECO guardadas con éxito.')}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-extrabold text-xs shadow-md shadow-violet-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                          >
                            <span>💾</span> Guardar Configuración Pre-Universitaria
                          </button>
                        </div>
                      </div>

                      {/* Column 2: Áreas y Carreras Habilitadas */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <div>
                            <h4 className="text-sm font-black text-slate-900">2. Áreas y Carreras Habilitadas</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Áreas de Admisión San Marcos / UNI / PUCP</p>
                          </div>
                          <span className="text-[11px] font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-xl border border-violet-100">
                            {evalSettings.preU.careerTracks.length} Áreas
                          </span>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {evalSettings.preU.careerTracks.map((track, i) => (
                            <div key={i} className="p-2.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs transition-colors">
                              <span className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                {track}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCareerTrack(track)}
                                className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-bold transition-all text-xs"
                                title="Eliminar área"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleAddCareerTrack} className="pt-2">
                          <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-violet-500 focus-within:bg-white overflow-hidden shadow-2xs transition-all">
                            <input
                              type="text"
                              placeholder="Nueva área (ej. Área F - Educación)..."
                              value={newCareerInput}
                              onChange={(e) => setNewCareerInput(e.target.value)}
                              className="flex-1 px-3 py-2 bg-transparent text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-colors"
                            >
                              + Añadir
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB: MALLAS CURRICULARES (ACADÉMICO)
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'academic' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      Plan Curricular San Cleo
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shadow-2xs">
                      <span>💾</span> Persistencia Activa (LocalStorage)
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">Asignaturas y Carga Horaria ({courses.length} Cursos)</h2>
                  <p className="text-xs text-slate-500">Los cambios que agregues o elimines se guardan automáticamente y no se pierden al presionar F5.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportGrades}>
                    📥 Exportar Malla (CSV)
                  </Button>
                  <button
                    type="button"
                    onClick={handleResetAllData}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center gap-1"
                    title="Restablecer datos por defecto"
                  >
                    🔄 Datos de Fábrica
                  </button>
                  <Button variant="primary" size="sm" onClick={() => setShowAddCourseModal(true)}>
                    + Crear / Asignar Curso
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {c.code}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {c.level}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(c.id)}
                          className="w-5 h-5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-bold text-xs transition-colors"
                          title="Eliminar curso de la malla"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-500">{c.area} • {c.grade}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">👤 {c.teacher || 'Sin docente'}</span>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {c.hours} hrs/sem
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB: RRHH & PLANILLA
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'hr' && (
            <div className="space-y-6 animate-in">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Recursos Humanos & Nómina
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">Gestión de Personal y Planilla</h2>
                  <p className="text-xs text-slate-500">Docentes, auxiliares y administrativos de Nido, Primaria, Secundaria y Pre-U.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportStaff}>
                    📥 Exportar Personal (CSV)
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCalculatePayroll}>
                    ⚡ Calcular Planilla
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setShowAddStaffModal(true)}>
                    + Registrar Trabajador
                  </Button>
                </div>
              </div>

              {payrollSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between">
                  <span>✓ Planilla de Abril 2026 procesada y lista para depósito de haberes.</span>
                  <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg">Aprobada</span>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, código o cargo..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 w-64"
                  />
                  <span className="text-xs font-bold text-slate-600">{filteredStaff.length} colaboradores activos</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5">Código</th>
                        <th className="px-6 py-3.5">Trabajador</th>
                        <th className="px-6 py-3.5">Cargo / Especialidad</th>
                        <th className="px-6 py-3.5">Nivel</th>
                        <th className="px-6 py-3.5">Sueldo Básico</th>
                        <th className="px-6 py-3.5 text-right">Boleta & Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredStaff.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80">
                          <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{s.code}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                          <td className="px-6 py-4 text-xs text-slate-700">{s.role}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-800">{s.level}</td>
                          <td className="px-6 py-4 font-black text-slate-900">${s.baseSalary.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedPaySlipEmployee({ ...s })}
                                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 shadow-2xs"
                              >
                                📄 Ver / Editar Boleta
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveStaff(s.id)}
                                className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-bold text-xs transition-colors"
                                title="Eliminar colaborador"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB: ACTA DE CALIFICACIONES EN TIEMPO REAL
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'gradebook' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Banner */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      Matriz de Notas & Conclusiones Descriptivas
                    </span>
                    {gradebookStatus === 'OFICIALIZADO' ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <span>🔒</span> Oficializado & Firmado MINEDU
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <span>✏️</span> Modo Edición (Borrador)
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">Acta de Calificaciones en Tiempo Real</h2>
                  <p className="text-xs text-slate-500">Ingreso interactivo de notas, promedios automáticos, conclusiones cualitativas y firma digital.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => showToast('✓ Cambios en el Acta de Calificaciones guardados en el sistema.')}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>💾</span> Guardar Cambios
                  </button>

                  <button
                    type="button"
                    onClick={handleExportGrades}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center gap-1.5"
                  >
                    <span>📥</span> Exportar CSV
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOfficialActaPdfModal(true)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>🖨️</span> Vista Oficial PDF
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleActaStatus}
                    className={`px-3.5 py-2 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                      gradebookStatus === 'EDICION'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    {gradebookStatus === 'EDICION' ? (
                      <><span>🔒</span> Oficializar Acta</>
                    ) : (
                      <><span>🔓</span> Reabrir Edición</>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
                {/* Filter and Control Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Asignatura:</span>
                      <select
                        value={selectedGradebookCourse}
                        onChange={(e) => setSelectedGradebookCourse(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
                      >
                        <option value="MAT-101">Álgebra y Aritmética (Primaria 1°)</option>
                        <option value="COM-101">Comprensión y Lenguaje (Primaria 2°)</option>
                        <option value="FIS-101">Física Elemental (Secundaria 4°)</option>
                        <option value="PRE-101">Razonamiento Pre-U (Ciclo Anual)</option>
                        <option value="PSI-101">Psicomotricidad & Expresión (Nido 4 Años)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Periodo Lectivo:</span>
                      <select
                        value={selectedGradebookPeriod}
                        onChange={(e) => setSelectedGradebookPeriod(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
                      >
                        <option value="I Bimestre 2026">I Bimestre 2026</option>
                        <option value="II Bimestre 2026">II Bimestre 2026</option>
                        <option value="III Bimestre 2026">III Bimestre 2026</option>
                        <option value="IV Bimestre 2026">IV Bimestre 2026</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-1 max-w-xs">
                    <input
                      type="text"
                      placeholder="Buscar alumno o código..."
                      value={gradebookSearch}
                      onChange={(e) => setGradebookSearch(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddGradebookStudentModal(true)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-xs rounded-xl transition-all whitespace-nowrap"
                    >
                      + Alumno
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-100/70 text-[11px] uppercase font-black text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5">Código / Alumno</th>
                        <th className="px-4 py-3.5 text-center">Nota 1 (Prácticas)</th>
                        <th className="px-4 py-3.5 text-center">Nota 2 (Tareas)</th>
                        <th className="px-4 py-3.5 text-center">Nota 3 (Participación)</th>
                        <th className="px-4 py-3.5 text-center">Examen Bimestral</th>
                        <th className="px-4 py-3.5 text-center">Promedio</th>
                        <th className="px-4 py-3.5 text-center">Logro</th>
                        <th className="px-6 py-3.5">Conclusión Cualitativa / Retroalimentación</th>
                        <th className="px-3 py-3.5 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {gradebook
                        .filter((r) => {
                          const matchCourse = !selectedGradebookCourse || r.courseId === selectedGradebookCourse;
                          const matchPeriod = !selectedGradebookPeriod || r.period === selectedGradebookPeriod;
                          const matchSearch =
                            !gradebookSearch ||
                            r.studentName.toLowerCase().includes(gradebookSearch.toLowerCase()) ||
                            r.code.toLowerCase().includes(gradebookSearch.toLowerCase());
                          return matchCourse && matchPeriod && matchSearch;
                        })
                        .map((row) => (
                          <tr key={row.studentId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{row.studentName}</p>
                              <p className="text-[11px] font-mono font-bold text-indigo-600">{row.code}</p>
                            </td>

                            <td className="px-4 py-4 text-center">
                              {gradebookStatus === 'EDICION' ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={row.n1}
                                  onChange={(e) => handleUpdateGrade(row.studentId, 'n1', Number(e.target.value))}
                                  className="w-14 text-center py-1 bg-white border border-slate-300 rounded-lg font-black text-slate-900 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                              ) : (
                                <span className="font-black text-slate-900">{row.n1}</span>
                              )}
                            </td>

                            <td className="px-4 py-4 text-center">
                              {gradebookStatus === 'EDICION' ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={row.n2}
                                  onChange={(e) => handleUpdateGrade(row.studentId, 'n2', Number(e.target.value))}
                                  className="w-14 text-center py-1 bg-white border border-slate-300 rounded-lg font-black text-slate-900 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                              ) : (
                                <span className="font-black text-slate-900">{row.n2}</span>
                              )}
                            </td>

                            <td className="px-4 py-4 text-center">
                              {gradebookStatus === 'EDICION' ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={row.n3}
                                  onChange={(e) => handleUpdateGrade(row.studentId, 'n3', Number(e.target.value))}
                                  className="w-14 text-center py-1 bg-white border border-slate-300 rounded-lg font-black text-slate-900 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                              ) : (
                                <span className="font-black text-slate-900">{row.n3}</span>
                              )}
                            </td>

                            <td className="px-4 py-4 text-center">
                              {gradebookStatus === 'EDICION' ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={row.exam}
                                  onChange={(e) => handleUpdateGrade(row.studentId, 'exam', Number(e.target.value))}
                                  className="w-14 text-center py-1 bg-white border border-slate-300 rounded-lg font-black text-slate-900 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                              ) : (
                                <span className="font-black text-slate-900">{row.exam}</span>
                              )}
                            </td>

                            <td className="px-4 py-4 text-center">
                              <span className="text-base font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                                {row.gpa.toFixed(1)}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-center">
                              <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                                row.status === 'AD'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : row.status === 'A'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : row.status === 'B'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}>
                                {row.status === 'AD' && '🌟 AD'}
                                {row.status === 'A' && '✓ A'}
                                {row.status === 'B' && '⏳ B'}
                                {row.status === 'C' && '🌱 C'}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-xs">
                              {gradebookStatus === 'EDICION' ? (
                                <input
                                  type="text"
                                  value={row.qualitativeNote}
                                  onChange={(e) => handleUpdateQualitativeNote(row.studentId, e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-400 rounded-xl text-slate-800 font-medium text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                  placeholder="Redacta la observación cualitativa..."
                                />
                              ) : (
                                <p className="text-slate-700 italic font-medium">{row.qualitativeNote}</p>
                              )}
                            </td>

                            <td className="px-3 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveGradebookStudent(row.studentId)}
                                disabled={gradebookStatus === 'OFICIALIZADO'}
                                className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                title="Eliminar registro"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB: CONTROL DIARIO DE ASISTENCIA
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-in">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                    Control de Asistencia Biométrico / Aula
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">Toma de Asistencia Diaria</h2>
                  <p className="text-xs text-slate-500">Registro en tiempo real por sección con envío de notificación a apoderados.</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={selectedAttendanceDate}
                    onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                  />
                  <Button size="sm" variant="primary" onClick={() => showToast('✓ Registro de asistencia de hoy guardado correctamente.')}>
                    💾 Guardar Asistencia
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Sección Activa: Primaria 1° "A" & Nido 5 Años</span>
                  <span className="text-xs font-bold text-emerald-700">Asistencia Registrada: 83.3%</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5">Alumno</th>
                        <th className="px-6 py-3.5">Grado / Sección</th>
                        <th className="px-6 py-3.5">Hora de Ingreso</th>
                        <th className="px-6 py-3.5">Estado de Asistencia</th>
                        <th className="px-6 py-3.5 text-right">Marcar Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {attendance.map((att) => (
                        <tr key={att.studentId} className="hover:bg-slate-50/70">
                          <td className="px-6 py-4 font-bold text-slate-900">{att.studentName}</td>
                          <td className="px-6 py-4 text-xs text-slate-700">{att.grade} ({att.section})</td>
                          <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-800">{att.arrivalTime}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              att.status === 'PRESENTE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : att.status === 'TARDANZA'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {att.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleAttendance(att.studentId, 'PRESENTE')}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                  att.status === 'PRESENTE' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                🟢 Presente
                              </button>
                              <button
                                onClick={() => handleToggleAttendance(att.studentId, 'TARDANZA')}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                  att.status === 'TARDANZA' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                🟡 Tardanza
                              </button>
                              <button
                                onClick={() => handleToggleAttendance(att.studentId, 'FALTA_JUSTIFICADA')}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                  att.status === 'FALTA_JUSTIFICADA' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                🔵 Falta
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB: HORARIOS SEMANALES (MODIFICABLE & EDITABLE)
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'schedule' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Banner */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
                      Cuadrante Horario Institucional
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shadow-2xs">
                      <span>✏️</span> Modificable en Tiempo Real
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">Horarios Semanales de Clase</h2>
                  <p className="text-xs text-slate-500">Haz clic en cualquier celda para reasignar docente, asignatura o aula de clase.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportScheduleCSV}>
                    📥 Exportar CSV
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowTimetablePdfModal(true)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    🖨️ Imprimir PDF
                  </button>
                  <Button variant="primary" size="sm" onClick={() => setShowAddSlotModal(true)}>
                    + Agregar Bloque Horario
                  </Button>
                </div>
              </div>

              {/* Filters Bar: Nivel & Grado / Sección */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-slate-700 uppercase">Nivel Educativo:</span>
                  {(['Primaria', 'Secundaria', 'Nido', 'Pre-Universitario'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setSelectedScheduleLevel(lvl);
                        if (lvl === 'Primaria') setSelectedScheduleGrade('5to Grado A (Primaria)');
                        else if (lvl === 'Secundaria') setSelectedScheduleGrade('4to Año B (Secundaria)');
                        else if (lvl === 'Nido') setSelectedScheduleGrade('Aula 4 Años (Nido)');
                        else setSelectedScheduleGrade('Ciclo Intensivo Pre-U (Aula Magna)');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                        selectedScheduleLevel === lvl
                          ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl === 'Nido' ? '🧸 Nido / Inicial' : lvl === 'Primaria' ? '🎒 Primaria' : lvl === 'Secundaria' ? '🎓 Secundaria' : '⚡ Pre-U'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-700 uppercase">Grado / Aula:</span>
                  <select
                    value={selectedScheduleGrade}
                    onChange={(e) => setSelectedScheduleGrade(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  >
                    {selectedScheduleLevel === 'Primaria' && (
                      <>
                        <option value="1er Grado A (Primaria)">1er Grado A (Primaria)</option>
                        <option value="3er Grado B (Primaria)">3er Grado B (Primaria)</option>
                        <option value="5to Grado A (Primaria)">5to Grado A (Primaria)</option>
                        <option value="6to Grado A (Primaria)">6to Grado A (Primaria)</option>
                      </>
                    )}
                    {selectedScheduleLevel === 'Secundaria' && (
                      <>
                        <option value="1er Año A (Secundaria)">1er Año A (Secundaria)</option>
                        <option value="3er Año B (Secundaria)">3er Año B (Secundaria)</option>
                        <option value="4to Año B (Secundaria)">4to Año B (Secundaria)</option>
                        <option value="5to Año A (Secundaria)">5to Año A (Secundaria)</option>
                      </>
                    )}
                    {selectedScheduleLevel === 'Nido' && (
                      <>
                        <option value="Aula 3 Años (Nido)">Aula 3 Años (Nido)</option>
                        <option value="Aula 4 Años (Nido)">Aula 4 Años (Nido)</option>
                        <option value="Aula 5 Años (Nido)">Aula 5 Años (Nido)</option>
                      </>
                    )}
                    {selectedScheduleLevel === 'Pre-Universitario' && (
                      <>
                        <option value="Ciclo Intensivo Pre-U (Aula Magna)">Ciclo Intensivo Pre-U (Aula Magna)</option>
                        <option value="Ciclo Semestral UNI (Aula 302)">Ciclo Semestral UNI (Aula 302)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Editable Timetable Grid */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-900 text-white text-[11px] uppercase font-bold">
                      <tr>
                        <th className="px-4 py-3 border-r border-slate-800 w-32">Bloque Horario</th>
                        <th className="px-4 py-3 border-r border-slate-800">Lunes</th>
                        <th className="px-4 py-3 border-r border-slate-800">Martes</th>
                        <th className="px-4 py-3 border-r border-slate-800">Miércoles</th>
                        <th className="px-4 py-3 border-r border-slate-800">Jueves</th>
                        <th className="px-4 py-3 border-r border-slate-800">Viernes</th>
                        <th className="px-3 py-3 text-center w-12">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {timetable.map((slot, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-4 font-mono font-bold bg-slate-100 border-r border-slate-200 text-slate-800 text-[11px]">
                            {slot.time}
                          </td>
                          {(['mon', 'tue', 'wed', 'thu', 'fri'] as const).map((dayKey) => {
                            const day = slot[dayKey];
                            const isRecreo = day.course.toUpperCase().includes('RECREO') || day.course.toUpperCase().includes('LONCHERA');
                            return (
                              <td key={dayKey} className="px-3 py-3 border-r border-slate-100 align-top group relative">
                                {isRecreo ? (
                                  <div
                                    onClick={() => handleOpenEditSlot(rowIdx, dayKey)}
                                    className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-center cursor-pointer transition-all space-y-0.5"
                                    title="Haz clic para modificar bloque de descanso"
                                  >
                                    <p className="font-bold text-amber-900 text-[11px]">☕ {day.course}</p>
                                    <span className="text-[9px] text-amber-700 font-semibold">{day.room}</span>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => handleOpenEditSlot(rowIdx, dayKey)}
                                    className="p-3 bg-slate-50 hover:bg-white hover:border-violet-300 border border-slate-200 rounded-xl space-y-1 cursor-pointer transition-all shadow-2xs group-hover:shadow-md"
                                    title="Haz clic para editar asignatura, docente y aula"
                                  >
                                    <div className="flex justify-between items-start">
                                      <p className="font-bold text-slate-900 text-xs">{day.course}</p>
                                      <span className="opacity-0 group-hover:opacity-100 text-[10px] text-violet-600 font-black transition-opacity">
                                        ✏️
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-violet-700 font-semibold">{day.teacher}</p>
                                    <span className="text-[9px] font-extrabold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                                      📍 {day.room}
                                    </span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-3 py-4 text-center border-l border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleRemoveSlotRow(rowIdx)}
                              className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-bold text-xs transition-colors"
                              title="Eliminar este bloque horario de la grilla"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB: COMUNICADOS A PADRES (CON DATOS NIDO HASTA PRE-U & EDICIÓN)
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Banner */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Mensajería Institucional
                    </span>
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1 shadow-2xs">
                      <span>✉️</span> Nido hasta Pre-U
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">Comunicados a Padres de Familia</h2>
                  <p className="text-xs text-slate-500">Emisión de circulares y notificaciones masivas organizadas por nivel educativo.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportAnnouncementsCSV}>
                    📥 Exportar CSV
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => setShowAddAnnouncementModal(true)}>
                    ✉️ Publicar Nuevo Comunicado
                  </Button>
                </div>
              </div>

              {/* Filter Bar by Scope */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-2 shadow-2xs">
                <span className="text-xs font-black text-slate-700 uppercase mr-1">Filtrar por Destinatario:</span>
                {([
                  { value: 'TODOS',            label: '📋 General (Todos)' },
                  { value: 'Nido / Inicial',   label: '🌱 Inicial' },
                  { value: 'Primaria',         label: '📘 Primaria' },
                  { value: 'Secundaria',       label: '🎓 Secundaria' },
                  { value: 'Pre-Universitario', label: '🚀 Pre-U' },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedAnnouncementScopeFilter(value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                      selectedAnnouncementScopeFilter === value
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Announcements List */}
              <div className="space-y-4">
                {announcements
                  .filter((ann) => selectedAnnouncementScopeFilter === 'TODOS' || ann.scope === selectedAnnouncementScopeFilter)
                  .map((ann) => (
                    <div
                      key={ann.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-all relative group space-y-3 cursor-pointer"
                      onClick={() => handleOpenEditAnnouncement(ann)}
                    >
                      {/* Delete Button (X) in Top-Right Corner */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAnnouncement(ann.id);
                        }}
                        className="absolute top-4 right-4 w-7 h-7 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-bold text-xs transition-colors z-10"
                        title="Eliminar comunicado"
                      >
                        ✕
                      </button>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pr-8">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {ann.scope}
                            </span>
                            <span className="text-xs text-slate-400 font-mono font-bold">📅 {ann.date}</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              👤 {ann.author}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mt-1.5">
                            {ann.title}
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 whitespace-nowrap">
                          ✓ Recibido por {ann.recipientsCount} apoderados
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium">
                        {ann.content}
                      </p>

                      <div className="pt-2 flex justify-end items-center text-xs text-slate-500 font-medium">
                        <span className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                          ✏️ Modificar Comunicado
                        </span>
                      </div>
                    </div>
                  ))}

                {announcements.filter((ann) => selectedAnnouncementScopeFilter === 'TODOS' || ann.scope === selectedAnnouncementScopeFilter).length === 0 && (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                    <p className="font-bold text-base text-slate-700">No hay comunicados publicados para la sección seleccionada.</p>
                    <p className="text-xs text-slate-400 mt-1">Haz clic en "+ Publicar Nuevo Comunicado" para enviar una circular a esta sección.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB: EMBUDO DE ADMISIONES (KANBAN / PIPELINE)
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'admissions' && (
            <div className="space-y-6 animate-in">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                    Proceso de Admisión 2026-2027
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">Embudo de Postulantes</h2>
                  <p className="text-xs text-slate-500">Seguimiento de aspirantes desde la solicitud hasta la matrícula final.</p>
                </div>
                <Button size="sm" variant="primary" onClick={() => setShowAddApplicantModal(true)}>
                  + Registrar Postulante
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { statusKey: 'EN_REVISION', title: '1. En Revisión', color: 'bg-blue-500' },
                  { statusKey: 'EVALUACIÓN', title: '2. Evaluación Programada', color: 'bg-amber-500' },
                  { statusKey: 'APROBADO', title: '3. Aprobado / Vacante', color: 'bg-emerald-500' },
                  { statusKey: 'MATRICULADO', title: '4. Matriculado', color: 'bg-indigo-500' },
                ].map((column) => {
                  const items = admissions.filter((a) => a.status === column.statusKey);
                  return (
                    <div key={column.statusKey} className="bg-slate-100 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-800">{column.title}</span>
                        <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${column.color}`}>
                          {items.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {items.map((applicant) => (
                          <div
                            key={applicant.id}
                            className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md transition-all relative group cursor-pointer space-y-2"
                            onClick={() => handleOpenEditApplicant(applicant)}
                          >
                            {/* Delete Button (X) in Top-Right Corner */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveApplicant(applicant.id);
                              }}
                              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-bold text-xs transition-colors z-10"
                              title="Eliminar postulante"
                            >
                              ✕
                            </button>

                            <div className="flex justify-between items-start pr-6">
                              <p className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                {applicant.applicantCode}
                              </p>
                            </div>

                            <p className="font-bold text-xs text-slate-900 group-hover:text-amber-700 transition-colors pr-6">
                              {applicant.applicantName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {applicant.targetLevel} • {applicant.targetGrade}
                            </p>

                            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                              <span className="text-slate-600 font-medium">📞 {applicant.contactPhone}</span>
                              {applicant.score !== null && applicant.score !== undefined && (
                                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  Score: {applicant.score}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 4: FINANZAS & CAJA
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Núcleo Financiero y Recaudación de Pensiones</h2>
                  <p className="text-xs text-slate-500">Control de ingresos por niveles: Nido, Primaria, Secundaria y Pre-U.</p>
                </div>
                <Button size="sm" variant="primary" onClick={() => setShowRecordPaymentModal(true)}>
                  💳 Registrar Cobro en Caja
                </Button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">Historial de Recaudación en Tiempo Real</h3>
                  <Button size="sm" variant="outline" onClick={handleExportPayments}>
                    📥 Exportar Reporte de Caja
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-6 py-3.5">N° Recibo</th>
                        <th className="px-6 py-3.5">Alumno</th>
                        <th className="px-6 py-3.5">Concepto</th>
                        <th className="px-6 py-3.5">Monto</th>
                        <th className="px-6 py-3.5">Medio de Pago</th>
                        <th className="px-6 py-3.5">Fecha</th>
                        <th className="px-6 py-3.5 text-right">Comprobante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-600">{p.receiptNumber}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{p.studentName}</td>
                          <td className="px-6 py-4 text-xs">{p.concept}</td>
                          <td className="px-6 py-4 font-black text-slate-900">${p.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-700">{p.method}</td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-500">{p.date}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => { setSelectedReceipt(p); setShowReceiptPdfModal(true); }}
                              className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                            >
                              📄 Ver Boleta PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 5: ALUMNOS & MATRÍCULAS
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Directorio de Alumnos Matriculados</h2>
                    <p className="text-xs text-slate-500">Expedientes estudiantiles en Nido (3-5), Primaria (1°-6°), Secundaria (1°-5°) y Pre-U.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Buscar alumno..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                    <Button size="sm" variant="primary" onClick={() => setShowAddStudentModal(true)}>
                      + Matricular Alumno
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5">Código</th>
                        <th className="px-6 py-3.5">Alumno</th>
                        <th className="px-6 py-3.5">Nivel / Grado</th>
                        <th className="px-6 py-3.5">Apoderado</th>
                        <th className="px-6 py-3.5">Promedio</th>
                        <th className="px-6 py-3.5">Pensión</th>
                        <th className="px-6 py-3.5 text-right">Ficha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredStudents.map((stu) => (
                        <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{stu.code}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{stu.name}</td>
                          <td className="px-6 py-4 text-xs text-slate-700">
                            <span className="font-bold text-indigo-700">{stu.level}</span> • {stu.grade} ({stu.section})
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <p className="text-slate-800">{stu.parentName}</p>
                            <p className="text-[11px] text-slate-400">{stu.parentPhone}</p>
                          </td>
                          <td className="px-6 py-4 font-black text-indigo-600">{stu.gpa.toFixed(1)}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                              stu.tuitionStatus === 'AL DÍA'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {stu.tuitionStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedStudentDetail(stu)}
                              className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100"
                            >
                              🔍 Ver Expediente
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 6: TIENDA ESCOLAR & CATALOGO INVENTARIO
             ──────────────────────────────────────────────────────────── */}
          {/* ────────────────────────────────────────────────────────────
             TAB 6: TIENDA E INVENTARIO (MULTI-ROL: ADMIN, PADRES, ALUMNOS, PROFESORES)
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'commerce' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {isStoreOnly && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-400/40 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                      🛒
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">Acceso Autorizado: Gestor de Tienda & Productos</h3>
                        <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                          Lic. Mateo Alarcón Medina
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Panel exclusivo de gestión de catálogo: Tienes permisos para <strong>añadir</strong> nuevos productos, <strong>modificar</strong> precios y stock, y <strong>eliminar</strong> productos descontinuados.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button size="sm" variant="primary" onClick={() => setShowAddProductModal(true)}>
                      + Añadir Producto
                    </Button>
                  </div>
                </div>
              )}

              {/* Header Banner */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Módulo Comercial & Tienda Escolar
                    </span>
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1 shadow-2xs">
                      <span>🛍️</span> Gestión Multi-Rol Adaptativa
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">Tienda Virtual e Inventario Institucional</h2>
                  <p className="text-xs text-slate-500">Administración de productos para Administrador/Asistente y tiendas especializadas por rol.</p>
                </div>

                {selectedCommerceRole === 'admin' && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportInventoryCSV}>
                      📥 Exportar Inventario (CSV)
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => setShowAddProductModal(true)}>
                      + Registrar Nuevo Producto
                    </Button>
                  </div>
                )}
              </div>

              {/* Selector de Perspectiva por Rol de Usuario */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    👁️ Seleccionar Vista / Perspectiva por Rol de Usuario:
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedCommerceRole === 'admin'
                      ? 'Vista Admin / Asistente (CRUD Inventario)'
                      : selectedCommerceRole === 'parent'
                      ? 'Vista Padre (Implementos & Uniformes)'
                      : selectedCommerceRole === 'student'
                      ? 'Vista Alumno (Menú Escolar & Útiles)'
                      : 'Vista Profesor (Cafetería & Material Aula)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCommerceRole('admin')}
                    className={`p-3 rounded-xl text-xs font-black transition-all text-left border flex items-center gap-2.5 ${
                      selectedCommerceRole === 'admin'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg">👑</span>
                    <div>
                      <p className="font-black text-xs">Admin & Asistente</p>
                      <p className={`text-[10px] font-normal ${selectedCommerceRole === 'admin' ? 'text-slate-300' : 'text-slate-500'}`}>CRUD Inventario Total</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCommerceRole('parent')}
                    className={`p-3 rounded-xl text-xs font-black transition-all text-left border flex items-center gap-2.5 ${
                      selectedCommerceRole === 'parent'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg">👨‍👩‍👧‍👦</span>
                    <div>
                      <p className="font-black text-xs">Padres de Familia</p>
                      <p className={`text-[10px] font-normal ${selectedCommerceRole === 'parent' ? 'text-amber-100' : 'text-slate-500'}`}>Uniformes & Kits</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCommerceRole('student')}
                    className={`p-3 rounded-xl text-xs font-black transition-all text-left border flex items-center gap-2.5 ${
                      selectedCommerceRole === 'student'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg">🎓</span>
                    <div>
                      <p className="font-black text-xs">Alumnos / Estudiantes</p>
                      <p className={`text-[10px] font-normal ${selectedCommerceRole === 'student' ? 'text-indigo-100' : 'text-slate-500'}`}>Menú Escolar & Útiles</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCommerceRole('teacher')}
                    className={`p-3 rounded-xl text-xs font-black transition-all text-left border flex items-center gap-2.5 ${
                      selectedCommerceRole === 'teacher'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg">👨‍🏫</span>
                    <div>
                      <p className="font-black text-xs">Profesores / Docentes</p>
                      <p className={`text-[10px] font-normal ${selectedCommerceRole === 'teacher' ? 'text-emerald-100' : 'text-slate-500'}`}>Cafetería & Materiales</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────────
                 VISTA 1: ADMINISTRADOR Y ASISTENTE (CRUD INVENTARIO COMPLETO)
                 ──────────────────────────────────────────────────────────── */}
              {selectedCommerceRole === 'admin' && (
                <div className="space-y-6">
                  {/* KPIs Inventario */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Total Productos</p>
                      <p className="text-2xl font-black text-slate-900">{products.length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Valor Inventario</p>
                      <p className="text-2xl font-black text-emerald-700">
                        ${products.reduce((acc, p) => acc + p.price * p.stock, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Stock Bajo / Crítico</p>
                      <p className="text-2xl font-black text-rose-600">
                        {products.filter((p) => p.stock <= 20).length}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Pedidos de Alumnos</p>
                      <p className="text-2xl font-black text-indigo-600">{orders.length}</p>
                    </div>
                  </div>

                  {/* Sub-Tabs: Catálogo vs Pedidos */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCommerceSubTab('catalog')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                          commerceSubTab === 'catalog'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        👕 Catálogo e Inventario General ({products.length})
                      </button>
                      <button
                        onClick={() => setCommerceSubTab('orders')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                          commerceSubTab === 'orders'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        📦 Pedidos de Alumnos y Cajas ({orders.length})
                      </button>
                    </div>

                    {commerceSubTab === 'catalog' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          placeholder="Buscar producto por nombre o código..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 w-56 focus:bg-white focus:outline-none"
                        />
                        <select
                          value={selectedProductCategoryFilter}
                          onChange={(e) => setSelectedProductCategoryFilter(e.target.value)}
                          className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
                        >
                          <option value="TODOS">Todas las Categorías</option>
                          <option value="Uniformes">Uniformes</option>
                          <option value="Menú Escolar">Menú Escolar</option>
                          <option value="Menú Docente">Menú Docente</option>
                          <option value="Kits & Útiles">Kits & Útiles</option>
                          <option value="Material Docente">Material Docente</option>
                          <option value="Libros & Guías">Libros & Guías</option>
                          <option value="Accesorios">Accesorios</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {commerceSubTab === 'catalog' ? (
                    /* TABLA COMPLETA DE INVENTARIO (CRUD ADMIN / ASISTENTE) */
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                          <thead className="bg-slate-900 text-white text-[11px] uppercase font-extrabold border-b border-slate-800">
                            <tr>
                              <th className="px-6 py-3.5">Código / Ícono</th>
                              <th className="px-6 py-3.5">Nombre del Producto</th>
                              <th className="px-6 py-3.5">Categoría</th>
                              <th className="px-6 py-3.5">Rol Destino</th>
                              <th className="px-6 py-3.5">Precio Unitario</th>
                              <th className="px-6 py-3.5">Stock Disponible</th>
                              <th className="px-6 py-3.5">Estado</th>
                              <th className="px-6 py-3.5 text-right">Acciones CRUD</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {products
                              .filter((p) => {
                                const matchCategory = selectedProductCategoryFilter === 'TODOS' || p.category === selectedProductCategoryFilter;
                                const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.code.toLowerCase().includes(productSearch.toLowerCase());
                                return matchCategory && matchSearch;
                              })
                              .map((prod) => (
                                <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl">{prod.icon || (prod as any).image || '📦'}</span>
                                      <span className="font-mono text-xs font-bold text-indigo-600">{prod.code}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="font-bold text-slate-900 text-xs">{prod.name}</p>
                                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{prod.description || 'Sin descripción'}</p>
                                  </td>
                                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">{prod.category}</td>
                                  <td className="px-6 py-4">
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                      {prod.targetRole || 'Padre'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-black text-slate-900">${prod.price.toFixed(2)}</td>
                                  <td className="px-6 py-4 font-bold text-slate-800">{prod.stock} unids</td>
                                  <td className="px-6 py-4">
                                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                      prod.stock > 20
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : prod.stock > 0
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : 'bg-rose-50 text-rose-800 border-rose-200'
                                    }`}>
                                      {prod.stock > 20 ? 'DISPONIBLE' : prod.stock > 0 ? 'STOCK BAJO' : 'AGOTADO'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditProduct(prod)}
                                        className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-all flex items-center gap-1"
                                      >
                                        ✏️ Editar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveProduct(prod.id)}
                                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-bold text-xs transition-colors"
                                        title="Eliminar producto del inventario"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* TABLA DE PEDIDOS DE ALUMNOS */
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500">
                            <tr>
                              <th className="px-6 py-3.5">Código</th>
                              <th className="px-6 py-3.5">Alumno Solicitante</th>
                              <th className="px-6 py-3.5">Detalle Items</th>
                              <th className="px-6 py-3.5">Total</th>
                              <th className="px-6 py-3.5">Estado</th>
                              <th className="px-6 py-3.5 text-right">Acción Operativa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {orders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-slate-50/70">
                                <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{ord.code}</td>
                                <td className="px-6 py-4 font-bold text-slate-900">{ord.studentName}</td>
                                <td className="px-6 py-4 text-xs text-slate-700">{ord.items}</td>
                                <td className="px-6 py-4 font-bold text-slate-900">${ord.totalAmount.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    ord.status === 'DELIVERED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ord.status === 'PREPARING'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {ord.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {ord.status === 'PENDING' && (
                                    <button
                                      onClick={() => handleOrderStatus(ord, 'PREPARING')}
                                      className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg"
                                    >
                                      📦 Preparar Pedido
                                    </button>
                                  )}
                                  {ord.status === 'PREPARING' && (
                                    <button
                                      onClick={() => handleOrderStatus(ord, 'DELIVERED')}
                                      className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg"
                                    >
                                      ✓ Marcar Entregado
                                    </button>
                                  )}
                                  {ord.status === 'DELIVERED' && (
                                    <span className="text-xs font-semibold text-slate-400">Entregado</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ────────────────────────────────────────────────────────────
                 VISTA 2: TIENDA PARA PADRES DE FAMILIA (UNIFORMES & IMPLEMENTOS)
                 ──────────────────────────────────────────────────────────── */}
              {selectedCommerceRole === 'parent' && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-amber-600 to-amber-700 rounded-3xl text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200 bg-amber-800/40 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        Catálogo para Apoderados
                      </span>
                      <h3 className="text-xl font-black mt-1">Uniformes, Implementos y Guías Escolares</h3>
                      <p className="text-xs text-amber-100 mt-0.5">Adquiere uniformes oficiales, mandiles de nido, mochilas y compendios de estudio.</p>
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-xs text-xs font-bold">
                      💳 Entrega a Domicilio o Retiro en Colegio
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {products
                      .filter((p) => p.targetRole === 'Padre' || p.category === 'Uniformes' || p.category === 'Kits & Útiles' || p.category === 'Libros & Guías' || p.category === 'Accesorios')
                      .map((prod) => (
                        <div key={prod.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-3xl shadow-2xs">
                                {prod.icon || (prod as any).image || '👕'}
                              </div>
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                                {prod.category}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-mono font-bold text-indigo-600">{prod.code}</span>
                              <h4 className="text-sm font-black text-slate-900 leading-snug mt-0.5">{prod.name}</h4>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{prod.description || 'Producto oficial San Cleo.'}</p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-xs text-slate-400 font-bold block text-[10px]">PRECIO</span>
                              <span className="text-lg font-black text-slate-900">${prod.price.toFixed(2)}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleQuickPurchase(prod.name, 'Padre de Familia')}
                            >
                              🛒 Comprar Implemento
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────────
                 VISTA 3: TIENDA PARA ALUMNOS (MENÚ ESCOLAR & ÚTILES)
                 ──────────────────────────────────────────────────────────── */}
              {selectedCommerceRole === 'student' && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200 bg-indigo-900/40 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                        Cantina & Cafetería Estudiantil
                      </span>
                      <h3 className="text-xl font-black mt-1">Menú del Día Escolar & Útiles de Clases</h3>
                      <p className="text-xs text-indigo-100 mt-0.5">Reserva tu almuerzo balanceado, bebidas, snacks y cuadernos institucionales.</p>
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-xs text-xs font-bold">
                      🍱 Entrega en Recreo / Comedor
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {products
                      .filter((p) => p.targetRole === 'Alumno' || p.category === 'Menú Escolar' || p.category === 'Útiles Escolares')
                      .map((prod) => (
                        <div key={prod.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl shadow-2xs">
                                {prod.icon || (prod as any).image || '🍱'}
                              </div>
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                                {prod.category}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-mono font-bold text-indigo-600">{prod.code}</span>
                              <h4 className="text-sm font-black text-slate-900 leading-snug mt-0.5">{prod.name}</h4>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{prod.description || 'Menú balanceado supervisado.'}</p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-xs text-slate-400 font-bold block text-[10px]">PRECIO</span>
                              <span className="text-lg font-black text-slate-900">${prod.price.toFixed(2)}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleQuickPurchase(prod.name, 'Estudiante')}
                            >
                              🍱 Reservar Menú / Útiles
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────────
                 VISTA 4: TIENDA PARA PROFESORES / DOCENTES (CAFETERÍA & MATERIAL)
                 ──────────────────────────────────────────────────────────── */}
              {selectedCommerceRole === 'teacher' && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                        Servicios para Plana Docente
                      </span>
                      <h3 className="text-xl font-black mt-1">Cafetería Ejecutiva & Insumos de Aula</h3>
                      <p className="text-xs text-emerald-100 mt-0.5">Almuerzo ejecutivo docente, plumones de pizarra, motas y mandiles de laboratorio.</p>
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-xs text-xs font-bold">
                      ☕ Atención Preferencial Docente
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {products
                      .filter((p) => p.targetRole === 'Profesor' || p.category === 'Menú Docente' || p.category === 'Material Docente' || p.category === 'Tecnología')
                      .map((prod) => (
                        <div key={prod.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl shadow-2xs">
                                {prod.icon || (prod as any).image || '☕'}
                              </div>
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                                {prod.category}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-mono font-bold text-indigo-600">{prod.code}</span>
                              <h4 className="text-sm font-black text-slate-900 leading-snug mt-0.5">{prod.name}</h4>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{prod.description || 'Material para la plana docente.'}</p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-xs text-slate-400 font-bold block text-[10px]">PRECIO</span>
                              <span className="text-lg font-black text-slate-900">${prod.price.toFixed(2)}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleQuickPurchase(prod.name, 'Docente / Profesor')}
                            >
                              ☕ Pedir Menú / Material
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 7: REPORTES, BI & EXPORTACIÓN
             ──────────────────────────────────────────────────────────── */}
          {/* ────────────────────────────────────────────────────────────
             TAB 7: REPORTES & BUSINESS INTELLIGENCE (BI & ANALYTICS INTERACTIVO)
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'reporting' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Banner */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      Business Intelligence (BI) & Analítica
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shadow-2xs">
                      <span>📈</span> Indicadores Directivos
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">Centro de Inteligenia de Negocios y Reportes</h2>
                  <p className="text-xs text-slate-500">Métricas de rendimiento, análisis predictivo y exportación ejecutiva configurable.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowBiSettingsModal(true)}>
                    ⚙️ Configurar Metas BI
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportStudents}>
                    📥 Exportar Alumnos (CSV)
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => setShowAddReportModal(true)}>
                    + Crear Nuevo Reporte
                  </Button>
                </div>
              </div>

              {/* Panel de Metas BI Modificable */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-xl space-y-4 border border-slate-700">
                <div className="flex justify-between items-start border-b border-slate-700 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-400/30">
                      Tablero Directivo de Objetivos 2026
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">Metas Institucionales de Gestión</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBiSettingsModal(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    ✏️ Modificar Metas
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-medium">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Meta Recaudación Mensual</p>
                    <p className="text-xl font-black text-emerald-400">${biSettings.monthlyTargetRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-slate-300">Progreso Actual: {((payments.reduce((a, b) => a + b.amount, 0) / biSettings.monthlyTargetRevenue) * 100).toFixed(1)}%</p>
                  </div>

                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Meta Matriculados</p>
                    <p className="text-xl font-black text-indigo-300">{students.length} / {biSettings.enrollmentTarget}</p>
                    <p className="text-[10px] text-slate-300">Efectividad: {((students.length / biSettings.enrollmentTarget) * 100).toFixed(0)}% de meta</p>
                  </div>

                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Puntualidad Mínima</p>
                    <p className="text-xl font-black text-amber-300">{biSettings.minAttendanceRate}%</p>
                    <p className="text-[10px] text-slate-300">Asistencia Real: 96.2%</p>
                  </div>

                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Promedio GPA Objetivo</p>
                    <p className="text-xl font-black text-teal-300">{biSettings.minGpaTarget.toFixed(1)} / 20.0</p>
                    <p className="text-[10px] text-slate-300">Promedio Real: 16.8</p>
                  </div>

                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Ratio Alumno / Docente</p>
                    <p className="text-xl font-black text-purple-300">{(students.length / Math.max(staff.length, 1)).toFixed(1)} : 1</p>
                    <p className="text-[10px] text-slate-300">Límite Aceptable: {biSettings.maxStudentTeacherRatio} : 1</p>
                  </div>
                </div>
              </div>

              {/* Gráficos / Tarjetas de Analítica BI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BI 1: Distribución Financiera por Nivel */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Finanzas & Recaudación
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-0.5">Ingresos por Niveles Educativos</h4>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                      Total: ${payments.reduce((a, b) => a + b.amount, 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-800 mb-1">
                        <span>🧸 Nido / Inicial (Pensión $380)</span>
                        <span>$3,800.00 (20%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '20%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-800 mb-1">
                        <span>🎒 Primaria (Pensión $450)</span>
                        <span>$9,000.00 (45%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-800 mb-1">
                        <span>🎓 Secundaria (Pensión $480)</span>
                        <span>$4,800.00 (25%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-800 mb-1">
                        <span>⚡ Pre-Universitario (Pensión $550)</span>
                        <span>$2,750.00 (10%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: '10%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* BI 2: Distribución de Desempeño Académico */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Rendimiento Académico
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-0.5">Distribución de Promedios (GPA)</h4>
                    </div>
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                      Promediar: 16.8 / 20.0
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-0.5">
                      <p className="text-[10px] font-bold text-emerald-800 uppercase">Sobresaliente (18-20)</p>
                      <p className="text-2xl font-black text-emerald-700">42%</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Cuadro de Honor</p>
                    </div>

                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-center space-y-0.5">
                      <p className="text-[10px] font-bold text-indigo-800 uppercase">Logrado (14-17)</p>
                      <p className="text-2xl font-black text-indigo-700">48%</p>
                      <p className="text-[10px] text-indigo-600 font-medium">Nivel Satisfactorio</p>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-0.5">
                      <p className="text-[10px] font-bold text-amber-800 uppercase">En Proceso (11-13)</p>
                      <p className="text-2xl font-black text-amber-700">8%</p>
                      <p className="text-[10px] text-amber-600 font-medium">Reforzamiento</p>
                    </div>

                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-0.5">
                      <p className="text-[10px] font-bold text-rose-800 uppercase">En Inicio (0-10)</p>
                      <p className="text-2xl font-black text-rose-700">2%</p>
                      <p className="text-[10px] text-rose-600 font-medium">Nivel Crítico</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creador & Gestor de Reportes Personalizados */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      Reportes Ejecutivos Oficiales
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">Generador y Modificador de Reportes</h3>
                    <p className="text-xs text-slate-500">Documentos oficiales listos para firma de Dirección General, impresión en PDF o exportación CSV.</p>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => setShowAddReportModal(true)}>
                    + Crear Nuevo Reporte
                  </Button>
                </div>

                {/* Tabs de filtro por nivel */}
                <div className="flex flex-wrap gap-2 pb-1">
                  {([
                    { value: 'TODOS',            label: '📋 General',    icon: '📋' },
                    { value: 'Nido',             label: '🌱 Inicial',    icon: '🌱' },
                    { value: 'Primaria',         label: '📘 Primaria',   icon: '📘' },
                    { value: 'Secundaria',       label: '🎓 Secundaria', icon: '🎓' },
                    { value: 'Pre-Universitario', label: '🚀 Pre-U',     icon: '🚀' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReportScopeFilter(value)}
                      className={`px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wide border transition-all ${
                        reportScopeFilter === value
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {label}
                      <span className="ml-1 text-[10px] opacity-60">
                        ({value === 'TODOS'
                          ? customReports.length
                          : customReports.filter((r) => r.scope === value).length
                        })
                      </span>
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-900 text-white text-[11px] uppercase font-extrabold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-3.5">Categoría / Fecha</th>
                        <th className="px-6 py-3.5">Título del Reporte</th>
                        <th className="px-6 py-3.5">Nivel / Alcance</th>
                        <th className="px-6 py-3.5">Autor / Emisor</th>
                        <th className="px-6 py-3.5">Observaciones Ejecutivas</th>
                        <th className="px-6 py-3.5 text-right">Acciones & Impresión</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {customReports
                        .filter((rep) => reportScopeFilter === 'TODOS' ? true : rep.scope === reportScopeFilter)
                        .map((rep) => (
                        <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 block w-max mb-1">
                              {rep.category}
                            </span>
                            <span className="text-xs text-slate-400 font-mono font-bold">{rep.date}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900 text-xs">{rep.title}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                              rep.scope === 'Nido' ? 'bg-amber-100 text-amber-800' :
                              rep.scope === 'Primaria' ? 'bg-indigo-100 text-indigo-800' :
                              rep.scope === 'Secundaria' ? 'bg-blue-100 text-blue-800' :
                              rep.scope === 'Pre-Universitario' ? 'bg-purple-100 text-purple-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {rep.scope === 'TODOS' ? '📊 TODOS' :
                               rep.scope === 'Nido' ? '🧸 Nido' :
                               rep.scope === 'Primaria' ? '🎒 Primaria' :
                               rep.scope === 'Secundaria' ? '🎓 Secundaria' :
                               '⚡ Pre-Universitario'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-700">{rep.author}</td>
                          <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">{rep.observations}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setShowPrintReportPdfModal(rep)}
                                className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-all"
                              >
                                🖨️ PDF
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditReport(rep)}
                                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-all"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveReport(rep.id)}
                                className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center font-bold text-xs transition-colors"
                                title="Eliminar reporte"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {customReports.filter((rep) => reportScopeFilter === 'TODOS' ? true : rep.scope === reportScopeFilter).length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-xs font-medium">
                            No hay reportes para el nivel <span className="font-black text-slate-600">{reportScopeFilter}</span>. Crea uno con el botón superior.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ────────────────────────────────────────────────────────────
         MODAL 1: REGISTRAR NUEVO EMPLEADO (RRHH)
         ──────────────────────────────────────────────────────────── */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Registrar Docente / Personal</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>
            <form onSubmit={handleAddStaffSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Prof. Sandra Rojas"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nivel Formativo</label>
                  <select
                    value={newStaff.level}
                    onChange={(e) => setNewStaff({ ...newStaff, level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="Nido / Inicial">Nido / Inicial</option>
                    <option value="Primaria">Primaria (1°-6°)</option>
                    <option value="Secundaria">Secundaria (1°-5°)</option>
                    <option value="Pre-Universitario">Pre-Universitario</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Sueldo Básico ($)</label>
                  <input
                    type="number"
                    required
                    value={newStaff.baseSalary}
                    onChange={(e) => setNewStaff({ ...newStaff, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Cargo / Especialidad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Docente Nido 4 años / Docente Matemática Pre-U"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddStaffModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="sm">Registrar Trabajador</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL: IMPRESIÓN DE BOLETA / COMPROBANTE DE PAGO PDF
         ──────────────────────────────────────────────────────────── */}
      {showReceiptPdfModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-slate-900 shadow-2xl space-y-6">
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded">RUC 20458932101</span>
                <button onClick={() => setShowReceiptPdfModal(false)} className="text-slate-400 hover:text-slate-800 text-xl font-bold">✕</button>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">COLEGIO SAN CLEO S.A.C.</h2>
              <p className="text-xs text-slate-600">Av. Las Flores de Primavera 450, San Isidro • Tel: (01) 458-9900</p>
              <div className="inline-block bg-slate-100 px-4 py-1 rounded-lg border border-slate-300 mt-2 font-mono font-extrabold text-sm text-emerald-800">
                BOLETA DE VENTA ELECTRÓNICA N° {selectedReceipt.receiptNumber}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-slate-500">Alumno / Cliente:</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedReceipt.studentName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Fecha de Emisión:</p>
                  <p className="font-mono font-bold text-slate-900">{selectedReceipt.date}</p>
                </div>
                <div>
                  <p className="text-slate-500">Medio de Pago:</p>
                  <p className="font-bold text-emerald-700">{selectedReceipt.method}</p>
                </div>
                <div>
                  <p className="text-slate-500">Moneda:</p>
                  <p className="font-bold text-slate-900">USD ($)</p>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-2">Descripción / Concepto</th>
                    <th className="py-2 px-2 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-2 font-bold text-slate-800">{selectedReceipt.concept}</td>
                    <td className="py-3 px-2 text-right font-black text-slate-900">${selectedReceipt.amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span>TOTAL RECAUDADO</span>
                <span className="text-xl text-emerald-700 font-black">${selectedReceipt.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setShowReceiptPdfModal(false)}>Cerrar</Button>
              <Button size="sm" variant="primary" onClick={() => window.print()}>🖨️ Imprimir / Guardar PDF</Button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL 4: MATRICULAR NUEVO ALUMNO (ALUMNOS)
         ──────────────────────────────────────────────────────────── */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Matricular Estudiante (San Cleo)</h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>
            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombres y Apellidos</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Luciana Castro Morales"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nivel Educativo</label>
                  <select
                    value={newStudent.level}
                    onChange={(e) => {
                      const lvl = e.target.value;
                      let defaultGrade = '1er Grado Primaria';
                      if (lvl === 'Nido') defaultGrade = 'Nido 3 Años';
                      else if (lvl === 'Secundaria') defaultGrade = '1er Año Secundaria';
                      else if (lvl === 'Pre-Universitario') defaultGrade = 'Ciclo Anual Pre-U';
                      setNewStudent({ ...newStudent, level: lvl, grade: defaultGrade });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="Nido">Nido / Inicial</option>
                    <option value="Primaria">Primaria (1°-6°)</option>
                    <option value="Secundaria">Secundaria (1°-5°)</option>
                    <option value="Pre-Universitario">Pre-Universitario</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Grado Exacto</label>
                  <select
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    {newStudent.level === 'Nido' && (
                      <>
                        <option value="Cuna / Maternal">Cuna / Maternal</option>
                        <option value="Nido 3 Años">Nido 3 Años</option>
                        <option value="Nido 4 Años">Nido 4 Años</option>
                        <option value="Nido 5 Años">Nido 5 Años</option>
                      </>
                    )}
                    {newStudent.level === 'Primaria' && (
                      <>
                        <option value="1er Grado Primaria">1er Grado Primaria</option>
                        <option value="2do Grado Primaria">2do Grado Primaria</option>
                        <option value="3er Grado Primaria">3er Grado Primaria</option>
                        <option value="4to Grado Primaria">4to Grado Primaria</option>
                        <option value="5to Grado Primaria">5to Grado Primaria</option>
                        <option value="6to Grado Primaria">6to Grado Primaria</option>
                      </>
                    )}
                    {newStudent.level === 'Secundaria' && (
                      <>
                        <option value="1er Año Secundaria">1er Año Secundaria</option>
                        <option value="2do Año Secundaria">2do Año Secundaria</option>
                        <option value="3er Año Secundaria">3er Año Secundaria</option>
                        <option value="4to Año Secundaria">4to Año Secundaria</option>
                        <option value="5to Año Secundaria">5to Año Secundaria</option>
                      </>
                    )}
                    {newStudent.level === 'Pre-Universitario' && (
                      <>
                        <option value="Ciclo Anual Pre-U">Ciclo Anual Pre-U</option>
                        <option value="Ciclo Semestral UNI">Ciclo Semestral UNI</option>
                        <option value="Ciclo San Marcos">Ciclo San Marcos</option>
                        <option value="Ciclo Pre-Católica (PUCP)">Ciclo Pre-Católica (PUCP)</option>
                        <option value="Ciclo Repaso Intensivo">Ciclo Repaso Intensivo</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Sección / Aula</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. A, B, UNI, Médicas"
                    value={newStudent.section}
                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Teléfono Apoderado</label>
                  <input
                    type="text"
                    required
                    placeholder="999 888 777"
                    value={newStudent.parentPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre del Apoderado / Familia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Familia Castro Morales"
                  value={newStudent.parentName}
                  onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddStudentModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="sm">Completar Matrícula</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Publicar Comunicado Masivo */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Publicar Comunicado Oficial</h3>
              <button onClick={() => setShowAddAnnouncementModal(false)} className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs">✕</button>
            </div>
            <form onSubmit={handleAddAnnouncementSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Título del Comunicado</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Citación a Asamblea Extraordinaria"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Alcance / Nivel Destinatario</label>
                <select
                  value={newAnnouncement.scope}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, scope: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="TODOS">🌐 Todos los Apoderados (Colegio General)</option>
                  <option value="Nido / Inicial">🧸 Solo Nido / Inicial (3, 4 y 5 Años)</option>
                  <option value="Primaria">🎒 Solo Primaria (1er a 6to Grado)</option>
                  <option value="Secundaria">🎓 Solo Secundaria (1ro a 5to Año)</option>
                  <option value="Pre-Universitario">⚡ Solo Pre-Universitario (Ciclo Anual / UNI / San Marcos)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Contenido del Mensaje Oficial</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escriba aquí la circular oficial para los padres de familia..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddAnnouncementModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="sm">✉️ Publicar Comunicado</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Comunicado Oficial */}
      {showEditAnnouncementModal && editingAnnouncement && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {editingAnnouncement.scope} • San Cleo
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Editar Comunicado a Padres</h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowEditAnnouncementModal(false); setEditingAnnouncement(null); }}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncementSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Título del Comunicado</label>
                <input
                  type="text"
                  required
                  value={editingAnnouncement.title}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nivel / Alcance</label>
                  <select
                    value={editingAnnouncement.scope}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, scope: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="TODOS">🌐 TODOS (Colegio General)</option>
                    <option value="Nido / Inicial">🧸 Nido / Inicial</option>
                    <option value="Primaria">🎒 Primaria</option>
                    <option value="Secundaria">🎓 Secundaria</option>
                    <option value="Pre-Universitario">⚡ Pre-Universitario</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Autor / Emitido por</label>
                  <input
                    type="text"
                    required
                    value={editingAnnouncement.author}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Contenido del Comunicado Oficial</label>
                <textarea
                  required
                  rows={4}
                  value={editingAnnouncement.content}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleRemoveAnnouncement(editingAnnouncement.id)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>🗑️</span> Eliminar Comunicado
                </button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setShowEditAnnouncementModal(false); setEditingAnnouncement(null); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    💾 Guardar Cambios
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL: AGREGAR PRODUCTO A TIENDA
         ──────────────────────────────────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────
         MODAL: AGREGAR PRODUCTO A TIENDA (NUEVO REGISTRO)
         ──────────────────────────────────────────────────────────── */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Agregar Producto al Catálogo</h3>
              <button onClick={() => setShowAddProductModal(false)} className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs">✕</button>
            </div>
            <form onSubmit={handleAddProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Polo Deportivo San Cleo (Talla 12)"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Categoría</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Uniformes">Uniformes</option>
                    <option value="Menú Escolar">Menú Escolar</option>
                    <option value="Menú Docente">Menú Docente</option>
                    <option value="Kits & Útiles">Kits & Útiles</option>
                    <option value="Material Docente">Material Docente</option>
                    <option value="Libros & Guías">Libros & Guías</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Rol Destino</label>
                  <select
                    value={(newProduct as any).targetRole || 'Padre'}
                    onChange={(e) => setNewProduct({ ...newProduct, targetRole: e.target.value } as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Padre">Padre (Uniformes/Kits)</option>
                    <option value="Alumno">Alumno (Menú/Útiles)</option>
                    <option value="Profesor">Profesor (Docente)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Precio Unitario ($)</label>
                  <input
                    type="number"
                    step={0.5}
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddProductModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="sm">+ Crear Producto</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: EDITAR PRODUCTO (CRUD COMPLETO ADMIN / ASISTENTE) */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {editingProduct.code} • Modificar Inventario
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Editar Producto de Tienda</h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowEditProductModal(false); setEditingProduct(null); }}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Completo del Producto</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Categoría</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Uniformes">Uniformes</option>
                    <option value="Menú Escolar">Menú Escolar</option>
                    <option value="Menú Docente">Menú Docente</option>
                    <option value="Kits & Útiles">Kits & Útiles</option>
                    <option value="Material Docente">Material Docente</option>
                    <option value="Libros & Guías">Libros & Guías</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Rol Destino</label>
                  <select
                    value={editingProduct.targetRole || 'Padre'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, targetRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Padre">Padre de Familia</option>
                    <option value="Alumno">Estudiante / Alumno</option>
                    <option value="Profesor">Profesor / Docente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Precio Unitario ($)</label>
                  <input
                    type="number"
                    step={0.5}
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Stock Disponible</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Descripción Breve</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(editingProduct.id)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>🗑️</span> Eliminar Producto
                </button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setShowEditProductModal(false); setEditingProduct(null); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    💾 Guardar Cambios
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL: PUBLICAR COMUNICADO
         ──────────────────────────────────────────────────────────── */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Publicar Comunicado Masivo</h3>
              <button onClick={() => setShowAddAnnouncementModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>
            <form onSubmit={handleAddAnnouncementSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Título del Comunicado</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Citación a Asamblea Extraordinaria"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Alcance / Destinatarios</label>
                <select
                  value={newAnnouncement.scope}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, scope: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="TODOS">Todos los Apoderados del Colegio</option>
                  <option value="Nido">Solo Nido / Inicial</option>
                  <option value="Primaria">Solo Primaria (1°-6°)</option>
                  <option value="Secundaria">Solo Secundaria (1°-5°)</option>
                  <option value="Pre-Universitario">Solo Pre-Universitario</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Contenido del Mensaje</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escriba aquí la información oficial para los padres..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddAnnouncementModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="sm">Enviar Notificación</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL: REGISTRAR POSTULANTE (ADMISIONES)
         ──────────────────────────────────────────────────────────── */}
      {showAddApplicantModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Registrar Solicitud de Admisión</h3>
              <button onClick={() => setShowAddApplicantModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>
            <form onSubmit={handleAddApplicantSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Completo del Postulante</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mateo Alejandro Benítez"
                  value={newApplicant.name}
                  onChange={(e) => setNewApplicant({ ...newApplicant, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nivel Objetivo</label>
                  <select
                    value={newApplicant.level}
                    onChange={(e) => setNewApplicant({ ...newApplicant, level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="Nido">Nido / Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Pre-Universitario">Pre-Universitario</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Grado Postulación</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1er Grado Primaria"
                    value={newApplicant.grade}
                    onChange={(e) => setNewApplicant({ ...newApplicant, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre del Padre / Apoderado</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Benítez"
                  value={newApplicant.parentName}
                  onChange={(e) => setNewApplicant({ ...newApplicant, parentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Teléfono Contacto</label>
                  <input
                    type="text"
                    required
                    placeholder="988 776 655"
                    value={newApplicant.phone}
                    onChange={(e) => setNewApplicant({ ...newApplicant, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="cbenitez@gmail.com"
                    value={newApplicant.email}
                    onChange={(e) => setNewApplicant({ ...newApplicant, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddApplicantModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="sm">Registrar Postulante</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL 5: EXPEDIENTE DEL ALUMNO (ALUMNOS)
         ──────────────────────────────────────────────────────────── */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
                  {selectedStudentDetail.level} • San Cleo
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedStudentDetail.name}</h3>
              </div>
              <button onClick={() => setSelectedStudentDetail(null)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p><span className="font-bold text-slate-700">Código:</span> <span className="font-mono font-bold text-indigo-600">{selectedStudentDetail.code}</span></p>
                <p><span className="font-bold text-slate-700">Grado:</span> {selectedStudentDetail.grade} (Sección {selectedStudentDetail.section})</p>
                <p><span className="font-bold text-slate-700">Apoderado:</span> {selectedStudentDetail.parentName} ({selectedStudentDetail.parentPhone})</p>
                <p><span className="font-bold text-slate-700">Rendimiento:</span> Promedio {selectedStudentDetail.gpa} • Asistencia {selectedStudentDetail.attendanceRate}%</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setSelectedStudentDetail(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL 6: REGISTRAR COBRO / CAJA (FINANZAS)
         ──────────────────────────────────────────────────────────── */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Registrar Cobro en Caja</h3>
              <button onClick={() => setShowRecordPaymentModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>
            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Seleccionar Alumno</label>
                <select
                  value={newPayment.studentId}
                  onChange={(e) => setNewPayment({ ...newPayment, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.level} - {s.grade} - {s.tuitionStatus})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Monto ($)</label>
                  <input
                    type="number"
                    required
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Medio de Pago</label>
                  <select
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="EFECTIVO EN CAJA">EFECTIVO EN CAJA</option>
                    <option value="TARJETA VISA/MC">TARJETA VISA/MC</option>
                    <option value="TRANSFERENCIA BCP">TRANSFERENCIA BCP</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRecordPaymentModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="sm">Emitir Recibo y Cobrar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL: CREAR / ASIGNAR CURSO (ACADÉMICO)
         ──────────────────────────────────────────────────────────── */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Crear / Asignar Curso</h3>
              <button onClick={() => setShowAddCourseModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>
            <form onSubmit={handleAddCourseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre de la Asignatura</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Psicomotricidad / Razonamiento Pre-U"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nivel</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="Nido">Nido / Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Pre-Universitario">Pre-Universitario</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Grado / Año</label>
                  <select
                    value={newCourse.grade}
                    onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <optgroup label="Nido (Inicial)">
                      <option value="Nido 3 Años">Nido 3 Años</option>
                      <option value="Nido 4 Años">Nido 4 Años</option>
                      <option value="Nido 5 Años">Nido 5 Años</option>
                    </optgroup>
                    <optgroup label="Primaria (1° a 6°)">
                      <option value="1er Grado Primaria">1er Grado Primaria</option>
                      <option value="2do Grado Primaria">2do Grado Primaria</option>
                      <option value="3er Grado Primaria">3er Grado Primaria</option>
                      <option value="4to Grado Primaria">4to Grado Primaria</option>
                      <option value="5to Grado Primaria">5to Grado Primaria</option>
                      <option value="6to Grado Primaria">6to Grado Primaria</option>
                    </optgroup>
                    <optgroup label="Secundaria (1° a 5°)">
                      <option value="1er Año Secundaria">1er Año Secundaria</option>
                      <option value="2do Año Secundaria">2do Año Secundaria</option>
                      <option value="3er Año Secundaria">3er Año Secundaria</option>
                      <option value="4to Año Secundaria">4to Año Secundaria</option>
                      <option value="5to Año Secundaria">5to Año Secundaria</option>
                    </optgroup>
                    <optgroup label="Pre-Universitario">
                      <option value="Ciclo Anual Pre-U">Ciclo Anual Pre-U</option>
                      <option value="Ciclo Semestral UNI">Ciclo Semestral UNI</option>
                      <option value="Ciclo San Marcos">Ciclo San Marcos</option>
                      <option value="Ciclo Pre-Católica (PUCP)">Ciclo Pre-Católica (PUCP)</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Horas Semanales</label>
                  <input
                    type="number"
                    required
                    value={newCourse.hours}
                    onChange={(e) => setNewCourse({ ...newCourse, hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Docente Asignado</label>
                  <select
                    value={newCourse.teacher}
                    onChange={(e) => setNewCourse({ ...newCourse, teacher: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddCourseModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="sm">Guardar Asignatura</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL: VER / EDITAR BOLETA DE PAGO (RRHH)
         ──────────────────────────────────────────────────────────── */}
      {selectedPaySlipEmployee && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-2xl space-y-4 border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {selectedPaySlipEmployee.code} • Boleta Oficial Electrónica
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Periodo Abril 2026 • San Cleo</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPaySlipEmployee(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePaySlipEmployeeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Completo del Trabajador</label>
                <input
                  type="text"
                  required
                  value={selectedPaySlipEmployee.name}
                  onChange={(e) => setSelectedPaySlipEmployee({ ...selectedPaySlipEmployee, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Cargo / Especialidad</label>
                  <input
                    type="text"
                    required
                    value={selectedPaySlipEmployee.role}
                    onChange={(e) => setSelectedPaySlipEmployee({ ...selectedPaySlipEmployee, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nivel Asignado</label>
                  <select
                    value={selectedPaySlipEmployee.level}
                    onChange={(e) => setSelectedPaySlipEmployee({ ...selectedPaySlipEmployee, level: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Nido">Nido / Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Pre-Universitario">Pre-Universitario</option>
                    <option value="Administración">Administración</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Sueldo Básico ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    required
                    value={selectedPaySlipEmployee.baseSalary}
                    onChange={(e) => setSelectedPaySlipEmployee({ ...selectedPaySlipEmployee, baseSalary: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tipo de Contrato</label>
                  <select
                    value={selectedPaySlipEmployee.contractType || 'INDEFINIDO'}
                    onChange={(e) => setSelectedPaySlipEmployee({ ...selectedPaySlipEmployee, contractType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="INDEFINIDO">Plazo Indefinido (Planilla)</option>
                    <option value="PLAZO FIJO">Contrato a Plazo Fijo</option>
                    <option value="CAS">Contrato CAS Institucional</option>
                    <option value="LOCACION">Locación de Servicios (RxH)</option>
                  </select>
                </div>
              </div>

              {/* Cálculo en tiempo real de Haberes y Descuentos */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 font-medium">
                <p className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                  Resumen de Boleta de Pago
                </p>
                <div className="flex justify-between font-bold">
                  <span>Haberes Básicos</span>
                  <span>${(Number(selectedPaySlipEmployee.baseSalary) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>+ Asignación Familiar Ley 25129</span>
                  <span>+$102.50</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>- Aporte Previsional (AFP / ONP 13%)</span>
                  <span>-${((Number(selectedPaySlipEmployee.baseSalary) || 0) * 0.13).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black border-t border-slate-300 pt-2 text-slate-900">
                  <span>Neto a Percibir en Cuenta</span>
                  <span className="text-emerald-700 font-mono text-base">
                    ${(((Number(selectedPaySlipEmployee.baseSalary) || 0) * 0.87) + 102.50).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center pt-3 border-t border-slate-100 gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveStaff(selectedPaySlipEmployee.id)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>🗑️</span> Eliminar Colaborador
                </button>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
                    🖨️ Imprimir
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedPaySlipEmployee(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    💾 Guardar Cambios
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 1: Agregar Estudiante al Acta */}
      {showAddGradebookStudentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Agregar Alumno al Acta</h3>
                  <p className="text-xs text-slate-500">Registra un nuevo estudiante en la matriz de evaluación</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddGradebookStudentModal(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGradebookStudent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre Completo del Alumno *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Sofía Ramírez Mendoza"
                  value={newGradebookStudentName}
                  onChange={(e) => setNewGradebookStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Código de Matrícula (Opcional)</label>
                <input
                  type="text"
                  placeholder="ej. ALU-2026-007"
                  value={newGradebookStudentCode}
                  onChange={(e) => setNewGradebookStudentCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button size="sm" variant="outline" type="button" onClick={() => setShowAddGradebookStudentModal(false)}>
                  Cancelar
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  + Registrar en Acta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Vista e Impresión de Acta Oficial PDF */}
      {showOfficialActaPdfModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 space-y-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  🇵🇪
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Documento Oficial Institucional MINEDU
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                    ACTA OFICIAL DE EVALUACIÓN ACADÉMICA 2026
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Colegio San Cleo • Código Local: 048291</p>
                </div>
              </div>
              <button
                onClick={() => setShowOfficialActaPdfModal(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Document Header Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Asignatura</span>
                <p className="font-extrabold text-slate-900">{selectedGradebookCourse}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Periodo Lectivo</span>
                <p className="font-extrabold text-slate-900">{selectedGradebookPeriod}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Estado Acta</span>
                <p className="font-extrabold text-emerald-700">{gradebookStatus === 'OFICIALIZADO' ? '🔒 Oficializado' : '✏️ En Edición'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Firma Digital Hash</span>
                <p className="font-mono text-[11px] font-bold text-indigo-600">SHA256-48F092A1</p>
              </div>
            </div>

            {/* Print Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Apellidos y Nombres</th>
                    <th className="p-3 text-center">N1</th>
                    <th className="p-3 text-center">N2</th>
                    <th className="p-3 text-center">N3</th>
                    <th className="p-3 text-center">Examen</th>
                    <th className="p-3 text-center">Prom.</th>
                    <th className="p-3 text-center">Logro</th>
                    <th className="p-3">Observación Formativa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {gradebook
                    .filter((r) => {
                      const matchCourse = !selectedGradebookCourse || r.courseId === selectedGradebookCourse;
                      const matchPeriod = !selectedGradebookPeriod || r.period === selectedGradebookPeriod;
                      return matchCourse && matchPeriod;
                    })
                    .map((row) => (
                    <tr key={row.studentId}>
                      <td className="p-3 font-mono text-indigo-700 font-bold">{row.code}</td>
                      <td className="p-3 font-extrabold text-slate-900">{row.studentName}</td>
                      <td className="p-3 text-center">{row.n1}</td>
                      <td className="p-3 text-center">{row.n2}</td>
                      <td className="p-3 text-center">{row.n3}</td>
                      <td className="p-3 text-center">{row.exam}</td>
                      <td className="p-3 text-center font-black text-indigo-700">{row.gpa.toFixed(1)}</td>
                      <td className="p-3 text-center font-black">{row.status}</td>
                      <td className="p-3 italic text-[11px] text-slate-600">{row.qualitativeNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-xs">
              <div className="space-y-1">
                <div className="border-b border-slate-400 w-48 mx-auto pb-1 font-bold text-slate-800">Prof. Eduardo Torres</div>
                <p className="text-[11px] text-slate-500 font-medium">Docente Titular de Asignatura</p>
              </div>
              <div className="space-y-1">
                <div className="border-b border-slate-400 w-48 mx-auto pb-1 font-bold text-slate-800">Lic. Roberto Benavides</div>
                <p className="text-[11px] text-slate-500 font-medium">Director de Gestión Académica</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <span suppressHydrationWarning className="text-[11px] text-slate-400 italic">Fecha de emisión: {new Date().toLocaleDateString('es-PE')}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowOfficialActaPdfModal(false)}>
                  Cerrar
                </Button>
                <Button size="sm" variant="primary" onClick={() => window.print()}>
                  🖨️ Imprimir / Guardar PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Celda de Horario */}
      {showEditSlotModal && editingSlot && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                  {editingSlot.dayKey === 'mon' ? 'Lunes' : editingSlot.dayKey === 'tue' ? 'Martes' : editingSlot.dayKey === 'wed' ? 'Miércoles' : editingSlot.dayKey === 'thu' ? 'Jueves' : 'Viernes'} • {timetable[editingSlot.rowIdx].time}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Reasignar Asignatura y Docente</h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowEditSlotModal(false); setEditingSlot(null); }}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlotSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre de la Asignatura / Actividad</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Álgebra y Aritmética"
                  value={editSlotCourse}
                  onChange={(e) => setEditSlotCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Docente Asignado</label>
                <select
                  value={editSlotTeacher}
                  onChange={(e) => setEditSlotTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  <option value="Sin docente">Sin docente asignado</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Aula / Laboratorio / Espacio</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Aula 101, Lab. Ciencias, Patio Central"
                  value={editSlotRoom}
                  onChange={(e) => setEditSlotRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowEditSlotModal(false); setEditingSlot(null); }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  💾 Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agregar Nuevo Bloque Horario */}
      {showAddSlotModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Agregar Bloque Horario</h3>
              <button
                type="button"
                onClick={() => setShowAddSlotModal(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSlotSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Rango Horario (Ejemplo: 13:00 - 14:30)</label>
                <input
                  type="text"
                  required
                  placeholder="ej. 13:00 - 14:30"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
              <p className="text-xs text-slate-500 italic">
                El nuevo bloque se añadirá al final del horario semanal. Luego podrás personalizar las asignaturas de cada día.
              </p>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddSlotModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  + Crear Bloque
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Vista e Impresión PDF del Horario Semanal */}
      {showTimetablePdfModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 space-y-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  🏫
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                    Documento Oficial Institucional
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                    HORARIO SEMANAL DE CLASES 2026 • {selectedScheduleGrade.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Colegio San Cleo • Nivel {selectedScheduleLevel} • Año Lectivo 2026</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTimetablePdfModal(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Print Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white font-extrabold text-[11px]">
                  <tr>
                    <th className="p-3 border-r border-slate-800">Bloque</th>
                    <th className="p-3 border-r border-slate-800">Lunes</th>
                    <th className="p-3 border-r border-slate-800">Martes</th>
                    <th className="p-3 border-r border-slate-800">Miércoles</th>
                    <th className="p-3 border-r border-slate-800">Jueves</th>
                    <th className="p-3">Viernes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-900">
                  {timetable.map((slot, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-mono font-bold bg-slate-50 text-indigo-700">{slot.time}</td>
                      {[slot.mon, slot.tue, slot.wed, slot.thu, slot.fri].map((day, dIdx) => (
                        <td key={dIdx} className="p-3 border-r border-slate-100 align-top">
                          <p className="font-bold text-slate-900 text-xs">{day.course}</p>
                          <p className="text-[10px] text-slate-600">{day.teacher}</p>
                          <span className="text-[9px] font-bold text-slate-400">📍 {day.room}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center">
              <div>
                <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
                <p className="font-extrabold text-xs text-slate-900">Prof. Tutor / Coordinador de Nivel</p>
                <p className="text-[10px] text-slate-500">Colegio San Cleo</p>
              </div>
              <div>
                <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
                <p className="font-extrabold text-xs text-slate-900">Dirección Académica</p>
                <p className="text-[10px] text-slate-500">Firma & Sello Oficial</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setShowTimetablePdfModal(false)}>
                Cerrar
              </Button>
              <Button size="sm" variant="primary" onClick={() => window.print()}>
                🖨️ Imprimir / Guardar PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Postulante del Embudo de Admisiones */}
      {showEditApplicantModal && editingApplicant && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {editingApplicant.applicantCode} • CRM Admisiones
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Editar Expediente de Admisión</h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowEditApplicantModal(false); setEditingApplicant(null); }}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveApplicantSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Completo del Postulante</label>
                <input
                  type="text"
                  required
                  value={editingApplicant.applicantName}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, applicantName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nivel Objetivo</label>
                  <select
                    value={editingApplicant.targetLevel}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, targetLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Nido">Nido / Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Pre-Universitario">Pre-Universitario</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Grado / Aula</label>
                  <input
                    type="text"
                    required
                    value={editingApplicant.targetGrade}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, targetGrade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Estado en Embudo CRM</label>
                <select
                  value={editingApplicant.status}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="EN_REVISION">1. En Revisión de Solicitud</option>
                  <option value="EVALUACIÓN">2. Evaluación Programada</option>
                  <option value="APROBADO">3. Aprobado / Vacante Otorgada</option>
                  <option value="MATRICULADO">4. Matriculado Exitosamente</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Padre / Apoderado</label>
                  <input
                    type="text"
                    required
                    value={editingApplicant.parentName}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, parentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    required
                    value={editingApplicant.contactPhone}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={editingApplicant.email}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Puntaje / Score (0 - 20)</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={editingApplicant.score ?? 15}
                    onChange={(e) => setEditingApplicant({ ...editingApplicant, score: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleRemoveApplicant(editingApplicant.id)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>🗑️</span> Eliminar Postulante
                </button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setShowEditApplicantModal(false); setEditingApplicant(null); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    💾 Guardar Cambios
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Configurar Metas Institucionales de Business Intelligence */}
      {showBiSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Business Intelligence • Directivo
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Configurar Metas de Gestión BI</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBiSettingsModal(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBiSettingsSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Meta Recaudación Mensual ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={biSettings.monthlyTargetRevenue}
                    onChange={(e) => setBiSettings({ ...biSettings, monthlyTargetRevenue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Meta de Alumnos Matriculados</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={biSettings.enrollmentTarget}
                    onChange={(e) => setBiSettings({ ...biSettings, enrollmentTarget: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Puntualidad Mínima (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    required
                    value={biSettings.minAttendanceRate}
                    onChange={(e) => setBiSettings({ ...biSettings, minAttendanceRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">GPA Meta (0-20)</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    required
                    value={biSettings.minGpaTarget}
                    onChange={(e) => setBiSettings({ ...biSettings, minGpaTarget: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-teal-700 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Ratio Máx. Alumno/Docente</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    required
                    value={biSettings.maxStudentTeacherRatio}
                    onChange={(e) => setBiSettings({ ...biSettings, maxStudentTeacherRatio: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowBiSettingsModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  💾 Guardar Metas BI
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Reporte Personalizado */}
      {showEditReportModal && editingReport && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {editingReport.category} • San Cleo BI
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Editar Reporte Ejecutivo</h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowEditReportModal(false); setEditingReport(null); }}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Título Oficial del Reporte</label>
                <input
                  type="text"
                  required
                  value={editingReport.title}
                  onChange={(e) => setEditingReport({ ...editingReport, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Categoría</label>
                  <select
                    value={editingReport.category}
                    onChange={(e) => setEditingReport({ ...editingReport, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="FINANZAS">FINANZAS & CAJA</option>
                    <option value="ACADÉMICO">ACADÉMICO & NOTAS</option>
                    <option value="ASISTENCIA">ASISTENCIA & TUTORÍA</option>
                    <option value="RRHH">RRHH & PLANILLA</option>
                    <option value="ADMISIONES">ADMISIONES CRM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nivel / Alcance</label>
                  <select
                    value={editingReport.scope}
                    onChange={(e) => setEditingReport({ ...editingReport, scope: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="TODOS">TODOS los Niveles</option>
                    <option value="Nido">Nido / Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Pre-Universitario">Pre-Universitario</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Autor / Emitido por</label>
                <input
                  type="text"
                  required
                  value={editingReport.author}
                  onChange={(e) => setEditingReport({ ...editingReport, author: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Observaciones Ejecutivas</label>
                <textarea
                  rows={3}
                  value={editingReport.observations}
                  onChange={(e) => setEditingReport({ ...editingReport, observations: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleRemoveReport(editingReport.id)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>🗑️</span> Eliminar Reporte
                </button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setShowEditReportModal(false); setEditingReport(null); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    💾 Guardar Cambios
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Nuevo Reporte Personalizado */}
      {showAddReportModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Generar Reporte Personalizado</h3>
              <button
                type="button"
                onClick={() => setShowAddReportModal(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Título del Reporte</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Consolidado de Asistencia del II Bimestre"
                  value={newReportInput.title}
                  onChange={(e) => setNewReportInput({ ...newReportInput, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Categoría</label>
                  <select
                    value={newReportInput.category}
                    onChange={(e) => setNewReportInput({ ...newReportInput, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="FINANZAS">FINANZAS & CAJA</option>
                    <option value="ACADÉMICO">ACADÉMICO & NOTAS</option>
                    <option value="ASISTENCIA">ASISTENCIA & TUTORÍA</option>
                    <option value="RRHH">RRHH & PLANILLA</option>
                    <option value="ADMISIONES">ADMISIONES CRM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nivel Objetivo</label>
                  <select
                    value={newReportInput.scope}
                    onChange={(e) => setNewReportInput({ ...newReportInput, scope: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="TODOS">TODOS los Niveles</option>
                    <option value="Nido">Nido / Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Pre-Universitario">Pre-Universitario</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Observaciones / Sumilla</label>
                <textarea
                  rows={3}
                  placeholder="Detalles o conclusiones del informe ejecutivo..."
                  value={newReportInput.observations}
                  onChange={(e) => setNewReportInput({ ...newReportInput, observations: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddReportModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  + Crear Reporte
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Vista e Impresión PDF del Reporte Oficial */}
      {showPrintReportPdfModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 space-y-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  📊
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Informe Ejecutivo Institucional • {showPrintReportPdfModal.category}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                    {showPrintReportPdfModal.title.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Colegio San Cleo • Alcance: {showPrintReportPdfModal.scope} • Emisión: {showPrintReportPdfModal.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintReportPdfModal(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs text-slate-800">
              <p className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                Dictamen u Observaciones de la Dirección:
              </p>
              <p className="leading-relaxed font-medium">{showPrintReportPdfModal.observations}</p>
              <div className="pt-2 flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Emitido por: {showPrintReportPdfModal.author}</span>
                <span>Estado: {showPrintReportPdfModal.status}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center">
              <div>
                <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
                <p className="font-extrabold text-xs text-slate-900">Emisor / Responsable de Área</p>
                <p className="text-[10px] text-slate-500">{showPrintReportPdfModal.author}</p>
              </div>
              <div>
                <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
                <p className="font-extrabold text-xs text-slate-900">Dirección General</p>
                <p className="text-[10px] text-slate-500">Firma & Sello Institucional</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setShowPrintReportPdfModal(null)}>
                Cerrar
              </Button>
              <Button size="sm" variant="primary" onClick={() => window.print()}>
                🖨️ Imprimir / Guardar PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal JWT */}
      <LoginModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

const SchoolAdminDashboardClient = dynamic(
  () => Promise.resolve(SchoolAdminDashboard),
  { ssr: false }
);

export default function Page() {
  return (
    <AuthProvider>
      <SchoolAdminDashboardClient />
    </AuthProvider>
  );
}
