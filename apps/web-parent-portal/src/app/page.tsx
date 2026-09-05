'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { LoginModal } from '../components/login-modal';
import { checkoutOrder, getActivities, getMyOrders, getMyStudents, getProducts, login } from '../lib/api';

/* ────────────────────────────────────────────────────────────
   INTERFACES
   ──────────────────────────────────────────────────────────── */
interface ChildReport {
  id: string;
  name: string;
  gradeSection: string;
  code: string;
  attendancePercent: number;
  gpa: number;
  courses: Array<{ name: string; score: number; level: string }>;
  pendingBills: Array<{ concept: string; dueDate: string; amount: number }>;
  teacher: string;
  level: string;
  photo: string;
}

interface StoreProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

interface SchoolActivity {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  price: number;
  vacancies: number;
  requiresConsent: boolean;
  description: string;
}

interface ApiActivity {
  id: string;
  title: string;
  type: string;
  startDate: string;
  location?: string;
  price: number;
  maxCapacity: number;
  _count?: { registrations: number };
  requiresConsent: boolean;
}

interface ApiProduct {
  id: string;
  name: string;
  category?: { name: string };
  variants: Array<{ id: string; price: number; stock: number; name: string }>;
}

interface ApiStudent {
  id: string;
  firstName: string;
  lastName: string;
}

interface ParentOrder {
  id: string;
  code: string;
  status: string;
  totalAmount: number;
  placedAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  icon: string;
}

interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  fullText: string;
}

/* ────────────────────────────────────────────────────────────
   MOCK DATA
   ──────────────────────────────────────────────────────────── */
const CHILDREN: ChildReport[] = [
  {
    id: 'ch1',
    name: 'Rodrigo García Morales',
    gradeSection: '1er Grado Primaria - Sección A',
    code: 'ALU-2026-001',
    attendancePercent: 100,
    gpa: 18.5,
    teacher: 'Prof. Elena Torres',
    level: 'Primaria',
    photo: '👦',
    courses: [
      { name: 'Matemática y Aritmética', score: 18.5, level: 'AD (Destacado)' },
      { name: 'Comunicación Lectora', score: 19.0, level: 'AD (Destacado)' },
      { name: 'Ciencia y Ambiente', score: 18.0, level: 'AD (Destacado)' },
      { name: 'Personal Social', score: 17.0, level: 'A (Logrado)' },
      { name: 'Arte y Cultura', score: 19.5, level: 'AD (Destacado)' },
    ],
    pendingBills: [
      { concept: 'Pensión Abril 2026', dueDate: '2026-04-30', amount: 350.0 },
    ],
  },
  {
    id: 'ch2',
    name: 'Luciana García Morales',
    gradeSection: 'Nido 5 Años - Aula Azul',
    code: 'ALU-2026-002',
    attendancePercent: 98.0,
    gpa: 19.0,
    teacher: 'Prof. María Luz Soto',
    level: 'Nido',
    photo: '👧',
    courses: [
      { name: 'Psicomotricidad y Coordinación', score: 19.0, level: 'AD (Destacado)' },
      { name: 'Autonomía y Convivencia Temprana', score: 18.5, level: 'AD (Destacado)' },
      { name: 'Lenguaje y Expresión Artística', score: 18.0, level: 'AD (Destacado)' },
      { name: 'Exploración del Entorno', score: 20.0, level: 'AD (Destacado)' },
    ],
    pendingBills: [],
  },
  {
    id: 'ch3',
    name: 'Sebastián García Morales',
    gradeSection: 'Ciclo Anual Pre-U - Aula Decano',
    code: 'ALU-2026-088',
    attendancePercent: 97.5,
    gpa: 17.8,
    teacher: 'Prof. Carlos Ríos',
    level: 'Pre-U',
    photo: '🧑',
    courses: [
      { name: 'Simulacro DECO (100 Preguntas)', score: 18.0, level: 'Puesto #1 (1588.75 pts)' },
      { name: 'Física y Trigonometría Pre-U', score: 17.5, level: 'A (Logrado)' },
      { name: 'Razonamiento Verbal y Matemático', score: 18.5, level: 'AD (Destacado)' },
      { name: 'Historia Universal', score: 16.0, level: 'A (Logrado)' },
      { name: 'Biología y Química', score: 19.0, level: 'AD (Destacado)' },
    ],
    pendingBills: [],
  },
];

const STORE_PRODUCTS: StoreProduct[] = [
  { id: 'p1', name: 'Polo Oficial de Ed. Física (Talla 12)', category: 'Uniformes', price: 45.0, stock: 35, image: '👕' },
  { id: 'p2', name: 'Buzo Completo Institucional (Talla 12)', category: 'Uniformes', price: 120.0, stock: 20, image: '🏃' },
  { id: 'p3', name: 'Pack Cuadernos Institucionales A4 (x5)', category: 'Útiles', price: 35.0, stock: 150, image: '📚' },
  { id: 'p4', name: 'Libro de Matemática 1er Grado 2026', category: 'Libros', price: 85.0, stock: 40, image: '📖' },
  { id: 'p5', name: 'Mochila Oficial San Cleo (Grande)', category: 'Accesorios', price: 95.0, stock: 18, image: '🎒' },
  { id: 'p6', name: 'Agenda Escolar 2026 (Personalizada)', category: 'Útiles', price: 28.0, stock: 60, image: '📓' },
];

