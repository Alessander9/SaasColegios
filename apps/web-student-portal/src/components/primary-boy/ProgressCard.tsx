import React from 'react';

export interface ProgressCardProps {
  percentage?: number;
  weeklyChange?: string;
}

export function ProgressCard({
  percentage = 78,
  weeklyChange = '+15%',
}: ProgressCardProps) {
  // Circular progress calculations
  const size = 135;
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative min-h-[281px] rounded-[22px] bg-white p-5 shadow-[0_6px_20px_rgba(42,104,180,0.10)] border border-[#E2EBF5] flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-[#111C5A] tracking-tight flex items-center gap-1.5">
          <span>Mi progreso</span>
          <span className="text-amber-400 text-sm">✨</span>
        </h3>
        <span className="text-xl">🚀</span>
      </div>

      {/* Center: Circular Progress & Motivational Text */}
      <div className="flex items-center justify-center gap-4 my-1">
        {/* Circular SVG Ring */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E8ECF2"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active Foreground Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#progressGreenGrad)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="progressGreenGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#35B449" />
                <stop offset="100%" stopColor="#6BCB4B" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Percentage Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-[#111C5A] leading-none">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1 text-left">
          <p className="text-sm font-black text-[#111C5A] leading-snug">
            ¡Vas por <br />
            <span className="text-[#31B447]">excelente camino!</span>
          </p>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#31B447] text-xs font-black">
            <span>📈</span>
            <span>{weeklyChange}</span>
          </div>
        </div>
      </div>

      {/* Bottom: Trend note */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#5F678C]">
        <span>Tendencia:</span>
        <span className="text-emerald-600 font-extrabold flex items-center gap-1">
          <span>{weeklyChange}</span>
          <span>respecto a la semana pasada</span>
        </span>
      </div>
    </div>
  );
}
