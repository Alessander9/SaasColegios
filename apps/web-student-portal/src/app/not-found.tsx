import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#EAF5FF] flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-4xl mb-4 border border-blue-100">
        🚀
      </div>
      <h2 className="text-3xl font-black text-[#111C5A] tracking-tight mb-2">
        Página no encontrada
      </h2>
      <p className="text-sm font-bold text-[#5F678C] max-w-sm mb-6">
        Parece que esta sección espacial está en otra galaxia o no existe.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#1677F2] hover:bg-[#0B4DB8] text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
      >
        Volver al Dashboard Inicio 🏠
      </Link>
    </div>
  );
}
