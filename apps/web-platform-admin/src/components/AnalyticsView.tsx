'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getPlatformGrowth, getModuleUsage,
  type GrowthTimeline, type ModuleUsage,
} from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';

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
  { module: 'Finanzas & Facturación', tenantCount: 2, usagePercentage: 67 },
  { module: 'Tienda Escolar Online', tenantCount: 2, usagePercentage: 67 },
  { module: 'Notificaciones Push', tenantCount: 3, usagePercentage: 100 },
  { module: 'Talleres Extracurriculares', tenantCount: 1, usagePercentage: 33 },
  { module: 'Recursos Humanos', tenantCount: 1, usagePercentage: 33 },
  { module: 'Planillas & Nóminas', tenantCount: 1, usagePercentage: 33 },
  { module: 'Gestor Documental', tenantCount: 1, usagePercentage: 33 },
  { module: 'Reportes Ejecutivos & BI', tenantCount: 1, usagePercentage: 33 },
];

/* ── Minimalist Light SVG Area Chart ── */
function MinimalistAreaChart({ data }: { data: GrowthTimeline[] }) {
  const max = Math.max(...data.map((d) => d.students), 2000);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 400;
    const y = 140 - (d.students / max) * 110;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,140 ${points} 400,140`;

  return (
    <div className="w-full">
      <svg viewBox="0 0 400 170" className="w-full h-auto">
        <defs>
          <linearGradient id="lightAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid */}
        {[0, 0.33, 0.66, 1].map((p) => (
          <line key={p} x1="0" y1={140 - p * 110} x2="400" y2={140 - p * 110} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
        ))}

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#lightAreaGradient)" />

        {/* Line */}
        <polyline points={points} fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 400;
          const y = 140 - (d.students / max) * 110;
          return (
            <g key={i} className="cursor-pointer group">
              <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" className="group-hover:r-6 transition-all" />
              <text x={x} y={160} textAnchor="middle" className="fill-slate-500 text-[9px] font-semibold">
                {d.month.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AnalyticsView() {
  const { config } = useCurrency();
  const [growth, setGrowth] = useState<GrowthTimeline[]>(MOCK_GROWTH);
  const [modules, setModules] = useState<ModuleUsage[]>(MOCK_MODULES);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [g, m] = await Promise.all([
        getPlatformGrowth().catch(() => MOCK_GROWTH),
        getModuleUsage().catch(() => MOCK_MODULES),
      ]);
      setGrowth(Array.isArray(g) ? g : MOCK_GROWTH);
      setModules(Array.isArray(m) ? m : MOCK_MODULES);
    } catch {
      setGrowth(MOCK_GROWTH);
      setModules(MOCK_MODULES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const latest = growth[growth.length - 1] ?? { students: 1645, tenants: 3 };
  const first = growth[0] ?? { students: 320, tenants: 1 };
  const growthRate = Math.round(((latest.students - first.students) / first.students) * 100);

  const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-orange-500', 'bg-purple-600'];

  return (
    <div className="space-y-6 animate-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Analíticas de Crecimiento</h2>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full hover:bg-orange-100 transition-colors">
              MRR ({config.symbol}) & Alumnos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Evolución de alumnos activos y adopción de módulos ({config.name})</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-lg flex items-center gap-1.5 hover-lift-sm">
            <svg className="w-3.5 h-3.5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
            +{growthRate}% Crecimiento Total
          </span>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="rounded-xl bg-white border border-slate-200/90 p-5 space-y-4 shadow-sm hover-lift">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A2.25 2.25 0 013 18.75v-5.625zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a2.25 2.25 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a2.25 2.25 0 01-1.125-1.125V4.125z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Curva de Alumnos Activos</h3>
              <p className="text-[11px] text-slate-500">Total de estudiantes en la plataforma por mes</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-orange-600">{latest.students.toLocaleString()}</span>
            <p className="text-[10px] font-semibold text-slate-500">Estudiantes Activos</p>
          </div>
        </div>

        <div className="pt-2">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400 animate-pulse">Cargando datos analíticos...</div>
          ) : (
            <MinimalistAreaChart data={growth} />
          )}
        </div>
      </div>

      {/* Grid: Module Adoption & Tenant Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Module Adoption */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100 text-blue-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Adopción por Módulo</h3>
              <p className="text-[11px] text-slate-500">% de colegios con el módulo activo</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {modules.map((m, idx) => (
              <div key={m.module} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{m.module}</span>
                  <span className="text-slate-500 font-medium">{m.usagePercentage}% ({m.tenantCount} inst.)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${colors[idx % colors.length]}`}
                    style={{ width: `${m.usagePercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth by Month Table */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-purple-100 text-purple-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Historial Mensual</h3>
              <p className="text-[11px] text-slate-500">Desglose mensual de instituciones y alumnos</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {growth.map((g) => (
              <div key={g.month} className="py-2.5 flex items-center justify-between text-xs first:pt-1 last:pb-1">
                <span className="font-mono font-medium text-slate-700">{g.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{g.tenants} colegios</span>
                  <span className="font-bold text-orange-600">{g.students.toLocaleString()} alumnos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

