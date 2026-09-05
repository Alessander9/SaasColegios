import React from 'react';
import { PendingTask } from '../../data/primary-boy.mock';

export interface TasksCardProps {
  tasks: PendingTask[];
  onViewAllTasks?: () => void;
}

export function TasksCard({ tasks, onViewAllTasks }: TasksCardProps) {
  const getSubjectEmoji = (subject: string) => {
    if (subject.includes('Matemática')) return '📐';
    if (subject.includes('Comunicación')) return '📖';
    if (subject.includes('Ciencia')) return '🧪';
    return '📝';
  };

  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_6px_20px_rgba(42,104,180,0.10)] border border-[#E2EBF5] flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <h3 className="text-lg font-black text-[#111C5A] tracking-tight">
            Tareas pendientes
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-[#F44336] text-white text-[11px] font-black shadow-xs">
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onViewAllTasks}
          className="text-xs font-black text-[#1677F2] hover:text-[#0B4DB8] transition-colors cursor-pointer"
        >
          Ver todas →
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {tasks.map((task) => {
          // Circular mini progress calculations
          const size = 42;
          const strokeWidth = 4;
          const radius = (size - strokeWidth) / 2;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset =
            circumference - (task.progress / 100) * circumference;

          return (
            <div
              key={task.id}
              className="h-[77px] px-3.5 rounded-[14px] bg-[#FBFDFF] hover:bg-[#F0F6FF] border border-[#EEF3F8] hover:border-blue-200 transition-all flex items-center justify-between gap-3 group"
            >
              {/* Left: Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-xs"
                style={{ backgroundColor: `${task.color}18`, color: task.color }}
              >
                {getSubjectEmoji(task.subject)}
              </div>

              {/* Center: Title & Deadline */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${task.color}15`, color: task.color }}
                  >
                    {task.subject}
                  </span>
                </div>
                <h4 className="text-sm font-black text-[#111C5A] truncate group-hover:text-[#1677F2] transition-colors mt-0.5">
                  {task.title}
                </h4>
                <p className="text-[10px] font-bold text-[#8A95BA]">
                  {task.delivery}
                </p>
              </div>

              {/* Right: Circular Mini Progress */}
              <div className="relative flex items-center justify-center flex-shrink-0">
                <svg width={size} height={size} className="transform -rotate-90">
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E8ECF2"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={task.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-[10px] font-black text-[#111C5A]">
                  {task.progress}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={onViewAllTasks}
          className="text-xs font-black text-[#1677F2] hover:text-[#0B4DB8] transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Ver todas las tareas</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
