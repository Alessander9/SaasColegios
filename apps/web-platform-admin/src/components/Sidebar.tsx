'use client';

import React from 'react';

export type DashboardView = 'overview' | 'tenants' | 'plans' | 'analytics' | 'audit';

interface SidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onLogout: () => void;
  userEmail?: string;
  userName?: string;
}

const NAV_ITEMS: { id: DashboardView; label: string; icon: string; description: string }[] = [
  { id: 'overview', label: 'Panel General', icon: '📊', description: 'KPIs y métricas globales' },
  { id: 'tenants', label: 'Colegios', icon: '🏫', description: 'Gestión de tenantes' },
  { id: 'plans', label: 'Planes', icon: '💳', description: 'Catálogo comercial' },
  { id: 'analytics', label: 'Analíticas', icon: '📈', description: 'Crecimiento y uso' },
  { id: 'audit', label: 'Auditoría', icon: '🛡️', description: 'Logs de actividad' },
];

export default function Sidebar({ activeView, onViewChange, onLogout, userEmail, userName }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-600 to-emerald-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/25">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">COLE</span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Super Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Panel de Control Global</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                  : 'hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <span className={`text-xl w-8 h-8 flex items-center justify-center rounded-lg ${
                isActive ? 'bg-indigo-500/20' : 'bg-slate-800/60 group-hover:bg-slate-800'
              }`}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                  {item.label}
                </p>
                <p className={`text-[10px] font-medium ${isActive ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-400'}`}>
                  {item.description}
                </p>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
            {userName ? userName.charAt(0).toUpperCase() : 'SA'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userName || 'Super Admin'}</p>
            <p className="text-[10px] text-slate-500 truncate">{userEmail || 'admin@cole.pe'}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
