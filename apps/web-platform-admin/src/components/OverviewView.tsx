'use client';

import React, { useEffect, useState } from 'react';
import {
  getPlatformMetrics,
  getTenants,
  getPlans,
  type PlatformMetrics,
  type PlatformTenant,
  type PlatformPlan,
} from '../lib/api';

/* ── Fallback mock data (shown when API is unreachable) ── */
const MOCK_METRICS: PlatformMetrics = {
  tenants: { total: 3, active: 2, trial: 1, suspended: 0 },
  usage: { totalStudentsActive: 1645 },
  catalog: { activePlans: 3 },
  timestamp: '2026-01-01T00:00:00.000Z', // fixed to avoid SSR/client hydration mismatch
};

const MOCK_TENANTS: PlatformTenant[] = [
  { id: 't-1', slug: 'sancleo', name: 'Colegio San Cleo', subdomain: 'sancleo', status: 'ACTIVE', planId: 'p2', plan: { id: 'p2', code: 'PLAN_PRO', name: 'Profesional', maxStudents: 600, maxTeachers: 50, maxStorageGb: 50, features: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'], monthlyPrice: 199, annualPrice: 1990, isActive: true, createdAt: '', updatedAt: '' }, usageMetrics: [{ id: 'u1', tenantId: 't-1', metricKey: 'students', value: 480, periodKey: 'current' }], createdAt: '2025-01-15T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 't-2', slug: 'inmaculada', name: 'Inmaculada Concepción', subdomain: 'inmaculada', status: 'ACTIVE', planId: 'p3', plan: { id: 'p3', code: 'PLAN_ENT', name: 'Enterprise', maxStudents: 1500, maxTeachers: 150, maxStorageGb: 200, features: ['academic', 'enrollment', 'finance', 'commerce', 'activities', 'hr', 'payroll', 'notifications', 'documents', 'reporting'], monthlyPrice: 399, annualPrice: 3990, isActive: true, createdAt: '', updatedAt: '' }, usageMetrics: [{ id: 'u2', tenantId: 't-2', metricKey: 'students', value: 1120, periodKey: 'current' }], createdAt: '2024-09-01T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
  { id: 't-3', slug: 'montessori', name: 'Academia Montessori', subdomain: 'montessori', status: 'TRIAL', planId: 'p1', plan: { id: 'p1', code: 'PLAN_BASIC', name: 'Básico', maxStudents: 150, maxTeachers: 15, maxStorageGb: 10, features: ['academic', 'enrollment', 'notifications'], monthlyPrice: 99, annualPrice: 990, isActive: true, createdAt: '', updatedAt: '' }, usageMetrics: [{ id: 'u3', tenantId: 't-3', metricKey: 'students', value: 45, periodKey: 'current' }], createdAt: '2026-07-20T00:00:00Z', updatedAt: '2026-08-15T00:00:00Z' },
];

const MOCK_PLANS: PlatformPlan[] = [
  { id: 'p1', code: 'PLAN_BASIC', name: 'Básico', description: 'Plan de inicio para colegios pequeños', maxStudents: 150, maxTeachers: 15, maxStorageGb: 10, features: ['academic', 'enrollment', 'notifications'], monthlyPrice: 99, annualPrice: 990, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'p2', code: 'PLAN_PRO', name: 'Profesional', description: 'Para colegios en crecimiento', maxStudents: 500, maxTeachers: 50, maxStorageGb: 50, features: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'], monthlyPrice: 199, annualPrice: 1990, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'p3', code: 'PLAN_ENT', name: 'Enterprise', description: 'Solución integral para grandes instituciones', maxStudents: 1500, maxTeachers: 150, maxStorageGb: 200, features: ['academic', 'enrollment', 'finance', 'commerce', 'activities', 'hr', 'payroll', 'notifications', 'documents', 'reporting'], monthlyPrice: 399, annualPrice: 3990, isActive: true, createdAt: '', updatedAt: '' },
];

function getStudentCount(t: PlatformTenant): number {
  const m = t.usageMetrics?.find((u) => u.metricKey === 'students' && u.periodKey === 'current');
  return m?.value ?? 0;
}

function getMRR(tenants: PlatformTenant[]): number {
  return tenants.reduce((acc, t) => acc + (t.plan?.monthlyPrice ?? 0), 0);
}

/* ────────────────────────────────────────────────────────────
   OVERVIEW VIEW
   ──────────────────────────────────────────────────────────── */
export default function OverviewView() {
  const [metrics, setMetrics] = useState<PlatformMetrics>(MOCK_METRICS);
  const [tenants, setTenants] = useState<PlatformTenant[]>(MOCK_TENANTS);
  const [plans, setPlans] = useState<PlatformPlan[]>(MOCK_PLANS);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [m, t, p] = await Promise.all([
          getPlatformMetrics(),
          getTenants(),
          getPlans(),
        ]);
        setMetrics(m);
        setTenants(t);
        setPlans(p);
        setApiConnected(true);
      } catch {
        setApiConnected(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalStudents = metrics.usage.totalStudentsActive || tenants.reduce((a, t) => a + getStudentCount(t), 0);
  const mrr = getMRR(tenants);
  const arr = mrr * 12;

  const kpis = [
    {
      label: 'Colegios Activos',
      value: metrics.tenants.active,
      sub: `${metrics.tenants.trial} en prueba`,
      icon: '🏫',
      color: 'from-indigo-500 to-violet-600',
      textColor: 'text-indigo-400',
      glow: 'shadow-indigo-500/20',
    },
    {
      label: 'Alumnos Totales',
      value: totalStudents.toLocaleString(),
      sub: 'En todas las instituciones',
      icon: '👨‍🎓',
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
      glow: 'shadow-emerald-500/20',
    },
    {
      label: 'MRR (Ingreso Mensual)',
      value: `$${mrr.toLocaleString()}`,
      sub: `$${arr.toLocaleString()} ARR anual`,
      icon: '💰',
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400',
      glow: 'shadow-amber-500/20',
    },
    {
      label: 'Planes Activos',
      value: metrics.catalog.activePlans,
      sub: 'Tiers comerciales',
      icon: '💳',
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400',
      glow: 'shadow-cyan-500/20',
    },
  ];

  const recentTenants = [...tenants].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Panel General</h1>
          <p className="text-sm text-slate-400 mt-1">Vista general de la plataforma Cole</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          apiConnected
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          {apiConnected ? 'API Conectada' : 'Modo Demo (API Off)'}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`relative overflow-hidden p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl ${kpi.glow} hover:-translate-y-1 transition-transform duration-300`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${kpi.color} opacity-10 rounded-bl-[60px]`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <p className={`text-3xl font-black ${kpi.textColor} mt-2`}>{loading ? '—' : kpi.value}</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">{kpi.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-2xl shadow-lg`}>
                {kpi.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Tenant Status + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenant Status Summary */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Estado de Colegios</h2>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">{tenants.length} total</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Activos', count: metrics.tenants.active, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '✅' },
              { label: 'En Prueba', count: metrics.tenants.trial, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: '🧪' },
              { label: 'Suspendidos', count: metrics.tenants.suspended, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: '⛔' },
            ].map((s) => (
              <div key={s.label} className={`p-4 rounded-xl ${s.bg} border text-center`}>
                <span className="text-lg">{s.icon}</span>
                <p className={`text-2xl font-black ${s.color} mt-1`}>{loading ? '—' : s.count}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actividad Reciente de Colegios</h3>
            {recentTenants.map((t) => {
              const sc = getStudentCount(t);
              const pct = t.plan ? Math.round((sc / t.plan.maxStudents) * 100) : 0;
              return (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-300">
                    {t.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{t.name}</p>
                    <p className="text-[10px] text-slate-500">{t.subdomain}.cole.pe • {t.plan?.name ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{sc} alumnos</p>
                    <div className="w-20 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-white">Distribución por Plan</h2>
          <div className="space-y-4">
            {plans.map((plan) => {
              const tenantsOnPlan = tenants.filter((t) => t.planId === plan.id);
              const pct = tenants.length > 0 ? Math.round((tenantsOnPlan.length / tenants.length) * 100) : 0;
              return (
                <div key={plan.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{plan.name}</span>
                    <span className="text-[10px] font-bold text-slate-400">{tenantsOnPlan.length} colegios</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        plan.code === 'PLAN_BASIC' ? 'bg-emerald-500' :
                        plan.code === 'PLAN_PRO' ? 'bg-indigo-500' : 'bg-violet-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">${plan.monthlyPrice}/mes</span>
                    <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumen Rápido</h3>
            <div className="space-y-2">
              {[
                { label: 'MRR Total', value: `$${mrr.toLocaleString()}`, icon: '💵' },
                { label: 'ARR Proyectado', value: `$${arr.toLocaleString()}`, icon: '📈' },
                { label: 'Promedio/Alumno', value: totalStudents > 0 ? `$${(mrr / totalStudents).toFixed(1)}` : '$0', icon: '🧮' },
                { label: 'Colegios Totales', value: String(tenants.length), icon: '🏫' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-[11px] font-medium text-slate-400">{s.label}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
