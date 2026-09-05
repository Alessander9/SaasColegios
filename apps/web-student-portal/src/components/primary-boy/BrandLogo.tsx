import React from 'react';

export function BrandLogo() {
  return (
    <div className="flex flex-col items-center justify-center select-none py-2">
      <div className="flex items-center gap-2.5">
        {/* Playful Rocket Badge */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1677F2] to-[#39B54A] flex items-center justify-center text-white shadow-md shadow-blue-500/20 transform hover:scale-105 transition-transform duration-200">
          <span className="text-xl">🚀</span>
        </div>
        {/* EsCool Brand Text */}
        <div className="flex flex-col">
          <div className="flex items-center text-2xl font-black tracking-tight leading-none">
            <span className="text-[#1677F2]">Es</span>
            <span className="text-[#39B54A]">Cool</span>
            <span className="text-[#FF9800] text-sm ml-0.5">✦</span>
          </div>
        </div>
      </div>
      <p className="text-[11px] font-extrabold text-[#5F678C] tracking-wide mt-2 text-center">
        ¡Aprender es una aventura!
      </p>
    </div>
  );
}