const SCHOOL_ACTIVITIES: SchoolActivity[] = [
  {
    id: 'act-1',
    title: 'Taller Extracurricular de Robótica Educativa',
    type: 'Taller',
    date: 'Todos los Sábados (Abril - Junio)',
    location: 'Laboratorio STEM (Pabellón B)',
    price: 80.0,
    vacancies: 12,
    requiresConsent: true,
    description: 'Los alumnos aprenderán programación básica con Arduino y Lego Mindstorms. Cupo limitado a 20 estudiantes. Incluye kit de materiales.',
  },
  {
    id: 'act-2',
    title: 'Visita de Estudio a la Granja Villa',
    type: 'Paseo Educativo',
    date: 'Viernes 25 de Abril, 08:30 AM',
    location: 'Granja Villa, Chorrillos, Lima',
    price: 65.0,
    vacancies: 8,
    requiresConsent: true,
    description: 'Paseo pedagógico de contacto con la naturaleza y fauna doméstica. Incluye transporte, almuerzo campestre y seguro estudiantil.',
  },
  {
    id: 'act-3',
    title: 'Torneo Interescolar de Ajedrez',
    type: 'Deportivo',
    date: 'Sábado 10 de Mayo, 09:00 AM',
    location: 'Coliseo Deportivo Central',
    price: 0.0,
    vacancies: 20,
    requiresConsent: true,
    description: 'Competencia por equipos entre los mejores colegios de Lima. Representación oficial de San Cleo. Uniforme institucional obligatorio.',
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    from: 'Dirección Académica',
    subject: '📋 Reunión de Padres - I Bimestre 2026',
    preview: 'Estimados padres de familia, los convocamos a la reunión...',
    date: '2026-04-28',
    read: false,
    fullText: 'Estimados padres de familia,\n\nLos convocamos a la reunión de padres correspondiente al I Bimestre 2026. La reunión se llevará a cabo el día Sábado 03 de Mayo de 2026 a las 09:00 AM en el Auditorio Principal (Pabellón A).\n\nTemas a tratar:\n• Entrega de libretas bimestrales\n• Resultados académicos generales\n• Plan de mejora por grado\n• Presentación de actividades extracurriculares del II Bimestre\n\nSu asistencia es indispensable para el seguimiento educativo de su hijo(a).\n\nAtentamente,\nMg. Carmen Vidal Ruiz\nDirectora Académica — Colegio San Cleo',
  },
  {
    id: 'msg-2',
    from: 'Prof. Elena Torres',
    subject: '⭐ Felicitaciones por logros de Mateo',
    preview: 'Me complace informarles que Mateo ha obtenido el primer puesto...',
    date: '2026-04-25',
    read: false,
    fullText: 'Estimados apoderados,\n\nMe complace comunicarles que Mateo García Morales ha obtenido el PRIMER PUESTO en el ranking académico de 1° Grado Primaria durante el I Bimestre 2026, con un promedio ponderado de 18.5 / 20.\n\nSu desempeño en las áreas de Comunicación y Arte ha sido excepcional. Ha demostrado gran autonomía, disciplina de estudio y habilidades socioemocionales muy desarrolladas para su edad.\n\nLes invito a continuar apoyando sus hábitos de lectura en casa.\n\nCon mucho cariño,\nProf. Elena Torres\nDocente de 1° Grado A — Colegio San Cleo',
  },
  {
    id: 'msg-3',
    from: 'Coordinación de Finanzas',
    subject: '💳 Recordatorio de Pago - Pensión Abril 2026',
    preview: 'Le recordamos que la pensión de Abril vence el 30...',
    date: '2026-04-22',
    read: true,
    fullText: 'Estimado(a) apoderado(a),\n\nLe recordamos que la pensión escolar del mes de Abril 2026 vence el día 30 de Abril de 2026.\n\nMonto a pagar: S/. 350.00\nConcepto: Pensión Escolar Abril 2026\nEstudiante: Mateo García Morales — ALU-2026-001\n\nMétodos de pago aceptados:\n• Pago en línea a través de este portal (Visa / Mastercard)\n• Transferencia bancaria al BCP Cta. 193-12345678-0-31\n• Ventanilla del colegio (Lunes a Viernes, 08:00 - 13:00 hrs)\n\nLe pedimos puntualidad para evitar recargos por mora.\n\nAtentamente,\nCoordinación de Finanzas\nColegio San Cleo',
  },
];

/* ────────────────────────────────────────────────────────────
   TOAST COMPONENT
   ──────────────────────────────────────────────────────────── */
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
        const barColors = {
          success: 'bg-emerald-500',
          error: 'bg-red-500',
          info: 'bg-blue-500',
          warning: 'bg-amber-500',
        };
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-xl shadow-black/10 backdrop-blur-xl ${colors[toast.type]} animate-[slideInFromRight_0.3s_ease-out]`}
            style={{ animation: 'slideInRight 0.25s ease-out' }}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{toast.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-snug">{toast.message}</p>
              <div className={`mt-2 h-1 rounded-full ${barColors[toast.type]} opacity-40`} style={{ width: '100%' }} />
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity text-xs font-bold mt-0.5 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MODAL COMPONENT
   ──────────────────────────────────────────────────────────── */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      <div
        className={`relative w-full ${sizes[size]} bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.2s ease-out' }}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-base font-black text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */
