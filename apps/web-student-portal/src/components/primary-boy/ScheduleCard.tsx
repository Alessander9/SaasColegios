import React from 'react';
import { ScheduleClass } from '../../data/primary-boy.mock';

export interface ScheduleCardProps {
  schedule: ScheduleClass[];
  onViewFullSchedule?: () => void;
}

export function ScheduleCard({
  schedule,
  onViewFullSchedule,
}: ScheduleCardProps) {
  const getSubjectEmoji = (subject: string) => {
    if (subject.includes('Matemática')) return '📐';
    if (subject.includes('Comunicación')) return '📖';
    if (subject.includes('Ciencia')) return '🔬';
    if (subject.includes('Arte')) return '🎨';
    return '📝';
  };

  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_6px_20px_rgba(42,104,180,0.10)] border border-[#E2EBF5] flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏰</span>
          <h3 className="text-lg font-black text-[#111C5A] tracking-tight">
            Horario de hoy
          </h3>
        </div>
        <button
          type="button"
          onClick={onViewFullSchedule}
          className="text-xs font-black text-[#1677F2] hover:text-[#0B4DB8] transition-colors cursor-pointer"
        >
          Ver horario completo →
        </button>
      </div>

      {/* Schedule Rows */}
      <div className="space-y-2.5">
        {schedule.map((item) => (
          <div
            key={item.id}
            className="h-[72px] px-3.5 rounded-[15px] bg-[#FBFDFF] hover:bg-[#F0F6FF] border border-[#EEF3F8] hover:border-blue-200 transition-all flex items-center justify-between gap-3 group"
          >
            {/* Left: Time Badge */}
            <div className="w-[68px] flex flex-col items-center justify-center border-r border-[#EEF3F8] pr-2 text-center">
              <span className="text-xs font-black text-[#111C5A]">{item.start}</span>
              <span className="text-[10px] font-bold text-[#8A95BA]">{item.end}</span>
            </div>

            {/* Center: Subject & Room */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-xs"
                style={{ backgroundColor: `${item.color}18`, color: item.color }}
              >
                {getSubjectEmoji(item.subject)}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-[#111C5A] truncate group-hover:text-[#1677F2] transition-colors">
                  {item.subject}
                </h4>
                <p className="text-[11px] font-bold text-[#5F678C] truncate">
                  {item.room} • {item.teacher}
                </p>
              </div>
            </div>

            {/* Right: Status / Indicator */}
            <div className="flex items-center">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
