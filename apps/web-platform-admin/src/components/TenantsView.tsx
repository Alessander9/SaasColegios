'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getTenants, getPlans, createTenant, updateTenant, getTenantById, checkEntitlement,
  type PlatformTenant, type PlatformPlan, type CreateTenantDto,
} from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';

/* ── Fallback mock data ── */
const MOCK_PLANS: PlatformPlan[] = [
  { id: 'p1', code: 'PLAN_BASIC', name: 'Básico', description: 'Plan de inicio', maxStudents: 150, maxTeachers: 15, maxStorageGb: 10, features: ['academic', 'enrollment', 'notifications'], monthlyPrice: 99, annualPrice: 990, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'p2', code: 'PLAN_PRO', name: 'Profesional', description: 'Para colegios en crecimiento', maxStudents: 500, maxTeachers: 50, maxStorageGb: 50, features: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'], monthlyPrice: 199, annualPrice: 1990, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'p3', code: 'PLAN_ENT', name: 'Enterprise', description: 'Solución integral', maxStudents: 1500, maxTeachers: 150, maxStorageGb: 200, features: ['academic', 'enrollment', 'finance', 'commerce', 'activities', 'hr', 'payroll', 'notifications', 'documents', 'reporting'], monthlyPrice: 399, annualPrice: 3990, isActive: true, createdAt: '', updatedAt: '' },
];

const MOCK_TENANTS: PlatformTenant[] = [
  { id: 't-1', slug: 'sancleo', name: 'Colegio San Cleo', subdomain: 'sancleo', status: 'ACTIVE', planId: 'p2', plan: MOCK_PLANS[1], usageMetrics: [{ id: 'u1', tenantId: 't-1', metricKey: 'students', value: 480, periodKey: 'current' }], createdAt: '2025-01-15T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 't-2', slug: 'inmaculada', name: 'Inmaculada Concepción', subdomain: 'inmaculada', status: 'ACTIVE', planId: 'p3', plan: MOCK_PLANS[2], usageMetrics: [{ id: 'u2', tenantId: 't-2', metricKey: 'students', value: 1120, periodKey: 'current' }], createdAt: '2024-09-01T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
  { id: 't-3', slug: 'montessori', name: 'Academia Montessori', subdomain: 'montessori', status: 'TRIAL', planId: 'p1', plan: MOCK_PLANS[0], usageMetrics: [{ id: 'u3', tenantId: 't-3', metricKey: 'students', value: 45, periodKey: 'current' }], createdAt: '2026-07-20T00:00:00Z', updatedAt: '2026-08-15T00:00:00Z' },
];

function getStudentCount(t: PlatformTenant): number {
  return t.usageMetrics?.find((u) => u.metricKey === 'students' && u.periodKey === 'current')?.value ?? 0;
}

const FEATURE_LABELS: Record<string, { label: string; icon: string }> = {
  academic: { label: 'Gestión Académica & Notas', icon: '📝' },
  enrollment: { label: 'Matrícula & Registro', icon: '📋' },
  finance: { label: 'Tesorería & Cobranzas', icon: '💳' },
  commerce: { label: 'Tienda Escolar Online', icon: '🛍️' },
  activities: { label: 'Talleres Extracurriculares', icon: '⚽' },
  hr: { label: 'Recursos Humanos & Docentes', icon: '👥' },
  payroll: { label: 'Cálculo de Planillas', icon: '💼' },
  notifications: { label: 'Notificaciones Push & Email', icon: '🔔' },
  documents: { label: 'Gestor Documental', icon: '📄' },
  reporting: { label: 'Reportes Ejecutivos & BI', icon: '📊' },
  advanced_analytics: { label: 'Analítica Predictiva', icon: '🔬' },
  custom_domain: { label: 'Dominio Personalizado', icon: '🌐' },
};

/* ── Tenant Detail Modal ── */
function TenantDetailModal({ tenant, plans, onClose, onUpdated }: {
  tenant: PlatformTenant;
  plans: PlatformPlan[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { formatMoney } = useCurrency();
  const [detail, setDetail] = useState<PlatformTenant>(tenant);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState(tenant.status);
  const [editPlanId, setEditPlanId] = useState(tenant.planId);
  const [entitlements, setEntitlements] = useState<Record<string, { allowed: boolean; current?: number; limit?: number }>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const d = await getTenantById(tenant.id);
        setDetail(d);
        setEditStatus(d.status);
        setEditPlanId(d.planId);
        const entResults: Record<string, { allowed: boolean; current?: number; limit?: number }> = {};
        for (const f of (d.plan?.features ?? [])) {
          try {
            entResults[f] = await checkEntitlement(d.id, f);
          } catch { /* skip */ }
        }
        setEntitlements(entResults);
      } catch { /* use passed tenant */ }
      setLoading(false);
    }
    load();
  }, [tenant.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTenant(tenant.id, { status: editStatus, planId: editPlanId });
      onUpdated();
      onClose();
    } catch (e) {
      alert('Error al actualizar: ' + (e as Error).message);
    }
    setSaving(false);
  };

  const sc = getStudentCount(detail);
  const plan = plans.find((p) => p.id === editPlanId) ?? detail.plan;
  const pct = plan ? Math.round((sc / plan.maxStudents) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-view" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-slate-800 shadow-2xl hover-lift-sm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white text-base font-black shadow-md shadow-indigo-500/20 transition-transform duration-300 hover:scale-105">
              {detail.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">{detail.name}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
                  detail.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : detail.status === 'TRIAL'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {detail.status}
                </span>
              </div>
              <p className="text-xs font-mono font-medium text-blue-600 mt-0.5">{detail.subdomain}.cole.pe</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all btn-interactive">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">Cargando telemetría...</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 hover-lift-sm transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Capacidad Alumnos</span>
                  <span className="text-blue-600 group-hover:scale-110 transition-transform">👥</span>
                </div>
                <p className="text-xl font-bold text-slate-900 mt-1">{sc} <span className="text-xs font-normal text-slate-500">/ {plan?.maxStudents ?? '—'}</span></p>
                <div className="w-full h-1 bg-blue-200 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${pct > 90 ? 'bg-rose-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-100 hover-lift-sm transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-orange-700 uppercase">Facturación MRR</span>
                  <span className="text-orange-600 group-hover:scale-110 transition-transform">💵</span>
                </div>
                <p className="text-xl font-bold text-orange-700 mt-1">{formatMoney(plan?.monthlyPrice ?? 0)} <span className="text-xs font-normal text-slate-500">/mes</span></p>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold">Plan {plan?.name}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 hover-lift-sm transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-700 uppercase">Módulos Activos</span>
                  <span className="text-purple-600 group-hover:scale-110 transition-transform">⚡</span>
                </div>
                <p className="text-xl font-bold text-purple-700 mt-1">{plan?.features.length ?? 0} <span className="text-xs font-normal text-slate-500">activos</span></p>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold">Entitlements OK</p>
              </div>
            </div>

            {/* Feature Entitlements Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Entitlements del Plan</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {plan?.features.length} Habilitados
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(plan?.features ?? []).map((f) => {
                  const ent = entitlements[f];
                  const allowed = ent?.allowed !== false;
                  const featMeta = FEATURE_LABELS[f] ?? { label: f, icon: '📦' };

                  return (
                    <div key={f} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60 transition-all duration-200 text-xs group">
                      <div className="flex items-center gap-2">
                        <span className="text-xs group-hover:scale-110 transition-transform">{featMeta.icon}</span>
                        <span className="font-semibold text-slate-800">{featMeta.label}</span>
                      </div>
                      <span className={`text-[10px] font-bold transition-all ${allowed ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200' : 'text-rose-600'}`}>
                        {allowed ? '✓ Activo' : '✗ Bloqueado'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Edit Controls */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">⚙️</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Configuración de Suscripción</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Estado Operativo</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as PlatformTenant['status'])}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                  >
                    <option value="ACTIVE">ACTIVE (Operativo - Verde)</option>
                    <option value="TRIAL">TRIAL (Período de prueba - Naranja)</option>
                    <option value="SUSPENDED">SUSPENDED (Suspendido - Rojo)</option>
                    <option value="ARCHIVED">ARCHIVED (Archivado)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tier / Plan Comercial</label>
                  <select
                    value={editPlanId}
                    onChange={(e) => setEditPlanId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {formatMoney(p.monthlyPrice)}/mes ({p.maxStudents} alumnos)</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-all hover:bg-slate-50 btn-interactive"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm hover:shadow-blue-500/25 transition-all disabled:opacity-50 btn-interactive"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Create Tenant Modal ── */
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slug) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const dto: CreateTenantDto = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        planId,
      };
      await createTenant(dto);
      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-view" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full text-slate-800 shadow-2xl hover-lift-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100 text-blue-700">🏫</span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Registrar Nuevo Colegio</h3>
              <p className="text-xs text-slate-500">Provisión de tenant multi-tenant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 btn-interactive">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nombre de la Institución</label>
            <input
              type="text"
              required
              placeholder="Ej: Colegio San Agustín"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Subdominio</label>
            <div className="flex items-center">
              <input
                type="text"
                required
                placeholder="sanagustin"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-l-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-500 shadow-sm"
              />
              <span className="px-3 py-2.5 bg-blue-50 border border-l-0 border-blue-200 rounded-r-lg text-xs font-bold text-blue-700">
                .cole.pe
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Plan Comercial</label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {formatMoney(p.monthlyPrice)}/mes ({p.maxStudents} alumnos)</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-all hover:bg-slate-50 btn-interactive"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 btn-interactive"
            >
              {saving ? 'Creando...' : 'Crear Colegio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Tenants View ── */
export default function TenantsView() {
  const { config } = useCurrency();
  const [tenants, setTenants] = useState<PlatformTenant[]>(MOCK_TENANTS);
  const [plans, setPlans] = useState<PlatformPlan[]>(MOCK_PLANS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [detailTenant, setDetailTenant] = useState<PlatformTenant | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([getTenants(), getPlans()]);
      setTenants(t);
      setPlans(p);
    } catch { /* fallback */ }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filtered = tenants.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.subdomain.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5 animate-view">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Directorio de Colegios</h2>
          <p className="text-xs text-slate-500 mt-0.5">Gestión de instituciones, cuotas y suscripciones ({config.name} • {config.symbol})</p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="btn-interactive flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <span>+</span>
          <span>Registrar Colegio</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por institución o subdominio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[11px] font-medium text-slate-600">
          {[
            { id: 'ALL', label: 'Todos', color: 'hover:text-slate-900' },
            { id: 'ACTIVE', label: 'Activos', color: 'hover:text-emerald-700' },
            { id: 'TRIAL', label: 'En Prueba', color: 'hover:text-orange-700' },
            { id: 'SUSPENDED', label: 'Suspendidos', color: 'hover:text-rose-700' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1 rounded-md transition-all ${
                filterStatus === s.id ? 'bg-white text-slate-900 font-bold shadow-sm' : s.color
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Institución</th>
                <th className="px-5 py-3">Subdominio</th>
                <th className="px-5 py-3">Plan Comercial</th>
                <th className="px-5 py-3">Cuota Alumnos</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Cargando directorio...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No se encontraron instituciones.</td></tr>
              ) : (
                filtered.map((t) => {
                  const sc = getStudentCount(t);
                  const max = t.plan?.maxStudents ?? 100;
                  const pct = Math.round((sc / max) * 100);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setDetailTenant(t)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-50 via-indigo-50 to-orange-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{t.name}</p>
                            <p className="text-[10px] text-slate-400">ID: {t.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-blue-600 font-medium">
                        {t.subdomain}.cole.pe
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          {t.plan?.name ?? '—'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="w-28">
                          <div className="flex justify-between text-[10px] mb-1 font-medium">
                            <span className="text-slate-500">{sc}/{max}</span>
                            <span className={pct > 90 ? 'text-rose-600 font-bold' : pct > 70 ? 'text-orange-600 font-bold' : 'text-emerald-700 font-bold'}>{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                            <div
                              className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : t.status === 'TRIAL'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDetailTenant(t); }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-blue-700 bg-white hover:bg-slate-50 rounded border border-slate-200 transition-all shadow-sm"
                        >
                          Configurar →
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

      {/* Modals */}
      {showCreate && <CreateTenantModal plans={plans} onClose={() => setShowCreate(false)} onCreated={reload} />}
      {detailTenant && <TenantDetailModal tenant={detailTenant} plans={plans} onClose={() => setDetailTenant(null)} onUpdated={reload} />}
    </div>
  );
}