function ParentPortalContent() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auth
  const [email, setEmail] = useState('padre.garcia@email.com');
  const [password, setPassword] = useState('Cole2026!');
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cole_parent_auth') === 'true' || Boolean(localStorage.getItem('cole_access_token'));
    }
    return false;
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'academics' | 'store' | 'activities' | 'messages'>('home');
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Remote data
  const [activities, setActivities] = useState<SchoolActivity[]>(SCHOOL_ACTIVITIES);
  const [products, setProducts] = useState<StoreProduct[]>(STORE_PRODUCTS);
  const [linkedStudents, setLinkedStudents] = useState<ApiStudent[]>([]);
  const [orders, setOrders] = useState<ParentOrder[]>([]);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  // Toast system
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message: string, type: Toast['type'], icon: string) => {
    const id = String(++toastIdRef.current);
    setToasts((prev) => [...prev, { id, message, type, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Modals
  const [payModal, setPayModal] = useState<{ bill: ChildReport['pendingBills'][0]; child: ChildReport } | null>(null);
  const [payMethod, setPayMethod] = useState<'CARD' | 'TRANSFER' | 'COUNTER'>('CARD');
  const [payReceipt, setPayReceipt] = useState<{ bill: ChildReport['pendingBills'][0]; child: ChildReport; method: string } | null>(null);

  const [activityModal, setActivityModal] = useState<SchoolActivity | null>(null);
  const [productModal, setProductModal] = useState<StoreProduct | null>(null);
  const [productQty, setProductQty] = useState(1);

  const [reportModal, setReportModal] = useState<ChildReport | null>(null);
  const [messageModal, setMessageModal] = useState<Message | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const isParentAuthenticated = Boolean(user || authenticated);
  const activeChild = CHILDREN[selectedChildIndex]!;
  const unreadMessages = messages.filter((m) => !m.read).length;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cole_access_token');
      const saved = localStorage.getItem('cole_parent_auth');
      if (token || saved === 'true') setAuthenticated(true);
    }
    Promise.all([getActivities<ApiActivity>(), getProducts<ApiProduct>(), getMyStudents<ApiStudent>(), getMyOrders<ParentOrder>()])
      .then(([remoteActivities, remoteProducts, remoteStudents, remoteOrders]) => {
        setLinkedStudents(remoteStudents);
        setOrders(remoteOrders);
        setActivities(
          remoteActivities.map((a) => ({
            id: a.id,
            title: a.title,
            type: a.type,
            date: new Date(a.startDate).toLocaleString('es-PE'),
            location: a.location || 'Colegio San Cleo',
            price: Number(a.price),
            vacancies: Math.max(0, a.maxCapacity - (a._count?.registrations || 0)),
            requiresConsent: a.requiresConsent,
            description: '',
          }))
        );
        setProducts(
          remoteProducts.flatMap((p) =>
            p.variants.map((v) => ({
              id: v.id,
              name: `${p.name} (${v.name})`,
              category: p.category?.name || 'Tienda',
              price: Number(v.price),
              stock: v.stock,
              image: '📦',
            }))
          )
        );
      })
      .catch(() => null);
  }, []);

  // Real-Time Cross-Portal Academic Synchronization Listener for Parents
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('cole_platform_academic_sync');
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'EVALUATION_CREATED' && payload?.evaluation) {
          const ev = payload.evaluation;
          addToast(`Nuevo examen programado para Mateo: "${ev.name}" en ${payload.courseName || 'Álgebra'}`, 'info', '📝');
          const newMsg: Message = {
            id: `msg-${Date.now()}`,
            from: payload.teacherName || 'Prof. Elena Torres (Tutor)',
            subject: `Programación de Evaluación: ${ev.name}`,
            preview: `Se ha programado una nueva evaluación para la sección de Mateo (${ev.evaluationDate}).`,
            date: 'Hoy',
            read: false,
            fullText: `Estimados padres de familia, se les comunica que se ha programado la evaluación "${ev.name}" para el día ${ev.evaluationDate}. Tipo: ${ev.type === 'EXAM' ? 'Examen' : 'Práctica/Actividad'}. Ponderación: ${ev.weight}x.`,
          };
          setMessages((prev) => [newMsg, ...prev]);
        } else if (type === 'NOTICE_CREATED' && payload?.notice) {
          const ntc = payload.notice;
          const content = ntc.content || ntc.text || '';
          addToast(`Nuevo comunicado escolar: "${ntc.title}"`, 'info', '📢');
          const newMsg: Message = {
            id: ntc.id ? `msg-${ntc.id}` : `msg-${Date.now()}`,
            from: ntc.author || 'Docencia San José de Cluny',
            subject: ntc.title,
            preview: content.slice(0, 70) + (content.length > 70 ? '...' : ''),
            date: 'Hoy',
            read: false,
            fullText: content,
          };
          setMessages((prev) => [newMsg, ...prev.filter((m) => m.id !== newMsg.id)]);
        } else if (type === 'NOTICE_UPDATED' && payload?.notice) {
          const ntc = payload.notice;
          const content = ntc.content || ntc.text || '';
          addToast(`Comunicado modificado: "${ntc.title}"`, 'info', '✏️');
          setMessages((prev) =>
            prev.map((m) =>
              m.id === `msg-${ntc.id}` || m.subject === ntc.title
                ? {
                    ...m,
                    subject: ntc.title,
                    preview: content.slice(0, 70) + (content.length > 70 ? '...' : ''),
                    fullText: content,
                  }
                : m
            )
          );
        } else if (type === 'NOTICE_DELETED' && payload?.noticeId) {
          setMessages((prev) => prev.filter((m) => m.id !== `msg-${payload.noticeId}`));
          addToast('Un comunicado escolar fue retirado por el docente.', 'warning', '🗑️');
        } else if (type === 'GRADES_PUBLISHED') {
          addToast(`¡Nuevas notas de "${payload.evalName || 'Evaluación'}" publicadas por el docente!`, 'success', '🌟');
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel error in parent portal:', e);
    }

    return () => {
      if (channel) {
        channel.close();
      }
    };
  }, [addToast]);

  // ── Auth handlers ─────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    try {
      await login(email, password);
    } catch {
      // fallback
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cole_parent_auth', 'true');
        localStorage.setItem('cole_access_token', 'parent_demo_token');
      }
      setAuthenticated(true);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cole_parent_auth');
      localStorage.removeItem('cole_access_token');
    }
    setAuthenticated(false);
    logout?.();
  };

  // ── Action handlers ───────────────────────────────────────
  const confirmPayment = () => {
    if (!payModal) return;
    const receipt = { ...payModal, method: payMethod === 'CARD' ? 'Tarjeta en línea' : payMethod === 'TRANSFER' ? 'Transferencia bancaria' : 'Pago en ventanilla' };
    setPayModal(null);
    setPayReceipt(receipt);
    addToast(`Pago de ${payModal.bill.concept} procesado correctamente.`, 'success', '✅');
  };

  const confirmActivityRegistration = (act: SchoolActivity) => {
    setActivityModal(null);
    addToast(`¡Inscripción y autorización firmada para "${act.title}"!`, 'success', '🏕️');
  };

  const confirmProductPurchase = async (prod: StoreProduct) => {
    setProductModal(null);
    try {
      await checkoutOrder({
        studentId: linkedStudents[selectedChildIndex]?.id,
        variantId: prod.id,
        quantity: productQty,
        idempotencyKey: `portal-${prod.id}-${activeChild.id}-${Date.now()}`,
      });
      setOrders(await getMyOrders<ParentOrder>());
    } catch {
      // fallback for demo
    }
    addToast(`"${prod.name}" añadido al carrito. Stock reservado.`, 'success', '🛒');
    setProductQty(1);
  };

  const openMessage = (msg: Message) => {
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
    setMessageModal(msg);
  };

  // ── LOGIN SCREEN ──────────────────────────────────────────
  if (!isParentAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-8 text-white space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Colegio San Cleo • Nido, Primaria, Secundaria y Pre-U
              </div>
              <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Acompaña el progreso y la vida escolar de tus hijos
              </h2>
              <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                Notas bimestrales, asistencia, pagos de pensión, talleres y tienda escolar — todo en una plataforma moderna.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: '📊', title: 'Notas y Logros de Aprendizaje', desc: 'Libretas oficiales con escala vigesimal y niveles AD, A, B, C.' },
                { icon: '⏰', title: 'Asistencia y Puntualidad', desc: 'Alertas en tiempo real de inasistencias y tardanzas.' },
                { icon: '💳', title: 'Pagos de Pensión Seguros', desc: 'Paga en línea con recibo digital inmediato.' },
              ].map((feat) => (
                <div key={feat.title} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 text-lg">
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-100/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] p-6 sm:p-9 relative">
              <div className="text-center sm:text-left mb-6">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/30">
                    👨‍👩‍👧‍👦
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Colegio San Cleo
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Portal de Familias</h1>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Ingresa con tu correo de apoderado registrado.</p>
              </div>

              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <span className="text-amber-500 font-bold">⚡ Demo:</span> padre.garcia@email.com
                </span>
                <button
                  type="button"
                  onClick={() => { setEmail('padre.garcia@email.com'); setPassword('Cole2026!'); }}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                >
                  Autocompletar
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Correo</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="padre.garcia@email.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Contraseña</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200 focus:border-emerald-500 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                {apiError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">{apiError}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? 'Ingresando...' : 'Ingresar al Portal Familiar →'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ────────────────────────────────────────────────────────
     AUTHENTICATED DASHBOARD
     ──────────────────────────────────────────────────────── */
  const NAV_ITEMS = [
    { id: 'home', label: 'Inicio', icon: '🏠' },
    { id: 'academics', label: 'Notas & Pensiones', icon: '📊' },
    { id: 'activities', label: 'Talleres & Paseos', icon: '🏕️' },
    { id: 'store', label: 'Tienda Escolar', icon: '🛒' },
    { id: 'messages', label: 'Mensajes', icon: '✉️', badge: unreadMessages },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900">
      {/* Toast system */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out h-screen overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-600/30">
                👨‍👩‍👧‍👦
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Colegio San Cleo</span>
                <h2 className="text-base font-black text-white tracking-tight mt-0.5">Portal Familiar</h2>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white text-xl p-1">✕</button>
          </div>

          {/* Profile card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                {user ? user.firstName[0] + (user.lastName?.[0] || '') : 'FG'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-black text-white truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'Familia García Morales'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {user ? user.email : 'padre.garcia@email.com'}
                </p>
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sesión Activa
              </span>
              <span className="font-mono text-slate-300 font-bold">{CHILDREN.length} Hijos</span>
            </div>
          </div>

          {/* Nav items */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">Módulos Familiares</p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {'badge' in item && (item.badge as number) > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-extrabold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Child selector */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">Seleccionar Hijo</p>
            {CHILDREN.map((child, idx) => (
              <button
                key={child.id}
                onClick={() => { setSelectedChildIndex(idx); setSidebarOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  selectedChildIndex === idx
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="truncate">
                  <p className="font-bold text-white truncate">{child.photo} {child.name}</p>
                  <p className="text-[10px] text-slate-400">{child.gradeSection}</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-400 ml-2">{child.gpa}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                ☰
              </button>
              <div>
                <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Portal Familiar
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {NAV_ITEMS.find((n) => n.id === activeTab)?.label || 'Inicio'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-base transition-colors"
                >
                  🔔
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">Notificaciones</span>
                      <button onClick={() => setNotifOpen(false)} className="text-xs text-slate-400 hover:text-slate-700">✕</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {messages.map((msg) => (
                        <button
                          key={msg.id}
                          onClick={() => { openMessage(msg); setNotifOpen(false); setActiveTab('messages'); }}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${!msg.read ? 'bg-emerald-50/50' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            {!msg.read && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{msg.subject}</p>
                              <p className="text-[11px] text-slate-500 truncate">{msg.from}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{msg.date}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick child switcher */}
              <div className="hidden sm:flex items-center gap-1.5">
                {CHILDREN.map((child, idx) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildIndex(idx)}
                    title={child.name}
                    className={`w-9 h-9 rounded-xl text-base transition-all border-2 ${
                      selectedChildIndex === idx
                        ? 'border-emerald-500 bg-emerald-50 scale-110 shadow-sm shadow-emerald-200'
                        : 'border-transparent bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {child.photo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* ── HOME TAB ───────────────────────────────────── */}
          {activeTab === 'home' && (
            <>
              {/* Hero greeting */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      I Bimestre 2026
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black mt-2 leading-tight">
                      Bienvenida, <br className="sm:hidden" />
                      <span className="text-emerald-400">Familia García Morales</span> 👋
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Tienes <strong className="text-white">{unreadMessages} mensajes sin leer</strong> y{' '}
                      <strong className="text-white">{CHILDREN.reduce((a, c) => a + c.pendingBills.length, 0)} pagos pendientes</strong>.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {CHILDREN.map((child, idx) => (
                      <button
                        key={child.id}
                        onClick={() => { setSelectedChildIndex(idx); setActiveTab('academics'); }}
                        className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all hover:scale-105 text-center"
                      >
                        <span className="text-2xl">{child.photo}</span>
                        <p className="text-xs font-bold text-white mt-1 leading-tight">{child.name.split(' ')[0]}</p>
                        <p className="text-emerald-300 text-xs font-black">{child.gpa}/20</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick access cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '📊', label: 'Ver Notas', desc: 'Boleta bimestral', tab: 'academics', color: 'from-emerald-500 to-teal-600' },
                  { icon: '🏕️', label: 'Talleres', desc: `${activities.length} disponibles`, tab: 'activities', color: 'from-indigo-500 to-blue-600' },
                  { icon: '🛒', label: 'Tienda', desc: `${products.length} productos`, tab: 'store', color: 'from-violet-500 to-purple-600' },
                  { icon: '✉️', label: 'Mensajes', desc: `${unreadMessages} sin leer`, tab: 'messages', color: 'from-rose-500 to-pink-600' },
                ].map((q) => (
                  <button
                    key={q.label}
                    onClick={() => setActiveTab(q.tab as any)}
                    className="group flex flex-col items-start gap-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${q.color} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform`}>
                      {q.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-900">{q.label}</p>
                      <p className="text-xs text-slate-500">{q.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* All children summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CHILDREN.map((child, idx) => (
                  <div key={child.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`p-4 bg-gradient-to-r ${idx === 0 ? 'from-emerald-600 to-teal-600' : idx === 1 ? 'from-indigo-600 to-blue-600' : 'from-violet-600 to-purple-600'} text-white`}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{child.photo}</span>
                        <div>
                          <p className="font-black text-sm">{child.name}</p>
                          <p className="text-white/70 text-xs">{child.gradeSection}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Promedio</span>
                        <span className="font-black text-emerald-600 text-lg">{child.gpa} / 20</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Asistencia</span>
                        <span className="font-bold text-slate-900">{child.attendancePercent}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Deudas</span>
                        <span className={`font-bold ${child.pendingBills.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {child.pendingBills.length > 0 ? `S/. ${child.pendingBills[0].amount}` : '✓ Al día'}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => { setSelectedChildIndex(idx); setActiveTab('academics'); }}
                          className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-colors"
                        >
                          Ver Notas
                        </button>
                        <button
                          onClick={() => setReportModal(child)}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                        >
                          📄 Reporte
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent messages */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">✉️ Mensajes Recientes</h3>
                  <button onClick={() => setActiveTab('messages')} className="text-xs font-bold text-emerald-600 hover:underline">Ver todos →</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {messages.slice(0, 3).map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => openMessage(msg)}
                      className={`w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors flex items-start gap-3 ${!msg.read ? 'bg-emerald-50/30' : ''}`}
                    >
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{msg.subject}</p>
                        <p className="text-xs text-slate-500">{msg.from} · {msg.date}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{msg.preview}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── ACADEMICS TAB ──────────────────────────────── */}
          {activeTab === 'academics' && (
            <>
              {/* Child selector */}
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">Estudiante:</span>
                {CHILDREN.map((child, idx) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      selectedChildIndex === idx
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {child.photo} {child.name}
                  </button>
                ))}
              </div>

              {/* Hero bar */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Estudiante Matriculado
                    </span>
                    <h2 className="text-2xl font-black mt-1">{activeChild.photo} {activeChild.name}</h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {activeChild.gradeSection} | Código: <span className="font-mono text-emerald-300 font-bold">{activeChild.code}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Docente: {activeChild.teacher}</p>
                  </div>
                  <div className="flex gap-6 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400 font-medium">Promedio</p>
                      <p className="text-3xl font-black text-emerald-400">{activeChild.gpa} <span className="text-xs text-slate-400">/ 20</span></p>
                    </div>
                    <div className="text-right border-l border-slate-800 pl-6">
                      <p className="text-[11px] text-slate-400 font-medium">Asistencia</p>
                      <p className="text-3xl font-black text-teal-300">{activeChild.attendancePercent}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setReportModal(activeChild)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition-colors flex items-center gap-2"
                  >
                    📄 Ver Reporte Completo
                  </button>
                  <button
                    onClick={() => addToast('Libreta oficial descargada en PDF.', 'success', '📥')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition-colors flex items-center gap-2"
                  >
                    📥 Descargar Libreta PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Grades table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Boleta de Calificaciones — I Bimestre</h3>
                      <p className="text-xs text-slate-500">Notas oficiales publicadas por dirección académica.</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">Escala 0 - 20</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3.5">Asignatura</th>
                          <th className="px-6 py-3.5">Nota</th>
                          <th className="px-6 py-3.5">Nivel de Logro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {activeChild.courses.map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                            <td className="px-6 py-4 font-black text-emerald-600 text-base">{c.score.toFixed(1)}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                c.score >= 18 ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                                  : c.score >= 14 ? 'text-blue-700 bg-blue-50 border-blue-100'
                                  : 'text-amber-700 bg-amber-50 border-amber-100'
                              }`}>
                                {c.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial state */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-1">Estado de Cuenta</h3>
                    <p className="text-xs text-slate-500 mb-4">Pensiones y obligaciones escolares.</p>

                    {activeChild.pendingBills.length > 0 ? (
                      <div className="space-y-4">
                        {activeChild.pendingBills.map((bill, i) => (
                          <div key={i} className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-bold text-slate-900 text-sm">{bill.concept}</p>
                              <span className="font-black text-emerald-700 text-lg">S/. {bill.amount.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-amber-800 mb-3 font-medium">Vence: {bill.dueDate}</p>
                            <button
                              onClick={() => setPayModal({ bill, child: activeChild })}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                              💳 Pagar en Línea
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                        <p className="text-3xl">🎉</p>
                        <p className="font-extrabold text-emerald-800 text-sm">Al día en pensiones</p>
                        <p className="text-xs text-emerald-600 font-medium">No registra deudas pendientes.</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                    <button
                      onClick={() => addToast('Historial de boletas descargado correctamente.', 'info', '📄')}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      📄 Descargar Historial de Boletas
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── ACTIVITIES TAB ─────────────────────────────── */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-extrabold text-slate-900">🏕️ Talleres, Paseos y Actividades Extracurriculares</h2>
                <p className="text-xs text-slate-500 mt-0.5">Inscribe a tu hijo y firma digitalmente la autorización de participación.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activities.map((act) => (
                  <div key={act.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow hover:-translate-y-0.5">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          {act.type}
                        </span>
                        <span className={`text-xs font-semibold ${act.vacancies <= 5 ? 'text-rose-600' : 'text-slate-500'}`}>
                          {act.vacancies} cupos
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-2">{act.title}</h3>
                      {act.description && (
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{act.description}</p>
                      )}
                      <p className="text-xs text-slate-600 mt-2">📍 {act.location}</p>
                      <p className="text-xs text-slate-500 mt-1">🗓️ {act.date}</p>
                      {act.requiresConsent && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl mt-3 font-medium border border-amber-200">
                          ⚠️ Requiere autorización digital
                        </p>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xl font-black text-slate-900">
                        {act.price > 0 ? `S/. ${act.price.toFixed(2)}` : 'Gratuito'}
                      </span>
                      <button
                        onClick={() => setActivityModal(act)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        Inscribir & Autorizar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STORE TAB ──────────────────────────────────── */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">🛒 Tienda Virtual — Colegio San Cleo</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Uniformes, útiles y libros con entrega en secretaría o despacho a domicilio.</p>
                </div>
              </div>

              {orders.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4">📋 Mis Pedidos</h3>
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3 text-sm font-medium">
                        <span className="font-mono font-bold text-emerald-600">{order.code}</span>
                        <span className="font-bold">S/. {Number(order.totalAmount).toFixed(2)}</span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">{order.status}</span>
                        <span className="text-xs text-slate-500">{new Date(order.placedAt).toLocaleDateString('es-PE')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5 group"
                  >
                    <div>
                      <div className="text-5xl text-center py-5 bg-slate-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform">{prod.image}</div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {prod.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-2 leading-snug">{prod.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">Stock: {prod.stock} unidades</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-lg font-black text-slate-900">S/. {prod.price.toFixed(2)}</span>
                      <button
                        onClick={() => { setProductModal(prod); setProductQty(1); }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MESSAGES TAB ───────────────────────────────── */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">✉️ Mensajes del Colegio</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{unreadMessages} mensajes sin leer.</p>
                </div>
                <button
                  onClick={() => { setMessages((prev) => prev.map((m) => ({ ...m, read: true }))); addToast('Todos los mensajes marcados como leídos.', 'info', '✅'); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Marcar todos leídos
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className={`w-full text-left px-6 py-5 hover:bg-slate-50 transition-colors flex items-start gap-4 ${!msg.read ? 'bg-emerald-50/30' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {msg.from[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm truncate ${!msg.read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>{msg.subject}</p>
                        <span className="text-[11px] text-slate-400 flex-shrink-0">{msg.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{msg.from}</p>
                      <p className="text-xs text-slate-400 truncate mt-1">{msg.preview}</p>
                    </div>
                    {!msg.read && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS ─────────────────────────────────────────── */}

      {/* Payment confirmation modal */}
      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="💳 Pago de Pensión Escolar" size="md">
        {payModal && (
          <div className="space-y-5">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-extrabold text-slate-900">{payModal.bill.concept}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Estudiante: {payModal.child.name}</p>
                  <p className="text-xs text-amber-700 mt-1 font-medium">Vence: {payModal.bill.dueDate}</p>
                </div>
                <p className="text-2xl font-black text-emerald-700">S/. {payModal.bill.amount.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Método de Pago:</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'CARD', label: '💳 Tarjeta de Crédito / Débito', sub: 'Visa, Mastercard, American Express' },
                  { id: 'TRANSFER', label: '🏦 Transferencia Bancaria', sub: 'BCP, Interbank, BBVA' },
                  { id: 'COUNTER', label: '🏢 Pago en Ventanilla', sub: 'Secretaría del colegio (L-V, 08:00-13:00 hrs)' },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      payMethod === method.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value={method.id}
                      checked={payMethod === method.id as any}
                      onChange={() => setPayMethod(method.id as any)}
                      className="accent-emerald-600"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{method.label}</p>
                      <p className="text-xs text-slate-500">{method.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPayModal(null)}
                className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPayment}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-colors"
              >
                ✅ Confirmar Pago
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment receipt modal */}
      <Modal isOpen={!!payReceipt} onClose={() => setPayReceipt(null)} title="🧾 Comprobante de Pago" size="md">
        {payReceipt && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto">✅</div>
              <h3 className="text-lg font-black text-slate-900 mt-3">¡Pago Procesado!</h3>
              <p className="text-sm text-slate-500 mt-1">Tu comprobante ha sido enviado al correo registrado.</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-sm">
              {[
                { label: 'Concepto', value: payReceipt.bill.concept },
                { label: 'Estudiante', value: payReceipt.child.name },
                { label: 'Monto', value: `S/. ${payReceipt.bill.amount.toFixed(2)}` },
                { label: 'Método', value: payReceipt.method },
                { label: 'Fecha', value: new Date().toLocaleDateString('es-PE') },
                { label: 'N° Transacción', value: `TXN-${Math.floor(Math.random() * 900000) + 100000}` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">{row.label}</span>
                  <span className="font-bold text-slate-900">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { addToast('Comprobante descargado en PDF.', 'success', '📥'); setPayReceipt(null); }}
                className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                📥 Descargar PDF
              </button>
              <button
                onClick={() => setPayReceipt(null)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Activity inscription modal */}
      <Modal isOpen={!!activityModal} onClose={() => setActivityModal(null)} title="🏕️ Inscripción y Autorización" size="md">
        {activityModal && (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-emerald-700">{activityModal.type}</span>
              <h3 className="font-extrabold text-slate-900 mt-1">{activityModal.title}</h3>
              <p className="text-xs text-slate-600 mt-2">{activityModal.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div><span className="font-bold">📍 Lugar:</span> {activityModal.location}</div>
                <div><span className="font-bold">🗓️ Fecha:</span> {activityModal.date}</div>
                <div><span className="font-bold">💺 Cupos:</span> {activityModal.vacancies}</div>
                <div><span className="font-bold">💰 Costo:</span> {activityModal.price > 0 ? `S/. ${activityModal.price}` : 'Gratuito'}</div>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-700 mb-2">Estudiante a inscribir:</p>
              <div className="flex flex-wrap gap-2">
                {CHILDREN.map((child, idx) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildIndex(idx)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedChildIndex === idx ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {child.photo} {child.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {activityModal.requiresConsent && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium">
                ⚠️ Esta actividad requiere tu firma digital de autorización como apoderado. Al confirmar, aceptas la participación del menor en la actividad descrita.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setActivityModal(null)}
                className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmActivityRegistration(activityModal)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-colors"
              >
                ✅ Autorizar e Inscribir
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Product purchase modal */}
      <Modal isOpen={!!productModal} onClose={() => setProductModal(null)} title="🛒 Confirmar Compra" size="sm">
        {productModal && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="text-6xl mb-2">{productModal.image}</div>
              <h3 className="font-extrabold text-slate-900 text-base">{productModal.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{productModal.category}</p>
              <p className="text-2xl font-black text-emerald-700 mt-2">S/. {productModal.price.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-600 mb-2">Cantidad:</p>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setProductQty(Math.max(1, productQty - 1))}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-900 transition-colors"
                >
                  −
                </button>
                <span className="text-xl font-black text-slate-900 w-8 text-center">{productQty}</span>
                <button
                  onClick={() => setProductQty(Math.min(productModal.stock, productQty + 1))}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-900 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">
                Total: <strong className="text-slate-900">S/. {(productModal.price * productQty).toFixed(2)}</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setProductModal(null)}
                className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmProductPurchase(productModal)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-colors"
              >
                ✅ Confirmar Pedido
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Full report card modal */}
      <Modal isOpen={!!reportModal} onClose={() => setReportModal(null)} title={`📄 Reporte — ${reportModal?.name}`} size="lg">
        {reportModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl text-white">
              <span className="text-4xl">{reportModal.photo}</span>
              <div>
                <h3 className="font-black text-lg">{reportModal.name}</h3>
                <p className="text-slate-400 text-xs">{reportModal.gradeSection}</p>
                <p className="text-slate-400 text-xs">Código: {reportModal.code}</p>
                <p className="text-slate-400 text-xs">Docente: {reportModal.teacher}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-black text-emerald-400">{reportModal.gpa}/20</p>
                <p className="text-xs text-slate-400">Promedio</p>
                <p className="text-emerald-400 font-bold text-sm mt-1">{reportModal.attendancePercent}% Asistencia</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-slate-900 mb-3">📚 Rendimiento por Área</h4>
              <div className="space-y-3">
                {reportModal.courses.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <p className="text-xs font-bold text-slate-700 w-52 flex-shrink-0 truncate">{c.name}</p>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${c.score >= 18 ? 'bg-emerald-500' : c.score >= 14 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${(c.score / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-900 w-10 text-right">{c.score.toFixed(1)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-24 text-center flex-shrink-0 ${c.score >= 18 ? 'bg-emerald-100 text-emerald-700' : c.score >= 14 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {c.level.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { addToast('Reporte completo descargado en PDF.', 'success', '📥'); setReportModal(null); }}
                className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                📥 Descargar PDF
              </button>
              <button
                onClick={() => setReportModal(null)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Message detail modal */}
      <Modal isOpen={!!messageModal} onClose={() => setMessageModal(null)} title={messageModal?.subject || 'Mensaje'} size="lg">
        {messageModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {messageModal.from[0]}
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm">{messageModal.from}</p>
                <p className="text-xs text-slate-500">{messageModal.date}</p>
              </div>
            </div>
            <div className="prose prose-sm text-slate-700 leading-relaxed whitespace-pre-wrap text-sm bg-slate-50/50 rounded-2xl border border-slate-100 p-4 max-h-72 overflow-y-auto">
              {messageModal.fullText}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { addToast('Mensaje guardado en archivo.', 'info', '📁'); }}
                className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-colors"
              >
                📁 Archivar
              </button>
              <button
                onClick={() => setMessageModal(null)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Login Modal JWT */}
      <LoginModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes slideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

const ParentPortalDashboard = dynamic(() => Promise.resolve(ParentPortalContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30 animate-pulse">
          👨‍👩‍👧‍👦
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-black tracking-tight">Portal de Familias & Padres</h3>
          <p className="text-xs text-slate-400">Cargando información escolar...</p>
        </div>
      </div>
    </div>
  ),
});

export default function Page() {
  return (
    <AuthProvider>
      <ParentPortalDashboard />
    </AuthProvider>
  );
}
