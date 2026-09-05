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
import { useCurrency } from '../context/CurrencyContext';

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
  const { formatMoney, config } = useCurrency();
  const [metrics, setMetrics] = useState<PlatformMetrics>(MOCK_METRICS);
  const [tenants, setTenants] = useState<PlatformTenant[]>(MOCK_TENANTS);
  const [plans, setPlans] = useState<PlatformPlan[]>(MOCK_PLANS);
  const [loading, setLoading] = useState(true);
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
      } catch {
        /* fallback */
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
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60 group-hover:bg-blue-600 group-hover:text-white',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      glowClass: 'hover-glow-blue',
      icon: (
        <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12l3 3.75V21" />
        </svg>
      ),
    },
    {
      title: 'Alumnos Matriculados',
      value: totalStudents.toLocaleString(),
      subValue: 'Estudiantes activos en el sistema',
      trend: '+14.8%',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 group-hover:bg-emerald-600 group-hover:text-white',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      glowClass: 'hover-glow-emerald',
      icon: (
        <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      ),
    },
    {
      title: `Ingreso Recurrente (${config.code})`,
      value: formatMoney(mrr),
      subValue: `${formatMoney(arr)} ARR Proyectado`,
      trend: '+18.2%',
      iconBg: 'bg-orange-50 text-orange-600 border border-orange-200/60 group-hover:bg-orange-600 group-hover:text-white',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      glowClass: 'hover-glow-orange',
      icon: (
        <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Planes Comerciales',
      value: metrics.catalog.activePlans,
      subValue: 'Tiers activos en catálogo',
      trend: 'Estable',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/60 group-hover:bg-purple-600 group-hover:text-white',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      glowClass: 'hover-glow-purple',
      icon: (
        <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-view">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Métricas Ejecutivas</h2>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-orange-100 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              SaaS Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Rendimiento consolidado del ecosistema escolar SaaS</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period selector */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[11px] font-medium text-slate-600">
            {(['30D', '90D', 'YTD'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-md transition-all duration-150 ${
                  selectedPeriod === period ? 'bg-white text-slate-900 font-bold shadow-sm scale-105' : 'hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={() => alert('Informe exportado en formato CSV')}
            className="btn-interactive flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid with Hover-Lift & Glow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className={`p-5 rounded-xl bg-white border border-slate-200/90 shadow-sm group hover-lift ${card.glowClass} cursor-default`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
              <div className={`p-2 rounded-lg transition-all duration-200 ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight group-hover:scale-[1.02] transition-transform">
                  {loading ? '—' : card.value}
                </span>
                <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border transition-transform group-hover:scale-105 ${card.badgeBg}`}>
                  {card.trend}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">{card.subValue}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Institutions (2 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200/90 p-5 space-y-4 shadow-sm hover-lift-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-100 text-blue-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333A48.24 48.24 0 0012 9.75c-2.551 0-5.056.2-7.5.583V21" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Instituciones y Utilización de Cuota</h3>
                <p className="text-[11px] text-slate-500">Capacidad de alumnos y estado de colegios</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 hover:bg-indigo-100 transition-colors">
              {tenants.length} Colegios
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {tenants.map((t) => {
              const sc = getStudentCount(t);
              const max = t.plan?.maxStudents ?? 100;
              const pct = Math.round((sc / max) * 100);

              return (
                <div key={t.id} className="py-3.5 px-2 flex items-center justify-between gap-4 first:pt-2 last:pb-2 rounded-lg hover:bg-slate-50/90 hover:translate-x-1 transition-all duration-150 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-50 via-indigo-50 to-orange-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-700 shadow-sm group-hover:scale-110 transition-transform">
                      {t.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{t.name}</p>
                      <p className="text-[10px] font-mono font-medium text-blue-600 truncate">{t.subdomain}.cole.pe</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* Plan Badge */}
                    <span className="hidden sm:inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 group-hover:bg-purple-100 transition-colors">
                      {t.plan?.name ?? '—'}
                    </span>

                    {/* Progress Bar */}
                    <div className="w-28 text-right">
                      <div className="flex justify-between text-[10px] font-semibold mb-1">
                        <span className="text-slate-500">{sc} / {max}</span>
                        <span className={pct > 90 ? 'text-rose-600 font-bold' : pct > 70 ? 'text-orange-600 font-bold' : 'text-emerald-700 font-bold'}>{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Dot */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-transform group-hover:scale-105 ${
                      t.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : t.status === 'TRIAL'
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
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
          <div className="rounded-xl bg-white border border-slate-200/90 p-5 space-y-4 shadow-sm hover-lift-sm">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-purple-100 text-purple-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
              </span>
              <h3 className="text-sm font-bold text-slate-900">Distribución por Tier</h3>
            </div>

            <div className="space-y-3">
              {plans.map((plan) => {
                const count = tenants.filter((t) => t.planId === plan.id).length;
                const pct = tenants.length > 0 ? Math.round((count / tenants.length) * 100) : 0;

                return (
                  <div key={plan.id} className="space-y-1.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{plan.name}</span>
                      <span className="text-slate-500 font-semibold">{formatMoney(plan.monthlyPrice)}/mes • {count} col.</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          plan.code === 'PLAN_BASIC' ? 'bg-emerald-500' :
                          plan.code === 'PLAN_PRO' ? 'bg-blue-600' : 'bg-purple-600'
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
          <div className="rounded-xl bg-white border border-slate-200/90 p-5 space-y-3 shadow-sm hover-lift-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-orange-100 text-orange-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-slate-900">Salud del Cluster</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors">
                100% OK
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200/70 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-600 font-medium">Latencia API P95</span>
                </div>
                <span className="font-mono font-bold text-emerald-600">14 ms</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200/70 hover:border-blue-200 hover:bg-blue-50/20 transition-all">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-600 font-medium">Disponibilidad SLA</span>
                </div>
                <span className="font-mono font-bold text-blue-600">99.98%</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20 transition-all">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-slate-600 font-medium">Pool de Conexiones DB</span>
                </div>
                <span className="font-mono font-bold text-purple-700">12 / 50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

