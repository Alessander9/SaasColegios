import React from 'react';
import { GradeItem } from '../../data/primary-boy.mock';

export interface GradesCardProps {
  grades: GradeItem[];
  onViewAllGrades?: () => void;
}

export function GradesCard({ grades, onViewAllGrades }: GradesCardProps) {
  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_6px_20px_rgba(42,104,180,0.10)] border border-[#E2EBF5] flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <h3 className="text-lg font-black text-[#111C5A] tracking-tight">
            Mis calificaciones
          </h3>
        </div>
        <button
          type="button"
          onClick={onViewAllGrades}
          className="text-xs font-black text-[#1677F2] hover:text-[#0B4DB8] transition-colors cursor-pointer"
        >
          Ver todas →
        </button>
      </div>

      {/* Grade Rows */}
      <div className="space-y-3">
        {grades.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#111C5A]">{item.subject}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#5F678C] font-semibold">{item.comment}</span>
                <span
                  className="font-black text-sm"
                  style={{ color: item.scoreColor }}
                >
                  {item.score}/20
                </span>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full h-[7px] bg-[#E8ECF2] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${item.barPercentage}%`,
                  backgroundColor: item.barColor,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
