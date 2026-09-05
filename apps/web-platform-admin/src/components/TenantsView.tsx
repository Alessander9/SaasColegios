'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getTenants, getPlans, createTenant, updateTenant, getTenantById, checkEntitlement,
  type PlatformTenant, type PlatformPlan, type CreateTenantDto,
} from '../lib/api';

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

const FEATURE_LABELS: Record<string, string> = {
  academic: '📋 Académico',
  enrollment: '📝 Matrícula',
  finance: '💰 Finanzas',
  commerce: '🛍️ Comercio',
  activities: '🎯 Actividades',
  hr: '👥 RRHH',
  payroll: '💼 Planillas',
  notifications: '🔔 Notificaciones',
  documents: '📄 Documentos',
  reporting: '📊 Reportes',
  advanced_analytics: '🔬 Analytics Avanzado',
  custom_domain: '🌐 Dominio Custom',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  TRIAL: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  SUSPENDED: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  ARCHIVED: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

/* ────────────────────────────────────────────────────────────
   TENANT DETAIL MODAL
   ──────────────────────────────────────────────────────────── */
function TenantDetailModal({ tenant, plans, onClose, onUpdated }: {
  tenant: PlatformTenant;
  plans: PlatformPlan[];
  onClose: () => void;
  onUpdated: () => void;
}) {
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
        // Load entitlements for each feature
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
  const sty = STATUS_STYLES[detail.status] ?? STATUS_STYLES.ACTIVE;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-100" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/20">
              {detail.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{detail.name}</h2>
              <p className="text-xs text-slate-400">{detail.subdomain}.cole.pe</p>
              <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sty.bg} ${sty.text} ${sty.border}`}>
                {detail.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-lg">✕</button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Cargando detalles del colegio...</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <p className="text-2xl font-black text-indigo-400">{sc}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Alumnos</p>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{sc}/{plan?.maxStudents ?? '—'} ({pct}%)</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <p className="text-2xl font-black text-emerald-400">${plan?.monthlyPrice ?? 0}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Mensual</p>
                <p className="text-[10px] text-slate-500 mt-1">{plan?.name ?? '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <p className="text-2xl font-black text-violet-400">{plan?.features.length ?? 0}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Módulos</p>
                <p className="text-[10px] text-slate-500 mt-1">Funciones activas</p>
              </div>
            </div>

            {/* Features Entitlements */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Entitlements / Funciones Habilitadas</h3>
              <div className="grid grid-cols-2 gap-2">
                {(plan?.features ?? []).map((f) => {
                  const ent = entitlements[f];
                  return (
                    <div key={f} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className={`w-2 h-2 rounded-full ${ent?.allowed !== false ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white">{FEATURE_LABELS[f] ?? f}</p>
                        {ent?.current !== undefined && ent?.limit !== undefined && (
                          <p className="text-[10px] text-slate-500">{ent.current} / {ent.limit} usado</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold ${ent?.allowed !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {ent?.allowed !== false ? '✓ Activo' : '✗ Bloqueado'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Edit Controls */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuración del Colegio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Estado</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as PlatformTenant['status'])}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="TRIAL">Trial</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Plan</label>
                  <select
                    value={editPlanId}
                    onChange={(e) => setEditPlanId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (${p.monthlyPrice}/mes)</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all">
                Cerrar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
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

/* ────────────────────────────────────────────────────────────
   CREATE TENANT MODAL
   ──────────────────────────────────────────────────────────── */
function CreateTenantModal({ plans, onClose, onCreated }: {
  plans: PlatformPlan[];
  onClose: () => void;
  onCreated: () => void;
}) {
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-100" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-white">Registrar Nuevo Colegio</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nombre de la Institución</label>
            <input type="text" required placeholder="Ej: Colegio San Agustín" value={name} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Slug (identificador único)</label>
            <input type="text" required placeholder="sanagustin" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Subdominio</label>
            <div className="flex items-center gap-0">
              <input type="text" required placeholder="sanagustin" value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-l-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              <span className="px-4 py-3 bg-slate-800 border border-l-0 border-slate-800 rounded-r-xl text-xs font-bold text-slate-400">.cole.pe</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Plan Comercial</label>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ${p.monthlyPrice}/mes ({p.maxStudents} alumnos)</option>
              ))}
            </select>
          </div>
          {error && <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</div>}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all">Cancelar</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50">
              {saving ? 'Creando...' : 'Crear Colegio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   TENANTS VIEW (MAIN)
   ──────────────────────────────────────────────────────────── */
export default function TenantsView() {
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
    } catch { /* use mock data */ }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filtered = tenants.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.subdomain.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Colegios</h1>
          <p className="text-sm text-slate-400 mt-1">{tenants.length} instituciones registradas en la plataforma</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2">
          <span>+</span>
          <span>Registrar Colegio</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o subdominio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${
                filterStatus === s
                  ? 'bg-white text-slate-950 border-white'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {s === 'ALL' ? 'Todos' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Institución</th>
                <th className="px-6 py-4">Subdominio</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Uso / Alumnos</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Registro</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">Cargando colegios...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">No se encontraron colegios con los filtros aplicados.</td></tr>
              ) : (
                filtered.map((t) => {
                  const sc = getStudentCount(t);
                  const max = t.plan?.maxStudents ?? 100;
                  const pct = Math.round((sc / max) * 100);
                  const sty = STATUS_STYLES[t.status] ?? STATUS_STYLES.ACTIVE;
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors cursor-pointer" onClick={() => setDetailTenant(t)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{t.name}</p>
                            <p className="text-[10px] text-slate-500">ID: {t.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-indigo-400">{t.subdomain}.cole.pe</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                          {t.plan?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex justify-between text-[10px] mb-1 font-medium">
                            <span>{sc} / {max}</span>
                            <span className={pct > 90 ? 'text-rose-400' : pct > 70 ? 'text-amber-400' : 'text-emerald-400'}>{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${sty.bg} ${sty.text} ${sty.border}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDetailTenant(t); }}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all"
                        >
                          Ver Detalle →
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
