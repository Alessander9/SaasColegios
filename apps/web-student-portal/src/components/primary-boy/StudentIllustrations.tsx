import React from 'react';

export function BoyAvatar({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <div className={`relative rounded-full overflow-hidden bg-gradient-to-b from-[#BEE3FF] to-[#7BC5FF] flex items-center justify-center shadow-inner border-2 border-white ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background glow */}
        <circle cx="50" cy="50" r="48" fill="#BEE3FF" />
        {/* Neck */}
        <rect x="42" y="65" width="16" height="15" rx="4" fill="#F8C291" />
        {/* Hoodie Collar */}
        <path d="M 25 80 Q 50 72 75 80 L 80 100 L 20 100 Z" fill="#1677F2" />
        <path d="M 40 75 Q 50 82 60 75" stroke="#0B4DB8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Face */}
        <ellipse cx="50" cy="48" rx="26" ry="25" fill="#FAD390" />
        {/* Cheeks */}
        <circle cx="34" cy="52" r="5" fill="#F8A5C2" opacity="0.6" />
        <circle cx="66" cy="52" r="5" fill="#F8A5C2" opacity="0.6" />
        {/* Eyes */}
        <ellipse cx="38" cy="45" rx="4" ry="5.5" fill="#10185A" />
        <ellipse cx="62" cy="45" rx="4" ry="5.5" fill="#10185A" />
        {/* Eye highlights */}
        <circle cx="36.5" cy="43.5" r="1.5" fill="#FFFFFF" />
        <circle cx="60.5" cy="43.5" r="1.5" fill="#FFFFFF" />
        {/* Eyebrows */}
        <path d="M 33 37 Q 38 34 43 37" stroke="#0A1345" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 57 37 Q 62 34 67 37" stroke="#0A1345" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Smile */}
        <path d="M 43 54 Q 50 61 57 54" stroke="#D35400" strokeWidth="2.5" fill="#FFFFFF" strokeLinecap="round" />
        {/* Dark Navy Modern Cartoon Hair */}
        <path
          d="M 23 45 C 20 30 30 18 50 18 C 70 18 80 30 77 45 C 75 36 70 32 64 34 C 58 26 42 26 36 34 C 30 32 25 36 23 45 Z"
          fill="#101C5A"
        />
        {/* Front Hair Tuft */}
        <path d="M 44 22 Q 52 14 55 25 Q 48 24 44 22 Z" fill="#1B2875" />
      </svg>
    </div>
  );
}

export function PlanOfTheDayNote() {
  return (
    <div className="relative transform -rotate-3 bg-[#FFF9D2] text-[#111C5A] p-3.5 rounded-xl shadow-lg border border-[#F6E58D]/80 w-36 sm:w-40 select-none animate-float-slow transition-transform hover:rotate-0 duration-300">
      {/* Red Pushpin */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 shadow-md border border-red-700 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
        </div>
      </div>
      <div className="text-[11px] font-black tracking-wider text-[#0D62D7] uppercase border-b border-amber-300 pb-1 mb-1.5 text-center mt-1">
        PLAN DEL DÍA:
      </div>
      <ul className="text-[11px] font-bold space-y-1 text-slate-800">
        <li className="flex items-center gap-1.5">
          <span className="text-emerald-600 font-black text-xs">✓</span> Estudiar
        </li>
        <li className="flex items-center gap-1.5">
          <span className="text-emerald-600 font-black text-xs">✓</span> Leer
        </li>
        <li className="flex items-center gap-1.5">
          <span className="text-amber-600 font-black text-xs">✓</span> Practicar
        </li>
        <li className="flex items-center gap-1.5">
          <span className="text-rose-500 font-black text-xs">★</span> Divertirme
        </li>
      </ul>
    </div>
  );
}

export function HeroSceneIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      <svg viewBox="0 0 460 260" className="w-full h-full max-h-[250px] object-contain">
        <defs>
          {/* Gradients */}
          <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#D8EEFF" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="planetGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF7675" />
            <stop offset="100%" stopColor="#D63031" />
          </linearGradient>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFEAA7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FDCB6E" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2EBF8" />
          </linearGradient>
          <linearGradient id="hoodieGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2575FC" />
            <stop offset="100%" stopColor="#1A53D8" />
          </linearGradient>
          <linearGradient id="robotGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00CEC9" />
            <stop offset="100%" stopColor="#0984E3" />
          </linearGradient>
          <linearGradient id="rocketGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF7675" />
            <stop offset="100%" stopColor="#D63031" />
          </linearGradient>
        </defs>

        {/* Floating Clouds Background */}
        <g opacity="0.85">
          <ellipse cx="60" cy="60" rx="35" ry="18" fill="url(#cloudGrad)" />
          <ellipse cx="85" cy="50" rx="22" ry="16" fill="url(#cloudGrad)" />
          <ellipse cx="380" cy="45" rx="40" ry="20" fill="url(#cloudGrad)" />
          <ellipse cx="410" cy="38" rx="25" ry="18" fill="url(#cloudGrad)" />
        </g>

        {/* Ringed Planet */}
        <g transform="translate(360, 45)">
          <circle cx="0" cy="0" r="18" fill="url(#planetGrad)" />
          <ellipse cx="0" cy="0" rx="30" ry="7" fill="none" stroke="url(#ringGrad)" strokeWidth="4" transform="rotate(-20)" />
          {/* Sparkles */}
          <polygon points="28,-18 30,-12 36,-10 30,-8 28,-2 26,-8 20,-10 26,-12" fill="#FFEAA7" />
        </g>

        {/* Flying Rocket */}
        <g transform="translate(90, 40) rotate(-35)">
          {/* Flame */}
          <polygon points="-8,30 0,42 8,30" fill="#FF7675" />
          <polygon points="-4,30 0,38 4,30" fill="#FFEAA7" />
          {/* Body */}
          <path d="M 0 0 C 12 12 12 28 8 32 L -8 32 C -12 28 -12 12 0 0 Z" fill="url(#rocketGrad)" />
          {/* Fins */}
          <polygon points="-8,22 -16,32 -8,32" fill="#0984E3" />
          <polygon points="8,22 16,32 8,32" fill="#0984E3" />
          {/* Window */}
          <circle cx="0" cy="16" r="4.5" fill="#DFE6E9" stroke="#0984E3" strokeWidth="1.5" />
        </g>

        {/* Stars */}
        <g fill="#FFAA00">
          <polygon points="180,25 182,30 187,31 183,34 184,39 180,36 176,39 177,34 173,31 178,30" />
          <polygon points="280,35 281,38 285,39 282,41 283,45 280,43 277,45 278,41 275,39 279,38" transform="scale(0.8) translate(50, 10)" />
        </g>

        {/* Study Desk Base */}
        <g transform="translate(140, 150)">
          {/* Desk Top */}
          <rect x="0" y="25" width="220" height="14" rx="7" fill="url(#deskGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Desk Legs */}
          <rect x="18" y="39" width="8" height="55" rx="4" fill="#94A3B8" />
          <rect x="194" y="39" width="8" height="55" rx="4" fill="#94A3B8" />

          {/* Plant in pot */}
          <g transform="translate(25, -2)">
            <ellipse cx="10" cy="24" rx="8" ry="4" fill="#F8A5C2" />
            <rect x="4" y="14" width="12" height="12" rx="3" fill="#FF7675" />
            <path d="M 10 14 Q 3 4 0 8 Q 6 12 10 14 Z" fill="#00B894" />
            <path d="M 10 14 Q 17 4 20 8 Q 14 12 10 14 Z" fill="#55EFC4" />
          </g>

          {/* Pencil Jar & Ruler */}
          <g transform="translate(180, 4)">
            <rect x="0" y="4" width="16" height="18" rx="4" fill="#74B9FF" />
            <rect x="3" y="-6" width="3" height="14" rx="1" fill="#FFEAA7" transform="rotate(-10 3 0)" />
            <rect x="8" y="-8" width="3" height="16" rx="1" fill="#FF7675" transform="rotate(12 8 0)" />
            <rect x="12" y="-4" width="2.5" height="12" rx="1" fill="#55EFC4" />
          </g>

          {/* Books Stack */}
          <g transform="translate(48, 8)">
            <rect x="0" y="10" width="24" height="6" rx="2" fill="#E17055" />
            <rect x="2" y="4" width="20" height="6" rx="2" fill="#6C5CE7" />
          </g>

          {/* Laptop on desk */}
          <g transform="translate(120, -6)">
            {/* Screen */}
            <rect x="0" y="4" width="46" height="28" rx="4" fill="#2D3436" />
            <rect x="2" y="6" width="42" height="24" rx="3" fill="#74B9FF" />
            {/* EsCool code lines on screen */}
            <rect x="6" y="10" width="16" height="2" rx="1" fill="#FFFFFF" />
            <rect x="6" y="14" width="24" height="2" rx="1" fill="#55EFC4" />
            <rect x="6" y="18" width="12" height="2" rx="1" fill="#FFEAA7" />
            {/* Keyboard base */}
            <polygon points="-4,32 50,32 44,28 2,28" fill="#B2BEC3" />
          </g>
        </g>

        {/* Main Character: Primary School Boy (Sitting, Happy) */}
        <g transform="translate(190, 80)">
          {/* Head & Hair */}
          <g transform="translate(20, 0)">
            <rect x="16" y="32" width="12" height="10" fill="#F8C291" rx="2" />
            {/* Face */}
            <ellipse cx="22" cy="22" rx="18" ry="17" fill="#FAD390" />
            {/* Eyes */}
            <ellipse cx="14" cy="20" rx="2.5" ry="3.5" fill="#10185A" />
            <ellipse cx="28" cy="20" rx="2.5" ry="3.5" fill="#10185A" />
            <circle cx="13" cy="19" r="1" fill="#FFFFFF" />
            <circle cx="27" cy="19" r="1" fill="#FFFFFF" />
            {/* Cheeks */}
            <circle cx="11" cy="25" r="3" fill="#F8A5C2" opacity="0.6" />
            <circle cx="31" cy="25" r="3" fill="#F8A5C2" opacity="0.6" />
            {/* Smile */}
            <path d="M 18 26 Q 22 31 26 26" stroke="#D35400" strokeWidth="2" fill="#FFFFFF" strokeLinecap="round" />
            {/* Navy Hair */}
            <path
              d="M 4 20 C 2 8 10 0 24 0 C 38 0 44 8 41 20 C 38 14 34 11 29 12 C 24 6 12 6 8 13 C 5 12 3 15 4 20 Z"
              fill="#101C5A"
            />
            <path d="M 18 3 Q 24 -2 27 5 Q 21 4 18 3 Z" fill="#203080" />
          </g>

          {/* Torso & Blue Hoodie */}
          <g transform="translate(22, 40)">
            <path d="M 6 0 Q 20 -4 34 0 L 38 38 L 2 38 Z" fill="url(#hoodieGrad)" />
            {/* Collar & Drawstrings */}
            <path d="M 14 0 Q 20 6 26 0" stroke="#0B4DB8" strokeWidth="2" fill="none" />
            <line x1="18" y1="4" x2="18" y2="14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="22" y1="4" x2="22" y2="14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            {/* Arms reaching to desk */}
            <path d="M 6 8 Q -6 22 4 30 L 10 26" stroke="#1A53D8" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="5" cy="30" r="4" fill="#FAD390" />
            <path d="M 34 8 Q 44 20 36 28 L 30 26" stroke="#1A53D8" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="35" cy="28" r="4" fill="#FAD390" />
          </g>
        </g>

        {/* Small Friendly Companion Robot */}
        <g transform="translate(305, 125)">
          {/* Antenna */}
          <line x1="16" y1="4" x2="16" y2="0" stroke="#00CEC9" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="0" r="2.5" fill="#FFEAA7" />
          {/* Head */}
          <rect x="4" y="4" width="24" height="18" rx="6" fill="url(#robotGrad)" />
          {/* Eyes & Smile Display */}
          <rect x="7" y="8" width="18" height="10" rx="3" fill="#10185A" />
          <circle cx="11" cy="13" r="2" fill="#55EFC4" />
          <circle cx="21" cy="13" r="2" fill="#55EFC4" />
          {/* Body */}
          <rect x="6" y="24" width="20" height="16" rx="5" fill="url(#robotGrad)" />
          <circle cx="16" cy="31" r="3" fill="#FFEAA7" />
          {/* Little arms */}
          <path d="M 4 28 Q 0 32 3 36" stroke="#0984E3" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 28 28 Q 32 32 29 36" stroke="#0984E3" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>

        {/* Soccer Ball at desk base */}
        <g transform="translate(125, 205)">
          <circle cx="12" cy="12" r="11" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <polygon points="12,6 16,9 15,14 9,14 8,9" fill="#10185A" />
          <line x1="12" y1="6" x2="12" y2="1" stroke="#10185A" strokeWidth="1" />
          <line x1="16" y1="9" x2="21" y2="7" stroke="#10185A" strokeWidth="1" />
          <line x1="15" y1="14" x2="19" y2="18" stroke="#10185A" strokeWidth="1" />
          <line x1="9" y1="14" x2="5" y2="18" stroke="#10185A" strokeWidth="1" />
          <line x1="8" y1="9" x2="3" y2="7" stroke="#10185A" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}

export function SidebarMotivationalCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0966E9] to-[#1B88FF] text-white p-4 pt-5 shadow-lg border border-blue-400/30 flex flex-col justify-between select-none">
      {/* Background celestial particles */}
      <div className="absolute top-2 right-3 text-amber-300 text-xs animate-pulse">★</div>
      <div className="absolute top-8 left-3 text-white/50 text-[10px]">✦</div>
      <div className="absolute bottom-12 right-6 text-amber-200 text-xs">✨</div>

      {/* Mini 3D Trophy & Space Illustration */}
      <div className="flex justify-center mb-1">
        <svg viewBox="0 0 120 75" className="w-28 h-18">
          {/* Green hill */}
          <ellipse cx="60" cy="72" rx="55" ry="16" fill="#39B54A" />
          {/* Trophy */}
          <g transform="translate(44, 10)">
            <path d="M 4 2 Q 16 -2 28 2 L 26 18 Q 16 26 6 18 Z" fill="#FFC928" stroke="#E1A100" strokeWidth="1" />
            <path d="M 4 5 Q -4 10 3 15 Q 6 14 5 11" fill="none" stroke="#FFC928" strokeWidth="2.5" />
            <path d="M 28 5 Q 36 10 29 15 Q 26 14 27 11" fill="none" stroke="#FFC928" strokeWidth="2.5" />
            <rect x="12" y="22" width="8" height="6" fill="#E1A100" />
            <rect x="8" y="28" width="16" height="6" rx="2" fill="#2C3E50" />
            <polygon points="16,8 18,12 22,12 19,15 20,19 16,16 12,19 13,15 10,12 14,12" fill="#FFFFFF" />
          </g>
          {/* Flying mini rocket */}
          <g transform="translate(88, 14) rotate(-35) scale(0.65)">
            <path d="M 0 0 C 8 8 8 20 5 24 L -5 24 C -8 20 -8 8 0 0 Z" fill="#FF7675" />
            <polygon points="-3,24 0,30 3,24" fill="#FFEAA7" />
          </g>
        </svg>
      </div>

      <div className="text-center relative z-10">
        <h4 className="text-base font-black tracking-tight leading-snug drop-shadow-xs">
          ¡Sigue así, campeón! 🚀
        </h4>
        <p className="text-xs text-blue-100 font-semibold mt-1">
          Cada día aprendes algo nuevo
        </p>
      </div>

      <div className="mt-3 text-center">
        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-white border border-white/30">
          Nivel 5 • Aventurero
        </span>
      </div>
    </div>
  );
}
