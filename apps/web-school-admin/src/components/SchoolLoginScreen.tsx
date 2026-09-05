'use client';

import React, { useState } from 'react';
import SchoolMeshGradient from './SchoolMeshGradient';
import SchoolParticleField from './SchoolParticleField';
import { useTilt } from '@cole/ui-components/src/useTilt';

interface Props {
  onLogin: () => void;
  loginFn: (email: string, password: string) => Promise<void>;
}

export default function SchoolLoginScreen({ onLogin, loginFn }: Props) {
  const [email, setEmail] = useState('director@sancleo.edu.pe');
  const [password, setPassword] = useState('Cole2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginFn(email, password);
      onLogin();
    } catch {
      setError('Credenciales inválidas o API no disponible.');
    } finally {
      setLoading(false);
    }
  };

  const tilt = useTilt<HTMLDivElement>({ maxTilt: 8, perspective: 1000, scale: 1.02 });

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Animated mesh gradient + particles ── */}
      <SchoolMeshGradient />
      <SchoolParticleField />

      {/* ── Login card ── */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div
          ref={tilt.ref}
          style={tilt.style}
          onMouseMove={tilt.onMouseMove}
          onMouseLeave={tilt.onMouseLeave}
          className="bg-white/[0.07] backdrop-blur-xl rounded-3xl border border-white/[0.12] shadow-2xl shadow-black/30 p-8 sm:p-10 animate-in"
        >
          {/* ── School icon ── */}
          <div className="flex justify-center mb-6">
            <div className="group relative cursor-default">
              {/* Glow ring on hover */}
              <div className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(16,185,129,0.4), transparent, rgba(6,182,212,0.4), transparent)', animation: 'shieldGlowSpin 4s linear infinite', filter: 'blur(12px)' }} />
              {/* Outer rotating ring */}
              <div className="absolute -inset-3 rounded-3xl border border-transparent opacity-0 group-hover:opacity-100 group-hover:border-emerald-500/30 transition-all duration-700" style={{ animation: 'shieldRotate 8s linear infinite' }} />
              {/* Pulsing ring */}
              <div className="absolute -inset-2 rounded-3xl border-2 border-emerald-400/0 group-hover:border-emerald-400/20 group-hover:animate-pulse transition-all duration-700" />
              {/* Icon body */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/60 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-shadow duration-500">
                <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
              </div>
              {/* Status dot */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#041a14] shadow-[0_0_8px_rgba(52,211,153,0.6)] group-hover:shadow-[0_0_14px_rgba(52,211,153,0.9)] transition-shadow duration-500" />
            </div>
          </div>

          {/* ── Branding ── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Colegio San Cleo</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Administración Escolar</h1>
            <p className="text-sm text-slate-400 mt-1">Nido • Primaria • Secundaria • Pre-Universitario</p>
          </div>

          {/* ── Quick Roles Selector ── */}
          <div className="mb-5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Seleccionar perfil de acceso rápido:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('director@sancleo.edu.pe');
                  setPassword('Cole2026!');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  email === 'director@sancleo.edu.pe'
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-white shadow-sm'
                    : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-slate-300'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1">
                  <span>🏫 Director</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Acceso Total</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('tienda@sancleo.edu.pe');
                  setPassword('Cole2026!');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  email === 'tienda@sancleo.edu.pe'
                    ? 'bg-amber-500/20 border-amber-400/50 text-white shadow-sm'
                    : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-slate-300'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1">
                  <span>🛒 Gestor Tienda</span>
                </div>
                <div className="text-[10px] text-amber-300/80 truncate">Solo Productos</div>
              </button>
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@sancleo.edu.pe"
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.06] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.06] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className="text-xs text-red-300 font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verificando credenciales...
                  </>
                ) : (
                  <>
                    Ingresar al Colegio
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* ── Footer ── */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-[11px] text-slate-500">
              Acceso restringido a directivos y administradores.
            </p>
            <p className="text-[10px] text-slate-600 mt-1">
              Cole Platform v0.1.0 &middot; Multi-Tenant SaaS
            </p>
          </div>
        </div>

        {/* ── Bottom badge ── */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-1.5 bg-white/[0.05] backdrop-blur border border-white/[0.08] rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-medium text-slate-400">Sistema operativo &middot; Servicios activos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
