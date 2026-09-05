'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getPlans, createPlan, type PlatformPlan, type CreatePlanDto } from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';

const MOCK_PLANS: PlatformPlan[] = [
  { id: 'p1', code: 'PLAN_BASIC', name: 'Básico', description: 'Plan de inicio para instituciones de nivel primario o guarderías', maxStudents: 150, maxTeachers: 15, maxStorageGb: 10, features: ['academic', 'enrollment', 'notifications'], monthlyPrice: 99, annualPrice: 990, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'p2', code: 'PLAN_PRO', name: 'Profesional', description: 'Para colegios integrados con tesorería, tienda escolar y cobranzas', maxStudents: 500, maxTeachers: 50, maxStorageGb: 50, features: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'], monthlyPrice: 199, annualPrice: 1990, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'p3', code: 'PLAN_ENT', name: 'Enterprise', description: 'Solución integral corporativa con RRHH, planillas y BI avanzado', maxStudents: 1500, maxTeachers: 150, maxStorageGb: 200, features: ['academic', 'enrollment', 'finance', 'commerce', 'activities', 'hr', 'payroll', 'notifications', 'documents', 'reporting'], monthlyPrice: 399, annualPrice: 3990, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

const ALL_FEATURES = [
  { key: 'academic', label: 'Gestión Académica & Notas', desc: 'Calificaciones, libretas, asistencia' },
  { key: 'enrollment', label: 'Matrícula & Fichas', desc: 'Inscripción y gestión de familias' },
  { key: 'finance', label: 'Tesorería & Facturación', desc: 'Pensiones, cobros automáticos' },
  { key: 'commerce', label: 'Tienda Escolar Online', desc: 'Uniformes, libros y catálogo' },
  { key: 'activities', label: 'Talleres Extracurriculares', desc: 'Inscripción a actividades' },
  { key: 'hr', label: 'Recursos Humanos', desc: 'Legajos docentes y contratos' },
  { key: 'payroll', label: 'Planillas & Nóminas', desc: 'Cálculo de haberes y boletas' },
  { key: 'notifications', label: 'Notificaciones Push / Email', desc: 'Canal oficial de avisos' },
  { key: 'documents', label: 'Gestor Documental', desc: 'Almacenamiento seguro en nube' },
  { key: 'reporting', label: 'Reportes Ejecutivos & BI', desc: 'Inteligencia de gestión escolar' },
];

/* ── Create Plan Modal ── */
function CreatePlanModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { config, convertToUsd } = useCurrency();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyPriceInput, setMonthlyPriceInput] = useState(149);
  const [annualPriceInput, setAnnualPriceInput] = useState(1490);
  const [maxStudents, setMaxStudents] = useState(300);
  const [maxTeachers, setMaxTeachers] = useState(30);
  const [maxStorageGb, setMaxStorageGb] = useState(25);
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
      // Normalize to USD base
      const normalizedMonthly = config.code === 'USD' ? monthlyPriceInput : Math.round(convertToUsd(monthlyPriceInput));
      const normalizedAnnual = config.code === 'USD' ? annualPriceInput : Math.round(convertToUsd(annualPriceInput));

      const dto: CreatePlanDto = {
        code: code.toUpperCase().replace(/\s+/g, '_'),
        name,
        description,
        monthlyPrice: normalizedMonthly,
        annualPrice: normalizedAnnual || normalizedMonthly * 10,
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-view" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto text-slate-800 shadow-2xl hover-lift-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Crear Nuevo Plan Comercial</h3>
              <p className="text-xs text-slate-500">Definición de cuotas, precios en {config.name} ({config.symbol}) y entitlements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Código del Plan</label>
              <input
                type="text"
                required
                placeholder="PLAN_PLUS"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-500 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nombre</label>
              <input
                type="text"
                required
                placeholder="Plus"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Descripción</label>
            <input
              type="text"
              placeholder="Para colegios medianos con finanzas y cobranza"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1">Precio Mensual ({config.symbol})</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{config.symbol}</span>
                <input
                  type="number"
                  required
                  min={0}
                  value={monthlyPriceInput}
                  onChange={(e) => setMonthlyPriceInput(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-orange-200 rounded-lg text-slate-900 text-xs font-bold focus:outline-none focus:border-orange-500 shadow-sm focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-emerald-700 uppercase mb-1">Precio Anual ({config.symbol})</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{config.symbol}</span>
                <input
                  type="number"
                  required
                  min={0}
                  value={annualPriceInput}
                  onChange={(e) => setAnnualPriceInput(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-emerald-200 rounded-lg text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-500 shadow-sm focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-blue-700 uppercase mb-1">Máx. Alumnos</label>
              <input
                type="number"
                required
                min={1}
                value={maxStudents}
                onChange={(e) => setMaxStudents(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-purple-700 uppercase mb-1">Máx. Docentes</label>
              <input
                type="number"
                required
                min={1}
                value={maxTeachers}
                onChange={(e) => setMaxTeachers(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-purple-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1">Storage (GB)</label>
              <input
                type="number"
                required
                min={1}
                value={maxStorageGb}
                onChange={(e) => setMaxStorageGb(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-orange-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-orange-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2">Entitlements / Módulos Habilitados</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
              {ALL_FEATURES.map((f) => {
                const selected = selectedFeatures.includes(f.key);
                return (
                  <button
                    type="button"
                    key={f.key}
                    onClick={() => toggleFeature(f.key)}
                    className={`flex items-center gap-2 p-2 rounded text-left transition-all text-xs hover:scale-[1.01] ${
                      selected ? 'bg-blue-50 text-blue-900 border border-blue-200 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold border ${selected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 bg-white'}`}>
                      {selected && '✓'}
                    </span>
                    <span className="truncate">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">{error}</div>}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-interactive px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-all hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-interactive px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Plans View ── */
export default function PlansView() {
  const { formatMoney, config } = useCurrency();
  const [plans, setPlans] = useState<PlatformPlan[]>(MOCK_PLANS);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const p = await getPlans();
      setPlans(p);
    } catch { /* fallback */ }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return (
    <div className="space-y-6 animate-view">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Catálogo de Planes Comerciales</h2>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full hover:bg-orange-100 transition-colors">
              SaaS Tiers ({config.code})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Suscripciones SaaS, cuotas y entitlements por nivel ({config.name})</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Annual Toggle with Orange Highlight & Smooth Switch */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs shadow-sm hover:border-slate-300 transition-all">
            <span className={`text-[11px] ${!annualBilling ? 'font-bold text-slate-900' : 'text-slate-500'}`}>Mensual</span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className={`w-8 h-4 rounded-full transition-colors duration-200 relative ${annualBilling ? 'bg-orange-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${annualBilling ? 'left-4.5' : 'left-0.5'}`} />
            </button>
            <span className={`text-[11px] ${annualBilling ? 'font-bold text-orange-700' : 'text-slate-500'}`}>
              Anual <span className="text-[9px] bg-orange-50 text-orange-700 border border-orange-200 px-1 py-0.2 rounded font-bold hover:scale-105 transition-transform inline-block">-16% Ahorro</span>
            </span>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="btn-interactive flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Nuevo Plan</span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid with Hover Lift & Glow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-xs text-slate-400">Cargando planes...</div>
        ) : (
          plans.map((plan) => {
            const price = annualBilling ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
            const isPro = plan.code === 'PLAN_PRO';
            const isEnt = plan.code === 'PLAN_ENT';

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl bg-white border p-5 flex flex-col justify-between hover-lift group transition-all duration-200 ${
                  isPro
                    ? 'border-orange-300 ring-2 ring-orange-100 shadow-sm hover-glow-orange'
                    : isEnt
                    ? 'border-purple-300 ring-1 ring-purple-100 shadow-sm hover-glow-purple'
                    : 'border-blue-200 ring-1 ring-blue-50 shadow-sm hover-glow-blue'
                }`}
              >
                {/* Popular badge on Pro Plan */}
                {isPro && (
                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                    ★ Más Popular
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top Badge & Code */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125 ${isPro ? 'bg-orange-500' : isEnt ? 'bg-purple-600' : 'bg-blue-500'}`} />
                      <span className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-slate-950">{plan.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-transform group-hover:scale-105 ${
                      isPro ? 'bg-orange-50 text-orange-700 border-orange-200' : isEnt ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {plan.code}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">{plan.description}</p>

                  {/* Pricing */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black tracking-tight transition-transform group-hover:scale-105 ${isPro ? 'text-orange-600' : isEnt ? 'text-purple-700' : 'text-blue-700'}`}>
                        {formatMoney(price)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ mes</span>
                    </div>
                    {annualBilling && (
                      <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Facturado anualmente: {formatMoney(plan.annualPrice)}/año</p>
                    )}
                  </div>

                  {/* Quotas with SVG Icons & Hover Lift */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50 border border-slate-200/80 rounded-lg text-center group-hover:bg-slate-100/60 transition-colors">
                    <div className="hover:scale-105 transition-transform">
                      <div className="flex items-center justify-center text-blue-600 mb-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{plan.maxStudents}</p>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">Alumnos</p>
                    </div>
                    <div className="hover:scale-105 transition-transform">
                      <div className="flex items-center justify-center text-purple-600 mb-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{plan.maxTeachers}</p>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">Docentes</p>
                    </div>
                    <div className="hover:scale-105 transition-transform">
                      <div className="flex items-center justify-center text-orange-600 mb-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{plan.maxStorageGb} GB</p>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">Storage</p>
                    </div>
                  </div>

                  {/* Feature Checklist with SVG icons */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Entitlements Incluidos</p>
                    <div className="space-y-1.5">
                      {ALL_FEATURES.map((feat) => {
                        const included = plan.features.includes(feat.key);
                        return (
                          <div
                            key={feat.key}
                            className={`flex items-center gap-2 text-xs p-1 rounded hover:bg-slate-50 transition-colors ${included ? 'text-slate-800' : 'text-slate-400 line-through'}`}
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform group-hover:scale-110 ${
                              included ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {included ? '✓' : '×'}
                            </span>
                            <span className="text-[11px] font-medium truncate">{feat.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCreate && <CreatePlanModal onClose={() => setShowCreate(false)} onCreated={reload} />}
    </div>
  );
}


