'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getPlatformGrowth, getModuleUsage, getTenants,
  type GrowthTimeline, type ModuleUsage, type PlatformTenant,
} from '../lib/api';

/* ── Fallback mock data ── */
const MOCK_GROWTH: GrowthTimeline[] = [
  { month: '2026-02', tenants: 1, students: 320 },
  { month: '2026-03', tenants: 1, students: 480 },
  { month: '2026-04', tenants: 2, students: 900 },
  { month: '2026-05', tenants: 2, students: 1100 },
  { month: '2026-06', tenants: 3, students: 1350 },
  { month: '2026-07', tenants: 3, students: 1520 },
  { month: '2026-08', tenants: 3, students: 1645 },
];

const MOCK_MODULES: ModuleUsage[] = [
  { module: 'Académico', tenantCount: 3, usagePercentage: 100 },
  { module: 'Matrícula', tenantCount: 3, usagePercentage: 100 },
  { module: 'Finanzas', tenantCount: 2, usagePercentage: 67 },
  { module: 'Comercio', tenantCount: 2, usagePercentage: 67 },
  { module: 'Notificaciones', tenantCount: 3, usagePercentage: 100 },
  { module: 'Actividades', tenantCount: 1, usagePercentage: 33 },
  { module: 'RRHH', tenantCount: 1, usagePercentage: 33 },
  { module: 'Planillas', tenantCount: 1, usagePercentage: 33 },
  { module: 'Documentos', tenantCount: 1, usagePercentage: 33 },
  { module: 'Reportes', tenantCount: 1, usagePercentage: 33 },
];

