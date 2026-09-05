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

interface NavItem {
  id: DashboardView;
  label: string;
  description: string;
  badge?: string;
  accentColor: string;
  icon: (active: boolean) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Panel General',
    description: 'Métricas y KPIs ejecutivos',
    accentColor: 'blue',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: 'tenants',
    label: 'Colegios',
    description: 'Gestión de instituciones',
    badge: 'Multi-Tenant',
    accentColor: 'emerald',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12l3 3.75V21" />
      </svg>
    ),
  },
  {
    id: 'plans',
    label: 'Planes Comerciales',
    description: 'Tiers & Entitlements',
    accentColor: 'purple',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-slate-500 group-hover:text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analíticas',
    description: 'Crecimiento y adopción',
    accentColor: 'indigo',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A2.25 2.25 0 013 18.75v-5.625zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a2.25 2.25 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a2.25 2.25 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    id: 'audit',
    label: 'Auditoría & Seguridad',
    description: 'Trazabilidad de eventos',
    accentColor: 'purple',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-slate-500 group-hover:text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeView, onViewChange, onLogout, userEmail, userName }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40 select-none shadow-sm">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">
            C
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">COLE</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                SaaS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">Control Center</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 pt-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Módulos de Plataforma</p>
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group ${
                isActive
                  ? item.accentColor === 'blue'
                    ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200/80 shadow-sm'
                    : item.accentColor === 'emerald'
                    ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/80 shadow-sm'
                    : 'bg-purple-50 text-purple-900 font-semibold border border-purple-200/80 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span className={`p-1.5 rounded-md ${
                isActive
                  ? item.accentColor === 'blue'
                    ? 'bg-blue-100/80'
                    : item.accentColor === 'emerald'
                    ? 'bg-emerald-100/80'
                    : 'bg-purple-100/80'
                  : 'bg-slate-100 group-hover:bg-slate-200/70'
              }`}>
                {item.icon(isActive)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        <div className="pt-5 px-3 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Infraestructura</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
            <span className="text-[11px] font-medium text-slate-600">PostgreSQL</span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Conectado
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
            <span className="text-[11px] font-medium text-slate-600">Redis Cache</span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Sincronizado
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
            <span className="text-[11px] font-medium text-slate-600">Cluster Multi-Tenant</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">v2.0</span>
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-200/80 space-y-2 bg-slate-50/50">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {userName ? userName.charAt(0).toUpperCase() : 'SA'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight">{userName || 'Super Admin'}</p>
            <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{userEmail || 'admin@cole.pe'}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-all shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
