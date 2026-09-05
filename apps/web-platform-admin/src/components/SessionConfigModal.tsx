'use client';

import React, { useState } from 'react';
import { useAuthSession } from '@/context/AuthSessionContext';
import { getCookie } from '@/lib/cookies';

interface SessionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionConfigModal: React.FC<SessionConfigModalProps> = ({ isOpen, onClose }) => {
  const { timeoutMinutes, warningSeconds, updateSessionConfig, user } = useAuthSession();

  const [selectedMinutes, setSelectedMinutes] = useState<number>(timeoutMinutes);
  const [selectedWarning, setSelectedWarning] = useState<number>(warningSeconds);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickDurations = [
    { label: '5 min (Ultra seguro)', value: 5 },
    { label: '15 min (Recomendado)', value: 15 },
    { label: '30 min (Estándar)', value: 30 },
    { label: '1 hora (Extendido)', value: 60 },
    { label: '2 horas', value: 120 },
    { label: '4 horas', value: 240 },
    { label: '8 horas (Jornada)', value: 480 },
  ];

  const quickWarnings = [
    { label: '30 seg antes', value: 30 },
    { label: '1 min antes', value: 60 },
    { label: '2 min antes', value: 120 },
    { label: '5 min antes', value: 300 },
  ];

  const handleSave = () => {
    updateSessionConfig(selectedMinutes, selectedWarning);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const hasTokenCookie = !!getCookie('cole_super_admin_token');
  const sessionStart = getCookie('cole_super_admin_session_start');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Configuración de Sesión y Seguridad</h3>
              <p className="text-xs text-slate-500">Persistencia por Cookies y Auto-Logout por inactividad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Timeout options */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="text-blue-600">⏱️</span>
              Tiempo de inactividad permitido
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Si no se detectan clics, movimientos ni pulsaciones de teclado durante este tiempo, la sesión se cerrará automáticamente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickDurations.map((d) => {
                const isSelected = selectedMinutes === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setSelectedMinutes(d.value)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 text-blue-700 shadow-sm font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{d.label}</span>
                    {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warning notice options */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="text-orange-500">🔔</span>
              Aviso preventivo antes de cerrar
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Muestra una ventana modal flotante para permitir extender la sesión con un solo clic.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickWarnings.map((w) => {
                const isSelected = selectedWarning === w.value;
                return (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setSelectedWarning(w.value)}
                    className={`px-2.5 py-2 rounded-xl text-xs text-center border transition-all ${
                      isSelected
                        ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diagnostic status banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="text-emerald-600">🍪</span>
              <span>Diagnóstico de Persistencia y Cookies</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
              <div>
                <span className="text-slate-400">Cookie JWT:</span>{' '}
                <span className={hasTokenCookie ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                  {hasTokenCookie ? 'Activa (cole_super_admin_token)' : 'No detectada'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Usuario:</span>{' '}
                <span className="font-semibold text-slate-800">{user?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400">Inicio sesión:</span>{' '}
                <span className="font-mono text-slate-700">
                  {sessionStart ? new Date(parseInt(sessionStart, 10)).toLocaleTimeString() : 'Ahora'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Seguridad:</span>{' '}
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  🛡️ Encriptada / SameSite=Lax
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={savedSuccess}
            className={`px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
            }`}
          >
            {savedSuccess ? (
              <>✓ ¡Guardado con éxito!</>
            ) : (
              'Guardar preferencias'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
