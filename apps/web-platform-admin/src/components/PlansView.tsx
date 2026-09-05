'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getPlans, createPlan, type PlatformPlan, type CreatePlanDto } from '../lib/api';

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
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(149);
  const [annualPrice, setAnnualPrice] = useState(1490);
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto text-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Crear Nuevo Plan Comercial</h3>
            <p className="text-xs text-slate-500">Definición de cuotas y entitlements</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">✕</button>
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-500 shadow-sm"
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
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
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Precio Mensual ($)</label>
              <input
                type="number"
                required
                min={0}
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Precio Anual ($)</label>
              <input
                type="number"
                required
                min={0}
                value={annualPrice}
                onChange={(e) => setAnnualPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Máx. Alumnos</label>
              <input
                type="number"
                required
                min={1}
                value={maxStudents}
                onChange={(e) => setMaxStudents(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Máx. Docentes</label>
              <input
                type="number"
                required
                min={1}
                value={maxTeachers}
                onChange={(e) => setMaxTeachers(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Storage (GB)</label>
              <input
                type="number"
                required
                min={1}
                value={maxStorageGb}
                onChange={(e) => setMaxStorageGb(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2">Entitlements / Módulos Habilitados</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              {ALL_FEATURES.map((f) => {
                const selected = selectedFeatures.includes(f.key);
                return (
                  <button
                    type="button"
                    key={f.key}
                    onClick={() => toggleFeature(f.key)}
                    className={`flex items-center gap-2 p-2 rounded text-left transition-all text-xs ${
                      selected ? 'bg-blue-50 text-blue-900 border border-blue-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border ${selected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 bg-white'}`}>
                      {selected && '✓'}
                    </span>
                    <span className="truncate font-medium">{f.label}</span>
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
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-all hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
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
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Catálogo de Planes Comerciales</h2>
          <p className="text-xs text-slate-500 mt-0.5">Suscripciones SaaS, cuotas y entitlements por nivel</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Annual Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs shadow-sm">
            <span className={`text-[11px] ${!annualBilling ? 'font-bold text-slate-900' : 'text-slate-500'}`}>Mensual</span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className={`w-8 h-4 rounded-full transition-colors relative ${annualBilling ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${annualBilling ? 'left-4.5' : 'left-0.5'}`} />
            </button>
            <span className={`text-[11px] ${annualBilling ? 'font-bold text-emerald-700' : 'text-slate-500'}`}>
              Anual <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded font-bold">-16%</span>
            </span>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <span>+</span>
            <span>Nuevo Plan</span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
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
                className={`rounded-xl bg-white border p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 ${
                  isEnt ? 'border-purple-300 ring-1 ring-purple-100 shadow-sm' : isPro ? 'border-blue-300 ring-1 ring-blue-100 shadow-sm' : 'border-slate-200 shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Badge & Code */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 tracking-tight">{plan.name}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isEnt ? 'bg-purple-50 text-purple-700 border-purple-200' : isPro ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {plan.code}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">{plan.description}</p>

                  {/* Pricing */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black tracking-tight ${isEnt ? 'text-purple-700' : isPro ? 'text-blue-700' : 'text-emerald-700'}`}>
                        ${price}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ mes</span>
                    </div>
                    {annualBilling && (
                      <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Facturado anualmente: ${plan.annualPrice}/año</p>
                    )}
                  </div>

                  {/* Quotas */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50 border border-slate-200/80 rounded-lg text-center">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{plan.maxStudents}</p>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">Alumnos</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{plan.maxTeachers}</p>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">Docentes</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{plan.maxStorageGb} GB</p>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">Storage</p>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Entitlements Incluidos</p>
                    <div className="space-y-1.5">
                      {ALL_FEATURES.map((feat) => {
                        const included = plan.features.includes(feat.key);
                        return (
                          <div
                            key={feat.key}
                            className={`flex items-center gap-2 text-xs ${included ? 'text-slate-800' : 'text-slate-400 line-through'}`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
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
