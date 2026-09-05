'use client';

import React, { useState } from 'react';
import { Button } from '@cole/ui-components';
import { login } from '../lib/api';
import ParticleField from '../components/ParticleField';
import MeshGradient from '../components/MeshGradient';
import { useTilt } from '@cole/ui-components/src/useTilt';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  planName: string;
  studentsCount: number;
  maxStudents: number;
  features: string[];
}

interface Plan {
  id: string;
  name: string;
  code: string;
  monthlyPrice: number;
  maxStudents: number;
  maxTeachers: number;
  features: string[];
}

const INITIAL_PLANS: Plan[] = [
  { id: 'p1', name: 'Básico', code: 'PLAN_BASIC', monthlyPrice: 99, maxStudents: 150, maxTeachers: 15, features: ['academic', 'enrollment', 'notifications'] },
  { id: 'p2', name: 'Profesional', code: 'PLAN_PRO', monthlyPrice: 199, maxStudents: 500, maxTeachers: 50, features: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'] },
  { id: 'p3', name: 'Enterprise', code: 'PLAN_ENTERPRISE', monthlyPrice: 399, maxStudents: 1500, maxTeachers: 150, features: ['academic', 'enrollment', 'finance', 'commerce', 'activities', 'hr', 'payroll', 'notifications', 'documents', 'reporting'] },
];

const INITIAL_TENANTS: Tenant[] = [
  { id: 't-1', name: 'Colegio San Cleo (Nido • Primaria • Secundaria • Pre-U)', subdomain: 'sancleo', status: 'ACTIVE', planName: 'Profesional', studentsCount: 480, maxStudents: 600, features: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'] },
  { id: 't-2', name: 'Inmaculada Concepción', subdomain: 'inmaculada', status: 'ACTIVE', planName: 'Enterprise', studentsCount: 1120, maxStudents: 1500, features: ['academic', 'enrollment', 'finance', 'commerce', 'activities', 'hr', 'payroll', 'reporting'] },
  { id: 't-3', name: 'Academia Montessori', subdomain: 'montessori', status: 'TRIAL', planName: 'Básico', studentsCount: 45, maxStudents: 150, features: ['academic', 'enrollment', 'notifications'] },
];

/* ────────────────────────────────────────────────────────────
   SUPER ADMIN LOGIN SCREEN
   ──────────────────────────────────────────────────────────── */
function LoginScreen({ onLogin, onBackToHome }: { onLogin: () => void; onBackToHome: () => void }) {
  const [email, setEmail] = useState('admin@cole.pe');
  const [password, setPassword] = useState('Cole2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      onLogin();
    } catch {
      setError('Credenciales inválidas o API no disponible.');
    } finally {
      setLoading(false);
    }
  };

  const tilt = useTilt<HTMLDivElement>({ maxTilt: 8, perspective: 1000, scale: 1.02 });

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 p-4">
      <MeshGradient />
      <ParticleField />

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div
          ref={tilt.ref}
          style={tilt.style}
          onMouseMove={tilt.onMouseMove}
          onMouseLeave={tilt.onMouseLeave}
          className="bg-white/[0.07] backdrop-blur-xl rounded-3xl border border-white/[0.12] shadow-2xl shadow-black/40 p-8 sm:p-10"
        >
          {/* Back button */}
          <button
            onClick={onBackToHome}
            className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            ← Volver al Inicio
          </button>

          {/* Shield icon */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0a0a1a] shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Super Admin</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Cole Platform</h1>
            <p className="text-sm text-slate-400 mt-1">Panel de administración global</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cole.pe"
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión Super Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SUPER ADMIN DASHBOARD VIEW
   ──────────────────────────────────────────────────────────── */
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [plans] = useState<Plan[]>(INITIAL_PLANS);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(INITIAL_PLANS[1].id);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = plans.find((p) => p.id === selectedPlanId) || plans[0];
    const newTenant: Tenant = {
      id: `t-${Date.now()}`,
      name: newName,
      subdomain: newSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      status: 'ACTIVE',
      planName: plan.name,
      studentsCount: 0,
      maxStudents: plan.maxStudents,
      features: plan.features,
    };
    setTenants([...tenants, newTenant]);
    setShowModal(false);
    setNewName('');
    setNewSubdomain('');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-500/20">
            Super Admin Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Colegios y Suscripciones SaaS</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => setShowModal(true)}>+ Registrar Nuevo Colegio</Button>
          <Button variant="outline" onClick={onLogout}>Cerrar Sesión</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase">Colegios Activos</p>
          <p className="text-3xl font-black text-indigo-400 mt-2">{tenants.length}</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase">Alumnos Totales</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">{tenants.reduce((acc, t) => acc + t.studentsCount, 0)}</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase">Planes Comerciales</p>
          <p className="text-3xl font-black text-violet-400 mt-2">{plans.length}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">Directorio de Colegios Vinculados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Colegio</th>
                <th className="px-6 py-4">Subdominio</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Alumnos</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-bold text-white">{t.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-indigo-400">{t.subdomain}.cole.pe</td>
                  <td className="px-6 py-4">{t.planName}</td>
                  <td className="px-6 py-4">{t.studentsCount} / {t.maxStudents}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-100">
            <h3 className="text-xl font-bold text-white mb-4">Registrar Nuevo Colegio</h3>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre de la Institución</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Colegio San Agustín"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subdominio</label>
                <input
                  type="text"
                  required
                  placeholder="sanagustin"
                  value={newSubdomain}
                  onChange={(e) => setNewSubdomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (${p.monthlyPrice}/mes)</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary">Crear Colegio</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN HOME / LANDING PAGE (LENGUAJE NO TÉCNICO Y CLARO)
   ──────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [activeAudience, setActiveAudience] = useState<'directors' | 'teachers' | 'parents' | 'students'>('directors');
  const [studentsCount, setStudentsCount] = useState<number>(350);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [portalModalOpen, setPortalModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [superAdminView, setSuperAdminView] = useState<'home' | 'login' | 'dashboard'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (superAdminView === 'login') {
    return <LoginScreen onLogin={() => setSuperAdminView('dashboard')} onBackToHome={() => setSuperAdminView('home')} />;
  }

  if (superAdminView === 'dashboard') {
    return <Dashboard onLogout={() => setSuperAdminView('home')} />;
  }

  // Savings calculations
  const paperSaved = Math.round(studentsCount * 75); // sheets/year
  const hoursSavedPerMonth = Math.round(studentsCount * 0.25 + 20); // hours

  const audienceData = {
    directors: {
      tag: 'Para Directores y Administradores',
      title: 'Ten el control total de tu colegio sin enredos ni estrés',
      description: 'Una sola pantalla para saber cuántos alumnos están matriculados, qué pensiones faltan cobrar y cómo marcha el colegio día a día.',
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      bullets: [
        { icon: '💸', title: 'Cobranza de pensiones sin perseguir a nadie', text: 'El sistema envía recordatorios amables y automáticos a los padres. Menos morosidad y cuentas siempre claras.' },
        { icon: '📝', title: 'Matrículas rápidas en 2 minutos', text: 'Registra a nuevos alumnos, guarda sus documentos y asígnalos a su aula sin filas de espera.' },
        { icon: '👥', title: 'Sueldos de profesores ordenados', text: 'Calcula planillas, horas trabajadas y bonos con un solo clic, sin equivocaciones.' },
        { icon: '📊', title: 'Reportes listos para la dirección', text: 'Mira gráficos fáciles de entender con la asistencia general, el rendimiento académico y los ingresos del mes.' },
      ],
      previewBadge: 'Directorio General (Nido • Primaria • Secundaria • Pre-U)',
      previewHeading: 'Colegio San Cleo • Panel de Dirección Integral',
      previewStats: [
        { label: 'Alumnos Matriculados', value: '380 Alumnos', sub: 'Capacidad 92%' },
        { label: 'Recaudación del Mes', value: '94.8% Al Día', sub: 'Recordatorios activos' },
        { label: 'Docentes y Personal', value: '28 Profesores', sub: 'Planillas aprobadas' },
      ],
      portalUrl: 'http://localhost:3001',
      portalButtonText: 'Ver Portal de Dirección (Demo)',
    },
    teachers: {
      tag: 'Para Profesores y Educadores',
      title: 'Menos papeleo administrativo, mucho más tiempo para enseñar',
      description: 'Dile adiós a pasar notas a mano tres veces o quedarte horas llenando libretas. Todo se hace fácil desde tu celular o computadora.',
      color: 'from-indigo-500 to-violet-600',
      textColor: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      bullets: [
        { icon: '⚡', title: 'Toma asistencia en 10 segundos', text: 'Marca "Todos presentes" con un botón o registra tardanzas en el acto.' },
        { icon: '🎯', title: 'Sube notas del 0 al 20 sin esfuerzo', text: 'El sistema calcula los promedios automáticamente y asigna el logro oficial (AD, A, B, C).' },
        { icon: '📄', title: 'Libretas listas al instante', text: 'Con un clic generas las libretas bimestrales oficiales de todo tu salón sin errores.' },
        { icon: '💬', title: 'Comunicación tranquila', text: 'Comparte observaciones del alumno con los padres sin que te llenen tu WhatsApp personal a deshoras.' },
      ],
      previewBadge: 'Campus Docente',
      previewHeading: 'Prof. Eduardo Torres • 5to Primaria A',
      previewStats: [
        { label: 'Asistencia Hoy', value: '28 / 28 Alumnos', sub: '100% Puntuales' },
        { label: 'Promedio del Aula', value: '17.4 / 20', sub: 'Nivel Destacado (AD)' },
        { label: 'Libretas Emitidas', value: 'I Bimestre Listo', sub: 'Aprobado por Dirección' },
      ],
      portalUrl: 'http://localhost:3002',
      portalButtonText: 'Ver Portal del Profesor (Demo)',
    },
    parents: {
      tag: 'Para Padres y Madres de Familia',
      title: 'La tranquilidad de saber cómo van tus hijos todos los días',
      description: 'Acompaña el aprendizaje de tus hijos desde la palma de tu mano: notas en tiempo real, aviso de asistencia y pagos de pensiones sin colas.',
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      bullets: [
        { icon: '📱', title: 'Mira las notas de tus hijos al instante', text: 'Entérate de cómo les fue en sus exámenes el mismo día que los califican, sin esperar a fin de año.' },
        { icon: '⏰', title: 'Avisos de llegada al colegio', text: 'Sabe con certeza si tu hijo ingresó a tiempo a su salón de clases.' },
        { icon: '💳', title: 'Paga la pensión en 1 minuto', text: 'Paga desde tu celular de forma segura y recibe tu comprobante electrónico de inmediato.' },
        { icon: '🛍️', title: 'Tienda escolar y uniformes', text: 'Compra polos de educación física, cuadernos y talleres de robótica o deportes sin salir de casa.' },
      ],
      previewBadge: 'Portal Familiar',
      previewHeading: 'Familia García Morales • Mateo (1er Grado)',
      previewStats: [
        { label: 'Estado de Cuenta', value: 'Pensión al Día', sub: 'Próx. vencimiento: 30 Abr' },
        { label: 'Promedio de Mateo', value: '18.5 / 20 (AD)', sub: 'Destacado en Matemáticas' },
        { label: 'Talleres Activos', value: 'Robótica y Fútbol', sub: 'Inscripción confirmada' },
      ],
      portalUrl: 'http://localhost:3003',
      portalButtonText: 'Ver Portal de Padres (Demo)',
    },
    students: {
      tag: 'Para Alumnos y Estudiantes',
      title: 'Tu vida escolar ordenada, clara y en tu propio bolsillo',
      description: 'Consulta tu horario de clases, mira qué salón te toca, celebra tus buenas calificaciones e inscríbete en tus talleres favoritos.',
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      bullets: [
        { icon: '🗓️', title: 'Horario siempre a la mano', text: 'Qué curso te toca hoy, a qué hora empieza y con qué profesor en cada aula.' },
        { icon: '🏆', title: 'Celebra tus metas y notas', text: 'Visualiza tus avances por cada materia y motívate a alcanzar el nivel AD.' },
        { icon: '⏰', title: 'Récord de asistencia y puntualidad', text: 'Revisa tu historial de asistencia y mantén tu récord perfecto.' },
        { icon: '🎨', title: 'Talleres y actividades del cole', text: 'Entérate de las actividades extracurriculares, paseos y ferias de ciencias.' },
      ],
      previewBadge: 'Campus del Alumno',
      previewHeading: 'Mateo García • 1er Grado Primaria A',
      previewStats: [
        { label: 'Horario Hoy', value: '4 Cursos Asignados', sub: 'Matemática, Lenguaje, Arte' },
        { label: 'Nivel de Logro', value: '🌟 Logro Destacado', sub: 'Cuadro de Honor' },
        { label: 'Asistencia', value: '100% Asistido', sub: '42 días consecutivos' },
      ],
      portalUrl: 'http://localhost:3004',
      portalButtonText: 'Ver Portal del Alumno (Demo)',
    },
  };

  const currentAudience = audienceData[activeAudience];

  const faqs = [
    {
      q: '¿Es difícil de usar si mis profesores o padres no son muy tecnológicos?',
      a: 'Para nada. La plataforma fue creada para que cualquier persona que use WhatsApp pueda usarla en menos de 5 minutos. Los botones son grandes, las palabras son claras y no requiere descargar programas complicados.',
    },
    {
      q: '¿Qué pasa si los padres de familia solo tienen teléfono celular?',
      a: 'Funciona al 100% en cualquier celular (Android o iPhone). No ocupará espacio en su memoria porque se abre directamente desde el navegador web de forma rápida y ligera.',
    },
    {
      q: '¿Cómo nos ayudan a pasar la información de los alumnos que ya tenemos?',
      a: 'Nuestro equipo de soporte te acompaña de la mano: te ayudamos a cargar la lista de alumnos, profesores y cursos en un solo día mediante archivos Excel o plantillas sencillas.',
    },
    {
      q: '¿Qué tan segura está la información de las notas y las pensiones?',
      a: 'Tus datos están protegidos con los mismos estándares de seguridad que usan los bancos en línea. Hacemos copias de respaldo automáticas todos los días para que nunca se pierda nada.',
    },
    {
      q: '¿Podemos probar el sistema antes de tomar una decisión en nuestro colegio?',
      a: '¡Sí! Puedes probar los 4 portales de demostración en vivo ahora mismo o solicitar una reunión guiada donde te mostramos cómo se adapta a las reglas específicas de tu colegio.',
    },
  ];

  const benefitsList = [
    {
      icon: '⏱️',
      title: 'Ahorra 15 a 20 horas semanales',
      desc: 'Los profesores no pierden tiempo transcribiendo notas ni buscando papeles. La dirección emite informes y matrículas en segundos.',
      color: 'border-indigo-500/30 bg-indigo-950/20',
    },
    {
      icon: '💸',
      title: 'Cobranza de pensiones sin estrés',
      desc: 'Las familias reciben estados de cuenta claritos en su celular. Tienen recordatorios respetuosos y pueden pagar sin hacer filas en el banco.',
      color: 'border-emerald-500/30 bg-emerald-950/20',
    },
    {
      icon: '📄',
      title: 'Libretas oficiales en 1 clic',
      desc: 'Se acabaron las calculadoras y los borrones. El sistema promedia las notas del 0 al 20, asigna los logros (AD, A, B) y genera el PDF listo.',
      color: 'border-violet-500/30 bg-violet-950/20',
    },
    {
      icon: '🔔',
      title: 'Comunicación clara con las familias',
      desc: 'Avisos de faltas, justificativos médicos y comunicados importantes llegan directo al teléfono de los padres, sin saturar los chats personales.',
      color: 'border-amber-500/30 bg-amber-950/20',
    },
    {
      icon: '🛍️',
      title: 'Tienda escolar y talleres en línea',
      desc: 'Vende uniformes oficiales, cuadernos y talleres de robótica o deportes con control de pedidos e inventario automático sin desorden de caja.',
      color: 'border-cyan-500/30 bg-cyan-950/20',
    },
    {
      icon: '🛡️',
      title: 'Tu información 100% protegida',
      desc: 'Nunca más perderás datos porque se malogró una computadora o se borró un archivo. Respaldos diarios automáticos y privacidad absoluta.',
      color: 'border-rose-500/30 bg-rose-950/20',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      {/* ────────────────────────────────────────────────────────────
         TOP NAVBAR
         ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-600 to-emerald-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/25">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">COLE</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Software Escolar
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Gestión Inteligente para Colegios</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-300">
            <a href="#para-quien" className="hover:text-white transition-colors">¿Para quién es?</a>
            <a href="#beneficios" className="hover:text-white transition-colors">Beneficios Clave</a>
            <a href="#calculadora" className="hover:text-white transition-colors">Calculadora de Ahorro</a>
            <a href="#portales" className="hover:text-white transition-colors">Portales en Vivo</a>
            <a href="#testimonios" className="hover:text-white transition-colors">Experiencias</a>
            <a href="#preguntas" className="hover:text-white transition-colors">Preguntas Frecuentes</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setPortalModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <span>🔑</span>
              <span>Entrar a Portales</span>
            </button>

            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <span>✨</span>
              <span>Solicitar Demo</span>
            </button>

            <button
              onClick={() => setSuperAdminView('login')}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-xs"
              title="Acceso Super Admin"
            >
              🔒
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-lg"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
              <button
                onClick={() => { setPortalModalOpen(true); setMobileMenuOpen(false); }}
                className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs font-bold text-white"
              >
                🔑 Entrar a Portales
              </button>
              <button
                onClick={() => { setDemoModalOpen(true); setMobileMenuOpen(false); }}
                className="py-2.5 px-3 rounded-xl bg-indigo-600 text-center text-xs font-bold text-white"
              >
                ✨ Solicitar Demo
              </button>
            </div>
            <div className="flex flex-col space-y-2 text-xs font-semibold text-slate-300">
              <a href="#para-quien" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-900">¿Para quién es?</a>
              <a href="#beneficios" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-900">Beneficios Clave</a>
              <a href="#calculadora" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-900">Calculadora de Ahorro</a>
              <a href="#portales" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-900">Portales en Vivo</a>
              <a href="#testimonios" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-900">Experiencias Reales</a>
              <a href="#preguntas" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-slate-900">Preguntas Frecuentes</a>
            </div>
          </div>
        )}
      </header>

      {/* ────────────────────────────────────────────────────────────
         HERO SECTION (LENGUAJE AMIGABLE Y VISUALMENTE IMPACTANTE)
         ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-800/80">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-full px-4 py-1.5 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-200">
              El software escolar que todos en tu colegio van a amar usar
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-5xl mx-auto leading-[1.1]">
            Tu colegio más organizado, tus profesores más{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-300 to-violet-400">
              felices y tus familias conectadas.
            </span>
          </h1>

          {/* Subtitle in clean, non-technical words */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Dile adiós a las pilas de papeles, los cobros difíciles y el estrés de fin de bimestre.
            Una sola plataforma fácil, bonita y amigable que cuida cada detalle de tu institución educativa.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setPortalModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 group"
            >
              <span>🚀 Explorar los 4 Portales en Vivo</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              onClick={() => setDemoModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>📅 Agendar Demostración Guiada</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-base">✓</span>
              <span>100% en la Nube (Sin instalar nada)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-base">✓</span>
              <span>Funciona en cualquier celular o PC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-base">✓</span>
              <span>Acompañamiento humano paso a paso</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-base">✓</span>
              <span>Información segura y con respaldo diario</span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
         QUICK STATS / IMPACT BANNER
         ──────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <p className="text-3xl sm:text-4xl font-black text-emerald-400">15 hrs</p>
            <p className="text-xs font-bold text-slate-300 mt-1">Ahorradas por semana en papeleo</p>
          </div>
          <div className="p-4 border-l border-slate-800">
            <p className="text-3xl sm:text-4xl font-black text-indigo-400">100%</p>
            <p className="text-xs font-bold text-slate-300 mt-1">Libretas sin errores de cálculo</p>
          </div>
          <div className="p-4 border-l border-slate-800">
            <p className="text-3xl sm:text-4xl font-black text-amber-400">95%</p>
            <p className="text-xs font-bold text-slate-300 mt-1">Familias pagan sus pensiones a tiempo</p>
          </div>
          <div className="p-4 border-l border-slate-800">
            <p className="text-3xl sm:text-4xl font-black text-cyan-400">4 Portales</p>
            <p className="text-xs font-bold text-slate-300 mt-1">Directores, Profes, Padres y Alumnos</p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
         SECTION 1: PARA QUIÉN ES (INTERACTIVE ROLES SHOWCASE)
         ──────────────────────────────────────────────────────────── */}
      <section id="para-quien" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Diseñado para toda la comunidad escolar
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Cada persona en tu colegio tiene su espacio a medida
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Selecciona un rol para ver cómo la plataforma transforma el día a día de directores, profesores, familias y estudiantes.
          </p>
        </div>

        {/* Audience Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { id: 'directors', label: '🏫 Directores & Administración', badge: 'Control Total' },
            { id: 'teachers', label: '👩‍🏫 Profesores & Docentes', badge: 'Cero Papeleo' },
            { id: 'parents', label: '👨‍👩‍👧‍👦 Padres de Familia', badge: 'Paz Mental' },
            { id: 'students', label: '🎒 Alumnos & Estudiantes', badge: 'Organización' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAudience(tab.id as any)}
              className={`px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 border ${
                activeAudience === tab.id
                  ? 'bg-white text-slate-950 border-white shadow-xl shadow-white/10 scale-105'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeAudience === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Active Role Content Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Description & Bullets */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className={`text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${currentAudience.badgeBg}`}>
                {currentAudience.tag}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {currentAudience.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {currentAudience.description}
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {currentAudience.bullets.map((b, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-2xl p-1 bg-slate-900 rounded-xl border border-slate-800">{b.icon}</div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{b.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{b.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setPortalModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>🔑</span>
                <span>{currentAudience.portalButtonText}</span>
              </button>
            </div>
          </div>

          {/* Right Live Interactive Mockup */}
          <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            {/* Header of Mockup */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
                  ✨
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Vista en Tiempo Real</span>
                  <p className="text-xs font-bold text-white">{currentAudience.previewHeading}</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                {currentAudience.previewBadge}
              </span>
            </div>

            {/* Stats Showcase */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentAudience.previewStats.map((st, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-400">{st.label}</p>
                  <p className="text-base font-black text-white mt-1">{st.value}</p>
                  <p className="text-[10px] font-medium text-emerald-400 mt-0.5">{st.sub}</p>
                </div>
              ))}
            </div>

            {/* Visual Action preview table */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">Operaciones Automatizadas</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">🟢 Activo</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">📋 Control Diario y Asistencia</span>
                  <span className="text-indigo-400 font-bold">1 Clic</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">🏆 Calificaciones & Libretas Oficiales</span>
                  <span className="text-emerald-400 font-bold">Automático</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">💳 Pensiones y Comprobantes de Pago</span>
                  <span className="text-amber-400 font-bold">En Línea</span>
                </div>
              </div>
            </div>

            {/* Bottom notification tag */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <p className="text-xs text-indigo-300 font-semibold">
                💡 Los datos se actualizan solos en tiempo real para todos los usuarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
         SECTION 2: BENEFICIOS CLAVE (LENGUAJE NO TÉCNICO)
         ──────────────────────────────────────────────────────────── */}
      <section id="beneficios" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Beneficios Reales
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              ¿Por qué los colegios cambian su forma de trabajar con nosotros?
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              No necesitas saber de tecnología para notar la diferencia. Estos son los beneficios que sentirás desde la primera semana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefitsList.map((item, i) => (
              <div
                key={i}
                className={`p-8 rounded-3xl border bg-slate-900/90 shadow-xl space-y-4 hover:-translate-y-1.5 transition-transform duration-300 ${item.color}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl shadow-md">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
         SECTION 3: CALCULADORA INTERACTIVA DE AHORRO
         ──────────────────────────────────────────────────────────── */}
      <section id="calculadora" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Calculadora en Vivo
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Calcula cuánto tiempo y recursos ahorrará tu colegio
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Mueve la barra para seleccionar la cantidad aproximada de alumnos de tu institución y mira el impacto inmediato.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl space-y-8">
          {/* Slider Control */}
          <div className="space-y-4 max-w-2xl mx-auto text-center">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block">
              Cantidad de Alumnos: <span className="text-2xl sm:text-3xl font-black text-white ml-2">{studentsCount} Alumnos</span>
            </label>
            <input
              type="range"
              min={50}
              max={1500}
              step={25}
              value={studentsCount}
              onChange={(e) => setStudentsCount(Number(e.target.value))}
              className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400 border border-slate-800"
            />
            <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1">
              <span>50 Alumnos</span>
              <span>500 Alumnos</span>
              <span>1,000 Alumnos</span>
              <span>1,500 Alumnos</span>
            </div>
          </div>

          {/* Metrics Calculated Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">📄</div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400">{paperSaved.toLocaleString('es-PE')}</p>
              <p className="text-xs font-bold text-slate-200">Hojas de Papel Ahorradas / Año</p>
              <p className="text-[11px] text-slate-400">Menos impresiones y carpetas</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">⏳</div>
              <p className="text-3xl sm:text-4xl font-black text-indigo-400">{hoursSavedPerMonth} Horas</p>
              <p className="text-xs font-bold text-slate-200">Horas Ahorradas al Mes</p>
              <p className="text-[11px] text-slate-400">En digitación y llamadas de cobranza</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">📈</div>
              <p className="text-3xl sm:text-4xl font-black text-amber-400">+35%</p>
              <p className="text-xs font-bold text-slate-200">Puntualidad en Pagos</p>
              <p className="text-[11px] text-slate-400">Gracias a recordatorios automáticos</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">😊</div>
              <p className="text-3xl sm:text-4xl font-black text-cyan-400">98.5%</p>
              <p className="text-xs font-bold text-slate-200">Familias Satisfechas</p>
              <p className="text-[11px] text-slate-400">Información en su celular 24/7</p>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all"
            >
              🚀 Quiero estos resultados en mi colegio
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
         SECTION 4: PORTALES EN VIVO (CENTRO DE ACCESO RÁPIDO)
         ──────────────────────────────────────────────────────────── */}
      <section id="portales" className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Prueba los Portales
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Accede a los 4 Portales Escolares en Tiempo Real
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Cada perfil tiene una experiencia pensada a su medida. Haz clic en cualquiera para abrirlo directamente:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. School Admin */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
                  🏫
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  Puerto 3006
                </span>
                <h3 className="text-lg font-bold text-white">Director & Administración</h3>
                <p className="text-xs text-slate-400">
                  Planillas de profesores, mallas curriculares, cobranzas de pensiones y reportes ejecutivos.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-400 font-mono">
                  <span>Usuario: </span><span className="text-white">director@sancleo.edu.pe</span><br />
                  <span>Clave: </span><span className="text-white">Cole2026!</span>
                </div>
              </div>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition-all shadow-md shadow-emerald-600/20"
              >
                Abrir Portal Director →
              </a>
            </div>

            {/* 2. Teacher Portal */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">
                  👩‍🏫
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                  Puerto 3007
                </span>
                <h3 className="text-lg font-bold text-white">Portal del Profesor</h3>
                <p className="text-xs text-slate-400">
                  Registro de asistencia con un clic, calificaciones del 0 al 20, logro AD/A/B y libretas oficiales.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-400 font-mono">
                  <span>Usuario: </span><span className="text-white">profesor@sancleo.edu.pe</span><br />
                  <span>Clave: </span><span className="text-white">Cole2026!</span>
                </div>
              </div>
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center transition-all shadow-md shadow-indigo-600/20"
              >
                Abrir Portal Profesor →
              </a>
            </div>

            {/* 3. Parent Portal */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between hover:border-amber-500/40 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
                  👨‍👩‍👧‍👦
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                  Puerto 3008
                </span>
                <h3 className="text-lg font-bold text-white">Portal de Padres</h3>
                <p className="text-xs text-slate-400">
                  Notas de los hijos, puntualidad, pagos de pensión en línea y tienda de uniformes y talleres.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-400 font-mono">
                  <span>Usuario: </span><span className="text-white">familia.garcia@gmail.com</span><br />
                  <span>Clave: </span><span className="text-white">Cole2026!</span>
                </div>
              </div>
              <a
                href="http://localhost:3003"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs text-center transition-all shadow-md shadow-amber-600/20"
              >
                Abrir Portal Padres →
              </a>
            </div>

            {/* 4. Student Portal */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl">
                  🎒
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full">
                  Puerto 3009
                </span>
                <h3 className="text-lg font-bold text-white">Portal del Alumno</h3>
                <p className="text-xs text-slate-400">
                  Horario de clases semanal, salones, boleta de notas por bimestre y asistencia personal.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-400 font-mono">
                  <span>Usuario: </span><span className="text-white">alumno@sancleo.edu.pe</span><br />
                  <span>Clave: </span><span className="text-white">Cole2026!</span>
                </div>
              </div>
              <a
                href="http://localhost:3004"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs text-center transition-all shadow-md shadow-cyan-600/20"
              >
                Abrir Portal Alumno →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
         SECTION 5: TESTIMONIOS REALES (HISTORIAS HUMANAS)
         ──────────────────────────────────────────────────────────── */}
      <section id="testimonios" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
            Historias Reales
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Lo que dicen quienes ya lo usan todos los días
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Directores, maestros y padres comparten cómo mejoró la convivencia y organización en sus colegios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
            <p className="text-sm text-slate-300 leading-relaxed italic">
              &ldquo;Antes pasábamos semanas enteras cerrando bimestres y sufriendo con las libretas en Excel. Ahora en 10 minutos todo está promediado, aprobado y los papás lo ven en su celular. Fue el mejor cambio del año.&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center text-sm">
                CS
              </div>
              <div>
                <p className="text-xs font-bold text-white">Carmen Silva</p>
                <p className="text-[11px] text-slate-400">Directora General • Colegio San Cleo</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
            <p className="text-sm text-slate-300 leading-relaxed italic">
              &ldquo;Tomar lista y registrar notas ahora me toma solo 2 minutos desde mi celular. Ya no me llevo cerros de carpetas a mi casa el fin de semana. Tengo más tiempo para preparar mis clases y descansar con mi familia.&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 font-black flex items-center justify-center text-sm">
                ET
              </div>
              <div>
                <p className="text-xs font-bold text-white">Prof. Eduardo Torres</p>
                <p className="text-[11px] text-slate-400">Docente de Primaria y Tutor</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
            <p className="text-sm text-slate-300 leading-relaxed italic">
              &ldquo;Pagar la pensión escolar desde mi teléfono en un minuto y ver las notas de mi hijo el mismo día del examen me da muchísima tranquilidad. La tienda para comprar los uniformes es súper práctica.&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-sm">
                PM
              </div>
              <div>
                <p className="text-xs font-bold text-white">Patricia Morales</p>
                <p className="text-[11px] text-slate-400">Madre de Familia (1er y 4to Grado)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
         SECTION 6: PREGUNTAS FRECUENTES (FAQ)
         ──────────────────────────────────────────────────────────── */}
      <section id="preguntas" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Dudas Comunes
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="text-sm text-slate-300">
              Respuestas directas, claras y sin palabras técnicas enredadas.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-white">{faq.q}</span>
                  <span className="text-slate-400 text-lg font-bold">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
         FINAL CTA BANNER
         ──────────────────────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-emerald-950 border border-slate-700/80 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Comienza hoy mismo
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              ¿Listo para transformar la experiencia en tu colegio?
            </h2>
            <p className="text-sm sm:text-base text-slate-200">
              Agenda una demostración guiada sin ningún compromiso o prueba los portales directamente. Te acompañamos en todo momento.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all"
              >
                📅 Solicitar Demostración Gratis
              </button>
              <button
                onClick={() => setPortalModalOpen(true)}
                className="px-8 py-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm border border-slate-700 transition-all"
              >
                🔑 Ver Portales en Vivo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
         FOOTER
         ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-base">
              🎓
            </div>
            <div>
              <p className="font-bold text-white text-sm">COLE Platform</p>
              <p className="text-[11px] text-slate-400">Software Integral de Gestión para Instituciones Educativas</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
            <a href="#para-quien" className="hover:text-white transition-colors">Para Quién Es</a>
            <a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a>
            <a href="#calculadora" className="hover:text-white transition-colors">Calculadora</a>
            <a href="#portales" className="hover:text-white transition-colors">Portales Demo</a>
            <button
              onClick={() => setSuperAdminView('login')}
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold"
            >
              🔒 Acceso Super Admin
            </button>
          </div>

          <p className="text-slate-400 text-center sm:text-right">
            © 2026 COLE Platform. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* ────────────────────────────────────────────────────────────
         MODAL: SELECTOR DE PORTALES EN VIVO
         ──────────────────────────────────────────────────────────── */}
      {portalModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">Selecciona el Portal que deseas probar</h3>
                <p className="text-xs text-slate-400 mt-0.5">Puedes abrir y explorar cualquier perfil en tiempo real.</p>
              </div>
              <button
                onClick={() => setPortalModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-start gap-3 group"
              >
                <span className="text-2xl p-2 rounded-xl bg-emerald-500/10">🏫</span>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Director & Admin</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Planillas, finanzas, matrícula y reportes (3006)</p>
                </div>
              </a>

              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-start gap-3 group"
              >
                <span className="text-2xl p-2 rounded-xl bg-indigo-500/10">👩‍🏫</span>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Profesor</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Asistencia diaria, notas 0-20 y libretas (3007)</p>
                </div>
              </a>

              <a
                href="http://localhost:3003"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all flex items-start gap-3 group"
              >
                <span className="text-2xl p-2 rounded-xl bg-amber-500/10">👨‍👩‍👧‍👦</span>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Padres de Familia</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Notas de hijos, pagos y tienda escolar (3008)</p>
                </div>
              </a>

              <a
                href="http://localhost:3004"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-start gap-3 group"
              >
                <span className="text-2xl p-2 rounded-xl bg-cyan-500/10">🎒</span>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Alumno</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Horarios, asignaturas y promedios (3009)</p>
                </div>
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
              💡 Credenciales de demostración: contraseña universal <code className="text-indigo-400 font-bold">Cole2026!</code>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL: SOLICITAR DEMOSTRACIÓN GUIADA
         ──────────────────────────────────────────────────────────── */}
      {demoModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">Solicitar Demostración Guiada</h3>
                <p className="text-xs text-slate-400 mt-0.5">Te mostramos cómo funciona adaptado a tu colegio.</p>
              </div>
              <button
                onClick={() => { setDemoModalOpen(false); setDemoSubmitted(false); }}
                className="text-slate-400 hover:text-white text-xl p-1"
              >
                ✕
              </button>
            </div>

            {demoSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl mx-auto flex items-center justify-center">
                  ✓
                </div>
                <h4 className="text-lg font-bold text-white">¡Solicitud recibida con éxito!</h4>
                <p className="text-xs text-slate-300">
                  Un asesor educativo de nuestro equipo te contactará por WhatsApp o correo en menos de 2 horas para coordinar la hora que mejor te acomode.
                </p>
                <button
                  onClick={() => { setDemoModalOpen(false); setDemoSubmitted(false); }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDemoSubmitted(true);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Nombre y Apellidos</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Directora María Ramos"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Nombre del Colegio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Colegio San Agustín"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">WhatsApp / Teléfono</label>
                  <input
                    type="tel"
                    required
                    placeholder="+51 987 654 321"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Cantidad aproximada de alumnos</label>
                  <select className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                    <option>50 a 150 alumnos</option>
                    <option>150 a 500 alumnos</option>
                    <option>500 a 1500 alumnos</option>
                    <option>Más de 1500 alumnos</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all mt-2"
                >
                  Confirmar y Agendar Demostración
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
