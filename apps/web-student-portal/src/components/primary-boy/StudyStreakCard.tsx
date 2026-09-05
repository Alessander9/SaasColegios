import React from 'react';

export interface StreakDay {
  day: string;
  completed: boolean;
}

export interface StudyStreakCardProps {
  streakDays: StreakDay[];
  streakCount?: number;
}

export function StudyStreakCard({
  streakDays,
  streakCount = 7,
}: StudyStreakCardProps) {
  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_6px_20px_rgba(42,104,180,0.10)] border border-[#E2EBF5] flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl animate-bounce">🔥</span>
          <h3 className="text-lg font-black text-[#111C5A] tracking-tight">
            Racha de estudio
          </h3>
        </div>
      </div>

      {/* Center: Star Badge & Message */}
      <div className="flex items-center gap-3.5 my-2">
        {/* Golden Star Badge */}
        <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0 animate-float-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <polygon
              points="50,5 64,35 96,38 72,60 79,92 50,75 21,92 28,60 4,38 36,35"
              fill="#FFC928"
              stroke="#E1A100"
              strokeWidth="3"
            />
          </svg>
          <span className="absolute text-xl font-black text-[#111C5A]">{streakCount}</span>
        </div>

        <div className="space-y-0.5">
          <p className="text-sm font-black text-[#111C5A] leading-snug">
            ¡Llevas <span className="text-[#39B54A]">{streakCount} días seguidos</span> aprendiendo!
          </p>
          <p className="text-xs font-bold text-[#5F678C]">
            ¡Continúa así para desbloquear el trofeo espacial!
          </p>
        </div>
      </div>

      {/* Bottom: Monday to Sunday Dots */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1">
        {streakDays.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-[#5F678C]">{item.day}</span>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                item.completed
                  ? 'bg-[#39B54A] text-white shadow-xs'
                  : 'bg-[#E9EDF2] text-[#8A95BA]'
              }`}
            >
              {item.completed ? '✓' : '•'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
