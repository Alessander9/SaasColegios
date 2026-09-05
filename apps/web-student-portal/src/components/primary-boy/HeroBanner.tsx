import React from 'react';
import { HeroSceneIllustration, PlanOfTheDayNote } from './StudentIllustrations';

export interface HeroBannerProps {
  onCtaClick?: () => void;
}

export function HeroBanner({ onCtaClick }: HeroBannerProps) {
  return (
    <div className="relative min-h-[281px] rounded-[22px] overflow-hidden bg-gradient-to-r from-[#F0F7FF] via-[#CFE9FF] to-[#9CDDFF] shadow-[0_8px_18px_rgba(44,109,186,0.12)] border border-white/60 p-6 sm:p-7 flex flex-col justify-between select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 left-40 w-48 h-48 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

      {/* Grid Layout: Left Copy & Right 3D Illustration */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Copy Area */}
        <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-center space-y-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl sm:text-[34px] lg:text-[36px] font-black leading-tight tracking-tight">
                <span className="text-[#0D62D7] block">¡Tú puedes</span>
                <span className="text-[#3AA72F] flex items-center gap-1.5">
                  lograrlo!
                  <span className="text-[#FFAA00] text-3xl animate-bounce">⚡</span>
                </span>
              </h2>
            </div>
            <p className="text-sm sm:text-base font-bold text-[#111C5A] leading-snug pt-1">
              Estudia, juega <br className="hidden sm:inline" />
              y diviértete aprendiendo.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={onCtaClick}
              className="px-6 py-3.5 bg-gradient-to-b from-[#3387FF] to-[#126FED] hover:from-[#4090FF] hover:to-[#0F60D5] text-white font-black text-sm rounded-[15px] shadow-[0_6px_14px_rgba(18,111,237,0.28)] hover:shadow-[0_8px_20px_rgba(18,111,237,0.38)] active:scale-95 transition-all duration-200 inline-flex items-center gap-2.5 cursor-pointer"
            >
              <span>Ver mis clases</span>
              <span className="text-base">→</span>
            </button>
          </div>
        </div>

        {/* Center-Right: 3D Scene Illustration & Sticky Plan Note */}
        <div className="md:col-span-6 lg:col-span-7 relative h-48 sm:h-56 md:h-64 flex items-center justify-end">
          {/* Main 3D Vector Scene */}
          <div className="w-full h-full max-w-[420px]">
            <HeroSceneIllustration />
          </div>

          {/* Daily Plan Sticky Note Overlay */}
          <div className="absolute -bottom-2 sm:bottom-2 left-0 sm:left-4 z-20">
            <PlanOfTheDayNote />
          </div>
        </div>
      </div>
    </div>
  );
}
