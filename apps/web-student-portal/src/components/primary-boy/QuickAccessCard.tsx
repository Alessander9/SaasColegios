import React from 'react';
import { QuickAccessItem } from '../../data/primary-boy.mock';

export interface QuickAccessCardProps {
  items: QuickAccessItem[];
  onSelectAction?: (item: QuickAccessItem) => void;
}

export function QuickAccessCard({ items, onSelectAction }: QuickAccessCardProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'qa-1': return '🎮';
      case 'qa-2': return '▶️';
      case 'qa-3': return '📖';
      case 'qa-4': return '📝';
      case 'qa-5': return '🔤';
      case 'qa-6': return '🧮';
      case 'qa-7': return '💬';
      case 'qa-8': return '❓';
      default: return '⚡';
    }
  };

  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_6px_20px_rgba(42,104,180,0.10)] border border-[#E2EBF5] select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <h3 className="text-lg font-black text-[#111C5A] tracking-tight">
            Accesos rápidos
          </h3>
        </div>
      </div>

      {/* 4x2 Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectAction?.(item)}
            className="h-[74px] rounded-[15px] p-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.03] active:scale-95 border border-[#EEF3F8] shadow-2xs cursor-pointer group"
            style={{ backgroundColor: item.bgLight }}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {getIcon(item.id)}
            </span>
            <span
              className="text-[11px] font-black leading-none truncate max-w-full"
              style={{ color: item.color }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
