'use client';

import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  message: string;
  type: ToastType;
}

interface ToastModalProps {
  toast: ToastData | null;
  onClose: () => void;
  durationMs?: number;
}

const CONFIG: Record<ToastType, {
  bg: string;
  border: string;
  text: string;
  iconBg: string;
  progressBg: string;
  icon: React.ReactNode;
  label: string;
}> = {
  success: {
    bg: 'bg-white',
    border: 'border-emerald-200',
    text: 'text-slate-800',
    iconBg: 'bg-emerald-500',
    progressBg: 'bg-emerald-500',
    label: 'Proceso completado',
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-white',
    border: 'border-rose-200',
    text: 'text-slate-800',
    iconBg: 'bg-rose-500',
    progressBg: 'bg-rose-500',
    label: 'Proceso denegado',
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-white',
    border: 'border-indigo-200',
    text: 'text-slate-800',
    iconBg: 'bg-indigo-500',
    progressBg: 'bg-indigo-500',
    label: 'Información',
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
};

export default function ToastModal({ toast, onClose, durationMs = 3000 }: ToastModalProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setProgress(100);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 16);

    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [toast, durationMs, onClose]);

  if (!toast) return null;

  const cfg = CONFIG[toast.type];

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none flex items-end justify-center sm:items-start sm:justify-end"
      aria-live="polite"
    >
      <div
        className={`
          pointer-events-auto m-4 sm:m-6 w-full max-w-sm
          ${cfg.bg} ${cfg.border} border rounded-2xl shadow-2xl shadow-black/10
          overflow-hidden transition-all duration-300 ease-out
          ${visible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 sm:translate-y-0 sm:translate-x-4'
          }
        `}
        role="alert"
      >
        <div className="flex items-start gap-3.5 p-4">
          <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center shadow-sm`}>
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">
              {cfg.label}
            </p>
            <p className={`text-sm font-semibold leading-snug ${cfg.text}`}>
              {toast.message.replace(/^[✓🔒🔓✕]\s*/, '')}
            </p>
          </div>
          <button
            onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
            className="flex-shrink-0 w-6 h-6 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors mt-0.5"
            aria-label="Cerrar"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="h-1 bg-slate-100 w-full">
          <div
            className={`h-full ${cfg.progressBg} rounded-full`}
            style={{ width: `${progress}%`, transition: 'width 16ms linear' }}
          />
        </div>
      </div>
    </div>
  );
}
