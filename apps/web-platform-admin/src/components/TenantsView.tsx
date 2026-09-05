'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getTenants, getPlans, createTenant, updateTenant, getTenantById, checkEntitlement,
  type PlatformTenant, type PlatformPlan, type CreateTenantDto,
} from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';

/* ── Fallback mock data ── */
const MOCK_PLANS: PlatformPlan[] = [
  { id: 'p1', code: 'PLAN_BASIC', name: 'Básico', description: 'Plan de inicio para instituciones en crecimiento inicial', maxStudents: 150, maxTeachers: 15, maxStorageGb: 10, features: ['academic', 'enrollment', 'notifications'], monthlyPrice: 99, annualPrice: 990, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'p2', code: 'PLAN_PRO', name: 'Profesional', description: 'Solución integral con cobranzas y tienda virtual', maxStudents: 500, maxTeachers: 50, maxStorageGb: 50, features: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'], monthlyPrice: 199, annualPrice: 1990, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'p3', code: 'PLAN_ENT', name: 'Enterprise', description: 'Suite completa con nóminas, RRHH y analítica avanzada', maxStudents: 1500, maxTeachers: 150, maxStorageGb: 200, features: ['academic', 'enrollment', 'finance', 'commerce', 'activities', 'hr', 'payroll', 'notifications', 'documents', 'reporting'], monthlyPrice: 399, annualPrice: 3990, isActive: true, createdAt: '', updatedAt: '' },
];

const MOCK_TENANTS: PlatformTenant[] = [
  { id: 't-1', slug: 'sancleo', name: 'Colegio San Cleo', subdomain: 'sancleo', status: 'ACTIVE', planId: 'p2', plan: MOCK_PLANS[1], usageMetrics: [{ id: 'u1', tenantId: 't-1', metricKey: 'students', value: 480, periodKey: 'current' }], createdAt: '2025-01-15T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 't-2', slug: 'inmaculada', name: 'Inmaculada Concepción', subdomain: 'inmaculada', status: 'ACTIVE', planId: 'p3', plan: MOCK_PLANS[2], usageMetrics: [{ id: 'u2', tenantId: 't-2', metricKey: 'students', value: 1120, periodKey: 'current' }], createdAt: '2024-09-01T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
  { id: 't-3', slug: 'montessori', name: 'Academia Montessori', subdomain: 'montessori', status: 'TRIAL', planId: 'p1', plan: MOCK_PLANS[0], usageMetrics: [{ id: 'u3', tenantId: 't-3', metricKey: 'students', value: 45, periodKey: 'current' }], createdAt: '2026-07-20T00:00:00Z', updatedAt: '2026-08-15T00:00:00Z' },
];

function getStudentCount(t: PlatformTenant): number {
  return t.usageMetrics?.find((u) => u.metricKey === 'students' && u.periodKey === 'current')?.value ?? 0;
}

const FEATURE_LABELS: Record<string, { label: string; icon: string; category: string }> = {
  academic: { label: 'Gestión Académica & Notas', icon: '📝', category: 'Académico' },
  enrollment: { label: 'Matrícula & Fichas de Ingreso', icon: '📋', category: 'Académico' },
  finance: { label: 'Tesorería, Pensiones & Pagos', icon: '💳', category: 'Finanzas' },
  commerce: { label: 'Tienda Escolar & Uniformes', icon: '🛍️', category: 'Comercio' },
  activities: { label: 'Talleres Extracurriculares', icon: '⚽', category: 'Académico' },
  hr: { label: 'Recursos Humanos & Docentes', icon: '👥', category: 'Gestión' },
  payroll: { label: 'Cálculo de Planillas & Nóminas', icon: '💼', category: 'Finanzas' },
  notifications: { label: 'Notificaciones Push & Alertas', icon: '🔔', category: 'Comunicación' },
  documents: { label: 'Gestor Documental Digital', icon: '📄', category: 'Gestión' },
  reporting: { label: 'Reportes Ejecutivos & BI', icon: '📊', category: 'Dirección' },
  advanced_analytics: { label: 'Analítica Predictiva de Deserción', icon: '🔬', category: 'Dirección' },
  custom_domain: { label: 'Dominio Propio (DNS SSL)', icon: '🌐', category: 'Infraestructura' },
};

/* ── Tenant Detail Modal (3 Modern Tabs) ── */
function TenantDetailModal({ tenant, plans, onClose, onUpdated }: {
  tenant: PlatformTenant;
  plans: PlatformPlan[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { formatMoney } = useCurrency();
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'settings'>('overview');
  const [detail, setDetail] = useState<PlatformTenant>(tenant);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState<PlatformTenant['status']>(tenant.status);
  const [editPlanId, setEditPlanId] = useState(tenant.planId);
  const [editCustomDomain, setEditCustomDomain] = useState(tenant.customDomain || '');
  const [entitlements, setEntitlements] = useState<Record<string, { allowed: boolean; current?: number; limit?: number }>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const d = await getTenantById(tenant.id);
        setDetail(d);
        setEditStatus(d.status);
        setEditPlanId(d.planId);
        setEditCustomDomain(d.customDomain || '');
        const entResults: Record<string, { allowed: boolean; current?: number; limit?: number }> = {};
        for (const f of (d.plan?.features ?? [])) {
          try {
            entResults[f] = await checkEntitlement(d.id, f);
          } catch { /* skip */ }
        }
        setEntitlements(entResults);
      } catch { /* use fallback */ }
      setLoading(false);
    }
    load();
  }, [tenant.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateTenant(tenant.id, {
        status: editStatus,
        planId: editPlanId,
        customDomain: editCustomDomain.trim() || undefined,
      });
      setSaveSuccess(true);
      onUpdated();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (e) {
      alert('Error al actualizar configuración: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const sc = getStudentCount(detail);
  const plan = plans.find((p) => p.id === editPlanId) ?? detail.plan;
  const maxStudents = plan?.maxStudents ?? 100;
  const pct = Math.round((sc / maxStudents) * 100);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={onClose}>
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-50/60 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white text-lg font-black shadow-md shadow-indigo-500/20">
              {detail.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900 leading-none">{detail.name}</h2>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  editStatus === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : editStatus === 'TRIAL'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {editStatus}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-mono font-bold text-blue-600">https://{detail.subdomain}.cole.pe</span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-semibold text-slate-500">Plan {plan?.name}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-white gap-2">
          {[
            { id: 'overview', label: 'Métricas & Cuotas', icon: '📊' },
            { id: 'features', label: 'Módulos & Entitlements', icon: '⚡' },
            { id: 'settings', label: 'Suscripción & Dominio', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs animate-pulse">
              Cargando telemetría del colegio...
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-6 animate-in fade-in">
              {/* Top Stat Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <div className="flex items-center justify-between text-xs text-blue-700 font-bold uppercase tracking-wider">
                    <span>Capacidad Alumnos</span>
                    <span>👥</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    {sc} <span className="text-xs font-normal text-slate-500">/ {maxStudents}</span>
                  </p>
                  <div className="w-full h-2 bg-blue-200/60 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pct > 90 ? 'bg-rose-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mt-1.5 text-right">{pct}% utilizado</p>
                </div>

                <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100">
                  <div className="flex items-center justify-between text-xs text-orange-700 font-bold uppercase tracking-wider">
                    <span>Facturación MRR</span>
                    <span>💵</span>
                  </div>
                  <p className="text-2xl font-black text-orange-600 mt-2">
                    {formatMoney(plan?.monthlyPrice ?? 0)}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {formatMoney((plan?.monthlyPrice ?? 0) * 12)} ARR proyectado
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-md">
                    Tier {plan?.name}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <div className="flex items-center justify-between text-xs text-purple-700 font-bold uppercase tracking-wider">
                    <span>Límites de Docentes</span>
                    <span>👨‍🏫</span>
                  </div>
                  <p className="text-2xl font-black text-purple-700 mt-2">
                    {plan?.maxTeachers ?? 15} <span className="text-xs font-normal text-slate-500">profesores</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {plan?.maxStorageGb ?? 10} GB Almacenamiento
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                    {plan?.features.length ?? 0} Módulos Activos
                  </span>
                </div>
              </div>

              {/* Institution Metadata */}
              <div className="rounded-2xl border border-slate-200/80 p-4 space-y-3 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Información del Sistema</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Identificador Slug:</span>
                    <p className="font-mono font-bold text-slate-800">{detail.slug}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Subdominio Cole:</span>
                    <p className="font-mono font-bold text-blue-600">{detail.subdomain}.cole.pe</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Fecha de Creación:</span>
                    <p className="font-semibold text-slate-700">
                      {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('es-PE', { dateStyle: 'long' }) : '15 de Enero de 2025'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Dominio Personalizado:</span>
                    <p className="font-semibold text-slate-700">
                      {detail.customDomain || 'No configurado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'features' ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Entitlements Habilitados</h4>
                  <p className="text-[11px] text-slate-500">Módulos permitidos según la suscripción del Plan {plan?.name}</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {plan?.features.length} / {Object.keys(FEATURE_LABELS).length} Activos
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(FEATURE_LABELS).map(([featKey, meta]) => {
                  const isIncluded = (plan?.features ?? []).includes(featKey);
                  const ent = entitlements[featKey];
                  const isExplicitlyAllowed = isIncluded && (ent?.allowed !== false);

                  return (
                    <div
                      key={featKey}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                        isIncluded
                          ? 'bg-emerald-50/40 border-emerald-200/80'
                          : 'bg-slate-50/50 border-slate-200/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base">{meta.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{meta.label}</p>
                          <span className="text-[10px] font-semibold text-slate-400">{meta.category}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isExplicitlyAllowed
                          ? 'bg-emerald-100/70 text-emerald-800 border-emerald-200'
                          : 'bg-slate-200/50 text-slate-500 border-slate-200'
                      }`}>
                        {isExplicitlyAllowed ? '✓ Activo' : '✗ Inactivo'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in">
              {/* Operational Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Estado Operativo de la Institución
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'ACTIVE', label: 'Activo', desc: 'Acceso total habilitado', color: 'border-emerald-500 bg-emerald-50/50 text-emerald-800' },
                    { id: 'TRIAL', label: 'En Prueba', desc: '14 días de evaluación', color: 'border-orange-500 bg-orange-50/50 text-orange-800' },
                    { id: 'SUSPENDED', label: 'Suspendido', desc: 'Acceso bloqueado', color: 'border-rose-500 bg-rose-50/50 text-rose-800' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setEditStatus(s.id as any)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        editStatus === s.id ? s.color : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className="text-xs font-bold">{s.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan Tier Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Plan Comercial Asignado
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setEditPlanId(p.id)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        editPlanId === p.id
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{p.name}</p>
                      <p className="text-sm font-black text-blue-600 mt-1">{formatMoney(p.monthlyPrice)}<span className="text-[10px] font-normal text-slate-500">/mes</span></p>
                      <p className="text-[10px] text-slate-500 mt-1 font-semibold">{p.maxStudents} alumnos máx.</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Domain */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dominio Personalizado (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej: colegio.sanagustin.edu.pe"
                  value={editCustomDomain}
                  onChange={(e) => setEditCustomDomain(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">Configuración de DNS con certificado SSL automático.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs">
            {saveSuccess && (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in">
                <span>✓</span> Cambios guardados correctamente
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Create Tenant Modal (Smart Auto-Slug & Live Preview) ── */
function CreateTenantModal({ plans, onClose, onCreated }: {
  plans: PlatformPlan[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const { formatMoney } = useCurrency();
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [slug, setSlug] = useState('');
  const [planId, setPlanId] = useState(plans[0]?.id ?? '');
  const [status, setStatus] = useState<'ACTIVE' | 'TRIAL'>('ACTIVE');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    const cleanSub = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    const cleanSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSubdomain(cleanSub);
    setSlug(cleanSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const dto: CreateTenantDto = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        subdomain: subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
        planId,
        status,
      };
      await createTenant(dto);
      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={onClose}>
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-lg font-black">
              🏫
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Registrar Nuevo Colegio</h3>
              <p className="text-xs text-slate-500">Provisión instantánea de institución SaaS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre de la Institución
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Colegio San Agustín"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs"
            />
          </div>

          {/* Subdomain & Live URL Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subdominio de Plataforma
            </label>
            <div className="flex items-center">
              <input
                type="text"
                required
                placeholder="sanagustin"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-l-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
              />
              <span className="px-3.5 py-2.5 bg-blue-50 border border-l-0 border-blue-200 rounded-r-xl text-xs font-bold text-blue-700">
                .cole.pe
              </span>
            </div>
            {subdomain && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                <span>URL de acceso:</span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  https://{subdomain}.cole.pe
                </span>
              </div>
            )}
          </div>

          {/* Plan Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Seleccionar Plan Comercial
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {plans.map((p) => {
                const isSel = planId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSel
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{p.name}</p>
                    <p className="text-sm font-black text-blue-600 mt-1">
                      {formatMoney(p.monthlyPrice)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{p.maxStudents} alumnos</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial State */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Modalidad de Inicio
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                  status === 'ACTIVE'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span>🟢 Activo Inmediato</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('TRIAL')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                  status === 'TRIAL'
                    ? 'border-orange-500 bg-orange-50 text-orange-800'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span>🟠 Prueba 14 Días</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !subdomain.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Creando...' : 'Crear Colegio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Tenants View (Dual View: Table & Cards Grid) ── */
export default function TenantsView() {
  const { formatMoney } = useCurrency();
  const [tenants, setTenants] = useState<PlatformTenant[]>(MOCK_TENANTS);
  const [plans, setPlans] = useState<PlatformPlan[]>(MOCK_PLANS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showCreate, setShowCreate] = useState(false);
  const [detailTenant, setDetailTenant] = useState<PlatformTenant | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([
        getTenants().catch(() => MOCK_TENANTS),
        getPlans().catch(() => MOCK_PLANS),
      ]);
      setTenants(Array.isArray(t) ? t : MOCK_TENANTS);
      setPlans(Array.isArray(p) ? p : MOCK_PLANS);
    } catch {
      setTenants(MOCK_TENANTS);
      setPlans(MOCK_PLANS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filtered = (tenants || []).filter((t) => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const activeCount = (tenants || []).filter((t) => t.status === 'ACTIVE').length;
  const trialCount = (tenants || []).filter((t) => t.status === 'TRIAL').length;
  const suspendedCount = (tenants || []).filter((t) => t.status === 'SUSPENDED').length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Directorio de Colegios</h2>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              {tenants.length} Registrados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Gestión de instituciones, cuotas de alumnos y suscripciones SaaS</p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="btn-interactive flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02]"
        >
          <span className="text-sm font-black">+</span>
          <span>Registrar Colegio</span>
        </button>
      </div>

      {/* Filter Tabs, Search Bar & Dual View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, subdominio o slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200 rounded-xl p-1 text-xs font-bold">
          {[
            { id: 'ALL', label: `Todos (${tenants.length})` },
            { id: 'ACTIVE', label: `Activos (${activeCount})`, dot: 'bg-emerald-500' },
            { id: 'TRIAL', label: `En Prueba (${trialCount})`, dot: 'bg-orange-500' },
            { id: 'SUSPENDED', label: `Suspendidos (${suspendedCount})`, dot: 'bg-rose-500' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === s.id
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {s.dot && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100/80 border border-slate-200 rounded-xl p-1 text-xs font-bold">
          <button
            onClick={() => setViewMode('table')}
            title="Vista Tabla"
            className={`p-1.5 px-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span>Tabla</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            title="Vista Tarjetas"
            className={`p-1.5 px-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span>Tarjetas</span>
          </button>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5">Institución</th>
                  <th className="px-6 py-3.5">Subdominio SaaS</th>
                  <th className="px-6 py-3.5">Plan Asignado</th>
                  <th className="px-6 py-3.5">Cuota de Alumnos</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Cargando instituciones...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <p className="text-sm font-bold text-slate-700">No se encontraron colegios</p>
                      <p className="text-xs text-slate-400 mt-1">Prueba con otro término de búsqueda o registra una nueva institución.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const sc = getStudentCount(t);
                    const max = t.plan?.maxStudents ?? 100;
                    const pct = Math.round((sc / max) * 100);

                    return (
                      <tr
                        key={t.id}
                        onClick={() => setDetailTenant(t)}
                        className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-50 via-indigo-50 to-orange-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-700 shadow-xs group-hover:scale-105 transition-transform">
                              {t.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{t.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">ID: {t.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">
                          {t.subdomain}.cole.pe
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            {t.plan?.name ?? '—'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="w-32">
                            <div className="flex justify-between text-[10px] mb-1 font-semibold">
                              <span className="text-slate-500">{sc} / {max}</span>
                              <span className={pct > 90 ? 'text-rose-600 font-bold' : pct > 70 ? 'text-orange-600 font-bold' : 'text-emerald-700 font-bold'}>{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            t.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : t.status === 'TRIAL'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {t.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDetailTenant(t); }}
                            className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all shadow-xs cursor-pointer group-hover:border-blue-300"
                          >
                            Configurar ⚙️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => {
            const sc = getStudentCount(t);
            const max = t.plan?.maxStudents ?? 100;
            const pct = Math.round((sc / max) * 100);

            return (
              <div
                key={t.id}
                onClick={() => setDetailTenant(t)}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer space-y-4 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white text-base font-black shadow-sm group-hover:scale-105 transition-transform">
                        {t.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">{t.name}</h3>
                        <p className="text-xs font-mono font-bold text-blue-600 truncate">{t.subdomain}.cole.pe</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      t.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : t.status === 'TRIAL'
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Plan:</span>
                      <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        {t.plan?.name ?? '—'} ({formatMoney(t.plan?.monthlyPrice ?? 0)}/m)
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                        <span className="text-slate-500">Capacidad:</span>
                        <span className={pct > 90 ? 'text-rose-600 font-bold' : pct > 70 ? 'text-orange-600 font-bold' : 'text-emerald-700 font-bold'}>
                          {sc} / {max} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">ID: {t.id.slice(0, 8)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDetailTenant(t); }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Configurar</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateTenantModal
          plans={plans}
          onClose={() => setShowCreate(false)}
          onCreated={reload}
        />
      )}
      {detailTenant && (
        <TenantDetailModal
          tenant={detailTenant}
          plans={plans}
          onClose={() => setDetailTenant(null)}
          onUpdated={reload}
        />
      )}
    </div>
  );
}
