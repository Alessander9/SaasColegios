export interface StudentProfile {
  name: string;
  grade: string;
  points: number;
  notifications: number;
  avatar: string;
}

export interface ScheduleClass {
  id: string;
  start: string;
  end: string;
  subject: string;
  room: string;
  teacher: string;
  color: string;
  icon: string;
}

export interface PendingTask {
  id: string;
  subject: string;
  title: string;
  delivery: string;
  progress: number;
  color: string;
  icon: string;
}

export interface GradeItem {
  id: string;
  subject: string;
  score: number;
  comment: string;
  barPercentage: number;
  barColor: string;
  scoreColor: string;
}

export interface EventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  date: string;
  time: string;
  type: 'science' | 'student';
}

export interface QuickAccessItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgLight: string;
}

export const MOCK_PRIMARY_BOY_DATA = {
  student: {
    name: 'Mateo R.',
    fullName: 'Mateo Rodríguez',
    grade: '5° de Primaria',
    points: 150,
    notifications: 2,
    avatar: 'boy_cartoon_avatar',
  },
  dashboard: {
    progressPercentage: 78,
    weeklyChange: '+15%',
    pendingTasksCount: 3,
    studyStreakDays: 7,
  },
  schedule: [
    {
      id: 'sc-1',
      start: '08:00',
      end: '09:00',
      subject: 'Matemática',
      room: 'Aula 201',
      teacher: 'Prof. Carlos R.',
      color: '#1677F2',
      icon: 'calculator',
    },
    {
      id: 'sc-2',
      start: '09:00',
      end: '10:00',
      subject: 'Comunicación',
      room: 'Aula 202',
      teacher: 'Prof. Mariana S.',
      color: '#F53E42',
      icon: 'message-circle',
    },
    {
      id: 'sc-3',
      start: '10:20',
      end: '11:20',
      subject: 'Ciencia',
      room: 'Aula 203',
      teacher: 'Prof. Luis G.',
      color: '#3FB547',
      icon: 'flask-conical',
    },
    {
      id: 'sc-4',
      start: '11:20',
      end: '12:20',
      subject: 'Arte',
      room: 'Aula 204',
      teacher: 'Prof. Elena M.',
      color: '#7045E8',
      icon: 'palette',
    },
  ] as ScheduleClass[],
  tasks: [
    {
      id: 'task-1',
      subject: 'Matemática',
      title: 'Resolver ejercicios',
      delivery: 'Entrega: 24 may. • 11:59 p.m.',
      progress: 30,
      color: '#1677F2',
      icon: 'book-open',
    },
    {
      id: 'task-2',
      subject: 'Comunicación',
      title: 'Leer un cuento corto',
      delivery: 'Entrega: 25 may. • 11:59 p.m.',
      progress: 50,
      color: '#FF9A00',
      icon: 'message-square',
    },
    {
      id: 'task-3',
      subject: 'Ciencia',
      title: 'Dibuja el ciclo del agua',
      delivery: 'Entrega: 27 may. • 11:59 p.m.',
      progress: 10,
      color: '#42B748',
      icon: 'flask-conical',
    },
  ] as PendingTask[],
  grades: [
    {
      id: 'gr-1',
      subject: 'Matemática',
      score: 17,
      comment: '¡Excelente! 😎',
      barPercentage: 85,
      barColor: '#43B53E',
      scoreColor: '#43B53E',
    },
    {
      id: 'gr-2',
      subject: 'Comunicación',
      score: 16,
      comment: 'Muy bueno 👍',
      barPercentage: 80,
      barColor: '#31A4F2',
      scoreColor: '#1677F2',
    },
    {
      id: 'gr-3',
      subject: 'Ciencia',
      score: 15,
      comment: 'Muy bueno 🙂',
      barPercentage: 75,
      barColor: '#7548DC',
      scoreColor: '#1677F2',
    },
    {
      id: 'gr-4',
      subject: 'Arte',
      score: 18,
      comment: '¡Excelente! 🌟',
      barPercentage: 90,
      barColor: '#F49A00',
      scoreColor: '#FF8C00',
    },
    {
      id: 'gr-5',
      subject: 'Historia',
      score: 14,
      comment: 'Bueno 🙂',
      barPercentage: 70,
      barColor: '#F15C7D',
      scoreColor: '#F44336',
    },
  ] as GradeItem[],
  events: [
    {
      id: 'ev-1',
      day: '24',
      month: 'MAY',
      title: 'Feria de Ciencias EsCool',
      date: 'Viernes 24 de mayo',
      time: '9:00 a.m.',
      type: 'science',
    },
    {
      id: 'ev-2',
      day: '31',
      month: 'MAY',
      title: 'Día del Estudiante',
      date: 'Viernes 31 de mayo',
      time: '8:00 a.m.',
      type: 'student',
    },
  ] as EventItem[],
  streakDays: [
    { day: 'L', completed: true },
    { day: 'M', completed: true },
    { day: 'M', completed: true },
    { day: 'J', completed: true },
    { day: 'V', completed: true },
    { day: 'S', completed: true },
    { day: 'D', completed: false },
  ],
  quickAccess: [
    { id: 'qa-1', label: 'Juegos', icon: 'gamepad', color: '#46B93C', bgLight: '#EAF8E8' },
    { id: 'qa-2', label: 'Videos', icon: 'play', color: '#EF3D55', bgLight: '#FDECEE' },
    { id: 'qa-3', label: 'Biblioteca', icon: 'book', color: '#198BEF', bgLight: '#E7F3FE' },
    { id: 'qa-4', label: 'Simulacros', icon: 'clipboard', color: '#FFA000', bgLight: '#FFF5E5' },
    { id: 'qa-5', label: 'Diccionario', icon: 'book-a', color: '#187DE8', bgLight: '#E7F2FD' },
    { id: 'qa-6', label: 'Calculadora', icon: 'calculator', color: '#5D5CE6', bgLight: '#EFEFFF' },
    { id: 'qa-7', label: 'Foro escolar', icon: 'message', color: '#21B7C3', bgLight: '#E8F8FA' },
    { id: 'qa-8', label: 'Ayuda', icon: 'help', color: '#17AFC4', bgLight: '#E7F7FA' },
  ] as QuickAccessItem[],
};
