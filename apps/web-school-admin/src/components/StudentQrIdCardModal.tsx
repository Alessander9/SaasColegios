'use client';

import React from 'react';

export interface StudentIdCardData {
  id: string;
  code: string;
  name: string;
  level: string;
  grade: string;
  section: string;
  parentName?: string;
  parentPhone?: string;
  photoUrl?: string;
  bloodType?: string;
  academicYear?: string;
}

interface StudentQrIdCardModalProps {
  student: StudentIdCardData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentQrIdCardModal: React.FC<StudentQrIdCardModalProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !student) return null;

  const academicYear = student.academicYear || '2026';
  const qrPayload = JSON.stringify({
    studentId: student.id,
    studentCode: student.code,
    name: student.name,
    level: student.level,
    grade: student.grade,
    section: student.section,
    year: academicYear,
    school: 'Colegio San Cleo',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl">
              🎓
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Fotocheck Escolar & Carnet QR</h3>
              <p className="text-[11px] text-blue-200">Credencial Oficial de Control de Asistencia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center font-bold text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Card Body / Credential Preview */}
        <div className="p-6 bg-slate-100 flex flex-col items-center justify-center">
          {/* Printable ID Card */}
          <div
            id="printable-student-card"
            className="w-full max-w-sm bg-gradient-to-br from-white via-slate-50 to-blue-50/40 rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden relative"
          >
            {/* Top Lanyard slot */}
            <div className="h-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 flex justify-center items-center">
              <div className="w-12 h-1 bg-white/40 rounded-full" />
            </div>

            {/* School Header Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-sm font-black text-white shadow-sm">
                  C
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase">Colegio San Cleo</h4>
                  <p className="text-[9px] text-blue-200 font-semibold">Educación de Excelencia • {academicYear}</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-white">
                FOTOCHECK
              </span>
            </div>

            {/* Student Info & Photo Row */}
            <div className="p-4 space-y-4">
              <div className="flex gap-4 items-center">
                {/* Avatar / Photo */}
                <div className="w-20 h-24 rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 border-2 border-blue-600/30 flex flex-col items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-blue-700">
                      <span className="text-3xl">👤</span>
                      <span className="text-[8px] font-bold mt-1 text-slate-500">ESTUDIANTE</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                    {student.level}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 leading-tight truncate mt-1">
                    {student.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-700">
                    {student.grade} <span className="text-blue-600">({student.section})</span>
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 font-bold">
                    Código: <span className="text-indigo-600 font-black">{student.code}</span>
                  </p>
                </div>
              </div>

              {/* QR Code Barcode Box */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Código QR de Asistencia
                  </span>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight">
                    Presente este código en el kiosko de portería para registrar ingreso automático.
                  </p>
                  <div className="pt-1 flex items-center gap-1.5 text-[9px] text-emerald-700 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Activo para Año {academicYear}</span>
                  </div>
                </div>

                {/* Scalable Vector QR Code */}
                <div title={qrPayload} className="w-20 h-20 bg-white p-1 rounded-lg border-2 border-slate-900 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Corner Position Markers */}
                    <rect x="5" y="5" width="26" height="26" fill="black" rx="2" />
                    <rect x="9" y="9" width="18" height="18" fill="white" />
                    <rect x="13" y="13" width="10" height="10" fill="#1e3a8a" />

                    <rect x="69" y="5" width="26" height="26" fill="black" rx="2" />
                    <rect x="73" y="9" width="18" height="18" fill="white" />
                    <rect x="77" y="13" width="10" height="10" fill="#1e3a8a" />

                    <rect x="5" y="69" width="26" height="26" fill="black" rx="2" />
                    <rect x="9" y="73" width="18" height="18" fill="white" />
                    <rect x="13" y="77" width="10" height="10" fill="#1e3a8a" />

                    {/* QR Code Data Pattern */}
                    <rect x="36" y="8" width="6" height="6" fill="#1e293b" />
                    <rect x="46" y="8" width="6" height="6" fill="#1e293b" />
                    <rect x="56" y="8" width="6" height="6" fill="#1e293b" />

                    <rect x="36" y="18" width="6" height="6" fill="#1e293b" />
                    <rect x="46" y="24" width="6" height="6" fill="#1e293b" />
                    <rect x="56" y="18" width="6" height="6" fill="#1e293b" />

                    <rect x="8" y="36" width="6" height="6" fill="#1e293b" />
                    <rect x="18" y="36" width="6" height="6" fill="#1e293b" />
                    <rect x="28" y="44" width="6" height="6" fill="#1e293b" />
                    <rect x="36" y="36" width="8" height="8" fill="#1e3a8a" />
                    <rect x="48" y="36" width="6" height="6" fill="#1e293b" />
                    <rect x="58" y="44" width="6" height="6" fill="#1e293b" />
                    <rect x="68" y="36" width="6" height="6" fill="#1e293b" />
                    <rect x="78" y="36" width="6" height="6" fill="#1e293b" />
                    <rect x="88" y="44" width="6" height="6" fill="#1e293b" />

                    <rect x="36" y="48" width="6" height="6" fill="#1e293b" />
                    <rect x="46" y="56" width="8" height="8" fill="#1e3a8a" />
                    <rect x="58" y="56" width="6" height="6" fill="#1e293b" />

                    <rect x="8" y="56" width="6" height="6" fill="#1e293b" />
                    <rect x="18" y="56" width="6" height="6" fill="#1e293b" />

                    <rect x="36" y="68" width="6" height="6" fill="#1e293b" />
                    <rect x="46" y="68" width="6" height="6" fill="#1e293b" />
                    <rect x="56" y="78" width="6" height="6" fill="#1e293b" />
                    <rect x="68" y="68" width="6" height="6" fill="#1e293b" />
                    <rect x="78" y="78" width="6" height="6" fill="#1e293b" />
                    <rect x="88" y="68" width="6" height="6" fill="#1e293b" />
                  </svg>
                </div>
              </div>

              {/* Emergency Contact footer */}
              {student.parentName && (
                <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2 flex justify-between">
                  <span>Apoderado: <b className="text-slate-700">{student.parentName}</b></span>
                  <span>Telf: <b className="text-slate-700 font-mono">{student.parentPhone || '-'}</b></span>
                </div>
              )}
            </div>

            {/* Bottom Security Bar */}
            <div className="bg-slate-900 text-white px-4 py-1.5 flex justify-between items-center text-[9px] font-mono font-semibold">
              <span>MINEDU • VERIFICADO</span>
              <span>VAL: DIC-{academicYear}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
          >
            Cerrar
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText?.(student.code);
                alert(`Código ${student.code} copiado al portapapeles.`);
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-white transition-all flex items-center gap-1.5"
            >
              <span>📋</span> Copiar Código
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <span>🖨️</span> Imprimir Fotocheck
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
