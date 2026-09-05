'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface ScanRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  grade: string;
  section: string;
  level: string;
  arrivalTime: string;
  status: 'PRESENTE' | 'TARDANZA';
  terminal: string;
}

interface AttendanceQrKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentsList: Array<{
    id: string;
    code: string;
    name: string;
    level: string;
    grade: string;
    section: string;
  }>;
  onRecordAttendance: (record: ScanRecord) => void;
  cutoffTime?: string; // e.g. '08:00:00'
}

export const AttendanceQrKioskModal: React.FC<AttendanceQrKioskModalProps> = ({
  isOpen,
  onClose,
  studentsList,
  onRecordAttendance,
  cutoffTime = '08:00:00',
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const [isScanningActive, setIsScanningActive] = useState<boolean>(true);
  const [lastScannedStudent, setLastScannedStudent] = useState<ScanRecord | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [feedbackEffect, setFeedbackEffect] = useState<'success' | 'warning' | null>(null);
  const [terminalName] = useState<string>('Portería Principal - Kiosko #1');

  const inputRef = useRef<HTMLInputElement>(null);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-PE', { hour12: false }));
      setCurrentDate(
        now.toLocaleDateString('es-PE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-focus barcode/QR input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, lastScannedStudent]);

  if (!isOpen) return null;

  const processScan = (rawCode: string) => {
    const query = rawCode.trim();
    if (!query) return;

    // Find student in list
    let matched = studentsList.find(
      (s) =>
        s.code.toLowerCase() === query.toLowerCase() ||
        s.id.toLowerCase() === query.toLowerCase() ||
        s.name.toLowerCase().includes(query.toLowerCase())
    );

    // If query was JSON
    if (!matched && query.startsWith('{')) {
      try {
        const parsed = JSON.parse(query);
        matched = studentsList.find(
          (s) =>
            s.code.toLowerCase() === (parsed.studentCode || '').toLowerCase() ||
            s.id.toLowerCase() === (parsed.studentId || '').toLowerCase()
        );
      } catch {
        // ignore
      }
    }

    if (!matched) {
      // Pick first or generate mock
      matched = studentsList[0] || {
        id: 'alu-custom',
        code: query.toUpperCase(),
        name: 'Alumno Registrado',
        level: 'Primaria',
        grade: '1er Grado Primaria',
        section: 'A',
      };
    }

    const nowStr = new Date().toLocaleTimeString('es-PE', { hour12: false });
    // Determine status (Present vs Tardy)
    const isLate = nowStr > cutoffTime;
    const status = isLate ? 'TARDANZA' : 'PRESENTE';

    const record: ScanRecord = {
      id: `scan-${Date.now()}`,
      studentId: matched.id,
      studentCode: matched.code,
      studentName: matched.name,
      grade: matched.grade,
      section: matched.section,
      level: matched.level,
      arrivalTime: nowStr,
      status,
      terminal: terminalName,
    };

    setLastScannedStudent(record);
    setScanHistory((prev) => [record, ...prev.slice(0, 19)]);
    setFeedbackEffect(isLate ? 'warning' : 'success');

    // Trigger parent callback
    onRecordAttendance(record);

    // Audio chime simulation
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isLate ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(isLate ? 350 : 880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio context ignored if not supported
    }

    setManualCode('');
    setTimeout(() => setFeedbackEffect(null), 1500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScan(manualCode);
  };

  const presentCount = scanHistory.filter((s) => s.status === 'PRESENTE').length;
  const tardyCount = scanHistory.filter((s) => s.status === 'TARDANZA').length;
  const totalScans = scanHistory.length;
  const punctualityRate = totalScans > 0 ? Math.round((presentCount / totalScans) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] text-white">
        {/* Top Kiosk Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 animate-pulse">
              📸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Manera 1 • Kiosko Automático QR
                </span>
                <span className="text-xs text-slate-500">|</span>
                <span className="text-xs font-semibold text-slate-300">{terminalName}</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                Estación de Control de Asistencia en Portería
              </h2>
            </div>
          </div>

          {/* Clock & Date Badge */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-black font-mono tracking-wider text-emerald-400">{currentTime || '08:00:00'}</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 capitalize">{currentDate}</p>
            </div>
            <button
              onClick={() => setIsScanningActive(!isScanningActive)}
              className={`px-3 py-2 rounded-xl font-bold text-xs transition-colors border flex items-center gap-1.5 ${
                isScanningActive
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isScanningActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>{isScanningActive ? 'Escáner Activo' : 'Pausado'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors border border-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Kiosk Content Grid */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          {/* Left Column: Scanner Station & Active Student Banner (7 cols) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            {/* Visual Camera / Scanner Viewport */}
            <div
              className={`relative rounded-3xl border-2 p-6 overflow-hidden flex flex-col items-center justify-center text-center transition-all min-h-[260px] ${
                feedbackEffect === 'success'
                  ? 'border-emerald-500 bg-emerald-950/40 shadow-2xl shadow-emerald-500/20'
                  : feedbackEffect === 'warning'
                  ? 'border-amber-500 bg-amber-950/40 shadow-2xl shadow-amber-500/20'
                  : 'border-slate-700 bg-slate-950/80 shadow-inner'
              }`}
            >
              {/* Animated Laser Scanning Line */}
              {isScanningActive && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse" />
                </div>
              )}

              {lastScannedStudent ? (
                /* Last Scanned Student Greeting Card */
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white/20 mx-auto flex items-center justify-center text-4xl shadow-xl">
                    🎓
                  </div>
                  <div>
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                        lastScannedStudent.status === 'PRESENTE'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      {lastScannedStudent.status === 'PRESENTE' ? '🟢 INGRESO PUNTUAL' : '🟡 INGRESO CON TARDANZA'}
                    </span>
                    <h3 className="text-2xl font-black text-white mt-2 tracking-tight">
                      {lastScannedStudent.studentName}
                    </h3>
                    <p className="text-xs font-bold text-slate-300 mt-1">
                      {lastScannedStudent.grade} • Sección ({lastScannedStudent.section})
                    </p>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      Código: <span className="text-indigo-400 font-bold">{lastScannedStudent.studentCode}</span> • Hora:{' '}
                      <span className="text-emerald-400 font-bold">{lastScannedStudent.arrivalTime}</span>
                    </p>
                  </div>
                </div>
              ) : (
                /* Waiting for Scan State */
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl mx-auto">
                    📷
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Lector QR Listo y Esperando</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      Acerque el Fotocheck Escolar o muestre la credencial desde el celular al lector.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Límite de puntualidad: {cutoffTime.slice(0, 5)} AM</span>
                  </div>
                </div>
              )}
            </div>

            {/* Manual QR / Barcode Input Form */}
            <form onSubmit={handleFormSubmit} className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Entrada directa de Lector / Código de Barras / DNI:
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Escanee código o ingrese ALU-2026-001..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <span>⚡ Registrar</span>
                </button>
              </div>
            </form>

            {/* Quick Demo Simulator buttons */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Simulador de Escaneo Rápido de Alumnos (1 Clic):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {studentsList.slice(0, 5).map((stu) => (
                  <button
                    key={stu.id}
                    type="button"
                    onClick={() => processScan(stu.code)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-[10px] font-bold text-slate-200 transition-all border border-slate-700 hover:border-indigo-500"
                  >
                    🪪 {stu.name.split(' ')[0]} ({stu.code})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Metrics & Recent Scan Stream (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <p className="text-[10px] font-bold text-slate-400">Puntuales</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{presentCount}</p>
                <span className="text-[9px] text-slate-500">A tiempo</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <p className="text-[10px] font-bold text-slate-400">Tardanzas</p>
                <p className="text-xl font-black text-amber-400 mt-0.5">{tardyCount}</p>
                <span className="text-[9px] text-slate-500">Pasado {cutoffTime.slice(0, 5)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <p className="text-[10px] font-bold text-slate-400">Puntualidad</p>
                <p className="text-xl font-black text-indigo-400 mt-0.5">{punctualityRate}%</p>
                <span className="text-[9px] text-slate-500">Eficiencia</span>
              </div>
            </div>

            {/* Live Feed List */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col min-h-[280px]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Registro de Ingresos en Vivo ({scanHistory.length})
                </span>
                <button
                  type="button"
                  onClick={() => setScanHistory([])}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                >
                  Limpiar lista
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-2 max-h-[300px] pr-1">
                {scanHistory.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 text-xs">
                    <p className="text-2xl mb-1">⏳</p>
                    No se han registrado ingresos hoy todavía.
                  </div>
                ) : (
                  scanHistory.map((scan) => (
                    <div
                      key={scan.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{scan.studentName}</span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                              scan.status === 'PRESENTE'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {scan.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {scan.grade} ({scan.section}) • {scan.studentCode}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300 flex-shrink-0">
                        {scan.arrivalTime}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Kiosko Conectado a Base de Datos Central</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Cerrar Estación
          </button>
        </div>
      </div>
    </div>
  );
};
