import React from 'react';
import { BoyAvatar } from './StudentIllustrations';

export interface StudentHeaderProps {
  studentName?: string;
  grade?: string;
  points?: number;
  notificationsCount?: number;
  onOpenNotifications?: () => void;
  onToggleMobileMenu?: () => void;
}

export function StudentHeader({
  studentName = 'Mateo R.',
  grade = '5° de Primaria',
  points = 150,
  notificationsCount = 2,
  onOpenNotifications,
  onToggleMobileMenu,
}: StudentHeaderProps) {
  return (
    <header className="h-[90px] flex items-center justify-between gap-4 select-none mb-4">
      {/* Left: Greeting */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden w-11 h-11 rounded-2xl bg-white border border-[#E2EBF5] shadow-xs flex items-center justify-center text-xl text-[#111C5A]"
          >
            ☰
          </button>
        )}
        <div>
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-black text-[#111C5A] tracking-tight leading-none flex items-center gap-1.5">
            ¡Hola, {studentName.split(' ')[0]}! <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-[13px] font-bold text-[#44507E] mt-1">
            Hoy es miércoles, 22 de mayo
          </p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 max-w-[280px] lg:max-w-[320px]">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar cursos, tareas..."
            className="w-full h-12 lg:h-14 pl-12 pr-4 bg-white rounded-[18px] border border-[#E2EBF5] text-sm font-bold text-[#111C5A] placeholder-[#8A95BA] shadow-[0_4px_14px_rgba(35,90,160,0.08)] focus:outline-none focus:border-[#1677F2] transition-colors"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#8A95BA]">
            🔍
          </div>
        </div>
      </div>

      {/* Right: Points, Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Points Widget */}
        <div className="h-12 lg:h-14 px-3 sm:px-4 bg-white rounded-[18px] border border-[#E2EBF5] shadow-[0_4px_14px_rgba(35,90,160,0.08)] flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-lg text-[#FFAA00]">
            ⭐
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-base sm:text-lg font-black text-[#111C5A]">{points}</span>
            <span className="text-[10px] font-black uppercase text-[#8A95BA]">Puntos</span>
          </div>
        </div>

        {/* Notifications Button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative w-12 lg:w-14 h-12 lg:h-14 bg-white rounded-[18px] border border-[#E2EBF5] shadow-[0_4px_14px_rgba(35,90,160,0.08)] flex items-center justify-center text-xl text-[#111C5A] hover:bg-[#F0F6FF] transition-all cursor-pointer"
        >
          <span>🔔</span>
          {notificationsCount > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#F44336] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
              {notificationsCount}
            </span>
          )}
        </button>

        {/* Student Profile Widget */}
        <div className="h-12 lg:h-14 pl-2 pr-3 bg-white rounded-[18px] border border-[#E2EBF5] shadow-[0_4px_14px_rgba(35,90,160,0.08)] flex items-center gap-2.5 cursor-pointer hover:border-blue-300 transition-colors">
          <BoyAvatar className="w-9 h-9" />
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs sm:text-sm font-extrabold text-[#111C5A] truncate">{studentName}</span>
            <span className="text-[10px] font-bold text-[#8A95BA]">{grade}</span>
          </div>
          <span className="text-xs text-[#8A95BA]">▼</span>
        </div>
      </div>
    </header>
  );
}
