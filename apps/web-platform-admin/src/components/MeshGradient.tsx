'use client';

import React from 'react';

export default function MeshGradient() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* ── Base dark gradient ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#110a24]" />

      {/* ── Animated color blobs ── */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)',
          top: '-15%',
          left: '-10%',
          animation: 'meshFloat1 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[700px] h-[700px] rounded-full opacity-25 blur-[100px] mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)',
          top: '30%',
          right: '-15%',
          animation: 'meshFloat2 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)',
          bottom: '-10%',
          left: '20%',
          animation: 'meshFloat3 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[80px] mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
          top: '60%',
          left: '60%',
          animation: 'meshFloat4 18s ease-in-out infinite',
        }}
      />

      {/* ── Noise texture overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* ── Subtle grid pattern ── */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── Vignette ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}
