'use client';

import React from 'react';
import { useAuthSession } from '@/context/AuthSessionContext';

export const SessionTimeoutModal: React.FC = () => {
  const { isWarningOpen, remainingSeconds, warningSeconds, extendSession, logout } = useAuthSession();

  if (!isWarningOpen) return null;

  const percentage = Math.max(0, Math.min(100, (remainingSeconds / warningSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 w-full max-w-md p-6 overflow-hidden relative transform transition-all scale-100">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-100">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-start gap-4 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-300 flex items-center justify-center flex-shrink-0 text-amber-600">
            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">¿Sigues ahí?</h3>
            <p className="text-sm text-slate-600 mt-1">
              Tu sesión está a punto de expirar por inactividad. Por motivos de seguridad bancaria y protección de datos escolares, cerraremos tu sesión en breve.
            </p>
          </div>
        </div>

        <div className="my-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-semibold">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Tiempo restante:</span>
          </div>
          <span className="text-2xl font-black tracking-wider text-amber-700 font-mono">
            {Math.floor(remainingSeconds / 60)}:
            {String(remainingSeconds % 60).padStart(2, '0')}
          </span>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => logout('manual')}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:border-slate-300"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Cerrar ahora
          </button>
          <button
            type="button"
            onClick={extendSession}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Mantener sesión
          </button>
        </div>
      </div>
    </div>
  );
};