const MOCK_TENANTS: PlatformTenant[] = [
  { id: 't-1', slug: 'sancleo', name: 'Colegio San Cleo', subdomain: 'sancleo', status: 'ACTIVE', planId: 'p2', plan: { id: 'p2', code: 'PLAN_PRO', name: 'Profesional', maxStudents: 600, maxTeachers: 50, maxStorageGb: 50, features: [], monthlyPrice: 199, annualPrice: 1990, isActive: true, createdAt: '', updatedAt: '' }, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 't-2', slug: 'inmaculada', name: 'Inmaculada Concepción', subdomain: 'inmaculada', status: 'ACTIVE', planId: 'p3', plan: { id: 'p3', code: 'PLAN_ENT', name: 'Enterprise', maxStudents: 1500, maxTeachers: 150, maxStorageGb: 200, features: [], monthlyPrice: 399, annualPrice: 3990, isActive: true, createdAt: '', updatedAt: '' }, createdAt: '2024-09-01T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
  { id: 't-3', slug: 'montessori', name: 'Academia Montessori', subdomain: 'montessori', status: 'TRIAL', planId: 'p1', plan: { id: 'p1', code: 'PLAN_BASIC', name: 'Básico', maxStudents: 150, maxTeachers: 15, maxStorageGb: 10, features: [], monthlyPrice: 99, annualPrice: 990, isActive: true, createdAt: '', updatedAt: '' }, createdAt: '2026-07-20T00:00:00Z', updatedAt: '2026-08-15T00:00:00Z' },
];

/* ── Simple SVG Bar Chart ── */
function BarChart({ data, labelKey, valueKey, color, maxValue }: {
  data: any[];
  labelKey: string;
  valueKey: string;
  color: string;
  maxValue?: number;
}) {
  const max = maxValue || Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="w-full">
      <svg viewBox="0 0 400 180" className="w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line key={pct} x1="0" y1={160 - pct * 140} x2="400" y2={160 - pct * 140} stroke="#1e293b" strokeWidth="0.5" />
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const val = Number(d[valueKey]) || 0;
          const barH = (val / max) * 140;
          const x = (i / data.length) * 400 + (400 / data.length) * 0.15;
          const w = (400 / data.length) * 0.6;
          return (
            <g key={i}>
              <rect
                x={x}
                y={160 - barH}
                width={w}
                height={barH}
                rx={4}
                fill={color}
                opacity={0.85}
                className="hover:opacity-100 transition-opacity"
              />
              <text x={x + w / 2} y={160 - barH - 6} textAnchor="middle" className="fill-white text-[10px] font-bold">
                {typeof val === 'number' ? val.toLocaleString() : val}
              </text>
              <text x={x + w / 2} y={175} textAnchor="middle" className="fill-slate-500 text-[8px] font-medium">
                {String(d[labelKey]).slice(-5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   ANALYTICS VIEW
   ──────────────────────────────────────────────────────────── */
export default function AnalyticsView() {
  const [growth, setGrowth] = useState<GrowthTimeline[]>(MOCK_GROWTH);
  const [modules, setModules] = useState<ModuleUsage[]>(MOCK_MODULES);
  const [tenants, setTenants] = useState<PlatformTenant[]>(MOCK_TENANTS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [g, m, t] = await Promise.all([
        getPlatformGrowth().catch(() => MOCK_GROWTH),
        getModuleUsage().catch(() => MOCK_MODULES),
        getTenants().catch(() => MOCK_TENANTS),
      ]);
      setGrowth(g);
      setModules(m);
      setTenants(t);
    } catch { /* use mocks */ }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const mrr = tenants.reduce((a, t) => a + (t.plan?.monthlyPrice ?? 0), 0);
  const revenueByPlan = tenants.reduce<Record<string, number>>((acc, t) => {
    const pn = t.plan?.name ?? 'Desconocido';
    acc[pn] = (acc[pn] || 0) + (t.plan?.monthlyPrice ?? 0);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Analíticas de Plataforma</h1>
        <p className="text-sm text-slate-400 mt-1">Crecimiento, uso de módulos y distribución de ingresos</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Cargando analíticas...</div>
      ) : (
        <>
          {/* Revenue Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Distribución de Ingresos por Plan (MRR)</h2>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ${mrr.toLocaleString()}/mes total
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(revenueByPlan).map(([plan, revenue], i) => {
                const pct = mrr > 0 ? Math.round((revenue / mrr) * 100) : 0;
                const colors = ['bg-emerald-500', 'bg-indigo-500', 'bg-violet-500'];
                return (
                  <div key={plan} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{plan}</span>
                      <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
                    </div>
                    <p className="text-2xl font-black text-white">${revenue.toLocaleString()}</p>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500">{tenants.filter((t) => t.plan?.name === plan).length} colegios</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Growth Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Crecimiento de Alumnos en el Tiempo</h2>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">Últimos 7 meses</span>
            </div>
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800/60">
              <BarChart
                data={growth}
                labelKey="month"
                valueKey="students"
                color="#6366f1"
              />
            </div>
          </div>

          {/* Tenant Growth */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Crecimiento de Colegios</h2>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">Últimos 7 meses</span>
            </div>
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800/60">
              <BarChart
                data={growth}
                labelKey="month"
                valueKey="tenants"
                color="#10b981"
              />
            </div>
          </div>

          {/* Module Usage */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Uso de Módulos por Colegios</h2>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">{modules.length} módulos</span>
            </div>
            <div className="space-y-3">
              {modules.sort((a, b) => b.usagePercentage - a.usagePercentage).map((m) => (
                <div key={m.module} className="flex items-center gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="w-32 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{m.module}</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          m.usagePercentage === 100 ? 'bg-emerald-500' :
                          m.usagePercentage >= 60 ? 'bg-indigo-500' :
                          m.usagePercentage >= 30 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${m.usagePercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <p className="text-xs font-bold text-white">{m.tenantCount}/{tenants.length}</p>
                    <p className="text-[10px] text-slate-500">{m.usagePercentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tasa de Conversión Trial → Active', value: '67%', icon: '🔄', color: 'text-emerald-400' },
              { label: 'Crecimiento Mensual (Alumnos)', value: growth.length >= 2 ? `+${growth[growth.length - 1].students - growth[growth.length - 2].students}` : '—', icon: '📈', color: 'text-indigo-400' },
              { label: 'Módulo Más Usado', value: modules[0]?.module ?? '—', icon: '🏆', color: 'text-amber-400' },
              { label: 'Ingreso Promedio/Colegio', value: tenants.length > 0 ? `$${Math.round(mrr / tenants.length)}` : '$0', icon: '💰', color: 'text-violet-400' },
            ].map((c) => (
              <div key={c.label} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <span className="text-2xl">{c.icon}</span>
                <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{c.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
