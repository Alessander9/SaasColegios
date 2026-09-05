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
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
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
        <polyline points={points} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 400;
          const y = 140 - (d.students / max) * 110;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
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
  const [growth, setGrowth] = useState<GrowthTimeline[]>(MOCK_GROWTH);
  const [modules, setModules] = useState<ModuleUsage[]>(MOCK_MODULES);
  const [tenants, setTenants] = useState<PlatformTenant[]>(MOCK_TENANTS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [g, m, t] = await Promise.all([
        getPlatformGrowth(),
        getModuleUsage(),
        getTenants(),
      ]);
      setGrowth(g);
      setModules(m);
      setTenants(t);
    } catch { /* fallback */ }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const latest = growth[growth.length - 1] ?? { students: 1645, tenants: 3 };
  const first = growth[0] ?? { students: 320, tenants: 1 };
  const growthRate = Math.round(((latest.students - first.students) / first.students) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Analíticas de Crecimiento</h2>
          <p className="text-xs text-slate-500 mt-0.5">Evolución de alumnos activos y adopción de módulos</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
            +{growthRate}% Crecimiento Total
          </span>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="rounded-xl bg-white border border-slate-200/90 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Curva de Alumnos Activos</h3>
            <p className="text-[11px] text-slate-500">Total de estudiantes en la plataforma por mes</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-blue-700">{latest.students.toLocaleString()}</span>
            <p className="text-[10px] font-semibold text-slate-500">Estudiantes Activos</p>
          </div>
        </div>

        <div className="pt-2">
          <MinimalistAreaChart data={growth} />
        </div>
      </div>

      {/* Grid: Module Adoption & Tenant Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Module Adoption */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-5 space-y-3 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Adopción por Módulo</h3>
            <p className="text-[11px] text-slate-500">% de colegios con el módulo activo</p>
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
                    className={`h-full rounded-full transition-all duration-300 ${
                      idx % 3 === 0 ? 'bg-blue-600' : idx % 3 === 1 ? 'bg-emerald-500' : 'bg-purple-600'
                    }`}
                    style={{ width: `${m.usagePercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth by Month Table */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-5 space-y-3 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Historial Mensual</h3>
            <p className="text-[11px] text-slate-500">Desglose mensual de instituciones y alumnos</p>
          </div>

          <div className="divide-y divide-slate-100">
            {growth.map((g) => (
              <div key={g.month} className="py-2.5 flex items-center justify-between text-xs first:pt-1 last:pb-1">
                <span className="font-mono font-medium text-slate-700">{g.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{g.tenants} colegios</span>
                  <span className="font-bold text-blue-700">{g.students.toLocaleString()} alumnos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
