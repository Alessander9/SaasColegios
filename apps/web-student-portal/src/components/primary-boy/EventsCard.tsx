import React from 'react';
import { EventItem } from '../../data/primary-boy.mock';

export interface EventsCardProps {
  events: EventItem[];
  onViewCalendar?: () => void;
}

export function EventsCard({ events, onViewCalendar }: EventsCardProps) {
  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_6px_20px_rgba(42,104,180,0.10)] border border-[#E2EBF5] flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <h3 className="text-lg font-black text-[#111C5A] tracking-tight">
            Próximos eventos
          </h3>
        </div>
        <button
          type="button"
          onClick={onViewCalendar}
          className="text-xs font-black text-[#1677F2] hover:text-[#0B4DB8] transition-colors cursor-pointer"
        >
          Ver calendario →
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        {events.map((event, idx) => (
          <div
            key={event.id}
            className="p-3 rounded-[15px] bg-[#FBFDFF] hover:bg-[#F0F6FF] border border-[#EEF3F8] hover:border-blue-200 transition-all flex items-center gap-3.5 group"
          >
            {/* Date Badge */}
            <div
              className={`w-[52px] h-[52px] rounded-[12px] flex flex-col items-center justify-center text-white flex-shrink-0 shadow-xs ${
                idx === 0
                  ? 'bg-gradient-to-tr from-[#397FF4] to-[#60A5FA]'
                  : 'bg-gradient-to-tr from-[#7045E8] to-[#A78BFA]'
              }`}
            >
              <span className="text-[10px] font-black tracking-wider leading-none">
                {event.month}
              </span>
              <span className="text-xl font-black leading-tight">
                {event.day}
              </span>
            </div>

            {/* Event Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-[#111C5A] truncate group-hover:text-[#1677F2] transition-colors">
                {event.title}
              </h4>
              <p className="text-[11px] font-bold text-[#5F678C] truncate mt-0.5">
                {event.date} • {event.time}
              </p>
            </div>

            {/* Event Type Icon */}
            <div className="text-xl flex-shrink-0">
              {event.type === 'science' ? '🔬' : '🎉'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
