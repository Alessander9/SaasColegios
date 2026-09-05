'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getPlans, createPlan, type PlatformPlan, type CreatePlanDto } from '../lib/api';

const MOCK_PLANS: PlatformPlan[] = [
  { id: 'p1', code: 'PLAN_BASIC', name: 'Básico', description: 'Plan de inicio para colegios pequeños que recién empiezan su digitalización', maxStudents: 150, maxTeachers: 15, maxStorageGb: 10, features: ['academic', 'enrollment', 'notifications'], monthlyPrice: 99, annualPrice: 990, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'p2', code: 'PLAN_PRO', name: 'Profesional', description: 'Para colegios en crecimiento que necesitan finanzas y comercio integrado', maxStudents: 500, maxTeachers: 50, maxStorageGb: 50, features: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'], monthlyPrice: 199, annualPrice: 1990, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'p3', code: 'PLAN_ENT', name: 'Enterprise', description: 'Solución integral para grandes instituciones con todas las funcionalidades', maxStudents: 1500, maxTeachers: 150, maxStorageGb: 200, features: ['academic', 'enrollment', 'finance', 'commerce', 'activities', 'hr', 'payroll', 'notifications', 'documents', 'reporting'], monthlyPrice: 399, annualPrice: 3990, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

const ALL_FEATURES = [
  { key: 'academic', label: '📋 Académico', desc: 'Calificaciones, asistencia, libretas' },
  { key: 'enrollment', label: '📝 Matrícula', desc: 'Gestión de inscripciones' },
  { key: 'finance', label: '💰 Finanzas', desc: 'Pensiones, cobros, pagos' },
  { key: 'commerce', label: '🛍️ Comercio', desc: 'Tienda escolar online' },
  { key: 'activities', label: '🎯 Actividades', desc: 'Talleres extracurriculares' },
  { key: 'hr', label: '👥 RRHH', desc: 'Personal y contratos' },
  { key: 'payroll', label: '💼 Planillas', desc: 'Nómina y sueldos' },
  { key: 'notifications', label: '🔔 Notificaciones', desc: 'Alertas y recordatorios' },
  { key: 'documents', label: '📄 Documentos', desc: 'Archivos y reportes' },
  { key: 'reporting', label: '📊 Reportes', desc: 'Analítica e inteligencia' },
];

const PLAN_COLORS = [
  { gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20', border: 'border-emerald-500/30', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { gradient: 'from-indigo-500 to-violet-600', glow: 'shadow-indigo-500/20', border: 'border-indigo-500/30', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/20', border: 'border-violet-500/30', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
];

/* ── Create Plan Modal ── */
function CreatePlanModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [annualPrice, setAnnualPrice] = useState(0);
  const [maxStudents, setMaxStudents] = useState(100);
  const [maxTeachers, setMaxTeachers] = useState(10);
  const [maxStorageGb, setMaxStorageGb] = useState(5);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['academic', 'enrollment', 'notifications']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFeature = (f: string) => {
    setSelectedFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const dto: CreatePlanDto = {
        code: code.toUpperCase().replace(/\s+/g, '_'),
        name,
        description,
        monthlyPrice,
        annualPrice: annualPrice || monthlyPrice * 10,
        maxStudents,
        maxTeachers,
        maxStorageGb,
        features: selectedFeatures,
        isActive: true,
      };
      await createPlan(dto);
      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-slate-100" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-white">Crear Nuevo Plan Comercial</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Código del Plan</label>
              <input type="text" required placeholder="PLAN_PLUS" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nombre</label>
              <input type="text" required placeholder="Plus" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Descripción</label>
            <input type="text" placeholder="Plan intermedio con finanzas" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Precio Mensual ($)</label>
              <input type="number" required min={0} value={monthlyPrice} onChange={(e) => setMonthlyPrice(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Precio Anual ($)</label>
              <input type="number" min={0} value={annualPrice} onChange={(e) => setAnnualPrice(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Max Alumnos</label>
              <input type="number" required min={1} value={maxStudents} onChange={(e) => setMaxStudents(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Max Profesores</label>
              <input type="number" required min={1} value={maxTeachers} onChange={(e) => setMaxTeachers(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Almacenamiento (GB)</label>
              <input type="number" required min={1} value={maxStorageGb} onChange={(e) => setMaxStorageGb(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Módulos Incluidos</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_FEATURES.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggleFeature(f.key)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all border ${
                    selectedFeatures.includes(f.key)
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                      : 'bg-slate-950/60 border-slate-800/60 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[8px] font-bold ${
                    selectedFeatures.includes(f.key) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700'
                  }`}>
                    {selectedFeatures.includes(f.key) ? '✓' : ''}
                  </span>
                  <div>
                    <p className="text-xs font-bold">{f.label}</p>
                    <p className="text-[10px] text-slate-500">{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {error && <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</div>}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all">Cancelar</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50">
              {saving ? 'Creando...' : 'Crear Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   PLANS VIEW
   ──────────────────────────────────────────────────────────── */
export default function PlansView() {
  const [plans, setPlans] = useState<PlatformPlan[]>(MOCK_PLANS);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const p = await getPlans();
      setPlans(p);
    } catch { /* use mock */ }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Planes Comerciales</h1>
          <p className="text-sm text-slate-400 mt-1">Catálogo de suscripciones y tiers disponibles</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2">
          <span>+</span>
          <span>Crear Nuevo Plan</span>
        </button>
      </div>

      {/* Plan Cards */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Cargando planes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const colors = PLAN_COLORS[i % PLAN_COLORS.length];
            return (
              <div key={plan.id} className={`relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-7 space-y-5 hover:-translate-y-1 transition-transform duration-300 shadow-xl ${colors.glow}`}>
                {/* Decorative gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-[0.07] rounded-bl-[80px]`} />

                {/* Plan Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${colors.badge}`}>
                      {plan.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                      {plan.isActive ? '🟢 Activo' : '🔴 Inactivo'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white">{plan.name}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">${plan.monthlyPrice}</span>
                  <span className="text-xs text-slate-500 font-bold">/mes</span>
                </div>
                <p className="text-[10px] text-slate-500 -mt-3">Anual: ${plan.annualPrice} (${Math.round(plan.annualPrice / 12)}/mes)</p>

                {/* Limits */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Alumnos', value: plan.maxStudents, icon: '👨‍🎓' },
                    { label: 'Profesores', value: plan.maxTeachers, icon: '👩‍🏫' },
                    { label: 'Almacenamiento', value: `${plan.maxStorageGb}GB`, icon: '💾' },
                  ].map((l) => (
                    <div key={l.label} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                      <span className="text-sm">{l.icon}</span>
                      <p className="text-sm font-black text-white mt-0.5">{l.value}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{l.label}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Módulos Incluidos</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.features.map((f) => {
                      const feat = ALL_FEATURES.find((x) => x.key === f);
                      return (
                        <span key={f} className="text-[10px] font-bold text-slate-300 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60">
                          {feat?.label ?? f}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Missing features */}
                {ALL_FEATURES.filter((x) => !plan.features.includes(x.key)).length > 0 && (
                  <div className="pt-3 border-t border-slate-800/60 space-y-1.5">
                    <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">No Incluido</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_FEATURES.filter((x) => !plan.features.includes(x.key)).map((f) => (
                        <span key={f.key} className="text-[10px] font-medium text-slate-600 bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-800/40 line-through">
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <CreatePlanModal onClose={() => setShowCreate(false)} onCreated={reload} />}
    </div>
  );
}
