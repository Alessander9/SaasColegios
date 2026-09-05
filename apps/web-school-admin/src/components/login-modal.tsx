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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
              C
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                JWT Authentication
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">Iniciar Sesión</h3>
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

        {/* Demo Credentials Quick Selector */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            ⚡ Accesos Rápido de Prueba (Base de Datos Real)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('director@sanjose.edu.pe')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-indigo-50 hover:border-indigo-300 text-left transition font-semibold text-slate-700"
            >
              <div className="font-extrabold text-slate-900">🏫 Director</div>
              <div className="text-[10px] text-slate-500 truncate">director@sanjose.edu.pe</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@cole.pe')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-purple-50 hover:border-purple-300 text-left transition font-semibold text-slate-700"
            >
              <div className="font-extrabold text-purple-900">🛡️ Super Admin</div>
              <div className="text-[10px] text-slate-500 truncate">admin@cole.pe</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('elena.torres@sanjose.edu.pe')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-emerald-50 hover:border-emerald-300 text-left transition font-semibold text-slate-700"
            >
              <div className="font-extrabold text-emerald-900">👨‍🏫 Docente</div>
              <div className="text-[10px] text-slate-500 truncate">elena.torres@sanjose.edu.pe</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('tienda@sancleo.edu.pe')}
              className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100 hover:border-amber-400 text-left transition font-semibold text-slate-700"
            >
              <div className="font-extrabold text-amber-950 flex items-center gap-1">
                <span>🛒 Gestor Tienda</span>
                <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold">Solo Prod.</span>
              </div>
              <div className="text-[10px] text-amber-800 truncate">tienda@sancleo.edu.pe</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('padre.garcia@email.com')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-amber-50 hover:border-amber-300 text-left transition font-semibold text-slate-700"
            >
              <div className="font-extrabold text-amber-900">👨‍👩‍👧 Apoderado</div>
              <div className="text-[10px] text-slate-500 truncate">padre.garcia@email.com</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="nombre@colegio.edu.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>🔐 Autenticar con JWT</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
