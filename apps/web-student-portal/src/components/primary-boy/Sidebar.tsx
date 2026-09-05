import React from 'react';
import { BrandLogo } from './BrandLogo';
import { SidebarMotivationalCard } from './StudentIllustrations';

export interface SidebarNavProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  pendingTasksCount?: number;
  messagesCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: '🏠' },
  { id: 'classes', label: 'Mis Clases', icon: '📚' },
  { id: 'tasks', label: 'Tareas', icon: '📋', badge: 3 },
  { id: 'grades', label: 'Calificaciones', icon: '⭐' },
  { id: 'schedule', label: 'Horarios', icon: '📅' },
  { id: 'attendance', label: 'Asistencia', icon: '😊' },
  { id: 'messages', label: 'Mensajes', icon: '✉️', badge: 2 },
  { id: 'resources', label: 'Recursos', icon: '📁' },
  { id: 'educational_games', label: 'Juegos Educativos', icon: '🎮' },
  { id: 'profile', label: 'Mi Perfil', icon: '👤' },
  { id: 'settings', label: 'Configuración', icon: '⚙️' },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  pendingTasksCount = 3,
  messagesCount = 2,
  isOpenMobile = false,
  onCloseMobile,
}: SidebarNavProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-2.5 bottom-2.5 left-3 w-[276px] bg-white rounded-[22px] p-4 shadow-[0_6px_20px_rgba(42,104,180,0.08)] border border-[#E2EBF5] z-50 flex flex-col justify-between overflow-hidden transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-[115%] lg:translate-x-0'
        }`}
      >
        {/* Top: Brand Logo */}
        <div className="relative pb-2 border-b border-[#F0F4F9]">
          <BrandLogo />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden absolute top-2 right-2 text-slate-400 hover:text-slate-600 font-black text-sm p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Middle: Navigation Items */}
        <nav className="my-3 flex-1 overflow-y-auto pr-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const badgeValue =
              item.id === 'tasks'
                ? pendingTasksCount
                : item.id === 'messages'
                ? messagesCount
                : item.badge;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full h-11 px-3.5 rounded-[25px] font-bold text-[15px] flex items-center justify-between transition-all duration-180 cursor-pointer ${
                  isActive
                    ? 'bg-[#176FF2] text-white shadow-[0_6px_16px_rgba(23,111,242,0.25)] scale-[1.01]'
                    : 'text-[#111C5A] hover:bg-[#F0F6FF] hover:text-[#1677F2]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>

                {badgeValue !== undefined && badgeValue > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                      isActive
                        ? 'bg-white text-[#F44336]'
                        : 'bg-[#F44336] text-white shadow-xs'
                    }`}
                  >
                    {badgeValue}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Motivational Banner */}
        <div className="pt-2">
          <SidebarMotivationalCard />
        </div>
      </aside>
    </>
  );
}
