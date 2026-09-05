'use client';

import React, { useState } from 'react';
import { useCurrency, type CurrencyCode } from '../context/CurrencyContext';

export default function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency, config, configs, updateExchangeRate } = useCurrency();
  const [modalOpen, setModalOpen] = useState(false);
  const [editPen, setEditPen] = useState(configs.PEN.rateAgainstUsd.toString());
  const [editEur, setEditEur] = useState(configs.EUR.rateAgainstUsd.toString());

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const pen = parseFloat(editPen);
    const eur = parseFloat(editEur);
    if (!isNaN(pen) && pen > 0) updateExchangeRate('PEN', pen);
    if (!isNaN(eur) && eur > 0) updateExchangeRate('EUR', eur);
    setModalOpen(false);
  };

  const currencyOptions: { code: CurrencyCode; label: string; symbol: string; flag: string }[] = [
    { code: 'PEN', label: 'Soles', symbol: 'S/', flag: '🇵🇪' },
    { code: 'USD', label: 'Dólares', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', label: 'Euros', symbol: '€', flag: '🇪🇺' },
  ];

  return (
    <>
      <div className="flex items-center gap-1.5">
        <div className="inline-flex items-center bg-slate-100/90 border border-slate-200/90 rounded-xl p-0.5 shadow-sm">
          {currencyOptions.map((opt) => {
            const isActive = currency === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => setCurrency(opt.code)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 btn-interactive ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
                title={`Moneda: ${opt.label} (${opt.symbol})`}
              >
                <span className="text-[11px]">{opt.flag}</span>
                <span className={isActive ? 'text-blue-700' : 'text-slate-600'}>{opt.symbol}</span>
                {!compact && <span className="hidden sm:inline text-[10px] uppercase font-semibold text-slate-400">{opt.code}</span>}
              </button>
            );
          })}
        </div>

        {/* Currency settings button to configure exchange rates */}
        <button
          onClick={() => {
            setEditPen(configs.PEN.rateAgainstUsd.toString());
            setEditEur(configs.EUR.rateAgainstUsd.toString());
            setModalOpen(true);
          }}
          className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700 transition-all btn-interactive"
          title="Configurar Tipo de Cambio (Soles / Dólares / Euros)"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Modal to configure Exchange Rates */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-view" onClick={() => setModalOpen(false)}>
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white text-base shadow-sm">
                  💱
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Configuración de Moneda</h3>
                  <p className="text-xs text-slate-500">Ajusta los tipos de cambio base frente al USD</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 btn-interactive">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRates} className="space-y-4">
              <div className="space-y-3">
                {/* USD Base */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🇺🇸</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">USD - Dólar Estadounidense ($)</p>
                      <p className="text-[10px] text-slate-500">Moneda base del sistema</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                    1.00 USD
                  </span>
                </div>

                {/* PEN (Soles) */}
                <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇵🇪</span>
                      <label className="text-xs font-bold text-blue-900">PEN - Soles Peruanos (S/)</label>
                    </div>
                    <span className="text-[10px] text-blue-700 font-semibold">1 USD = S/ {configs.PEN.rateAgainstUsd}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      required
                      value={editPen}
                      onChange={(e) => setEditPen(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>
                </div>

                {/* EUR (Euros) */}
                <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇪🇺</span>
                      <label className="text-xs font-bold text-purple-900">EUR - Euros (€)</label>
                    </div>
                    <span className="text-[10px] text-purple-700 font-semibold">1 USD = € {configs.EUR.rateAgainstUsd}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">€</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      required
                      value={editEur}
                      onChange={(e) => setEditEur(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Actualmente activo: <strong className="text-slate-800">{config.name} ({config.symbol})</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold btn-interactive"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm btn-interactive"
                  >
                    Guardar Tipo de Cambio
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
