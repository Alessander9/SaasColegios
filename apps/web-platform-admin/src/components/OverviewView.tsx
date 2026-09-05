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

/* ── Fallback mock data ── */
const MOCK_METRICS: PlatformMetrics = {
  tenants: { total: 3, active: 2, trial: 1, suspended: 0 },
  usage: { totalStudentsActive: 1645 },
  catalog: { activePlans: 3 },
  timestamp: '2026-01-01T00:00:00.000Z',
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

export default function OverviewView() {
  const [metrics, setMetrics] = useState<PlatformMetrics>(MOCK_METRICS);
  const [tenants, setTenants] = useState<PlatformTenant[]>(MOCK_TENANTS);
  const [plans, setPlans] = useState<PlatformPlan[]>(MOCK_PLANS);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'30D' | '90D' | 'YTD'>('30D');

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

  const kpiCards = [
    {
      title: 'Colegios Activos',
      value: metrics.tenants.active,
      subValue: `${metrics.tenants.trial} en período de prueba`,
      trend: '+25.0%',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12l3 3.75V21" />
        </svg>
      ),
    },
    {
      title: 'Alumnos Matriculados',
      value: totalStudents.toLocaleString(),
      subValue: 'Base de usuarios activos',
      trend: '+14.8%',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      ),
    },
    {
      title: 'Ingreso Recurrente (MRR)',
      value: `$${mrr.toLocaleString()}`,
      subValue: `$${arr.toLocaleString()} ARR Proyectado`,
      trend: '+18.2%',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Planes Comerciales',
      value: metrics.catalog.activePlans,
      subValue: 'Catálogo de suscripciones',
      trend: 'Estable',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Métricas Ejecutivas</h2>
          <p className="text-xs text-slate-400 mt-0.5">Rendimiento consolidado del ecosistema SaaS</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-medium text-slate-400">
            {(['30D', '90D', 'YTD'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedPeriod === period ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'hover:text-slate-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={() => alert('Informe exportado en formato CSV')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
                {card.icon}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {loading ? '—' : card.value}
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {card.trend}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{card.subValue}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Activity & Revenue Runrate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Institutions (2 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/80 border border-slate-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Instituciones y Utilización de Cuota</h3>
              <p className="text-[11px] text-slate-400">Estado de capacidad de alumnos por colegio</p>
            </div>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              {tenants.length} Colegios
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {tenants.map((t) => {
              const sc = getStudentCount(t);
              const max = t.plan?.maxStudents ?? 100;
              const pct = Math.round((sc / max) * 100);

              return (
                <div key={t.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-1 last:pb-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xs font-bold text-slate-300">
                      {t.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{t.name}</p>
                      <p className="text-[10px] font-mono text-indigo-400 truncate">{t.subdomain}.cole.pe</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Plan Badge */}
                    <span className="hidden sm:inline-block text-[10px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
                      {t.plan?.name ?? '—'}
                    </span>

                    {/* Progress Bar */}
                    <div className="w-28 text-right">
                      <div className="flex justify-between text-[10px] font-medium mb-1">
                        <span className="text-slate-400">{sc} / {max}</span>
                        <span className={pct > 90 ? 'text-rose-400' : 'text-slate-300'}>{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Dot */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      t.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : t.status === 'TRIAL'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: SaaS Tier Breakdown & Telemetry (1 col) */}
        <div className="space-y-4">
          {/* Tier breakdown */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Distribución por Tier</h3>

            <div className="space-y-3">
              {plans.map((plan) => {
                const count = tenants.filter((t) => t.planId === plan.id).length;
                const pct = tenants.length > 0 ? Math.round((count / tenants.length) * 100) : 0;

                return (
                  <div key={plan.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{plan.name}</span>
                      <span className="text-slate-500">${plan.monthlyPrice}/mes • {count} colegios</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          plan.code === 'PLAN_BASIC' ? 'bg-emerald-500' :
                          plan.code === 'PLAN_PRO' ? 'bg-indigo-500' : 'bg-violet-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telemetry Summary */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Salud del Cluster</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/80 border border-slate-900">
                <span className="text-slate-400">Latencia API P95</span>
                <span className="font-mono font-medium text-emerald-400">14 ms</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/80 border border-slate-900">
                <span className="text-slate-400">Disponibilidad SLA</span>
                <span className="font-mono font-medium text-emerald-400">99.98%</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/80 border border-slate-900">
                <span className="text-slate-400">Pool de Conexiones DB</span>
                <span className="font-mono font-medium text-slate-300">12 / 50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
