import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { StudentHeader } from './StudentHeader';
import { HeroBanner } from './HeroBanner';
import { ProgressCard } from './ProgressCard';
import { ScheduleCard } from './ScheduleCard';
import { TasksCard } from './TasksCard';
import { GradesCard } from './GradesCard';
import { EventsCard } from './EventsCard';
import { StudyStreakCard } from './StudyStreakCard';
import { QuickAccessCard } from './QuickAccessCard';
import { MOCK_PRIMARY_BOY_DATA, QuickAccessItem } from '../../data/primary-boy.mock';

export interface PrimaryBoyDashboardProps {
  onNotify?: (message: string, icon?: string) => void;
}

export function PrimaryBoyDashboard({ onNotify }: PrimaryBoyDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<QuickAccessItem | null>(null);

  const data = MOCK_PRIMARY_BOY_DATA;

  const handleNotify = (msg: string, icon = '🚀') => {
    if (onNotify) {
      onNotify(msg, icon);
    } else {
      // Inline visual feedback
      console.log(`[EsCool Notification]: ${icon} ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF5FF] text-[#111C5A] p-2 sm:p-4 lg:p-6 font-sans">
      {/* 1. Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          handleNotify(`Sección seleccionada: ${tabId}`, '📂');
        }}
        pendingTasksCount={data.tasks.length}
        messagesCount={2}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:ml-[296px] max-w-[1280px] space-y-4">
        {/* Top Student Header */}
        <StudentHeader
          studentName={data.student.name}
          grade={data.student.grade}
          points={data.student.points}
          notificationsCount={data.student.notifications}
          onOpenNotifications={() => handleNotify('Tienes 2 avisos escolares nuevos', '🔔')}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Desktop 2-Column Grid (2fr : 1.15fr) */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN (approx 65-66% width on large screens) */}
          <section className="lg:col-span-7 space-y-5">
            {/* Hero Education 3D Banner */}
            <HeroBanner
              onCtaClick={() => handleNotify('Abriendo el aula virtual de 5° de Primaria', '📚')}
            />

            {/* Schedule of Today */}
            <ScheduleCard
              schedule={data.schedule}
              onViewFullSchedule={() => handleNotify('Abriendo horario semanal completo', '📅')}
            />

            {/* Pending Tasks */}
            <TasksCard
              tasks={data.tasks}
              onViewAllTasks={() => handleNotify('Abriendo panel de entregas y tareas', '📋')}
            />
          </section>

          {/* RIGHT COLUMN (approx 34-35% width on large screens) */}
          <section className="lg:col-span-5 space-y-5">
            {/* Progress Card (Matches Hero Height visually) */}
            <ProgressCard
              percentage={data.dashboard.progressPercentage}
              weeklyChange={data.dashboard.weeklyChange}
            />

            {/* Grades Card */}
            <GradesCard
              grades={data.grades}
              onViewAllGrades={() => handleNotify('Mostrando libreta de notas bimestral', '⭐')}
            />

            {/* Events Card */}
            <EventsCard
              events={data.events}
              onViewCalendar={() => handleNotify('Abriendo calendario escolar 2026', '🎉')}
            />

            {/* Study Streak Card */}
            <StudyStreakCard
              streakDays={data.streakDays}
              streakCount={data.dashboard.studyStreakDays}
            />

            {/* Quick Access Card (4x2 grid) */}
            <QuickAccessCard
              items={data.quickAccess}
              onSelectAction={(item) => {
                setSelectedQuickAction(item);
                handleNotify(`Abriendo módulo: ${item.label}`, '⚡');
              }}
            />
          </section>
        </main>
      </div>

      {/* Quick Action Interactive Modal */}
      {selectedQuickAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-scale-in">
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-md"
              style={{ backgroundColor: selectedQuickAction.bgLight, color: selectedQuickAction.color }}
            >
              🚀
            </div>
            <div>
              <h3 className="text-xl font-black text-[#111C5A]">
                {selectedQuickAction.label}
              </h3>
              <p className="text-xs font-bold text-[#5F678C] mt-1">
                Módulo educativo para 5° de Primaria.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedQuickAction(null)}
                className="w-full py-3 bg-[#1677F2] hover:bg-[#0B4DB8] text-white font-black text-sm rounded-[15px] shadow-md transition-all cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
