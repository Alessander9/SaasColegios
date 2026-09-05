'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getPlans, createPlan, type PlatformPlan, type CreatePlanDto } from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';

const MOCK_PLANS: PlatformPlan[] = [
  { id: 'p1', code: 'PLAN_BASIC', name: 'Básico', description: 'Plan de inicio para instituciones de nivel primario o inicial', maxStudents: 150, maxTeachers: 15, maxStorageGb: 10, features: ['academic', 'enrollment', 'notifications'], monthlyPrice: 99, annualPrice: 990, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'p2', code: 'PLAN_PRO', name: 'Profesional', description: 'Para colegios integrados con tesorería, tienda escolar y cobranzas', maxStudents: 500, maxTeachers: 50, maxStorageGb: 50, features: ['academic', 'enrollment', 'finance', 'commerce', 'notifications'], monthlyPrice: 199, annualPrice: 1990, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'p3', code: 'PLAN_ENT', name: 'Enterprise', description: 'Solución integral corporativa con RRHH, planillas y analítica ejecutiva', maxStudents: 1500, maxTeachers: 150, maxStorageGb: 200, features: ['academic', 'enrollment', 'finance', 'commerce', 'activities', 'hr', 'payroll', 'notifications', 'documents', 'reporting'], monthlyPrice: 399, annualPrice: 3990, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

const ALL_FEATURES = [
  { key: 'academic', label: 'Gestión Académica & Notas', desc: 'Calificaciones, libretas, asistencia', category: 'Académico' },
  { key: 'enrollment', label: 'Matrícula & Registro', desc: 'Inscripción y gestión de familias', category: 'Académico' },
  { key: 'finance', label: 'Tesorería & Facturación', desc: 'Pensiones, cobros y comprobantes', category: 'Finanzas' },
  { key: 'commerce', label: 'Tienda Escolar Online', desc: 'Uniformes, libros y compras', category: 'Comercio' },
  { key: 'activities', label: 'Talleres Extracurriculares', desc: 'Inscripción a actividades y clubes', category: 'Académico' },
  { key: 'hr', label: 'Recursos Humanos', desc: 'Legajos docentes y contratos', category: 'Gestión' },
  { key: 'payroll', label: 'Planillas & Nóminas', desc: 'Cálculo de haberes y boletas', category: 'Finanzas' },
  { key: 'notifications', label: 'Notificaciones Push / Email', desc: 'Canal oficial de comunicación', category: 'Comunicación' },
  { key: 'documents', label: 'Gestor Documental', desc: 'Almacenamiento seguro en nube', category: 'Gestión' },
  { key: 'reporting', label: 'Reportes Ejecutivos & BI', desc: 'Inteligencia de gestión escolar', category: 'Dirección' },
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

  const handleSelectAll = () => {
    if (selectedFeatures.length === ALL_FEATURES.length) {
      setSelectedFeatures(['academic', 'enrollment', 'notifications']);
    } else {
      setSelectedFeatures(ALL_FEATURES.map((f) => f.key));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const normalizedMonthly = config.code === 'USD' ? monthlyPriceInput : Math.round(convertToUsd(monthlyPriceInput));
      const normalizedAnnual = config.code === 'USD' ? annualPriceInput : Math.round(convertToUsd(annualPriceInput));

      const dto: CreatePlanDto = {
        code: code.toUpperCase().replace(/\s+/g, '_'),
        name: name.trim(),
        description: description.trim(),
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={onClose}>
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto text-slate-800 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center text-lg font-black">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Crear Nuevo Plan Comercial</h3>
              <p className="text-xs text-slate-500">Definición de cuotas, precios en {config.name} ({config.symbol}) y entitlements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Código del Plan</label>
              <input
                type="text"
                required
                placeholder="PLAN_PLUS"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nombre Público</label>
              <input
                type="text"
                required
                placeholder="Ej: Plus Escolar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Descripción Resumida</label>
            <input
              type="text"
              placeholder="Para colegios medianos con tesorería, cobranzas y gestión académica"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-orange-700 uppercase tracking-wider mb-1.5">Precio Mensual ({config.symbol})</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{config.symbol}</span>
                <input
                  type="number"
                  required
                  min={0}
                  value={monthlyPriceInput}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMonthlyPriceInput(val);
                    setAnnualPriceInput(val * 10);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-orange-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5">Precio Anual ({config.symbol})</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{config.symbol}</span>
                <input
                  type="number"
                  required
                  min={0}
                  value={annualPriceInput}
                  onChange={(e) => setAnnualPriceInput(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5">Máx. Alumnos</label>
              <input
                type="number"
                required
                min={1}
                value={maxStudents}
                onChange={(e) => setMaxStudents(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1.5">Máx. Docentes</label>
              <input
                type="number"
                required
                min={1}
                value={maxTeachers}
                onChange={(e) => setMaxTeachers(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500 shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-orange-700 uppercase tracking-wider mb-1.5">Storage (GB)</label>
              <input
                type="number"
                required
                min={1}
                value={maxStorageGb}
                onChange={(e) => setMaxStorageGb(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-orange-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Módulos & Entitlements ({selectedFeatures.length}/{ALL_FEATURES.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {selectedFeatures.length === ALL_FEATURES.length ? 'Desmarcar todos' : 'Marcar todos'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
              {ALL_FEATURES.map((f) => {
                const selected = selectedFeatures.includes(f.key);
                return (
                  <button
                    type="button"
                    key={f.key}
                    onClick={() => toggleFeature(f.key)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all text-xs cursor-pointer ${
                      selected
                        ? 'bg-blue-50 text-blue-900 border border-blue-200 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black border ${
                      selected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 bg-white'
                    }`}>
                      {selected && '✓'}
                    </span>
                    <span className="truncate text-[11px]">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</div>}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !code.trim()}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear Plan Comercial'}
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
      const p = await getPlans().catch(() => MOCK_PLANS);
      setPlans(Array.isArray(p) ? p : MOCK_PLANS);
    } catch {
      setPlans(MOCK_PLANS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Catálogo de Planes Comerciales</h2>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full hover:bg-orange-100 transition-colors">
              SaaS Tiers ({config.code})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Suscripciones SaaS, cuotas y entitlements por nivel ({config.name})</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Annual Toggle */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs shadow-xs hover:border-slate-300 transition-all">
            <span className={`text-xs ${!annualBilling ? 'font-black text-slate-900' : 'text-slate-500'}`}>Mensual</span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className={`w-9 h-5 rounded-full transition-colors duration-200 relative cursor-pointer ${annualBilling ? 'bg-orange-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${annualBilling ? 'left-4.5' : 'left-0.5'}`} />
            </button>
            <span className={`text-xs flex items-center gap-1.5 ${annualBilling ? 'font-black text-orange-700' : 'text-slate-500'}`}>
              <span>Anual</span>
              <span className="text-[9px] bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.2 rounded font-black">-16% Ahorro</span>
            </span>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="btn-interactive flex items-center gap-1.5 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <span className="text-sm font-black">+</span>
            <span>Nuevo Plan</span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-16 text-xs text-slate-400 animate-pulse">Cargando catálogo de planes...</div>
        ) : (
          plans.map((plan) => {
            const price = annualBilling ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
            const isPro = plan.code === 'PLAN_PRO';
            const isEnt = plan.code === 'PLAN_ENT';

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl bg-white border p-6 flex flex-col justify-between shadow-xs hover:shadow-xl group transition-all duration-300 ${
                  isPro
                    ? 'border-orange-300 ring-2 ring-orange-100/80'
                    : isEnt
                    ? 'border-purple-300 ring-1 ring-purple-100/80'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Popular badge */}
                {isPro && (
                  <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md shadow-orange-500/20">
                    ★ Más Popular
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top Badge & Code */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isPro ? 'bg-orange-500' : isEnt ? 'bg-purple-600' : 'bg-blue-500'}`} />
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">{plan.name}</h3>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isPro ? 'bg-orange-50 text-orange-700 border-orange-200' : isEnt ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {plan.code}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">{plan.description}</p>

                  {/* Pricing */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-3xl font-black tracking-tight ${isPro ? 'text-orange-600' : isEnt ? 'text-purple-700' : 'text-blue-700'}`}>
                        {formatMoney(price)}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">/ mes</span>
                    </div>
                    {annualBilling && (
                      <p className="text-[11px] font-bold text-emerald-600 mt-1">Facturado {formatMoney(plan.annualPrice)} / año</p>
                    )}
                  </div>

                  {/* Quotas */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-center">
                    <div>
                      <p className="text-sm font-black text-slate-900">{plan.maxStudents}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Alumnos</p>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{plan.maxTeachers}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Docentes</p>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{plan.maxStorageGb} GB</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Storage</p>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-1">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Entitlements Incluidos</p>
                    <div className="space-y-2">
                      {ALL_FEATURES.map((feat) => {
                        const included = (plan.features || []).includes(feat.key);
                        return (
                          <div
                            key={feat.key}
                            className={`flex items-center gap-2.5 text-xs ${included ? 'text-slate-800' : 'text-slate-400 line-through opacity-60'}`}
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              included ? 'bg-emerald-100/70 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
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
