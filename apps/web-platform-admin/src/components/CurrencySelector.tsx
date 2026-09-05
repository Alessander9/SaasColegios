'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, type CurrencyCode } from '../context/CurrencyContext';

export default function CurrencySelector() {
  const { currency, setCurrency, configs, updateExchangeRate } = useCurrency();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPen, setEditPen] = useState(configs.PEN.rateAgainstUsd.toString());
  const [editEur, setEditEur] = useState(configs.EUR.rateAgainstUsd.toString());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const pen = parseFloat(editPen);
    const eur = parseFloat(editEur);
    if (!isNaN(pen) && pen > 0) updateExchangeRate('PEN', pen);
    if (!isNaN(eur) && eur > 0) updateExchangeRate('EUR', eur);
    setModalOpen(false);
  };

  const currencyOptions: { code: CurrencyCode; label: string; symbol: string; flag: string; desc: string }[] = [
    { code: 'PEN', label: 'Soles', symbol: 'S/', flag: '🇵🇪', desc: 'Sol Peruano' },
    { code: 'USD', label: 'Dólares', symbol: '$', flag: '🇺🇸', desc: 'Dólar Estadounidense' },
    { code: 'EUR', label: 'Euros', symbol: '€', flag: '🇪🇺', desc: 'Euro Europeo' },
  ];

  const currentOpt = currencyOptions.find((c) => c.code === currency) || currencyOptions[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sleek Compact Trigger Button */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="btn-interactive flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-800 transition-all shadow-xs"
        title="Cambiar divisa de visualización"
      >
        <span className="text-sm">{currentOpt.flag}</span>
        <span className="text-blue-700 font-black font-mono">{currentOpt.symbol}</span>
        <span className="text-[11px] font-extrabold text-slate-700">{currentOpt.code}</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Flyout Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Divisa de Plataforma</span>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">En Vivo</span>
          </div>

          <div className="space-y-0.5 pt-1">
            {currencyOptions.map((opt) => {
              const isSelected = currency === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setCurrency(opt.code);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-bold border border-blue-100'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{opt.flag}</span>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 leading-none">{opt.code} ({opt.symbol})</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setEditPen(configs.PEN.rateAgainstUsd.toString());
                setEditEur(configs.EUR.rateAgainstUsd.toString());
                setDropdownOpen(false);
                setModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition-colors"
            >
              <span>⚙️</span>
              <span>Ajustar tipos de cambio</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal to configure Exchange Rates */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
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
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRates} className="space-y-4">
              <div className="space-y-3">
                {/* USD Base */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🇺🇸</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">USD - Dólar Estadounidense ($)</p>
                      <p className="text-[10px] text-slate-500">Moneda base del sistema</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    1.00 USD
                  </span>
                </div>

                {/* PEN (Soles) */}
                <div className="p-3.5 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🇵🇪</span>
                      <label className="text-xs font-bold text-blue-900">PEN - Soles Peruanos (S/)</label>
                    </div>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-100/60 px-2 py-0.5 rounded">1 USD = S/ {configs.PEN.rateAgainstUsd}</span>
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
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* EUR (Euros) */}
                <div className="p-3.5 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🇪🇺</span>
                      <label className="text-xs font-bold text-purple-900">EUR - Euros (€)</label>
                    </div>
                    <span className="text-[10px] text-purple-700 font-bold bg-purple-100/60 px-2 py-0.5 rounded">1 USD = € {configs.EUR.rateAgainstUsd}</span>
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
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                >
                  Guardar Tipos de Cambio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
