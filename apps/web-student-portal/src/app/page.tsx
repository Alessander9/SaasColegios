'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@cole/ui-components';
import { useAuth, AuthProvider } from '../lib/auth-context';

/* ────────────────────────────────────────────────────────────
   TOAST SYSTEM (same pattern as parent portal)
   ──────────────────────────────────────────────────────────── */
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  icon: string;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '380px' }}>
      {toasts.map((toast) => {
        const colors = {
          success: 'bg-emerald-50 border-emerald-300 text-emerald-900',
          error: 'bg-red-50 border-red-300 text-red-900',
          info: 'bg-blue-50 border-blue-300 text-blue-900',
          warning: 'bg-amber-50 border-amber-300 text-amber-900',
        };
        const barColors = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-blue-500', warning: 'bg-amber-500' };
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-xl shadow-black/10 backdrop-blur-xl ${colors[toast.type]}`}
            style={{ animation: 'slideInRight 0.25s ease-out' }}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{toast.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-snug">{toast.message}</p>
              <div className={`mt-2 h-1 rounded-full ${barColors[toast.type]} opacity-40`} style={{ width: '100%' }} />
            </div>
            <button onClick={() => onRemove(toast.id)} className="text-current opacity-50 hover:opacity-100 transition-opacity text-xs font-bold mt-0.5 flex-shrink-0">✕</button>
          </div>
        );
      })}
    </div>
  );
}



/* ────────────────────────────────────────────────────────────
   TYPES & MOCK DATA
   ──────────────────────────────────────────────────────────── */
interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  course: string;
  classroom: string;
  teacher: string;
  area: string;
  color: string;
  isNext?: boolean;
}

interface CourseGrade {
  id: string;
  courseName: string;
  area: string;
  teacher: string;
  b1Score: number;
  level: 'AD' | 'A' | 'B' | 'C';
  evaluations: Array<{ name: string; score: number; date: string }>;
  teacherFeedback: string;
}

interface TaskItem {
  id: string;
  title: string;
  course: string;
  teacher: string;
  dueDate: string;
  status: 'PENDIENTE' | 'ENTREGADO' | 'CALIFICADO';
  score?: number;
  instructions: string;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  type?: string;
}

interface WorkshopItem {
  id: string;
  title: string;
  schedule: string;
  instructor: string;
  category: string;
  enrolled: boolean;
  vacancies: number;
  image: string;
  description: string;
}

interface StudentBadge {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress: string;
  dateUnlocked?: string;
  xp: number;
}

const getFutureDateString = (daysAhead: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getTodayDateString = (): string => getFutureDateString(0);

const INITIAL_SCHEDULE: ScheduleItem[] = [
  { id: 'sch-1', day: 'Lunes', time: '08:00 - 09:30', course: 'Álgebra y Aritmética', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Elena Torres', area: 'Matemática', color: 'border-l-indigo-500 bg-indigo-50/40 text-indigo-900', isNext: true },
  { id: 'sch-2', day: 'Lunes', time: '09:45 - 11:15', course: 'Comprensión Lectora y Gramática', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Miguel Ángel Vega', area: 'Comunicación', color: 'border-l-blue-500 bg-blue-50/40 text-blue-900' },
  { id: 'sch-3', day: 'Lunes', time: '11:45 - 13:15', course: 'Educación Física y Deportes', classroom: 'Cancha Polideportiva', teacher: 'Prof. Rodrigo Salazar', area: 'Desarrollo', color: 'border-l-emerald-500 bg-emerald-50/40 text-emerald-900' },
  { id: 'sch-4', day: 'Martes', time: '08:00 - 09:30', course: 'Ciencia y Tecnología', classroom: 'Laboratorio de Ciencias 1', teacher: 'Prof. Carmen Quispe', area: 'Ciencias', color: 'border-l-emerald-500 bg-emerald-50/40 text-emerald-900' },
  { id: 'sch-5', day: 'Martes', time: '09:45 - 11:15', course: 'Personal Social e Historia', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Sandra Rojas', area: 'Sociales', color: 'border-l-amber-500 bg-amber-50/40 text-amber-900' },
  { id: 'sch-6', day: 'Miércoles', time: '08:00 - 09:30', course: 'Álgebra y Aritmética', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Elena Torres', area: 'Matemática', color: 'border-l-indigo-500 bg-indigo-50/40 text-indigo-900' },
  { id: 'sch-7', day: 'Miércoles', time: '09:45 - 11:15', course: 'Inglés Comunicativo', classroom: 'Aula de Idiomas', teacher: 'Miss Laura Benites', area: 'Idiomas', color: 'border-l-violet-500 bg-violet-50/40 text-violet-900' },
  { id: 'sch-8', day: 'Jueves', time: '08:00 - 09:30', course: 'Comprensión Lectora y Gramática', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Miguel Ángel Vega', area: 'Comunicación', color: 'border-l-blue-500 bg-blue-50/40 text-blue-900' },
  { id: 'sch-9', day: 'Jueves', time: '09:45 - 11:15', course: 'Ciencia y Tecnología', classroom: 'Laboratorio de Ciencias 1', teacher: 'Prof. Carmen Quispe', area: 'Ciencias', color: 'border-l-emerald-500 bg-emerald-50/40 text-emerald-900' },
  { id: 'sch-10', day: 'Viernes', time: '08:00 - 09:30', course: 'Arte y Expresión Musical', classroom: 'Taller de Arte', teacher: 'Prof. Andrés Morales', area: 'Arte', color: 'border-l-pink-500 bg-pink-50/40 text-pink-900' },
  { id: 'sch-11', day: 'Viernes', time: '09:45 - 11:15', course: 'Tutoría y Convivencia Escolar', classroom: 'Aula 101 (Primaria)', teacher: 'Prof. Elena Torres', area: 'Tutoría', color: 'border-l-cyan-500 bg-cyan-50/40 text-cyan-900' },
];

const INITIAL_GRADES: CourseGrade[] = [
  {
    id: 'g-1',
    courseName: 'Álgebra y Aritmética',
    area: 'Matemática',
    teacher: 'Prof. Elena Torres',
    b1Score: 19,
    level: 'AD',
    evaluations: [
      { name: 'Examen Mensual de Álgebra y Ecuaciones Lineales', score: 18, date: getFutureDateString(1) },
      { name: 'Práctica Calificada 1', score: 20, date: '2026-03-25' },
      { name: 'Examen Mensual', score: 18, date: '2026-04-08' },
      { name: 'Resolución de Problemas y Tareas', score: 19, date: '2026-04-15' },
    ],
    teacherFeedback: 'Excelente capacidad lógica, resuelve problemas complejos con gran autonomía.',
  },
  {
    id: 'g-2',
    courseName: 'Comprensión Lectora y Gramática',
    area: 'Comunicación',
    teacher: 'Prof. Miguel Ángel Vega',
    b1Score: 18,
    level: 'AD',
    evaluations: [
      { name: 'Control de Lectura: El Principito', score: 18, date: '2026-03-28' },
      { name: 'Redacción y Ortografía', score: 19, date: '2026-04-10' },
      { name: 'Exposición Oral', score: 17, date: '2026-04-17' },
    ],
    teacherFeedback: 'Gran vocabulario y fluidez lectora. Muestra mucho entusiasmo en clase.',
  },
  {
    id: 'g-3',
    courseName: 'Ciencia y Tecnología',
    area: 'Ciencias',
    teacher: 'Prof. Carmen Quispe',
    b1Score: 18,
    level: 'AD',
    evaluations: [
      { name: 'Informe de Laboratorio: La Célula', score: 19, date: '2026-04-02' },
      { name: 'Evaluación de Contenidos', score: 17, date: '2026-04-14' },
      { name: 'Feria de Ciencias: Maqueta', score: 19, date: '2026-04-19' },
    ],
    teacherFeedback: 'Muy participativo en los experimentos prácticos de laboratorio.',
  },
  {
    id: 'g-4',
    courseName: 'Educación Física y Deportes',
    area: 'Desarrollo Personal',
    teacher: 'Prof. Rodrigo Salazar',
    b1Score: 20,
    level: 'AD',
    evaluations: [
      { name: 'Acondicionamiento Físico', score: 20, date: '2026-04-05' },
      { name: 'Trabajo en Equipo y Coordinación', score: 20, date: '2026-04-16' },
    ],
    teacherFeedback: 'Destacada coordinación motriz y excelente compañerismo deportivo.',
  },
  {
    id: 'g-5',
    courseName: 'Arte y Música',
    area: 'Arte y Cultura',
    teacher: 'Prof. Andrés Morales',
    b1Score: 18,
    level: 'AD',
    evaluations: [
      { name: 'Proyecto de Dibujo y Color', score: 18, date: '2026-04-06' },
      { name: 'Ejecución de Flauta Dulce', score: 18, date: '2026-04-18' },
    ],
    teacherFeedback: 'Muy creativo y con afinación rítmica precisa.',
  },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'exam-tomorrow',
    title: 'Examen Mensual de Álgebra y Ecuaciones Lineales',
    course: 'Álgebra y Aritmética',
    teacher: 'Prof. Elena Torres',
    dueDate: getFutureDateString(1),
    status: 'PENDIENTE',
    priority: 'ALTA',
    instructions: 'Examen programado en horario de clases (Aula 101). Traer regla, lápiz 2B y borrador. Temas: Operaciones combinadas y ecuaciones de primer grado.',
    type: 'EXAM',
  },
  {
    id: 'tsk-1',
    title: 'Guía N° 4: Sumas y Restas Combinadas',
    course: 'Álgebra y Aritmética',
    teacher: 'Prof. Elena Torres',
    dueDate: getFutureDateString(3),
    status: 'PENDIENTE',
    priority: 'ALTA',
    instructions: 'Resolver los ejercicios del libro de la página 34 a la 36 en el cuaderno y subir foto clara.',
    type: 'TAREA',
  },
  {
    id: 'tsk-2',
    title: 'Resumen de Lectura: El Zorro y la Cigüeña',
    course: 'Comprensión Lectora y Gramática',
    teacher: 'Prof. Miguel Ángel Vega',
    dueDate: getFutureDateString(5),
    status: 'PENDIENTE',
    priority: 'MEDIA',
    instructions: 'Escribir la moraleja del cuento y hacer un dibujo representativo en una carilla.',
    type: 'TAREA',
  },
  {
    id: 'tsk-3',
    title: 'Informe del Experimento de Fotosíntesis',
    course: 'Ciencia y Tecnología',
    teacher: 'Prof. Carmen Quispe',
    dueDate: getFutureDateString(-5),
    status: 'CALIFICADO',
    priority: 'BAJA',
    score: 19,
    instructions: 'Fotografiar la planta del experimento y anotar las observaciones en la ficha.',
    type: 'PROYECTO',
  },
];

const INITIAL_WORKSHOPS: WorkshopItem[] = [
  { id: 'ws-1', title: 'Taller de Robótica & Programación Lego', schedule: 'Miércoles y Viernes 15:30 - 17:00', instructor: 'Ing. Roberto Salas', category: 'Tecnología', enrolled: true, vacancies: 4, image: '🤖', description: 'Aprende programación básica con bloques Lego Mindstorms y Arduino. Los alumnos construyen robots que ejecutan órdenes programadas. Cupo máximo: 20 alumnos. Incluye kit de materiales.' },
  { id: 'ws-2', title: 'Fútbol Menores San Cleo', schedule: 'Martes y Jueves 15:30 - 17:00', instructor: 'Prof. Raúl Huamán', category: 'Deportes', enrolled: false, vacancies: 8, image: '⚽', description: 'Entrenamiento de técnica individual y juego colectivo. Se prepara al equipo para el torneo interescolar de Lima Norte. Uniforme deportivo institucional obligatorio.' },
  { id: 'ws-3', title: 'Taller de Pintura y Acuarela Creativa', schedule: 'Sábados 09:00 - 11:00', instructor: 'Prof. Sandra Rojas', category: 'Arte', enrolled: false, vacancies: 6, image: '🎨', description: 'Técnicas de pintura, mezcla de colores, composición y perspectiva básica. Cada alumno desarrolla un portafolio artístico bimestral. Materiales incluidos.' },
  { id: 'ws-4', title: 'Club de Ajedrez y Estrategia Escolar', schedule: 'Lunes 15:30 - 17:00', instructor: 'Prof. Carlos Mendoza', category: 'Estrategia', enrolled: false, vacancies: 10, image: '♟️', description: 'Domina la teoría de aperturas, tácticas y estrategia de final de partida. Participamos en el torneo nacional escolar de ajedrez. Tablero y piezas provistos.' },
];

const INITIAL_BADGES: StudentBadge[] = [
  { id: 'b-1', title: 'Asistencia Impecable', category: 'Puntualidad', icon: '🏆', description: '100% de asistencia durante el I Bimestre.', unlocked: true, progress: '42/42 días', dateUnlocked: '18 Abr 2026', xp: 150 },
  { id: 'b-2', title: 'Capitán de Matemáticas', category: 'Académico', icon: '🌟', description: 'Nivel AD sostenido en resolución de problemas.', unlocked: true, progress: '100%', dateUnlocked: '15 Abr 2026', xp: 200 },
  { id: 'b-3', title: 'Entregas a Tiempo', category: 'Responsabilidad', icon: '⚡', description: 'Todas las tareas escolares entregadas sin retraso.', unlocked: true, progress: '10/10 tareas', dateUnlocked: '12 Abr 2026', xp: 100 },
  { id: 'b-4', title: 'Lector Estrella', category: 'Comunicación', icon: '📚', description: 'Completar 5 lecturas sugeridas del plan lector.', unlocked: false, progress: '4/5 libros', xp: 120 },
  { id: 'b-5', title: 'Científico Curioso', category: 'Ciencia', icon: '🔬', description: 'Participar activamente en experimentos de laboratorio.', unlocked: false, progress: '2/3 proyectos', xp: 150 },
];

interface JustificationItem {
  id: string;
  date: string;
  submissionDate: string;
  reason: string;
  detail: string;
  imageUrl?: string;
  imageName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const INITIAL_JUSTIFICATIONS: JustificationItem[] = [
  {
    id: 'just-1',
    date: '2026-04-10',
    submissionDate: '10/04/2026 08:30 AM',
    reason: 'Cita Médica Pediátrica',
    detail: 'Consulta oftalmológica y chequeo anual pediátrico.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
    imageName: 'certificado_oftalmologico.jpg',
    status: 'APPROVED',
  },
];

interface StudentStoreProduct {
  id: string;
  code: string;
  name: string;
  category: 'MENU' | 'CAFETERIA' | 'SNACKS' | 'UTILES';
  price: number;
  icon: string;
  description: string;
  badge?: string;
  stock: number;
  options?: {
    entrees?: string[];
    mains?: string[];
    drinks?: string[];
    desserts?: string[];
  };
}

interface CartItem {
  product: StudentStoreProduct;
  quantity: number;
  selectedOptions?: {
    entree?: string;
    main?: string;
    drink?: string;
    dessert?: string;
    notes?: string;
  };
}

interface StudentOrder {
  id: string;
  code: string;
  date: string;
  time: string;
  items: { name: string; quantity: number; price: number; details?: string }[];
  total: number;
  paymentMethod: 'FAMILY_ACCOUNT' | 'YAPE_PLIN' | 'CARD' | 'COUNTER';
  status: 'PREPARING' | 'READY_PICKUP' | 'DELIVERED';
  pickupLocation: string;
}

const INITIAL_STUDENT_STORE_PRODUCTS: StudentStoreProduct[] = [
  {
    id: 'prod-menu-1',
    code: 'ALM-001',
    name: 'Menú Escolar Nutritivo Completo',
    category: 'MENU',
    price: 15.0,
    icon: '🍽️',
    description: 'Entrada fresca, plato de fondo balanceado para estudiantes, refresco natural y postre de frutas.',
    badge: 'Recomendado del Día',
    stock: 60,
    options: {
      entrees: ['Sopita de Letras y Verduras', 'Causa Rellena de Pollo', 'Ensaladita Rusa'],
      mains: ['Milanesa de Pollo con Puré y Arroz', 'Lomo Saltado con Arrocito', 'Tallarines Rojos con Pollo', 'Pescado a la Plancha'],
      drinks: ['Chicha Morada Casera (500ml)', 'Limonada Natural', 'Jugo de Maracuyá'],
      desserts: ['Mazamorra Morada', 'Arroz con Leche Casero', 'Fruta Fresca Picada'],
    },
  },
  {
    id: 'prod-menu-2',
    code: 'ALM-002',
    name: 'Almuerzo Saludable & Fitness Bowl Escolar',
    category: 'MENU',
    price: 16.5,
    icon: '🥗',
    description: 'Bowl proteico con quinua tricolor, pechuga de pollo deshilachada, palta fresca, choclo y vinagreta suave.',
    badge: 'Alto en Proteína',
    stock: 35,
    options: {
      mains: ['Bowl de Pollo y Quinua Real', 'Bowl con Huevo Cocido y Vegetales', 'Bowl Vegetariano con Quesito Fresco'],
      drinks: ['Agua de Manzana sin Azúcar', 'Emoliente Frío Refrescante', 'Agua Mineral'],
      desserts: ['Yogurt Natural con Granola', 'Manzana Horneada con Canela'],
    },
  },
  {
    id: 'prod-snack-1',
    code: 'SNK-001',
    name: 'Triple Escolar de Palta, Huevo y Tomate',
    category: 'SNACKS',
    price: 5.5,
    icon: '🥪',
    description: 'Pan de molde suave con palta fresca hass, huevo duro y tomate en rodajas.',
    badge: 'Favorito del Recreo',
    stock: 45,
  },
  {
    id: 'prod-snack-2',
    code: 'SNK-002',
    name: 'Croissant Caliente de Jamón Inglés y Queso',
    category: 'SNACKS',
    price: 6.5,
    icon: '🥐',
    description: 'Masa hojaldrada horneada con queso Edam derretido y jamón seleccionado.',
    stock: 30,
  },
  {
    id: 'prod-snack-3',
    code: 'SNK-003',
    name: 'Empanada de Pollo Criollo al Horno',
    category: 'SNACKS',
    price: 5.5,
    icon: '🥟',
    description: 'Empanada horneada rellena de pechuga de pollo, cebollita y huevo.',
    stock: 40,
  },
  {
    id: 'prod-cafe-1',
    code: 'CAF-001',
    name: 'Jugo de Naranja 100% Recién Exprimido',
    category: 'CAFETERIA',
    price: 6.0,
    icon: '🍊',
    description: 'Vaso de 450ml con fruta fresca seleccionada, sin preservantes ni colorantes.',
    badge: '100% Natural',
    stock: 50,
  },
  {
    id: 'prod-cafe-2',
    code: 'CAF-002',
    name: 'Yogurt Frutado con Cereal y Miel',
    category: 'CAFETERIA',
    price: 5.0,
    icon: '🥣',
    description: 'Vaso de yogurt artesanal con arándanos, hojuelas de maíz y miel de abeja.',
    stock: 40,
  },
  {
    id: 'prod-cafe-3',
    code: 'CAF-003',
    name: 'Chicha Morada Tradicional San Cleo (500ml)',
    category: 'CAFETERIA',
    price: 4.5,
    icon: '🥤',
    description: 'Elaborada con maíz morado, piña, manzana y canela aromática.',
    stock: 80,
  },
  {
    id: 'prod-util-1',
    code: 'UTL-001',
    name: 'Polo Oficial de Ed. Física (Talla 10-14)',
    category: 'UTILES',
    price: 45.0,
    icon: '👕',
    description: 'Polo deportivo institucional 100% algodón transpirable con logo bordado San Cleo.',
    badge: 'Uniforme Oficial',
    stock: 35,
  },
  {
    id: 'prod-util-2',
    code: 'UTL-002',
    name: 'Pack Cuadernos Institucionales A4 (x5 unid)',
    category: 'UTILES',
    price: 35.0,
    icon: '📚',
    description: 'Set de 5 cuadernos A4 cuadriculados y rayados con carátula institucional y stickers de materia.',
    stock: 100,
  },
  {
    id: 'prod-util-3',
    code: 'UTL-003',
    name: 'Agenda Escolar 2026 Personalizada',
    category: 'UTILES',
    price: 28.0,
    icon: '📓',
    description: 'Agenda oficial con calendario de bimestres, horario de clases y registro de tareas.',
    stock: 50,
  },
];

interface NoticeComment {
  id: string;
  author: string;
  avatar: string;
  role: string;
  text: string;
  time: string;
}

interface NoticeItem {
  id: string;
  title: string;
  date: string;
  time: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  course?: string;
  text: string;
  content?: string;
  target?: 'ALL' | 'STUDENTS' | 'PARENTS';
  tag: 'Materiales' | 'Urgente' | 'Evaluaciones' | 'Celebración' | 'Deportes' | 'Tutoría' | 'Dirección' | 'General';
  priority: 'normal' | 'alta' | 'urgente';
  read: boolean;
  acknowledged: boolean;
  liked: boolean;
  likesCount: number;
  attachment?: {
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'image' | 'link';
  };
  comments: NoticeComment[];
}

function getSharedNoticesFromCookie(): any[] {
  if (typeof document === 'undefined') return [];
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)cole_shared_notices=([^;]*)'));
    if (match && match[2]) {
      const decoded = decodeURIComponent(match[2]);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveSharedNoticesToCookie(noticesList: any[]) {
  if (typeof document === 'undefined') return;
  try {
    const serialized = encodeURIComponent(JSON.stringify(noticesList.slice(0, 30)));
    document.cookie = `cole_shared_notices=${serialized}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {}
}

function getSharedTasksFromCookie(): any[] {
  if (typeof document === 'undefined') return [];
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)cole_shared_tasks=([^;]*)'));
    if (match && match[2]) {
      const decoded = decodeURIComponent(match[2]);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveSharedTasksToCookie(tasksList: any[]) {
  if (typeof document === 'undefined') return;
  try {
    const serialized = encodeURIComponent(JSON.stringify(tasksList.slice(0, 30)));
    document.cookie = `cole_shared_tasks=${serialized}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {}
}

const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: 'not-1',
    title: '📢 Materiales para la clase de Ciencia y Tecnología del Jueves',
    date: '2026-04-21',
    time: '08:30 AM',
    author: 'Prof. Carmen Quispe',
    authorRole: 'Docente de Ciencia y Tecnología',
    authorAvatar: '👩‍🏫',
    course: 'Ciencia y Tecnología',
    text: 'Recordar traer al laboratorio: una lupa pequeña de mano, 2 muestras de hojas secas de diferentes árboles y el cuaderno de campo. Realizaremos la práctica de observación microscópica y celular vegetal.',
    tag: 'Materiales',
    priority: 'alta',
    read: false,
    acknowledged: false,
    liked: true,
    likesCount: 14,
    attachment: {
      name: 'Guia_Laboratorio_Celular_Semana8.pdf',
      size: '1.4 MB',
      type: 'pdf',
    },
    comments: [
      {
        id: 'c-1',
        author: 'Prof. Carmen Quispe',
        avatar: '👩‍🏫',
        role: 'Docente',
        text: 'Si alguien no consigue la lupa, el laboratorio prestará las del set institucional.',
        time: 'Hace 2 horas',
      },
    ],
  },
  {
    id: 'not-2',
    title: '🏆 Felicitaciones por el 1er Puesto en Concurso de Cálculo Mental',
    date: '2026-04-18',
    time: '11:00 AM',
    author: 'Dirección Académica',
    authorRole: 'Dirección General San Cleo',
    authorAvatar: '🏛️',
    text: 'Felicitamos al aula de 1er Grado Sección A por su destacada participación en las Olimpiadas Internas de Matemáticas. ¡Obtuvieron el máximo puntaje acumulado institucional!',
    tag: 'Celebración',
    priority: 'normal',
    read: true,
    acknowledged: true,
    liked: true,
    likesCount: 28,
    attachment: {
      name: 'Cuadro_Honor_Olimpiadas_2026.pdf',
      size: '2.8 MB',
      type: 'pdf',
    },
    comments: [],
  },
  {
    id: 'not-3',
    title: '⚽ Inicio de entrenamientos de fútbol extracurricular',
    date: '2026-04-15',
    time: '03:30 PM',
    author: 'Prof. Raúl Huamán',
    authorRole: 'Coordinador de Deportes',
    authorAvatar: '⚽',
    course: 'Educación Física y Deportes',
    text: 'Los alumnos inscritos en la selección de menores deben presentarse en la cancha polideportiva con su polo oficial deportivo, medias largas y canilleras. Iniciamos preparación para el torneo interescolar de Lima Norte.',
    tag: 'Deportes',
    priority: 'normal',
    read: false,
    acknowledged: false,
    liked: false,
    likesCount: 9,
    attachment: {
      name: 'Cronograma_Entrenamientos_LMC.pdf',
      size: '850 KB',
      type: 'pdf',
    },
    comments: [],
  },
  {
    id: 'not-4',
    title: '📝 Temario para la Evaluación Bimestral de Comunicación',
    date: '2026-04-14',
    time: '10:15 AM',
    author: 'Prof. Miguel Ángel Vega',
    authorRole: 'Docente de Comunicación',
    authorAvatar: '📚',
    course: 'Comprensión Lectora y Gramática',
    text: 'Se publica el temario oficial del I Bimestre: 1) Estructura del texto narrativo, 2) Uso de mayúsculas y signos de puntuación, 3) Identificación de la idea principal en fábulas y lecturas guiadas.',
    tag: 'Evaluaciones',
    priority: 'alta',
    read: true,
    acknowledged: true,
    liked: false,
    likesCount: 19,
    attachment: {
      name: 'Balotario_Comunicacion_Bimestre1.pdf',
      size: '1.1 MB',
      type: 'pdf',
    },
    comments: [],
  },
  {
    id: 'not-5',
    title: '🤝 Taller de Tutoría: Convivencia y Trabajo en Equipo',
    date: '2026-04-12',
    time: '09:00 AM',
    author: 'Prof. Elena Torres',
    authorRole: 'Tutor de Aula',
    authorAvatar: '👩‍🏫',
    course: 'Tutoría y Convivencia Escolar',
    text: 'Este viernes tendremos nuestro taller de convivencia "Trabajo en equipo y empatía en el aula". Traer un dibujo o foto de su actividad favorita con compañeros.',
    tag: 'Tutoría',
    priority: 'normal',
    read: true,
    acknowledged: true,
    liked: true,
    likesCount: 12,
    comments: [],
  },
];

/* ────────────────────────────────────────────────────────────
   DAY HELPER
   ──────────────────────────────────────────────────────────── */
const normalizeDay = (d: string): string => {
  return d ? d.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase() : '';
};

const getTodayDayFilter = (): string => {
  const dayIndex = new Date().getDay(); // 0: Domingo, 1: Lunes, 2: Martes, 3: Miércoles, 4: Jueves, 5: Viernes, 6: Sábado
  const dayMap: Record<number, string> = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
  };
  return dayMap[dayIndex] || 'Lunes';
};

const getTodayDayName = (): string => {
  const dayIndex = new Date().getDay();
  const dayMap: Record<number, string> = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    0: 'Domingo',
  };
  return dayMap[dayIndex] || 'Lunes';
};

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */
function StudentPortalContent() {
  const { user, login: authLogin, logout } = useAuth();
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('cole_student_auth');
      const token = localStorage.getItem('cole_student_access_token');
      return savedAuth === 'true' || Boolean(token);
    }
    return false;
  });
  const [email, setEmail] = useState('alumno@sancleo.edu.pe');
  const [password, setPassword] = useState('Cole2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isStudentAuthenticated = Boolean(user || authenticated);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'grades' | 'tasks' | 'attendance' | 'badges' | 'workshops' | 'notices' | 'store'>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('cole_student_activeTab') as any;
      if (savedTab) return savedTab;
    }
    return 'overview';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>(getTodayDayFilter);
  const [taskFilter, setTaskFilter] = useState<'TODAS' | 'PENDIENTE' | 'ENTREGADO' | 'CALIFICADO'>('TODAS');

  // Sync activeTab to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_student_activeTab', activeTab);
    }
  }, [activeTab]);

  const handleOpenSchedule = useCallback((dayOverride?: string) => {
    setSelectedDayFilter(dayOverride || getTodayDayFilter());
    setActiveTab('schedule');
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_student_activeTab', 'schedule');
    }
    setSidebarOpen(false);
  }, []);

  // Toast system
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const addToast = useCallback((message: string, type: Toast['type'], icon: string) => {
    const id = String(++toastIdRef.current);
    setToasts((prev) => [...prev, { id, message, type, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);
  const removeToast = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // Dynamic States
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    let list = INITIAL_TASKS;
    if (typeof window !== 'undefined') {
      const cookieTasks = getSharedTasksFromCookie();
      if (Array.isArray(cookieTasks) && cookieTasks.length > 0) {
        const formattedCookieTasks: TaskItem[] = cookieTasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          course: t.course || t.courseName || 'Álgebra y Aritmética',
          teacher: t.teacher || 'Prof. Elena Torres',
          dueDate: t.dueDate,
          status: (t.status as any) || 'PENDIENTE',
          priority: (t.priority as any) || 'ALTA',
          instructions: t.instructions || '',
          type: t.type || 'TAREA',
        }));
        const cookieIds = new Set(formattedCookieTasks.map((t) => t.id));
        const missingInitial = INITIAL_TASKS.filter((t) => !cookieIds.has(t.id));
        return [...missingInitial, ...formattedCookieTasks];
      }
      const saved = localStorage.getItem('cole_student_tasks');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const parsedIds = new Set(parsed.map((t: any) => t.id));
            const missing = INITIAL_TASKS.filter((t) => !parsedIds.has(t.id));
            list = [...missing, ...parsed];
          }
        } catch (e) {
          console.error('Error parsing tasks:', e);
        }
      }
    }
    return list;
  });

  // Auto-sync tomorrow exam and Thursday schedule if not present in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tomorrowExam = INITIAL_TASKS.find((t) => t.id === 'exam-tomorrow');
      if (tomorrowExam) {
        setTasks((prev) => {
          if (!prev.some((t) => t.id === 'exam-tomorrow' || t.title.includes('Examen Mensual de Álgebra'))) {
            const updated = [tomorrowExam, ...prev];
            try {
              localStorage.setItem('cole_student_tasks', JSON.stringify(updated));
            } catch {}
            return updated;
          }
          return prev;
        });
      }
    }
  }, []);
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(INITIAL_WORKSHOPS);
  const [badges] = useState<StudentBadge[]>(INITIAL_BADGES);
  const [grades, setGrades] = useState<CourseGrade[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cole_student_grades');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error('Error parsing grades:', e);
        }
      }
    }
    return INITIAL_GRADES;
  });
  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cookieNotices = getSharedNoticesFromCookie();
      if (Array.isArray(cookieNotices) && cookieNotices.length > 0) {
        return cookieNotices.map((n: any) => ({
          ...n,
          text: n.text || n.content || '',
          content: n.content || n.text || '',
          authorAvatar: n.authorAvatar || '👩‍🏫',
          authorRole: n.authorRole || n.role || 'Docente Titular',
          date: n.date || getTodayDateString(),
          time: n.time || '08:00 AM',
          tag: n.tag || 'General',
          priority: (n.priority?.toLowerCase() as any) || 'normal',
          likesCount: n.likesCount ?? n.likes ?? 0,
          comments: n.comments || [],
        }));
      }
      const saved = localStorage.getItem('cole_student_notices');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((n: any) => ({
              ...n,
              text: n.text || n.content || '',
              content: n.content || n.text || '',
              authorAvatar: n.authorAvatar || '👩‍🏫',
              authorRole: n.authorRole || n.role || 'Docente Titular',
              date: n.date || getTodayDateString(),
              time: n.time || '08:00 AM',
              tag: n.tag || 'General',
              priority: (n.priority?.toLowerCase() as any) || 'normal',
              likesCount: n.likesCount ?? n.likes ?? 0,
              comments: n.comments || [],
            }));
          }
        } catch (e) {
          console.error('Error parsing notices:', e);
        }
      }
    }
    return INITIAL_NOTICES;
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cole_student_schedule');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error('Error parsing schedule:', e);
        }
      }
    }
    return INITIAL_SCHEDULE;
  });

  // Cross-port cookie and storage listener for notices & tasks
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncSharedCookies = () => {
      // 1. Sync Notices
      const cookieNotices = getSharedNoticesFromCookie();
      if (Array.isArray(cookieNotices) && cookieNotices.length > 0) {
        setNotices((prev) => {
          const cookieIds = cookieNotices.map((c) => c.id).join(',');
          const prevIds = prev.map((p) => p.id).join(',');
          if (cookieIds !== prevIds) {
            return cookieNotices.map((n: any) => ({
              ...n,
              text: n.text || n.content || '',
              content: n.content || n.text || '',
              authorAvatar: n.authorAvatar || '👩‍🏫',
              authorRole: n.authorRole || n.role || 'Docente Titular',
              date: n.date || getTodayDateString(),
              time: n.time || '08:00 AM',
              tag: n.tag || 'General',
              priority: (n.priority?.toLowerCase() as any) || 'normal',
              likesCount: n.likesCount ?? n.likes ?? 0,
              comments: n.comments || [],
            }));
          }
          return prev;
        });
      }

      // 2. Sync Tasks
      const cookieTasks = getSharedTasksFromCookie();
      if (Array.isArray(cookieTasks) && cookieTasks.length > 0) {
        setTasks((prev) => {
          const cookieIds = cookieTasks.map((c) => c.id).join(',');
          const prevIds = prev.map((p) => p.id).join(',');
          if (cookieIds !== prevIds) {
            const formatted: TaskItem[] = cookieTasks.map((t: any) => {
              const existing = prev.find((p) => p.id === t.id);
              return {
                id: t.id,
                title: t.title,
                course: t.course || t.courseName || 'Álgebra y Aritmética',
                teacher: t.teacher || 'Prof. Elena Torres',
                dueDate: t.dueDate,
                status: existing ? existing.status : ((t.status as any) || 'PENDIENTE'),
                score: existing?.score,
                priority: (t.priority as any) || 'ALTA',
                instructions: t.instructions || '',
                type: t.type || 'TAREA',
              };
            });
            const formattedIds = new Set(formatted.map((f) => f.id));
            const missing = prev.filter((p) => !formattedIds.has(p.id));
            return [...formatted, ...missing];
          }
          return prev;
        });
      }
    };

    syncSharedCookies();
    const interval = setInterval(syncSharedCookies, 1500);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cole_student_notices' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const normalized = parsed.map((n: any) => ({
              ...n,
              text: n.text || n.content || '',
              content: n.content || n.text || '',
              authorAvatar: n.authorAvatar || '👩‍🏫',
              authorRole: n.authorRole || n.role || 'Docente Titular',
              date: n.date || getTodayDateString(),
              time: n.time || '08:00 AM',
              tag: n.tag || 'General',
              priority: (n.priority?.toLowerCase() as any) || 'normal',
              likesCount: n.likesCount ?? n.likes ?? 0,
              comments: n.comments || [],
            }));
            setNotices(normalized);
          }
        } catch {}
      } else if (e.key === 'cole_student_tasks' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setTasks(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', syncSharedCookies);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', syncSharedCookies);
    };
  }, []);

  // Sync schedule to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_student_schedule', JSON.stringify(schedule));
    }
  }, [schedule]);

  // Sync tasks to localStorage & shared cookie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_student_tasks', JSON.stringify(tasks));
      saveSharedTasksToCookie(tasks);
    }
  }, [tasks]);

  // Sync grades to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_student_grades', JSON.stringify(grades));
    }
  }, [grades]);

  // Sync notices to localStorage & shared cookie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_student_notices', JSON.stringify(notices));
      saveSharedNoticesToCookie(notices);
    }
  }, [notices]);

  // Real-Time Cross-Portal Academic Synchronization Listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('cole_platform_academic_sync');
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        
        // Helper to ensure a new materia/course exists in grades and schedule
        const ensureCourseInStudentProfile = (courseName?: string, teacherName?: string) => {
          if (!courseName) return;
          const cName = courseName.trim();
          const tName = teacherName || 'Prof. Elena Torres';

          setGrades((prev) => {
            const exists = prev.some((g) => g.courseName.toLowerCase() === cName.toLowerCase());
            if (exists) return prev;
            const newGrade: CourseGrade = {
              id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              courseName: cName,
              area: 'Académica / Curricular',
              teacher: tName,
              b1Score: 18,
              level: 'AD',
              evaluations: [
                { name: 'Evaluación Diagnóstica / Continua', score: 18, date: '2026-04-10' }
              ],
              teacherFeedback: 'Nueva materia agregada al plan académico del estudiante.',
            };
            return [...prev, newGrade];
          });

          setSchedule((prev) => {
            const exists = prev.some((s) => s.course.toLowerCase() === cName.toLowerCase());
            if (exists) return prev;
            const newSlot: ScheduleItem = {
              id: `sch-dyn-${Date.now()}`,
              day: 'Viernes',
              time: '11:45 - 13:15',
              course: cName,
              classroom: 'Aula 101 (Primaria)',
              teacher: tName,
              area: 'Académica',
              color: 'border-l-indigo-500 bg-indigo-50/40 text-indigo-900',
            };
            return [...prev, newSlot];
          });
        };

        if (type === 'EVALUATION_CREATED' && payload?.evaluation) {
          const ev = payload.evaluation;
          const courseName = payload.courseName || 'Álgebra y Aritmética';
          const teacherName = payload.teacherName || 'Prof. Elena Torres';
          
          ensureCourseInStudentProfile(courseName, teacherName);

          const newTask: TaskItem = {
            id: ev.id || `ev-${Date.now()}`,
            title: ev.name,
            course: courseName,
            teacher: teacherName,
            dueDate: ev.evaluationDate || getFutureDateString(3),
            status: 'PENDIENTE',
            priority: ev.weight > 1 ? 'ALTA' : 'MEDIA',
            instructions: `Evaluación programada por el docente (${ev.type === 'EXAM' ? 'Examen Mensual/Bimestral' : ev.type === 'QUIZ' ? 'Práctica Calificada' : 'Actividad'}). Ponderación: ${ev.weight}x. Puntaje máximo: ${ev.maxScore || 20} pts.`,
          };
          setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== ev.id)]);

          // Also inject into grades evaluations breakdown
          setGrades((prev) =>
            prev.map((g) => {
              if (
                g.courseName.toLowerCase() === courseName.toLowerCase() ||
                (courseName.toLowerCase().includes('álgebra') && g.courseName.toLowerCase().includes('álgebra'))
              ) {
                const exists = g.evaluations?.some((e) => e.name === ev.name);
                if (!exists) {
                  return {
                    ...g,
                    evaluations: [
                      ...(g.evaluations || []),
                      { name: ev.name, score: 18, date: ev.evaluationDate || '2026-04-20' },
                    ],
                  };
                }
              }
              return g;
            })
          );

          addToast(`¡Nuevo examen programado: "${ev.name}" en ${courseName} por ${teacherName}!`, 'info', '📝');
        } else if (type === 'EVALUATION_UPDATED' && payload?.evaluation) {
          const ev = payload.evaluation;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === ev.id
                ? {
                    ...t,
                    title: ev.name,
                    dueDate: ev.evaluationDate,
                    instructions: `Evaluación programada (${ev.type === 'EXAM' ? 'Examen' : 'Práctica'}). Ponderación: ${ev.weight}x. Puntaje: ${ev.maxScore || 20} pts.`,
                  }
                : t
            )
          );

          setGrades((prev) =>
            prev.map((g) => ({
              ...g,
              evaluations: g.evaluations?.map((e) =>
                e.name === ev.name || (e as any).id === ev.id
                  ? { ...e, name: ev.name, date: ev.evaluationDate }
                  : e
              ),
            }))
          );

          addToast(`Examen "${ev.name}" fue actualizado por el docente.`, 'info', '✏️');
        } else if (type === 'EVALUATION_DELETED' && payload?.evaluationId) {
          const delId = payload.evaluationId;
          setTasks((prev) => prev.filter((t) => t.id !== delId));
          setGrades((prev) =>
            prev.map((g) => ({
              ...g,
              evaluations: g.evaluations?.filter((e) => (e as any).id !== delId),
            }))
          );
          addToast('Una evaluación fue cancelada/retirada por el docente.', 'warning', '🗑️');
        } else if (type === 'NOTICE_CREATED' && payload?.notice) {
          const raw = payload.notice;
          const normalizedNotice: NoticeItem = {
            id: raw.id || `ntc-${Date.now()}`,
            title: raw.title,
            date: raw.date || getTodayDateString(),
            time: raw.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            author: raw.author || 'Prof. Elena Torres',
            authorRole: raw.authorRole || raw.role || 'Docente Titular',
            authorAvatar: raw.authorAvatar || '👩‍🏫',
            course: raw.course || raw.courseName || 'Álgebra y Aritmética',
            text: raw.text || raw.content || '',
            tag: raw.tag || 'General',
            priority: (raw.priority?.toLowerCase() as any) || 'normal',
            read: false,
            acknowledged: false,
            liked: false,
            likesCount: raw.likesCount ?? raw.likes ?? 0,
            comments: raw.comments || [],
          };
          ensureCourseInStudentProfile(normalizedNotice.course, normalizedNotice.author);
          setNotices((prev) => [normalizedNotice, ...prev.filter((n) => n.id !== normalizedNotice.id)]);
          addToast(`Nuevo aviso del aula: "${normalizedNotice.title}"`, 'info', '📢');
        } else if (type === 'NOTICE_UPDATED' && payload?.notice) {
          const raw = payload.notice;
          setNotices((prev) =>
            prev.map((n) =>
              n.id === raw.id
                ? {
                    ...n,
                    ...raw,
                    text: raw.text || raw.content || n.text,
                    content: raw.content || raw.text || n.content,
                  }
                : n
            )
          );
          addToast(`El aviso "${raw.title}" fue modificado por el docente.`, 'info', '✏️');
        } else if (type === 'NOTICE_DELETED' && payload?.noticeId) {
          setNotices((prev) => prev.filter((n) => n.id !== payload.noticeId));
          addToast('Un aviso del aula fue retirado por el docente.', 'warning', '🗑️');
        } else if (type === 'GRADES_PUBLISHED' && payload) {
          const studentMatch = payload.students?.find(
            (s: any) =>
              s.name?.toLowerCase().includes('rodrigo') ||
              s.name?.toLowerCase().includes('mateo') ||
              s.name?.toLowerCase().includes('garcía') ||
              s.id === 'st1' ||
              s.studentCode === 'ALU-2026-001'
          );

          const targetCourse = payload.courseName || 'Álgebra y Aritmética';
          const teacherName = payload.teacherName || 'Prof. Elena Torres';
          
          ensureCourseInStudentProfile(targetCourse, teacherName);

          if (studentMatch) {
            setGrades((prev) => {
              const courseExists = prev.some(
                (g) =>
                  g.courseName.toLowerCase() === targetCourse.toLowerCase() ||
                  (targetCourse.toLowerCase().includes('álgebra') && g.courseName.toLowerCase().includes('álgebra'))
              );

              if (courseExists) {
                return prev.map((g) => {
                  if (
                    g.courseName.toLowerCase() === targetCourse.toLowerCase() ||
                    (targetCourse.toLowerCase().includes('álgebra') && g.courseName.toLowerCase().includes('álgebra'))
                  ) {
                    const evalName = payload.evalName || 'Evaluación';
                    const exists = g.evaluations.some((ev) => ev.name === evalName);
                    const updatedEvals = exists
                      ? g.evaluations.map((ev) => (ev.name === evalName ? { ...ev, score: studentMatch.score, date: 'Hoy' } : ev))
                      : [...g.evaluations, { name: evalName, score: studentMatch.score, date: 'Hoy' }];
                    
                    const avg = Math.round(updatedEvals.reduce((acc, ev) => acc + ev.score, 0) / updatedEvals.length);
                    const level: 'AD' | 'A' | 'B' | 'C' = avg >= 18 ? 'AD' : avg >= 14 ? 'A' : avg >= 11 ? 'B' : 'C';

                    return {
                      ...g,
                      b1Score: avg,
                      level,
                      teacher: teacherName,
                      teacherFeedback: studentMatch.feedback || g.teacherFeedback,
                      evaluations: updatedEvals,
                    };
                  }
                  return g;
                });
              } else {
                const newGrade: CourseGrade = {
                  id: `g-${Date.now()}`,
                  courseName: targetCourse,
                  area: 'Académica / Curricular',
                  teacher: teacherName,
                  b1Score: studentMatch.score,
                  level: studentMatch.score >= 18 ? 'AD' : studentMatch.score >= 14 ? 'A' : studentMatch.score >= 11 ? 'B' : 'C',
                  evaluations: [
                    { name: payload.evalName || 'Evaluación', score: studentMatch.score, date: 'Hoy' },
                  ],
                  teacherFeedback: studentMatch.feedback || 'Calificación oficial registrada.',
                };
                return [...prev, newGrade];
              }
            });
          }
          addToast(`¡Nuevas calificaciones de "${payload.evalName || 'Evaluación'}" en ${targetCourse} publicadas por tu docente!`, 'success', '🌟');
        } else if (type === 'TASK_CREATED' && payload?.task) {
          const t = payload.task;
          const newTaskItem: TaskItem = {
            id: t.id,
            title: t.title,
            course: t.course || payload.courseName || 'Álgebra y Aritmética',
            teacher: t.teacher || payload.teacherName || 'Prof. Elena Torres',
            dueDate: t.dueDate,
            status: 'PENDIENTE',
            priority: t.priority || 'ALTA',
            instructions: t.instructions || '',
            type: t.type || 'TAREA',
          };
          setTasks((prev) => [newTaskItem, ...prev.filter((item) => item.id !== t.id)]);
          addToast(`¡Nueva tarea escolar asignada: "${t.title}" por ${t.teacher}!`, 'info', '📝');
        } else if (type === 'TASK_UPDATED' && payload?.task) {
          const t = payload.task;
          setTasks((prev) =>
            prev.map((item) =>
              item.id === t.id
                ? {
                    ...item,
                    title: t.title,
                    dueDate: t.dueDate,
                    priority: t.priority,
                    instructions: t.instructions,
                    type: t.type,
                  }
                : item
            )
          );
          addToast(`Tarea actualizada: "${t.title}"`, 'info', '✏️');
        } else if (type === 'TASK_DELETED' && payload?.taskId) {
          setTasks((prev) => prev.filter((item) => item.id !== payload.taskId));
          addToast('Una tarea escolar fue retirada por el docente.', 'warning', '🗑️');
        } else if (type === 'TASK_GRADED' && payload?.taskId) {
          setTasks((prev) =>
            prev.map((item) =>
              item.id === payload.taskId
                ? { ...item, status: 'CALIFICADO', score: payload.score }
                : item
            )
          );
          addToast(`¡Tu tarea fue calificada con ${payload.score}/20 por tu docente!`, 'success', '🌟');
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel error in student portal:', e);
    }

    // Comprehensive Sync from teacher localStorage data
    const syncAllTeacherEvaluations = () => {
      if (typeof window === 'undefined') return;
      try {
        const sectionCourseMap: Record<string, { courseName: string; teacherName: string }> = {
          'sec-prim-1': { courseName: 'Álgebra y Aritmética', teacherName: 'Prof. Elena Torres' },
          'sec-prim-5': { courseName: 'Comunicación y Redacción Creativa', teacherName: 'Prof. Elena Torres' },
          'sec-sec-3': { courseName: 'Física y Trigonometría', teacherName: 'Prof. Elena Torres' },
          'sec-preu-1': { courseName: 'Simulacros de Admisión DECO', teacherName: 'Prof. Elena Torres' },
          'sec-nido-1': { courseName: 'Psicomotricidad y Exploración', teacherName: 'Prof. Elena Torres' },
        };

        const extractedTasks: TaskItem[] = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;

          if (key.startsWith('cole_teacher_data_') || key.startsWith('cole_evaluations_')) {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            try {
              const data = JSON.parse(raw);
              const evalsList = Array.isArray(data) ? data : data.evaluations;
              if (Array.isArray(evalsList)) {
                const secId = key.replace('cole_teacher_data_', '').replace('cole_evaluations_', '');
                const courseInfo = sectionCourseMap[secId] || { courseName: 'Álgebra y Aritmética', teacherName: 'Prof. Elena Torres' };

                evalsList.forEach((ev: any) => {
                  if (ev && ev.name) {
                    extractedTasks.push({
                      id: ev.id || `eval-${ev.name.replace(/\s+/g, '-').toLowerCase()}`,
                      title: ev.name,
                      course: ev.courseName || courseInfo.courseName,
                      teacher: ev.teacherName || courseInfo.teacherName,
                      dueDate: ev.evaluationDate || getFutureDateString(1),
                      status: 'PENDIENTE',
                      priority: (ev.weight || 1) > 1 ? 'ALTA' : 'MEDIA',
                      instructions: `Evaluación oficial programada (${ev.type === 'EXAM' ? 'Examen Mensual / Bimestral' : 'Práctica Calificada'}). Ponderación: ${ev.weight || 1}x. Puntaje máximo: ${ev.maxScore || 20} pts.`,
                      type: ev.type || 'EXAM',
                    });
                  }
                });
              }
            } catch {}
          }
        }

        if (extractedTasks.length > 0) {
          setTasks((prev) => {
            const existingIds = new Set<string>();
            const existingNames = new Set<string>();
            prev.forEach((t) => {
              existingIds.add(t.id);
              existingNames.add(t.title.toLowerCase().trim());
            });

            const newItems = extractedTasks.filter(
              (item) => !existingIds.has(item.id) && !existingNames.has(item.title.toLowerCase().trim())
            );

            if (newItems.length > 0) {
              return [...newItems, ...prev];
            }
            return prev;
          });

          // Ensure in grades
          setGrades((prev) => {
            let updated = [...prev];
            extractedTasks.forEach((t) => {
              const courseIdx = updated.findIndex(
                (g) => g.courseName.toLowerCase() === t.course.toLowerCase()
              );
              if (courseIdx >= 0) {
                const g = updated[courseIdx];
                const exists = g.evaluations?.some((ev) => ev.name.toLowerCase() === t.title.toLowerCase());
                if (!exists) {
                  updated[courseIdx] = {
                    ...g,
                    evaluations: [
                      ...(g.evaluations || []),
                      { name: t.title, score: 18, date: t.dueDate },
                    ],
                  };
                }
              } else {
                updated.push({
                  id: `g-${Date.now()}-${t.id}`,
                  courseName: t.course,
                  area: 'Académica',
                  teacher: t.teacher,
                  b1Score: 18,
                  level: 'AD',
                  evaluations: [{ name: t.title, score: 18, date: t.dueDate }],
                  teacherFeedback: 'Evaluación y materia sincronizadas desde el portal docente.',
                });
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.error('Error syncing teacher evaluations:', err);
      }
    };

    // Run initial sync on mount
    syncAllTeacherEvaluations();

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'cole_student_tasks' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setTasks(parsed);
        } catch {}
      } else if (e.key === 'cole_student_grades' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setGrades(parsed);
        } catch {}
      } else if (e.key?.startsWith('cole_teacher_data_') || e.key?.startsWith('cole_evaluations_')) {
        syncAllTeacherEvaluations();
      }
    };

    const handleWindowFocus = () => {
      syncAllTeacherEvaluations();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageEvent);
      window.addEventListener('focus', handleWindowFocus);
    }

    return () => {
      if (channel) {
        channel.close();
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageEvent);
        window.removeEventListener('focus', handleWindowFocus);
      }
    };
  }, [addToast]);

  // Notice filters & interactive modal state
  const [noticeTagFilter, setNoticeTagFilter] = useState<string>('Todos');
  const [noticeStatusFilter, setNoticeStatusFilter] = useState<'TODOS' | 'NO_LEIDOS' | 'ENTERADOS'>('TODOS');
  const [selectedNoticeForDetail, setSelectedNoticeForDetail] = useState<NoticeItem | null>(null);
  const [newNoticeComment, setNewNoticeComment] = useState<string>('');

  const unreadNoticesCount = useMemo(() => notices.filter((n) => !n.read).length, [notices]);

  // Store & Cafetería States
  const [storeProducts] = useState<StudentStoreProduct[]>(INITIAL_STUDENT_STORE_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cole_student_cart');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });
  const [studentOrders, setStudentOrders] = useState<StudentOrder[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cole_student_orders');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: 'ord-std-1',
        code: 'PED-EST-2026-412',
        date: '2026-04-20',
        time: '12:45 PM',
        items: [
          { name: 'Menú Escolar Nutritivo Completo', quantity: 1, price: 15.0, details: 'Milanesa con puré • Chicha Morada • Mazamorra' },
        ],
        total: 15.0,
        paymentMethod: 'FAMILY_ACCOUNT',
        status: 'READY_PICKUP',
        pickupLocation: 'Comedor Escolar - Mesa de Entrega Primaria (13:15 hrs)',
      },
    ];
  });
  const [storeCategory, setStoreCategory] = useState<'ALL' | 'MENU' | 'CAFETERIA' | 'SNACKS' | 'UTILES'>('ALL');
  const [storeSearch, setStoreSearch] = useState('');
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);
  const [studentAvatarUrl, setStudentAvatarUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cole_student_avatar') || '';
    }
    return '';
  });
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<StudentOrder | null>(null);
  const [selectedProductForCustomization, setSelectedProductForCustomization] = useState<StudentStoreProduct | null>(null);
  const [customEntree, setCustomEntree] = useState('');
  const [customMain, setCustomMain] = useState('');
  const [customDrink, setCustomDrink] = useState('');
  const [customDessert, setCustomDessert] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<'FAMILY_ACCOUNT' | 'YAPE_PLIN' | 'CARD' | 'COUNTER'>('FAMILY_ACCOUNT');

  // Sync cart and orders to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_student_cart', JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_student_orders', JSON.stringify(studentOrders));
    }
  }, [studentOrders]);

  // Justifications State
  const [justifications, setJustifications] = useState<JustificationItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cole_student_justifications');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_JUSTIFICATIONS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_student_justifications', JSON.stringify(justifications));
    }
  }, [justifications]);

  // Modals
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<CourseGrade | null>(null);
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState<TaskItem | null>(null);
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [justificationForm, setJustificationForm] = useState<{
    date: string;
    reason: string;
    detail: string;
    imageUrl: string;
    imageName: string;
  }>({
    date: '2026-04-20',
    reason: 'Cita Médica Pediátrica',
    detail: '',
    imageUrl: '',
    imageName: '',
  });
  const [previewJustificationImage, setPreviewJustificationImage] = useState<string | null>(null);
  const [taskSubmissionNote, setTaskSubmissionNote] = useState('');
  const [reportCardView, setReportCardView] = useState<'cneb' | 'preu' | 'vigesimal'>('cneb');

  const handleStudentLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authLogin(email, password);
      setAuthenticated(true);
    } catch {
      // Demo fallback login
      setAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setActiveTab('overview');
  };

  // Workshop enrollment handler
  const handleToggleWorkshop = (workshop: WorkshopItem) => {
    const isEnrolling = !workshop.enrolled;
    setWorkshops((curr) =>
      curr.map((w) =>
        w.id === workshop.id
          ? { ...w, enrolled: isEnrolling, vacancies: isEnrolling ? w.vacancies - 1 : w.vacancies + 1 }
          : w
      )
    );
    if (isEnrolling) {
      addToast(`¡Inscripción confirmada en "${workshop.title}"! Horario reservado.`, 'success', '🎨');
    } else {
      addToast(`Inscripción cancelada en "${workshop.title}".`, 'warning', '⚠️');
    }
  };

  // ── Dynamic Notice Handlers ─────────────────────────────────
  const handleToggleNoticeRead = (noticeId: string) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === noticeId) {
          const nextRead = !n.read;
          if (nextRead) {
            addToast(`Aviso "${n.title.slice(0, 32)}..." marcado como leído.`, 'info', '👁️');
          }
          return { ...n, read: nextRead };
        }
        return n;
      })
    );
    if (selectedNoticeForDetail && selectedNoticeForDetail.id === noticeId) {
      setSelectedNoticeForDetail((curr) => (curr ? { ...curr, read: !curr.read } : null));
    }
  };

  const handleMarkAllNoticesAsRead = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('Todos los avisos fueron marcados como leídos.', 'success', '✅');
  };

  const handleConfirmNoticeAcknowledgement = (noticeId: string) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === noticeId) {
          return { ...n, acknowledged: true, read: true };
        }
        return n;
      })
    );
    if (selectedNoticeForDetail && selectedNoticeForDetail.id === noticeId) {
      setSelectedNoticeForDetail((curr) =>
        curr ? { ...curr, acknowledged: true, read: true } : null
      );
    }
    addToast('¡Acuse de recibo registrado! Quedaste registrado como "Enterado".', 'success', '✓');
  };

  const handleToggleNoticeLike = (noticeId: string) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === noticeId) {
          const nextLiked = !n.liked;
          const nextCount = nextLiked ? n.likesCount + 1 : Math.max(0, n.likesCount - 1);
          if (nextLiked) {
            addToast('Reaccionaste al comunicado del docente.', 'success', '👍');
          }
          return { ...n, liked: nextLiked, likesCount: nextCount };
        }
        return n;
      })
    );
    if (selectedNoticeForDetail && selectedNoticeForDetail.id === noticeId) {
      setSelectedNoticeForDetail((curr) =>
        curr
          ? {
              ...curr,
              liked: !curr.liked,
              likesCount: !curr.liked ? curr.likesCount + 1 : Math.max(0, curr.likesCount - 1),
            }
          : null
      );
    }
  };

  const handleAddNoticeComment = (noticeId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeComment.trim()) return;
    const commentObj: NoticeComment = {
      id: `c-${Date.now()}`,
      author: user ? `${user.firstName} ${user.lastName}` : 'Rodrigo García (Tú)',
      avatar: '👦',
      role: 'Estudiante',
      text: newNoticeComment.trim(),
      time: 'Hace un momento',
    };
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === noticeId) {
          return { ...n, comments: [...n.comments, commentObj], read: true };
        }
        return n;
      })
    );
    if (selectedNoticeForDetail && selectedNoticeForDetail.id === noticeId) {
      setSelectedNoticeForDetail((curr) =>
        curr ? { ...curr, comments: [...curr.comments, commentObj], read: true } : null
      );
    }
    setNewNoticeComment('');
    addToast('Tu consulta/comentario fue enviado al docente.', 'success', '💬');
  };

  const handleDownloadNoticeAttachment = (attachmentName: string) => {
    addToast(`Descargando documento adjunto: "${attachmentName}"...`, 'info', '📥');
  };

  // ── Store & Cafetería Handlers ──────────────────────────────
  const filteredStoreProducts = useMemo(() => {
    let list = [...storeProducts];
    if (storeCategory !== 'ALL') {
      list = list.filter((p) => p.category === storeCategory);
    }
    if (storeSearch.trim()) {
      const q = storeSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [storeProducts, storeCategory, storeSearch]);

  const handleOpenProductForCustomization = (product: StudentStoreProduct) => {
    setSelectedProductForCustomization(product);
    setCustomEntree(product.options?.entrees?.[0] || '');
    setCustomMain(product.options?.mains?.[0] || '');
    setCustomDrink(product.options?.drinks?.[0] || '');
    setCustomDessert(product.options?.desserts?.[0] || '');
    setCustomNotes('');
    setShowOrderModal(true);
  };

  const handleAddToCartDirect = (product: StudentStoreProduct) => {
    if (product.options) {
      handleOpenProductForCustomization(product);
      return;
    }
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id && !item.selectedOptions);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });
    addToast(`"${product.name}" añadido a tu bandeja de pedido.`, 'success', '🛍️');
  };

  const handleConfirmAddToCartWithOptions = () => {
    if (!selectedProductForCustomization) return;
    const item: CartItem = {
      product: selectedProductForCustomization,
      quantity: 1,
      selectedOptions: {
        entree: customEntree || undefined,
        main: customMain || undefined,
        drink: customDrink || undefined,
        dessert: customDessert || undefined,
        notes: customNotes || undefined,
      },
    };
    setCart((prev) => [...prev, item]);
    setShowOrderModal(false);
    addToast(`"${selectedProductForCustomization.name}" personalizado y añadido al pedido.`, 'success', '🍽️');
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    addToast('Producto removido del pedido.', 'info', '🗑️');
  };

  const handleUpdateCartQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      next[index].quantity = newQty;
      return next;
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const handleCheckoutOrder = () => {
    if (cart.length === 0) return;
    const newOrder: StudentOrder = {
      id: `ord-${Date.now()}`,
      code: `PED-EST-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('es-PE'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: cart.map((c) => {
        let details = '';
        if (c.selectedOptions) {
          const parts = [];
          if (c.selectedOptions.entree) parts.push(c.selectedOptions.entree);
          if (c.selectedOptions.main) parts.push(c.selectedOptions.main);
          if (c.selectedOptions.drink) parts.push(c.selectedOptions.drink);
          if (c.selectedOptions.dessert) parts.push(c.selectedOptions.dessert);
          if (c.selectedOptions.notes) parts.push(`Nota: ${c.selectedOptions.notes}`);
          details = parts.join(' • ');
        }
        return {
          name: c.product.name,
          quantity: c.quantity,
          price: c.product.price,
          details: details || undefined,
        };
      }),
      total: cartTotal,
      paymentMethod: orderPaymentMethod,
      status: 'PREPARING',
      pickupLocation: 'Comedor Escolar - Mesa de Atención Primaria (13:15 hrs)',
    };

    setStudentOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setShowCartDrawer(false);
    setActiveReceiptOrder(newOrder);
    setShowReceiptModal(true);
    addToast(`¡Pedido ${newOrder.code} registrado con éxito!`, 'success', '🚀');
  };

  // Task submit handler
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForSubmit) return;
    setTasks((curr) =>
      curr.map((t) => (t.id === selectedTaskForSubmit.id ? { ...t, status: 'ENTREGADO' } : t))
    );
    const taskTitle = selectedTaskForSubmit.title;
    const taskTeacher = selectedTaskForSubmit.teacher;
    setSelectedTaskForSubmit(null);
    setTaskSubmissionNote('');
    addToast(`Tarea "${taskTitle}" entregada con éxito a ${taskTeacher}.`, 'success', '📤');
  };

  // Justification image handlers & submit handler
  const handleJustificationImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).', 'warning', '⚠️');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setJustificationForm((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
          imageName: file.name,
        }));
        addToast(`Imagen "${file.name}" adjuntada con éxito.`, 'info', '📷');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveJustificationImage = () => {
    setJustificationForm((prev) => ({
      ...prev,
      imageUrl: '',
      imageName: '',
    }));
  };

  const handleJustificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJustification: JustificationItem = {
      id: `just-${Date.now()}`,
      date: justificationForm.date,
      submissionDate: new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reason: justificationForm.reason,
      detail: justificationForm.detail,
      imageUrl: justificationForm.imageUrl || undefined,
      imageName: justificationForm.imageName || undefined,
      status: 'PENDING',
    };

    setJustifications((prev) => [newJustification, ...prev]);
    setShowJustificationModal(false);
    addToast(`Justificación para el ${justificationForm.date} enviada a tutoría y dirección.`, 'success', '📝');
    setJustificationForm({
      date: '2026-04-20',
      reason: 'Cita Médica Pediátrica',
      detail: '',
      imageUrl: '',
      imageName: '',
    });
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Por favor selecciona una imagen válida (PNG, JPG, WEBP).', 'warning', '⚠️');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setStudentAvatarUrl(result);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cole_student_avatar', result);
        }
        addToast('¡Foto de perfil actualizada con éxito!', 'success', '📸');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (avatarValue: string) => {
    setStudentAvatarUrl(avatarValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cole_student_avatar', avatarValue);
    }
    addToast('Avatar actualizado con éxito.', 'success', '🎨');
  };

  const handleRemoveAvatar = () => {
    setStudentAvatarUrl('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cole_student_avatar');
    }
    addToast('Foto de perfil restablecida a las iniciales.', 'info', '🔄');
  };

  // Derived Counts
  const pendingTasksCount = tasks.filter((t) => t.status === 'PENDIENTE').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'CALIFICADO' || t.status === 'ENTREGADO').length;
  const enrolledWorkshopsCount = workshops.filter((w) => w.enrolled).length;
  const totalXp = badges.filter((b) => b.unlocked).reduce((acc, b) => acc + b.xp, 0);

  // Helper to parse any date string safely into timestamp milliseconds at midnight
  const parseDateToMs = (dateStr: string): number => {
    if (!dateStr) return 0;
    const str = dateStr.trim();
    if (str.toLowerCase() === 'hoy') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    if (str.toLowerCase() === 'mañana') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    // Check YYYY-MM-DD
    const ymd = str.split('-');
    if (ymd.length === 3 && ymd[0].length === 4) {
      const d = new Date(Number(ymd[0]), Number(ymd[1]) - 1, Number(ymd[2]));
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    // Check DD/MM/YYYY
    const dmy = str.split('/');
    if (dmy.length === 3) {
      const d = new Date(Number(dmy[2]), Number(dmy[1]) - 1, Number(dmy[0]));
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed.getTime();
    }
    return 0;
  };

  // Helper to calculate days until a due date
  const getDaysUntil = (dueDateStr: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetMs = parseDateToMs(dueDateStr);
      if (!targetMs) return dueDateStr;
      
      const diffMs = targetMs - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Hoy';
      if (diffDays === 1) return 'Mañana';
      if (diffDays === -1) return 'Ayer';
      if (diffDays < 0) return 'Vencido';
      return `En ${diffDays} días`;
    } catch {
      return dueDateStr;
    }
  };

  // Determine the next upcoming evaluation dynamically (ONLY future or today evaluations)
  const upcomingEvaluation = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    const futurePending = tasks.filter((t) => {
      if (t.status !== 'PENDIENTE' || !t.dueDate) return false;
      const targetMs = parseDateToMs(t.dueDate);
      return targetMs >= todayMs; // Future or today
    });

    if (futurePending.length === 0) return null;

    const sorted = [...futurePending].sort((a, b) => {
      return parseDateToMs(a.dueDate) - parseDateToMs(b.dueDate);
    });

    return sorted[0];
  }, [tasks]);

  // Urgent pending tasks sorted by closest due date (ONLY future or today)
  const urgentTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    const futurePending = tasks.filter((t) => {
      if (t.status !== 'PENDIENTE' || !t.dueDate) return false;
      const targetMs = parseDateToMs(t.dueDate);
      return targetMs >= todayMs;
    });

    return [...futurePending].sort((a, b) => {
      return parseDateToMs(a.dueDate) - parseDateToMs(b.dueDate);
    });
  }, [tasks]);

  // Filtered lists
  const filteredSchedule = useMemo(() => {
    return schedule.filter((item) => {
      if (selectedDayFilter === 'Todos') return true;
      return normalizeDay(item.day) === normalizeDay(selectedDayFilter);
    });
  }, [selectedDayFilter, schedule]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      return taskFilter === 'TODAS' || item.status === taskFilter;
    });
  }, [taskFilter, tasks]);

  const filteredNotices = useMemo(() => {
    return notices.filter((item) => {
      if (item.target === 'PARENTS') return false;

      const tag = item.tag || 'General';
      const matchesTag =
        noticeTagFilter === 'Todos' ||
        noticeTagFilter === 'ALL' ||
        tag.toLowerCase() === noticeTagFilter.toLowerCase();

      const matchesStatus =
        noticeStatusFilter === 'TODOS'
          ? true
          : noticeStatusFilter === 'NO_LEIDOS'
          ? !item.read
          : item.acknowledged;

      return matchesTag && matchesStatus;
    });
  }, [notices, noticeTagFilter, noticeStatusFilter]);

  /* ────────────────────────────────────────────────────────────
     LOGIN SCREEN
     ──────────────────────────────────────────────────────────── */
  if (!isStudentAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden text-slate-100 font-sans">
        {/* Ambient background glow & grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Hero Column */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-8 text-white space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Colegio San Cleo • Nido, Primaria, Secundaria y Pre-U
              </div>
              <h2 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight bg-gradient-to-br from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Tu campus escolar interactivo, ordenado y motivador
              </h2>
              <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                Consulta tus clases en tiempo real, entrega tus tareas con facilidad, revisa tus logros CNEB y desbloquea medallas de aprendizaje.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 text-lg">
                  🗓️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Horario de Clases y Próxima Sesión</h3>
                  <p className="text-xs text-slate-400 mt-0.5">A qué hora empieza cada materia, qué profesor enseña y en qué aula te toca.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 text-lg">
                  🏆
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Libreta CNEB y Logros Destacados (AD)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sigue tus calificaciones en tiempo real con conclusiones descriptivas claras.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 text-lg">
                  🎮
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Gamificación y Medallas de Reconocimiento</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Gana puntos de experiencia (XP) por puntualidad y entrega a tiempo de tus deberes.</p>
                </div>
              </div>
            </div>

            {/* Quote Footer */}
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
              <span className="text-indigo-400 font-bold text-sm">🎒</span>
              <span>"Aprender con entusiasmo cada día es el camino al éxito personal y académico."</span>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="w-full lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-100/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] p-6 sm:p-9 relative text-slate-900">
              {/* Header inside form */}
              <div className="text-center sm:text-left mb-6">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
                    🎒
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      Colegio San Cleo
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Campus del Alumno</h1>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Ingresa con tu correo institucional de alumno para consultar tu horario y calificaciones.
                </p>
              </div>

              {/* Demo Credentials Quick-Assist */}
              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-lg flex-shrink-0">🔑</span>
                  <div className="truncate text-xs">
                    <p className="text-slate-500 font-medium truncate">Demo Alumno:</p>
                    <p className="font-mono font-bold text-indigo-600 truncate">{email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('alumno@sancleo.edu.pe');
                    setPassword('Cole2026!');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex-shrink-0"
                >
                  Autocompletar
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleStudentLogin} className="space-y-4">
                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Correo Institucional del Alumno
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alumno@sancleo.edu.pe"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Contraseña de Acceso
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Ingresar al Campus Escolar</span>
                      <span>🚀</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  ¿Problemas con tu clave? Consulta con tu tutor de aula o en secretaría.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ────────────────────────────────────────────────────────────
     AUTHENTICATED STUDENT DASHBOARD
     ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-900 font-sans">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-950 text-white z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Logo & School Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
                🎒
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                  San Cleo SaaS
                </span>
                <h2 className="text-base font-black text-white leading-tight">Campus Alumno</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Student Profile Quick Card */}
          <div
            onClick={() => setShowStudentProfileModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowStudentProfileModal(true); }}
            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/50 via-slate-900/80 to-slate-900 border border-indigo-500/20 backdrop-blur-md hover:border-indigo-400/50 transition-all cursor-pointer group"
            title="Haz clic para ver y cambiar tu foto de perfil"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-md group-hover:scale-105 transition-transform overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-black text-base overflow-hidden">
                  {studentAvatarUrl ? (
                    studentAvatarUrl.startsWith('data:image') || studentAvatarUrl.startsWith('http') ? (
                      <img src={studentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{studentAvatarUrl}</span>
                    )
                  ) : (
                    'MG'
                  )}
                </div>
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-white text-sm truncate flex items-center gap-1.5">
                  <span>{user ? `${user.firstName} ${user.lastName}` : 'Mateo García'}</span>
                  <span className="text-[10px] text-indigo-300 opacity-60 group-hover:opacity-100 transition-opacity">✏️</span>
                </p>
                <p className="text-[11px] text-indigo-300 font-medium">1er Grado Primaria • Aula 101</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Mi Espacio Escolar
            </p>

            <button
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏠</span>
                <span>Inicio / Resumen</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                Hoy
              </span>
            </button>

            <button
              onClick={() => handleOpenSchedule()}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🗓️</span>
                <span>Horario & Clases</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'schedule' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                4 Clases
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('grades'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'grades'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏆</span>
                <span>Libreta & Logros CNEB</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'grades' ? 'bg-white/20 text-white' : 'bg-slate-800 text-emerald-400'
              }`}>
                18.5 AD
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('tasks'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📚</span>
                <span>Mis Tareas</span>
              </div>
              {pendingTasksCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-500 text-slate-950">
                  {pendingTasksCount} por hacer
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">⏰</span>
                <span>Asistencia Diaria</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'attendance' ? 'bg-white/20 text-white' : 'bg-slate-800 text-teal-400'
              }`}>
                100%
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('badges'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'badges'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏅</span>
                <span>Medallas & Logros</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                {badges.filter((b) => b.unlocked).length} Ganadas
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('workshops'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'workshops'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🎨</span>
                <span>Talleres & Clubes</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'workshops' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {enrolledWorkshopsCount} activos
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('notices'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'notices'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">💬</span>
                <span>Avisos del Aula</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold transition-colors ${
                unreadNoticesCount > 0
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {unreadNoticesCount > 0 ? `${unreadNoticesCount} nuevos` : `${notices.length} avisos`}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('store'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'store'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🍽️</span>
                <span>Cafetería & Tienda</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold transition-colors ${
                cart.reduce((a, b) => a + b.quantity, 0) > 0
                  ? 'bg-emerald-500 text-slate-950 font-black animate-pulse'
                  : 'bg-slate-800 text-emerald-400'
              }`}>
                {cart.reduce((a, b) => a + b.quantity, 0) > 0
                  ? `${cart.reduce((a, b) => a + b.quantity, 0)} en carrito`
                  : 'Abierto'}
              </span>
            </button>
          </div>

          {/* Academic Streak Card */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <span>🔥</span> Racha Impecable
              </span>
              <span className="font-mono text-amber-400">15 días</span>
            </div>
            <div className="w-full bg-indigo-900/50 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-indigo-400 h-full rounded-full" style={{ width: '75%' }} />
            </div>
            <p className="text-[10px] text-slate-400">Estás a 5 días de la medalla "Mes Perfecto".</p>
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
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-900">
        {/* Top Header with Fast Search */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
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
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Alumno Activo
                  </span>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">Colegio San Cleo • Nido, Primaria, Secundaria y Pre-U</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Campus Virtual del Estudiante
                </h1>
              </div>
            </div>

            {/* Student Level & Rank Widget */}
            <div
              onClick={() => setActiveTab('badges')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('badges'); }}
              className="flex-1 max-w-lg hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-violet-500/10 hover:from-amber-500/15 hover:via-indigo-500/15 hover:to-violet-500/15 border border-amber-300/40 rounded-2xl shadow-xs transition-all cursor-pointer group"
              title="Haz clic para ver tus medallas y logros"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-lg font-black shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                ⭐
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-black text-slate-900 truncate">
                      Nivel 5: Explorador Destacado
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded-md">
                      Rango Pro
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-700 flex-shrink-0">
                    {totalXp} / 600 XP
                  </span>
                </div>
                {/* Micro Progress Bar & Description */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((totalXp / 600) * 100))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium truncate">
                    A 150 XP de Nivel 6 (Investigador) 🚀
                  </span>
                </div>
              </div>
            </div>

            {/* User Quick Badge & Interactive Profile Avatar Button */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveTab('badges')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                <span>🏆</span>
                <span>{totalXp} XP</span>
              </button>

              <button
                type="button"
                onClick={() => setShowStudentProfileModal(true)}
                className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:scale-105 hover:ring-2 hover:ring-indigo-400 hover:shadow-indigo-500/40 transition-all cursor-pointer overflow-hidden group"
                title="Ver y editar mi perfil de estudiante"
              >
                {studentAvatarUrl ? (
                  studentAvatarUrl.startsWith('data:image') || studentAvatarUrl.startsWith('http') ? (
                    <img src={studentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{studentAvatarUrl}</span>
                  )
                ) : (
                  <span className="group-hover:scale-110 transition-transform">MG</span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* ────────────────────────────────────────────────────────────
             TAB: OVERVIEW / DASHBOARD INICIO
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Modern Glassmorphic Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/50">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200">
                      <span>☀️</span> ¡Buenos días, {user ? user.firstName : 'Rodrigo'}!
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                      Listo para un gran día de aprendizaje en San Cleo
                    </h2>
                    <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                      Tienes <span className="text-white font-black underline">{pendingTasksCount} tareas por entregar</span> esta semana y tu próxima clase es <span className="text-emerald-300 font-bold">Álgebra en Aula 101</span>.
                    </p>
                  </div>

                  {/* Hero Stats Pill Box */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-3 bg-black/25 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md flex-shrink-0">
                    <div className="px-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-indigo-300">Promedio CNEB</p>
                      <p className="text-2xl font-black text-emerald-400">18.5 AD</p>
                    </div>
                    <div className="px-3 text-center border-l border-white/10">
                      <p className="text-[10px] uppercase font-bold text-indigo-300">Asistencia</p>
                      <p className="text-2xl font-black text-teal-300">100%</p>
                    </div>
                    <div className="px-3 text-center border-l border-white/10">
                      <p className="text-[10px] uppercase font-bold text-indigo-300">Racha</p>
                      <p className="text-2xl font-black text-amber-300">🔥 15d</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                <button
                  onClick={() => handleOpenSchedule()}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    🗓️
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Ver Horario</h4>
                  <p className="text-[11px] text-slate-500">4 clases de hoy</p>
                </button>

                <button
                  onClick={() => setActiveTab('tasks')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    📚
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Tareas</h4>
                  <p className="text-[11px] text-amber-600 font-bold">{pendingTasksCount} pendientes</p>
                </button>

                <button
                  onClick={() => setActiveTab('grades')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    🏆
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Libreta CNEB</h4>
                  <p className="text-[11px] text-slate-500">Logros AD</p>
                </button>

                <button
                  onClick={() => setActiveTab('store')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    🍽️
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Cafetería & Menú</h4>
                  <p className="text-[11px] text-teal-600 font-bold">Almuerzos y snacks</p>
                </button>

                <button
                  onClick={() => setShowJustificationModal(true)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                    ⏰
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Justificar Falta</h4>
                  <p className="text-[11px] text-slate-500">Mesa de tutoría</p>
                </button>
              </div>

              {/* Grid: Hoy en el Aula & Tareas Urgentes */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Schedule Today (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {getTodayDayFilter() !== 'Todos'
                          ? `Agenda de Hoy • ${getTodayDayFilter()}`
                          : `Agenda Escolar • Próxima Semana (${getTodayDayName()})`}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">Clases del Día</h3>
                    </div>
                    <button
                      onClick={() => handleOpenSchedule('Todos')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Ver Semana Completa →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {schedule.filter((s) => s.day === (getTodayDayFilter() !== 'Todos' ? getTodayDayFilter() : 'Lunes')).map((item, idx) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                          idx === 0 ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/10' : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            idx === 0 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx === 0 ? '▶' : `${idx + 1}`}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{item.course}</h4>
                              {idx === 0 && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md animate-pulse">
                                  En Curso
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.teacher} • <span className="font-semibold text-slate-700">{item.classroom}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                          <span className="font-mono text-xs font-black text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Tareas y Deberes Pendientes (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Entregas Pendientes
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1">Tareas por Hacer</h3>
                      </div>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                        {completedTasksCount}/{tasks.length} Listas
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(urgentTasks.length > 0 ? urgentTasks.slice(0, 2) : tasks.slice(0, 2)).map((t) => (
                        <div
                          key={t.id}
                          className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2 hover:border-amber-300 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              {t.course}
                            </span>
                            <span className={`text-[11px] font-bold ${
                              getDaysUntil(t.dueDate) === 'Mañana' || getDaysUntil(t.dueDate) === 'Hoy'
                                ? 'text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded-md animate-pulse'
                                : 'text-rose-600'
                            }`}>
                              Vence {t.dueDate} ({getDaysUntil(t.dueDate)})
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900">{t.title}</h4>
                          <p className="text-[11px] text-slate-600 line-clamp-2">{t.instructions}</p>

                          <div className="pt-2 border-t border-amber-200/60 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500">{t.teacher}</span>
                            <button
                              onClick={() => setSelectedTaskForSubmit(t)}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-black shadow-sm transition-all"
                            >
                              📤 Entregar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all text-center"
                    >
                      Ver todas las asignaciones escolares ({tasks.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Badges & Workshops Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Badges Preview */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Mis Medallas & Recompensas</h3>
                      <p className="text-xs text-slate-500">Insignias obtenidas por esfuerzo y puntualidad.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('badges')}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Ver todas ({badges.length}) →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {badges.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-center space-y-1.5 hover:border-amber-300 transition-colors"
                      >
                        <div className="text-3xl">{b.icon}</div>
                        <h4 className="text-xs font-black text-slate-900 truncate">{b.title}</h4>
                        <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          +{b.xp} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notices Preview */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">Mural de Avisos y Comunicados</h3>
                        {unreadNoticesCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-black text-[10px]">
                            {unreadNoticesCount} sin leer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Noticias pedagógicas y anuncios de tus profesores.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('notices')}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <span>Ver todos ({notices.length})</span>
                      <span>→</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {notices.slice(0, 3).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setSelectedNoticeForDetail(n);
                          if (!n.read) handleToggleNoticeRead(n.id);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:border-indigo-300 hover:shadow-sm space-y-1.5 ${
                          !n.read
                            ? 'bg-indigo-50/50 border-indigo-200'
                            : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{n.authorAvatar}</span>
                            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                              {n.tag}
                            </span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="No leído" />
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{n.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{n.title}</h4>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.text}</p>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                          <span>{n.author}</span>
                          <span className="text-indigo-600 font-bold hover:underline">Abrir aviso →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 1: HORARIO & AGENDA ESCOLAR
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'schedule' && (
            <div className="space-y-6 animate-fade-in">
              {/* Prominent Tomorrow Exam Banner */}
              {tasks.some((t) => t.id === 'exam-tomorrow' || (t.type === 'EXAM' && getDaysUntil(t.dueDate) === 'Mañana')) ? (
                (() => {
                  const tomorrowExam = tasks.find((t) => t.id === 'exam-tomorrow' || (t.type === 'EXAM' && getDaysUntil(t.dueDate) === 'Mañana')) || tasks[0];
                  return (
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-indigo-500/15 border-2 border-amber-300 shadow-md shadow-amber-500/5 space-y-3">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 flex-shrink-0 animate-bounce">
                            📝
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white tracking-wider animate-pulse">
                                ⚡ EXAMEN PROGRAMADO PARA MAÑANA (JUEVES)
                              </span>
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                Ponderación: 2x (40%)
                              </span>
                            </div>
                            <h3 className="text-base font-black text-slate-900">
                              {tomorrowExam.title}
                            </h3>
                            <p className="text-xs text-slate-700 font-medium">
                              Asignatura: <strong className="text-indigo-950 font-bold">{tomorrowExam.course}</strong> • Docente: <strong>{tomorrowExam.teacher}</strong> • Aula 101 (Primaria)
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-2">
                          <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md shadow-amber-500/30 animate-pulse">
                            🗓️ Fecha: Mañana ({tomorrowExam.dueDate})
                          </span>
                          <button
                            onClick={() => {
                              setSelectedDayFilter('Jueves');
                            }}
                            className="px-3 py-1 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold shadow-sm transition-all"
                          >
                            Ver en horario de Jueves →
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-white/80 backdrop-blur rounded-2xl border border-amber-200/80 text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-amber-600 font-black">📌 Temario e Indicaciones:</span>
                        <span>{tomorrowExam.instructions || 'Operaciones combinadas y ecuaciones de primer grado. Traer regla, lápiz 2B y borrador.'}</span>
                      </div>
                    </div>
                  );
                })()
              ) : upcomingEvaluation ? (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl p-2 bg-white rounded-xl shadow-sm border border-indigo-100">
                      {upcomingEvaluation.type === 'EXAM' ? '📝' : upcomingEvaluation.type === 'QUIZ' ? '📊' : '📌'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                          {upcomingEvaluation.type === 'EXAM' ? 'EXAMEN' : upcomingEvaluation.type === 'QUIZ' ? 'PRÁCTICA' : 'EVALUACIÓN'}
                        </span>
                        <h3 className="text-sm font-bold text-indigo-950">
                          Próxima Evaluación: {upcomingEvaluation.title}
                        </h3>
                      </div>
                      <p className="text-xs text-indigo-700 mt-0.5">
                        {upcomingEvaluation.course} • Fecha: <strong className="underline">{upcomingEvaluation.dueDate}</strong> con <strong>{upcomingEvaluation.teacher}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg shadow-sm ${
                      getDaysUntil(upcomingEvaluation.dueDate) === 'Mañana' || getDaysUntil(upcomingEvaluation.dueDate) === 'Hoy'
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-indigo-600 text-white'
                    }`}>
                      {getDaysUntil(upcomingEvaluation.dueDate)}
                    </span>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline px-2 py-1"
                    >
                      Ver temario
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Schedule Main Table Card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Horario de Clases Semanal</h2>
                    <p className="text-xs text-slate-500">1er Grado de Primaria • Sección A • Turno Mañana (08:00 - 13:30)</p>
                  </div>

                  {/* Day filter buttons */}
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                    {['Todos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day) => {
                      const isToday = day !== 'Todos' && normalizeDay(getTodayDayFilter()) === normalizeDay(day);
                      const isTomorrow = day === 'Jueves';
                      const isSelected = normalizeDay(selectedDayFilter) === normalizeDay(day);
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDayFilter(day)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-white text-indigo-600 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>{day}</span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Día actual" />
                          )}
                          {isTomorrow && (
                            <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full shadow-xs">
                              Examen
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSchedule.map((item) => {
                    const classExams = tasks.filter((t) =>
                      t.status === 'PENDIENTE' &&
                      (t.type === 'EXAM' || t.title.toLowerCase().includes('examen')) &&
                      (t.course.toLowerCase().includes(item.course.toLowerCase()) || item.course.toLowerCase().includes(t.course.toLowerCase()))
                    );

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border border-l-4 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-colors ${item.color}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                              {item.day} • {item.time}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 mt-1">{item.course}</h3>
                            <p className="text-xs text-slate-600">{item.teacher}</p>
                          </div>
                        </div>

                        {classExams.length > 0 && (
                          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-base">📝</span>
                              <div>
                                <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                  Examen Programado
                                </span>
                                <p className="text-xs font-bold text-rose-950 mt-0.5">{classExams[0].title}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-rose-700 bg-white border border-rose-200 px-2 py-0.5 rounded-md">
                              {getDaysUntil(classExams[0].dueDate)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                          <span className="text-slate-700 font-medium flex items-center gap-1.5">
                            <span className="text-indigo-500">📍</span>
                            {item.classroom}
                          </span>
                          <span className="text-slate-500 font-semibold">{item.area}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Integrated Calendar / Evaluation Schedule for the Term */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">📅</span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Calendario de Evaluaciones y Exámenes</h3>
                      <p className="text-xs text-slate-500">Fechas oficiales programadas por los docentes para el I Bimestre</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                    I Bimestre 2026
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                        Mañana • Jueves
                      </span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                        Examen Mensual
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Álgebra y Ecuaciones Lineales</h4>
                    <p className="text-[11px] text-slate-600">Prof. Elena Torres • Aula 101 • 08:00 AM</p>
                    <div className="pt-2 border-t border-amber-200/70 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Puntaje: 20 pts (Peso 2x)</span>
                      <span className="font-bold text-amber-800">PENDIENTE</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                        Próxima Semana
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        Práctica Calificada
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Comprensión Lectora y Gramática</h4>
                    <p className="text-[11px] text-slate-600">Prof. Miguel Ángel Vega • Aula 101</p>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Puntaje: 20 pts (Peso 1x)</span>
                      <span className="font-bold text-slate-700">PROGRAMADA</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                        Fin de Bimestre
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Feria Científica
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Proyecto de Ciencias y Fotosíntesis</h4>
                    <p className="text-[11px] text-slate-600">Prof. Carmen Quispe • Lab 1</p>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Puntaje: 20 pts (Peso 1.5x)</span>
                      <span className="font-bold text-emerald-700">ASIGNADO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 2: LIBRETA & CALIFICACIONES
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'grades' && (
            <div className="space-y-6 animate-fade-in">
              {/* Educational Model Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Vista de Reporte Académico</h3>
                  <p className="text-xs text-slate-800 font-medium">Elige la modalidad para consultar el progreso oficial del estudiante.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setReportCardView('cneb')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      reportCardView === 'cneb'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🌱 CNEB (Competencias & Conclusiones)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportCardView('preu')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      reportCardView === 'preu'
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🎯 Simulacros Pre-U & Rankings
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportCardView('vigesimal')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      reportCardView === 'vigesimal'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📐 Secundaria Vigesimal (0-20)
                  </button>
                </div>
              </div>

              {/* VIEW 1: CNEB COMPETENCIES & DESCRIPTIVE CONCLUSIONS */}
              {reportCardView === 'cneb' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md uppercase tracking-wider">
                          Informe de Progreso CNEB
                        </span>
                        <h2 className="text-lg font-bold text-slate-900">Evaluación del Desarrollo de Competencias</h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Escala Literal Oficial: AD (Destacado), A (Esperado), B (En Proceso), C (En Inicio).</p>
                    </div>
                    <button
                      onClick={() => addToast('Informe CNEB descargado en formato oficial.', 'success', '📥')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                    >
                      <span>📥 Descargar Informe CNEB (PDF)</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3.5">Área Curricular</th>
                          <th className="px-6 py-3.5">Competencia Evaluada</th>
                          <th className="px-6 py-3.5 text-center">Nivel de Logro</th>
                          <th className="px-6 py-3.5">Conclusión Descriptiva / Evidencia Pedagógica</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        <tr>
                          <td className="px-6 py-4 font-bold text-slate-900">Matemática</td>
                          <td className="px-6 py-4 text-xs text-slate-700">Resuelve problemas de cantidad</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs border border-emerald-200">
                              AD
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 italic">
                            "El estudiante demuestra un nivel destacado en la resolución de problemas numéricos, formula hipótesis y argumenta sus procedimientos con solidez."
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-bold text-slate-900">Comunicación</td>
                          <td className="px-6 py-4 text-xs text-slate-700">Lee diversos tipos de textos en su lengua materna</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-black text-xs border border-blue-200">
                              A
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 italic">
                            "Infiere información relevante a partir del texto leído y explica el propósito comunicativo de la obra literaria."
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-bold text-slate-900">Ciencia y Tecnología</td>
                          <td className="px-6 py-4 text-xs text-slate-700">Indaga mediante métodos científicos para construir conocimientos</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs border border-emerald-200">
                              AD
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 italic">
                            "Formula preguntas investigables, diseña estrategias experimentales y sustenta conclusiones con datos empíricos."
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-bold text-slate-900">Personal Social</td>
                          <td className="px-6 py-4 text-xs text-slate-700">Convive y participa democráticamente en la búsqueda del bien común</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs border border-emerald-200">
                              AD
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 italic">
                            "Muestra empatía, liderazgo colaborativo y respeto continuo por las normas de convivencia del aula."
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: PRE-UNIVERSITY MOCK EXAMS & ADMISSION LEADERBOARD */}
              {reportCardView === 'preu' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card title="Puesto en Ranking General" subtitle="Ciclo Anual Pre-U 2026">
                      <p className="text-3xl font-black text-violet-600">#1 <span className="text-xs text-slate-400 font-semibold">de 420 postulantes</span></p>
                    </Card>
                    <Card title="Puntaje Último Simulacro" subtitle="DECO 100 Preguntas (UNMSM)">
                      <p className="text-3xl font-black text-emerald-600">1588.75 <span className="text-xs text-slate-400 font-semibold">/ 2000 pts</span></p>
                    </Card>
                    <Card title="Percentil Académico" subtitle="Área de Ciencias e Ingeniería">
                      <p className="text-3xl font-black text-indigo-600">98.5%</p>
                    </Card>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-violet-50/30">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Historial de Simulacros de Admisión</h2>
                        <p className="text-xs text-slate-500">Fórmula San Marcos / UNI: +20 por acierto • -1.125 por error • 0 en blanco.</p>
                      </div>
                      <button
                        onClick={() => addToast('Cuadro de mérito exportado en Excel.', 'success', '📊')}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                      >
                        <span>📥 Exportar Resultados (Excel)</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3.5">Simulacro</th>
                            <th className="px-6 py-3.5">Fecha</th>
                            <th className="px-6 py-3.5 text-center">Correctas</th>
                            <th className="px-6 py-3.5 text-center">Incorrectas</th>
                            <th className="px-6 py-3.5 text-center">En Blanco</th>
                            <th className="px-6 py-3.5 text-center">Puntaje Final</th>
                            <th className="px-6 py-3.5 text-center">Puesto</th>
                            <th className="px-6 py-3.5 text-right">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          <tr>
                            <td className="px-6 py-4 font-bold text-slate-900">Simulacro Dominical N° 4 (DECO General)</td>
                            <td className="px-6 py-4 text-xs text-slate-500">19 Abr 2026</td>
                            <td className="px-6 py-4 text-center font-bold text-emerald-600">82</td>
                            <td className="px-6 py-4 text-center font-bold text-rose-600">10</td>
                            <td className="px-6 py-4 text-center text-slate-400">8</td>
                            <td className="px-6 py-4 text-center font-black text-slate-900 text-base">1588.75</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2.5 py-1 bg-violet-100 text-violet-800 rounded-full font-black text-xs">
                                #1 (98.5%)
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200">
                                ✓ Vacante Asegurada
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 3: SECUNDARIA VIGESIMAL (0 - 20) */}
              {reportCardView === 'vigesimal' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Libreta Oficial de Calificaciones</h2>
                      <p className="text-xs text-slate-500">Año Lectivo 2026 • I Bimestre • Escala Oficial Vigesimal (0 a 20)</p>
                    </div>
                    <button
                      onClick={() => addToast('Libreta oficial generada en formato PDF.', 'success', '📄')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                    >
                      <span>📥 Descargar Boleta Oficial (PDF)</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3.5">Asignatura</th>
                          <th className="px-6 py-3.5">Área Curricular</th>
                          <th className="px-6 py-3.5">Docente</th>
                          <th className="px-6 py-3.5">Nota Bimestre I</th>
                          <th className="px-6 py-3.5">Nivel de Logro</th>
                          <th className="px-6 py-3.5 text-right">Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {grades.map((course) => (
                          <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{course.courseName}</td>
                            <td className="px-6 py-4 text-xs text-slate-500">{course.area}</td>
                            <td className="px-6 py-4 text-xs text-slate-700">{course.teacher}</td>
                            <td className="px-6 py-4">
                              <span className="font-mono font-black text-indigo-700 text-base">{course.b1Score}</span>
                              <span className="text-xs text-slate-400"> / 20</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                course.level === 'AD'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : course.level === 'A'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {course.level === 'AD' ? '🌟 Logro Destacado' : course.level === 'A' ? '✅ Logro Esperado' : '⚠️ En Proceso'} ({course.level})
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedCourseForDetail(course)}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
                              >
                                🔍 Ver Evaluaciones
                              </button>
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
             TAB 3: TAREAS & GUÍAS DE TRABAJO
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Bandeja de Tareas y Asignaciones</h2>
                    <p className="text-xs text-slate-500">Envía tus entregables y revisa las observaciones de tus profesores.</p>
                  </div>

                  {/* Task status filter */}
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                    {(['TODAS', 'PENDIENTE', 'ENTREGADO', 'CALIFICADO'] as const).map((filterKey) => (
                      <button
                        key={filterKey}
                        onClick={() => setTaskFilter(filterKey)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          taskFilter === filterKey
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {filterKey === 'TODAS' ? 'Todas' : filterKey === 'PENDIENTE' ? 'Pendientes' : filterKey === 'ENTREGADO' ? 'Entregadas' : 'Calificadas'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            {t.course}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              t.status === 'PENDIENTE'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : t.status === 'ENTREGADO'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-3">{t.instructions}</p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>📅 Límite: {t.dueDate}</span>
                          <span className="font-semibold text-slate-700">{t.teacher}</span>
                        </div>

                        {t.status === 'PENDIENTE' ? (
                          <button
                            onClick={() => setSelectedTaskForSubmit(t)}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>📤 Subir Tarea</span>
                          </button>
                        ) : (
                          <div className="p-2 rounded-xl bg-slate-100 text-center text-xs font-bold text-slate-600">
                            {t.score ? `✓ Calificación: ${t.score} / 20` : '✓ Entregado a tiempo'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 4: ASISTENCIA DIARIA
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Asistencia Global" subtitle="I Bimestre 2026">
                  <p className="text-3xl font-black text-emerald-600">100%</p>
                </Card>
                <Card title="Días Asistidos" subtitle="Total del periodo">
                  <p className="text-3xl font-black text-indigo-600">42 Días</p>
                </Card>
                <Card title="Tardanzas / Faltas" subtitle="Sin incidencias">
                  <p className="text-3xl font-black text-slate-700">0 Registros</p>
                </Card>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Control de Puntualidad y Asistencia</h2>
                    <p className="text-xs text-slate-500">Registro biométrico y de tutoría de aula.</p>
                  </div>
                  <button
                    onClick={() => setShowJustificationModal(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                  >
                    <span>📝 Justificar Inasistencia</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5">Fecha</th>
                        <th className="px-6 py-3.5">Hora de Ingreso</th>
                        <th className="px-6 py-3.5">Estado</th>
                        <th className="px-6 py-3.5">Observación del Tutor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-900">Lunes 21 de Abril, 2026</td>
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">07:48 AM</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                            ✓ PRESENTE A TIEMPO
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">Ingreso regular por puerta principal.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-900">Viernes 18 de Abril, 2026</td>
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">07:50 AM</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                            ✓ PRESENTE A TIEMPO
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">Participación en formación cívica.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-900">Jueves 17 de Abril, 2026</td>
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">07:45 AM</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                            ✓ PRESENTE A TIEMPO
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">Ingreso puntual.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Justifications History Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📋</span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Historial de Justificaciones Enviadas</h3>
                      <p className="text-xs text-slate-500">Comprobantes y solicitudes remitidas a la mesa de tutoría.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                    {justifications.length} Registradas
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {justifications.map((j) => (
                    <div key={j.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">Fecha: {j.date}</span>
                          <span className="text-xs text-slate-400">• Enviado el {j.submissionDate}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            j.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            j.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {j.status === 'PENDING' ? '⏳ En Revisión por Tutoría' : j.status === 'APPROVED' ? '✓ Aprobada' : '✕ Observada'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-teal-900">{j.reason}</p>
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">{j.detail}</p>
                      </div>

                      {j.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewJustificationImage(j.imageUrl!)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-all self-end sm:self-center flex-shrink-0"
                        >
                          <span className="text-base">🖼️</span>
                          <span>Ver Comprobante</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 5: MEDALLAS & LOGROS (GAMIFICACIÓN)
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'badges' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-bold">
                    <span>🌟</span> Sistema de Logros Escolares
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black">Nivel 5: Explorador Destacado</h2>
                  <p className="text-xs text-amber-100">Has ganado {totalXp} puntos XP y 3 medallas de honor en San Cleo.</p>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-white/20 text-center flex-shrink-0">
                  <p className="text-[10px] uppercase font-bold text-amber-200">Próximo Nivel (Nivel 6)</p>
                  <p className="text-2xl font-black">{totalXp} / 600 XP</p>
                  <div className="w-32 bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-white h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      b.unlocked
                        ? 'bg-white border-amber-200 shadow-sm hover:shadow-md'
                        : 'bg-slate-100/70 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-4xl p-3 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm">
                        {b.icon}
                      </div>
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          b.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {b.unlocked ? '✓ Desbloqueada' : '🔒 En Progreso'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1">
                      <h4 className="text-base font-black text-slate-900">{b.title}</h4>
                      <p className="text-xs text-slate-500">{b.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400 font-medium">Progreso: {b.progress}</span>
                      <span className="text-amber-600">+{b.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 6: TALLERES & CLUBES EXTRACURRICULARES
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'workshops' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Talleres y Actividades Extracurriculares</h2>
                    <p className="text-xs text-slate-500">Inscríbete libremente en robótica, deportes, arte y clubes de ajedrez.</p>
                  </div>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                    {enrolledWorkshopsCount} talleres activos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workshops.map((w) => (
                    <div
                      key={w.id}
                      className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                        w.enrolled ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">{w.image}</span>
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              w.enrolled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {w.enrolled ? '✓ Inscrito' : `${w.vacancies} vacantes`}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900">{w.title}</h3>
                        <p className="text-xs text-slate-600">🗓️ {w.schedule}</p>
                        <p className="text-xs text-slate-500">👨‍🏫 Instructor: {w.instructor}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleWorkshop(w)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                          w.enrolled
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                      >
                        {w.enrolled ? 'Cancelar Inscripción' : 'Inscribirme en este Taller'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 7: AVISOS DEL AULA (Mural Interactivo Dinámico)
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'notices' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header KPIs & Actions */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">Mural Interactivo de Avisos & Comunicados</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black">
                        {notices.length} comunicados
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Comunicaciones oficiales de profesores, tutoría y dirección académica con confirmación de enterado.
                    </p>
                  </div>

                  {unreadNoticesCount > 0 && (
                    <button
                      onClick={handleMarkAllNoticesAsRead}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <span>✓✓</span>
                      <span>Marcar todos como leídos</span>
                    </button>
                  )}
                </div>

                {/* Filters and Categorization */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Status switcher */}
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                    <button
                      onClick={() => setNoticeStatusFilter('TODOS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        noticeStatusFilter === 'TODOS'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Todos ({notices.length})
                    </button>
                    <button
                      onClick={() => setNoticeStatusFilter('NO_LEIDOS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        noticeStatusFilter === 'NO_LEIDOS'
                          ? 'bg-white text-rose-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Sin Leer</span>
                      {unreadNoticesCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                          {unreadNoticesCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setNoticeStatusFilter('ENTERADOS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        noticeStatusFilter === 'ENTERADOS'
                          ? 'bg-white text-emerald-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Confirmados ({notices.filter((n) => n.acknowledged).length})
                    </button>
                  </div>

                  {/* Category Tag pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {['Todos', 'Materiales', 'Evaluaciones', 'Académico', 'Celebración', 'Tutoría', 'General'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setNoticeTagFilter(tag)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                          noticeTagFilter.toLowerCase() === tag.toLowerCase()
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notices List */}
                <div className="space-y-4 pt-2">
                  {filteredNotices.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <div className="text-4xl">📭</div>
                      <p className="text-sm font-bold text-slate-600">No hay comunicados con los filtros seleccionados</p>
                      <p className="text-xs">Prueba seleccionando otra categoría o limpiando la barra de búsqueda.</p>
                    </div>
                  ) : (
                    filteredNotices.map((n) => (
                      <div
                        key={n.id}
                        className={`p-5 rounded-3xl border transition-all space-y-3.5 ${
                          !n.read
                            ? 'bg-indigo-50/40 border-indigo-200/90 shadow-sm'
                            : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        {/* Notice Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-100/70 border border-indigo-200 flex items-center justify-center text-2xl flex-shrink-0">
                              {n.authorAvatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-slate-900">{n.author}</h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                                  {n.authorRole}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                {n.course ? `${n.course} • ` : ''}Publicado el {n.date} a las {n.time}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                                n.tag === 'Materiales'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : n.tag === 'Evaluaciones'
                                  ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                  : n.tag === 'Celebración'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                  : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                              }`}
                            >
                              {n.tag}
                            </span>
                            {n.priority === 'alta' && (
                              <span className="text-[10px] font-black uppercase bg-rose-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                                Prioridad Alta
                              </span>
                            )}
                            {!n.read && (
                              <span className="text-[10px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded-md">
                                Nuevo
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Body */}
                        <div className="space-y-1.5">
                          <h3 className="text-base font-black text-slate-900 leading-snug">{n.title}</h3>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{n.text}</p>
                        </div>

                        {/* Attachment Preview if exists */}
                        {n.attachment && (
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl">📄</span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{n.attachment.name}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-mono">{n.attachment.size} • Documento oficial</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadNoticeAttachment(n.attachment!.name)}
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-xl text-xs font-black transition-colors flex items-center gap-1 flex-shrink-0 shadow-xs"
                            >
                              <span>📥</span>
                              <span>Descargar</span>
                            </button>
                          </div>
                        )}

                        {/* Interactive Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            {/* Like reaction button */}
                            <button
                              type="button"
                              onClick={() => handleToggleNoticeLike(n.id)}
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                                n.liked
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              <span>{n.liked ? '❤️' : '🤍'}</span>
                              <span>{n.likesCount}</span>
                            </button>

                            {/* Comments Counter / Opener */}
                            <button
                              type="button"
                              onClick={() => setSelectedNoticeForDetail(n)}
                              className="px-3 py-1.5 rounded-xl font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors flex items-center gap-1.5"
                            >
                              <span>💬</span>
                              <span>{n.comments.length} consultas</span>
                            </button>

                            {/* Toggle Read */}
                            <button
                              type="button"
                              onClick={() => handleToggleNoticeRead(n.id)}
                              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:underline px-2 py-1"
                            >
                              {n.read ? 'Marcar como no leído' : 'Marcar como leído'}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Acknowledgement Status / Action */}
                            {n.acknowledged ? (
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-xs flex items-center gap-1.5">
                                <span>✓</span>
                                <span>Enterado</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleConfirmNoticeAcknowledgement(n.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5"
                              >
                                <span>✓</span>
                                <span>Confirmar de Enterado</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedNoticeForDetail(n)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                            >
                              Ver Detalle →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────
             TAB 8: CAFETERÍA & TIENDA ESCOLAR
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'store' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-800/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-black text-emerald-200 uppercase tracking-wider">
                        Comedor & Cafetería Escolar
                      </span>
                      <span className="px-3 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-[11px] font-bold text-teal-300">
                        Convenio San Cleo
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Cafetería Nutritiva & Tienda del Alumno
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                      Reserva tu almuerzo escolar balanceado del día, snacks saludables, jugos naturales o uniformes y útiles oficiales.
                    </p>
                  </div>

                  {/* Cart Action Button */}
                  <button
                    type="button"
                    onClick={() => setShowCartDrawer(true)}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2.5 self-start sm:self-center flex-shrink-0"
                  >
                    <span className="text-base">🛍️</span>
                    <span>Mi Bandeja de Pedido ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                    <span className="bg-emerald-950 text-white px-2 py-0.5 rounded-lg text-[10px] font-mono">
                      S/. {cartTotal.toFixed(2)}
                    </span>
                  </button>
                </div>

                {/* Service Info Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-center">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                    <p className="text-[10px] uppercase font-bold text-emerald-300">Horario de Atención</p>
                    <p className="text-sm font-black text-white mt-0.5">07:30 AM - 04:00 PM</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                    <p className="text-[10px] uppercase font-bold text-teal-300">Forma de Pago</p>
                    <p className="text-sm font-black text-teal-200 mt-0.5">Cuenta Familiar / Yape</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                    <p className="text-[10px] uppercase font-bold text-amber-300">Entrega de Almuerzos</p>
                    <p className="text-sm font-black text-amber-200 mt-0.5">13:00 - 14:00 hrs</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                    <p className="text-[10px] uppercase font-bold text-blue-300">Mis Pedidos</p>
                    <p className="text-sm font-black text-blue-200 mt-0.5">{studentOrders.length} orden(es)</p>
                  </div>
                </div>
              </div>

              {/* Category Filter Toolbar & Search */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setStoreCategory('ALL')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      storeCategory === 'ALL'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Todos ({storeProducts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoreCategory('MENU')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      storeCategory === 'MENU'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🍽️ Menú Escolar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoreCategory('CAFETERIA')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      storeCategory === 'CAFETERIA'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🥤 Jugos & Bebidas
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoreCategory('SNACKS')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      storeCategory === 'SNACKS'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🥪 Snacks del Recreo
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoreCategory('UTILES')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      storeCategory === 'UTILES'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📚 Útiles & Uniformes
                  </button>
                </div>

                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    placeholder="🔍 Buscar producto, plato o útil..."
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  {storeSearch && (
                    <button
                      onClick={() => setStoreSearch('')}
                      className="absolute right-2.5 top-1.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Product Catalog Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredStoreProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl shadow-xs">
                          {prod.icon}
                        </div>
                        {prod.badge && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {prod.badge}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{prod.code}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {prod.category === 'MENU' ? 'Almuerzo' : prod.category === 'CAFETERIA' ? 'Bebida' : prod.category === 'SNACKS' ? 'Snack' : 'Útiles'}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm mt-1 leading-snug group-hover:text-emerald-700 transition-colors">
                          {prod.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Precio</span>
                        <span className="text-base font-black text-slate-900 font-mono">
                          S/. {prod.price.toFixed(2)}
                        </span>
                      </div>

                      {prod.options ? (
                        <button
                          type="button"
                          onClick={() => handleOpenProductForCustomization(prod)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <span>⚙️</span>
                          <span>Elegir Opciones</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToCartDirect(prod)}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <span>➕</span>
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order History Section */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📋</span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Mis Pedidos & Consumos Escolares</h3>
                      <p className="text-xs text-slate-500">Historial de órdenes emitidas para el comedor y cafetería del colegio.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {studentOrders.length} Pedidos Registrados
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {studentOrders.map((ord) => (
                    <div key={ord.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-slate-900">{ord.code}</span>
                          <span className="text-xs text-slate-400">• {ord.date} a las {ord.time}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            ord.status === 'PREPARING' ? 'bg-amber-100 text-amber-800' :
                            ord.status === 'READY_PICKUP' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {ord.status === 'PREPARING' ? '⏳ En Preparación' : ord.status === 'READY_PICKUP' ? '✓ Listo para Recoger' : '📦 Entregado'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">
                          {ord.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          📍 Lugar de Entrega: <strong className="text-slate-600">{ord.pickupLocation}</strong> • Pago: <strong className="text-slate-600">{ord.paymentMethod === 'FAMILY_ACCOUNT' ? 'Cuenta Familiar Apoderado' : ord.paymentMethod === 'YAPE_PLIN' ? 'Yape / Plin' : ord.paymentMethod === 'CARD' ? 'Tarjeta' : 'Directo en Caja'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="font-mono font-black text-sm text-slate-900">
                          S/. {ord.total.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReceiptOrder(ord);
                            setShowReceiptModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <span>🧾</span>
                          <span>Ver Boleta</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ────────────────────────────────────────────────────────────
         MODALS
         ──────────────────────────────────────────────────────────── */}

      {/* Task Submission Modal */}
      {selectedTaskForSubmit && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {selectedTaskForSubmit.course}
                </span>
                <h3 className="text-lg font-black mt-1">{selectedTaskForSubmit.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTaskForSubmit(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <p className="font-bold text-slate-800 mb-1">Instrucciones del Docente ({selectedTaskForSubmit.teacher}):</p>
              <p>{selectedTaskForSubmit.instructions}</p>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Adjuntar Archivo o Foto del Cuaderno
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 cursor-pointer bg-slate-50 transition-colors">
                  <span className="text-3xl block mb-1">📁</span>
                  <p className="text-xs font-bold text-slate-700">Arrastra tu archivo PDF, Word o foto aquí</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tamaño máximo: 25 MB</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nota o Comentario para el Profesor (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Profesor, adjunto el desarrollo de los 10 ejercicios..."
                  value={taskSubmissionNote}
                  onChange={(e) => setTaskSubmissionNote(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForSubmit(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/30"
                >
                  Confirmar Entrega 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Justification Modal */}
      {showJustificationModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                  Tutoría & Asistencia
                </span>
                <h3 className="text-lg font-black mt-1">Justificación de Inasistencia o Tardanza</h3>
              </div>
              <button
                onClick={() => setShowJustificationModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJustificationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Fecha de Inasistencia
                </label>
                <input
                  type="date"
                  required
                  value={justificationForm.date}
                  onChange={(e) => setJustificationForm({ ...justificationForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Motivo Principal
                </label>
                <select
                  value={justificationForm.reason}
                  onChange={(e) => setJustificationForm({ ...justificationForm, reason: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                >
                  <option value="Cita Médica Pediátrica">Cita Médica / Salud</option>
                  <option value="Motivos Familiares de Fuerza Mayor">Motivos Familiares</option>
                  <option value="Competencia Deportiva Institucional">Representación Escolar</option>
                  <option value="Problemas de Transporte">Problemas de Transporte</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Explicación o Detalle
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detallar el motivo y especificar horario o tratamiento..."
                  value={justificationForm.detail}
                  onChange={(e) => setJustificationForm({ ...justificationForm, detail: e.target.value })}
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Image Attachment Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                  <span>📷 Adjuntar Imagen o Certificado Médico</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">(opcional • JPG, PNG, WEBP)</span>
                </label>

                {justificationForm.imageUrl ? (
                  <div className="relative border border-teal-200 bg-teal-50/50 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0 relative group">
                      <img
                        src={justificationForm.imageUrl}
                        alt="Comprobante"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{justificationForm.imageName || 'comprobante_adjunto.jpg'}</p>
                      <p className="text-[10px] text-teal-700 font-medium flex items-center gap-1">
                        <span>✓</span> Imagen lista para enviar
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveJustificationImage}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors"
                      title="Eliminar imagen"
                    >
                      ✕ Quitar
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all block group">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleJustificationImageChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-1.5 text-slate-500 group-hover:text-teal-700">
                      <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
                      <p className="text-xs font-bold">Haz clic para subir foto del certificado o receta médica</p>
                      <p className="text-[10px] text-slate-400">Archivos PNG, JPG o WEBP hasta 5MB</p>
                    </div>
                  </label>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJustificationModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/30"
                >
                  Enviar Justificación 📨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Justification Image Lightbox Modal */}
      {previewJustificationImage && (
        <div
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewJustificationImage(null)}
        >
          <div
            className="bg-white rounded-3xl p-4 max-w-2xl w-full shadow-2xl space-y-3 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">🖼️</span>
                <h3 className="text-sm font-black text-slate-900">Comprobante Adjunto de Justificación</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewJustificationImage(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 max-h-[70vh] flex items-center justify-center">
              <img
                src={previewJustificationImage}
                alt="Comprobante ampliado"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setPreviewJustificationImage(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Grade Details Modal */}
      {selectedCourseForDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {selectedCourseForDetail.area}
                </span>
                <h3 className="text-lg font-black mt-1">{selectedCourseForDetail.courseName}</h3>
                <p className="text-xs text-slate-500">Docente: {selectedCourseForDetail.teacher}</p>
              </div>
              <button
                onClick={() => setSelectedCourseForDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Nota Bimestre I</p>
                <p className="text-2xl font-black text-indigo-600">{selectedCourseForDetail.b1Score} / 20</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs border border-emerald-200">
                Logro Destacado ({selectedCourseForDetail.level})
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Desglose de Evaluaciones</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                {selectedCourseForDetail.evaluations.map((ev, i) => (
                  <div key={i} className="p-3 bg-white flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{ev.name}</p>
                      <p className="text-[10px] text-slate-400">{ev.date}</p>
                    </div>
                    <span className="font-mono font-black text-indigo-700">{ev.score} / 20</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <p className="font-bold text-slate-800 mb-0.5">Comentario del Docente:</p>
              <p className="italic">"{selectedCourseForDetail.teacherFeedback}"</p>
            </div>

            <button
              onClick={() => setSelectedCourseForDetail(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}

      {/* Notice Detail & Discussion Modal */}
      {selectedNoticeForDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 text-slate-900 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-3xl">
                  {selectedNoticeForDetail.authorAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">{selectedNoticeForDetail.author}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                      {selectedNoticeForDetail.authorRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedNoticeForDetail.date} • {selectedNoticeForDetail.time}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNoticeForDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 border-y border-slate-100 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                  {selectedNoticeForDetail.tag}
                </span>
                {selectedNoticeForDetail.course && (
                  <span className="text-xs text-slate-500 font-semibold">
                    Curso: {selectedNoticeForDetail.course}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-slate-900 leading-snug">
                {selectedNoticeForDetail.title}
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {selectedNoticeForDetail.text}
              </p>
            </div>

            {/* Attachment section */}
            {selectedNoticeForDetail.attachment && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📑</span>
                  <div>
                    <p className="text-xs font-bold text-indigo-950">{selectedNoticeForDetail.attachment.name}</p>
                    <p className="text-[10px] text-indigo-600 font-mono">{selectedNoticeForDetail.attachment.size} • PDF Oficial</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadNoticeAttachment(selectedNoticeForDetail!.attachment!.name)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors"
                >
                  Descargar 📥
                </button>
              </div>
            )}

            {/* Acknowledgement banner inside modal */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Acuse de Recibo del Alumno</h4>
                <p className="text-[11px] text-slate-500">
                  {selectedNoticeForDetail.acknowledged
                    ? '✓ Has confirmado estar enterado de este comunicado oficial.'
                    : 'Confirma la lectura para que tu docente y tutor registren tu recepción.'}
                </p>
              </div>
              {selectedNoticeForDetail.acknowledged ? (
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black border border-emerald-200">
                  ✓ Confirmado
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConfirmNoticeAcknowledgement(selectedNoticeForDetail.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
                >
                  Confirmar de Enterado ✓
                </button>
              )}
            </div>

            {/* Questions / Comments Thread */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Consultas y Comentarios ({selectedNoticeForDetail.comments.length})</span>
                <span className="text-[10px] text-slate-400 font-normal">Visible para profesor y compañeros</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedNoticeForDetail.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No hay comentarios aún. Sé el primero en consultar.</p>
                ) : (
                  selectedNoticeForDetail.comments.map((com) => (
                    <div key={com.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-2.5 text-xs">
                      <span className="text-lg">{com.avatar}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{com.author}</span>
                          <span className="text-[10px] text-slate-400">{com.time}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{com.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment form */}
              <form onSubmit={(e) => handleAddNoticeComment(selectedNoticeForDetail.id, e)} className="flex gap-2">
                <input
                  type="text"
                  value={newNoticeComment}
                  onChange={(e) => setNewNoticeComment(e.target.value)}
                  placeholder="Escribe una pregunta o duda al profesor..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                />
                <button
                  type="submit"
                  disabled={!newNoticeComment.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-colors"
                >
                  Enviar
                </button>
              </form>
            </div>

            <button
              onClick={() => setSelectedNoticeForDetail(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}

      {/* Drawer: Shopping Cart & Order Checkout */}
      {showCartDrawer && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex justify-end text-slate-900">
          <div className="bg-white max-w-md w-full h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-fade-in">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-black">
                    🛍️
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Bandeja de Pedido</h3>
                    <p className="text-xs text-slate-400">{cart.reduce((a, b) => a + b.quantity, 0)} productos seleccionados</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <span className="text-4xl block">🥪</span>
                  <p className="text-sm font-bold text-slate-700">Tu bandeja de pedido está vacía</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Explora el menú escolar balanceado, bebidas nutritivas o útiles y agrégalos a tu pedido.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 divide-y divide-slate-100">
                  {cart.map((item, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.product.icon}</span>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 leading-snug">{item.product.name}</h4>
                            <span className="text-[11px] font-mono font-bold text-slate-500">
                              S/. {item.product.price.toFixed(2)} c/u
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(idx, -1)}
                              className="w-6 h-6 flex items-center justify-center font-black text-slate-700 hover:bg-white rounded text-xs"
                            >
                              -
                            </button>
                            <span className="w-7 text-center text-xs font-black">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(idx, 1)}
                              className="w-6 h-6 flex items-center justify-center font-black text-slate-700 hover:bg-white rounded text-xs"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCartItem(idx)}
                            className="text-slate-400 hover:text-rose-600 text-xs p-1"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Customized choices list */}
                      {item.selectedOptions && (
                        <div className="bg-slate-50 p-2 rounded-xl text-[11px] text-slate-600 space-y-0.5 font-medium">
                          {item.selectedOptions.entree && <p>• Entrada: <strong>{item.selectedOptions.entree}</strong></p>}
                          {item.selectedOptions.main && <p>• Fondo: <strong>{item.selectedOptions.main}</strong></p>}
                          {item.selectedOptions.drink && <p>• Bebida: <strong>{item.selectedOptions.drink}</strong></p>}
                          {item.selectedOptions.dessert && <p>• Postre: <strong>{item.selectedOptions.dessert}</strong></p>}
                          {item.selectedOptions.notes && <p className="text-amber-700 italic">• Obs: "{item.selectedOptions.notes}"</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Method Selector */}
              {cart.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      💳 Modalidad de Pago Escolar
                    </label>
                    <div className="space-y-1.5">
                      <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        orderPaymentMethod === 'FAMILY_ACCOUNT'
                          ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={orderPaymentMethod === 'FAMILY_ACCOUNT'}
                          onChange={() => setOrderPaymentMethod('FAMILY_ACCOUNT')}
                          className="text-emerald-600"
                        />
                        <div className="text-xs">
                          <span className="block font-black">👨‍👩‍👧 Cuenta Familiar del Apoderado (Recomendado)</span>
                          <span className="text-[10px] text-slate-500 font-normal">Se notifica y aprueba desde el Portal de Padres.</span>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        orderPaymentMethod === 'YAPE_PLIN'
                          ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={orderPaymentMethod === 'YAPE_PLIN'}
                          onChange={() => setOrderPaymentMethod('YAPE_PLIN')}
                          className="text-emerald-600"
                        />
                        <div className="text-xs">
                          <span className="block font-black">📲 Yape / Plin</span>
                          <span className="text-[10px] text-slate-500 font-normal">Genera código QR de pago inmediato en el celular.</span>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        orderPaymentMethod === 'COUNTER'
                          ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={orderPaymentMethod === 'COUNTER'}
                          onChange={() => setOrderPaymentMethod('COUNTER')}
                          className="text-emerald-600"
                        />
                        <div className="text-xs">
                          <span className="block font-black">💵 Pago en Counter de Cafetería</span>
                          <span className="text-[10px] text-slate-500 font-normal">Pago en efectivo al momento de recoger en el recreo.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Pickup Location Info */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-0.5">📍 Punto de Entrega:</span>
                    <span className="text-slate-600">Comedor Escolar - Mesa de Atención Primaria (13:15 a 14:00 hrs)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Total and Checkout Button */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3 mt-4">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono">S/. {(cartTotal / 1.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>IGV (18%)</span>
                    <span className="font-mono">S/. {(cartTotal - cartTotal / 1.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                    <span>Total a Pagar</span>
                    <span className="font-mono text-base text-emerald-700">S/. {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckoutOrder}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <span>🚀</span>
                  <span>Confirmar y Enviar Pedido</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Meal Customizer */}
      {showOrderModal && selectedProductForCustomization && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl">
                  {selectedProductForCustomization.icon}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedProductForCustomization.name}</h3>
                  <p className="text-xs text-emerald-700 font-mono font-bold">S/. {selectedProductForCustomization.price.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Entrees */}
              {selectedProductForCustomization.options?.entrees && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    🥗 1. Elige tu Entrada
                  </label>
                  <div className="space-y-1">
                    {selectedProductForCustomization.options.entrees.map((entree) => (
                      <label key={entree} className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        customEntree === entree ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="customEntree"
                          checked={customEntree === entree}
                          onChange={() => setCustomEntree(entree)}
                          className="text-emerald-600"
                        />
                        <span>{entree}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Mains */}
              {selectedProductForCustomization.options?.mains && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    🍗 2. Elige tu Segundo / Plato de Fondo
                  </label>
                  <div className="space-y-1">
                    {selectedProductForCustomization.options.mains.map((main) => (
                      <label key={main} className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        customMain === main ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="customMain"
                          checked={customMain === main}
                          onChange={() => setCustomMain(main)}
                          className="text-emerald-600"
                        />
                        <span>{main}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Drinks */}
              {selectedProductForCustomization.options?.drinks && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    🥤 3. Refresco Natural
                  </label>
                  <div className="space-y-1">
                    {selectedProductForCustomization.options.drinks.map((drink) => (
                      <label key={drink} className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        customDrink === drink ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="customDrink"
                          checked={customDrink === drink}
                          onChange={() => setCustomDrink(drink)}
                          className="text-emerald-600"
                        />
                        <span>{drink}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Desserts */}
              {selectedProductForCustomization.options?.desserts && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    🍮 4. Postre Escolar
                  </label>
                  <div className="space-y-1">
                    {selectedProductForCustomization.options.desserts.map((dessert) => (
                      <label key={dessert} className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        customDessert === dessert ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="customDessert"
                          checked={customDessert === dessert}
                          onChange={() => setCustomDessert(dessert)}
                          className="text-emerald-600"
                        />
                        <span>{dessert}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Special instructions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  📝 Notas o Preferencias Especiales (Alergias, sin ají, etc.)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sin ensalada con cebolla / Con limón extra..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-mono text-base font-black text-emerald-700">
                S/. {selectedProductForCustomization.price.toFixed(2)}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddToCartWithOptions}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
                >
                  Agregar a mi Bandeja 🛍️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Order Receipt / Comprobante de Compra */}
      {showReceiptModal && activeReceiptOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-black">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Comprobante de Pedido</h3>
                  <p className="text-xs text-slate-400 font-mono">{activeReceiptOrder.code}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Estudiante:</span>
                <span className="font-bold text-slate-900">{user ? `${user.firstName} ${user.lastName}` : 'Mateo García (1er Grado A)'}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Fecha y Hora:</span>
                <span className="font-bold text-slate-900">{activeReceiptOrder.date} - {activeReceiptOrder.time}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Punto de Entrega:</span>
                <span className="font-bold text-slate-900">{activeReceiptOrder.pickupLocation}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estado:</span>
                <span className="font-black text-emerald-700 uppercase">{activeReceiptOrder.status === 'PREPARING' ? 'En Preparación' : 'Listo para Recoger'}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-500">Detalle de Productos</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-3 bg-white space-y-2">
                {activeReceiptOrder.items.map((it, idx) => (
                  <div key={idx} className="pt-2 first:pt-0">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-mono">S/. {(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                    {it.details && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{it.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center text-sm font-black text-emerald-950">
              <span>Total Pagado:</span>
              <span className="font-mono text-base text-emerald-700">S/. {activeReceiptOrder.total.toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🖨️</span>
                <span>Imprimir Boleta</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL: PERFIL DEL ESTUDIANTE & EDICIÓN DE FOTO DE PERFIL
         ──────────────────────────────────────────────────────────── */}
      {showStudentProfileModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-black">
                  👤
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Perfil del Estudiante</h3>
                  <p className="text-xs text-slate-500">Datos institucionales y personalización de avatar.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowStudentProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded-xl hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Avatar Modification Section */}
            <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-violet-50/70 rounded-3xl p-5 border border-indigo-100/80 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Big Avatar Preview */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-400 p-1 shadow-lg shadow-indigo-500/20">
                    <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-white font-black text-2xl overflow-hidden">
                      {studentAvatarUrl ? (
                        studentAvatarUrl.startsWith('data:image') || studentAvatarUrl.startsWith('http') ? (
                          <img src={studentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">{studentAvatarUrl}</span>
                        )
                      ) : (
                        'MG'
                      )}
                    </div>
                  </div>

                  {studentAvatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center shadow-md transition-transform hover:scale-110"
                      title="Restablecer avatar a iniciales"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Upload & Actions */}
                <div className="flex-1 space-y-2.5 text-center sm:text-left">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Modificar Foto de Perfil</h4>
                    <p className="text-xs text-slate-500">Sube una foto propia o elige uno de los avatares divertidos.</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer transition-all flex items-center gap-1.5">
                      <span>📸</span>
                      <span>Subir Nueva Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>

                    {studentAvatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                      >
                        Quitar Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Preset Avatars Bar */}
              <div className="pt-3 border-t border-indigo-100/60 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  O elige un avatar rápido:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {['🚀', '🎓', '🦁', '🦊', '🤖', '🎨', '🔬', '⚽', '🌟', '🦄'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(emoji)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform hover:scale-125 border ${
                        studentAvatarUrl === emoji
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400'
                          : 'bg-white hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Student Information Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Información del Estudiante (MINEDU)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Estudiante</span>
                  <p className="font-black text-slate-900 text-sm">
                    {user ? `${user.firstName} ${user.lastName}` : 'Rodrigo García Morales'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Código de Matrícula</span>
                  <p className="font-mono font-bold text-indigo-700 text-sm">ALU-2026-001</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Grado y Sección</span>
                  <p className="font-bold text-slate-800">1er Grado Primaria • Sección A (Aula 101)</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Docente Tutor</span>
                  <p className="font-bold text-slate-800">Prof. Elena Torres Bellido</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Correo Institucional</span>
                  <p className="font-bold text-slate-800">alumno@sancleo.edu.pe</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Apoderado Responsable</span>
                  <p className="font-bold text-slate-800">Carlos García • 987 654 321</p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowStudentProfileModal(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/30 transition-all"
              >
                Guardar y Cerrar ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

const StudentPortalDashboard = dynamic(() => Promise.resolve(StudentPortalContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/30 animate-pulse">
          🎓
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-black tracking-tight">Portal del Estudiante</h3>
          <p className="text-xs text-slate-400">Cargando datos institucionales...</p>
        </div>
      </div>
    </div>
  ),
});

export default function Page() {
  return (
    <AuthProvider>
      <StudentPortalDashboard />
    </AuthProvider>
  );
}
