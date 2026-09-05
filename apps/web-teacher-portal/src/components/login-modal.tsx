'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Cole2026!');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900 relative space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
              👨‍🏫
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Portal Docente • JWT
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">Acceso Profesores</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Credentials for Teachers */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            ⚡ Acceso Rápido de Prueba (Docentes Sembrados)
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('elena.torres@sanjose.edu.pe')}
              className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-left transition font-semibold text-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="font-extrabold text-emerald-950">👨‍🏫 Prof. Elena Torres</div>
                <div className="text-[11px] text-emerald-700">elena.torres@sanjose.edu.pe • Docente Primaria & Sec</div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-200/80 px-2 py-1 rounded-lg">Seleccionar</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('director@sanjose.edu.pe')}
              className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 text-left transition font-semibold text-slate-700 flex items-center justify-between"
            >
              <div>
                <div className="font-extrabold text-slate-900">🏫 Lic. Roberto Méndez (Director)</div>
                <div className="text-[11px] text-slate-500">director@sanjose.edu.pe • Dirección Académica</div>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-200/80 px-2 py-1 rounded-lg">Seleccionar</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Correo Institucional del Docente
            </label>
            <input
              type="email"
              required
              placeholder="elena.torres@sanjose.edu.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>🔐 Iniciar Sesión en Aula Virtual</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
