'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getAuditLogs, getAuditStats, type AuditLog, type AuditStats } from '../lib/api';

/* ── Fallback mock data ── */
const MOCK_LOGS: AuditLog[] = [
  { id: 'a1', tenantId: 't-1', actorId: 'u1', actorEmail: 'director@sancleo.pe', action: 'CREATE', resource: 'student', resourceId: 'stu-001', timestamp: '2026-08-22T14:30:00Z', after: { firstName: 'Mateo', lastName: 'García' } },
  { id: 'a2', tenantId: 't-2', actorId: 'u3', actorEmail: 'admin@inmaculada.pe', action: 'UPDATE', resource: 'grade', resourceId: 'grd-045', timestamp: '2026-08-22T13:15:00Z', before: { score: 16 }, after: { score: 18 } },
  { id: 'a3', tenantId: 't-1', actorId: 'u2', actorEmail: 'contable@sancleo.pe', action: 'CREATE', resource: 'payment', resourceId: 'pay-102', timestamp: '2026-08-22T11:45:00Z', after: { amount: 199, method: 'CASH' } },
  { id: 'a4', tenantId: 't-3', actorId: 'u5', actorEmail: 'director@montessori.pe', action: 'CREATE', resource: 'tenant', resourceId: 't-3', timestamp: '2026-07-20T09:00:00Z', after: { name: 'Academia Montessori' } },
  { id: 'a5', tenantId: 't-2', actorId: 'u4', actorEmail: 'rrhh@inmaculada.pe', action: 'UPDATE', resource: 'employee', resourceId: 'emp-012', timestamp: '2026-08-21T16:20:00Z', before: { status: 'ACTIVE' }, after: { status: 'ON_LEAVE' } },
  { id: 'a6', tenantId: 't-1', actorId: 'u1', actorEmail: 'director@sancleo.pe', action: 'PUBLISH', resource: 'grades', resourceId: 'bim1-5A', timestamp: '2026-08-20T10:00:00Z', after: { period: 'I Bimestre', published: true } },
  { id: 'a7', tenantId: 't-2', actorId: 'u3', actorEmail: 'admin@inmaculada.pe', action: 'CREATE', resource: 'order', resourceId: 'ord-089', timestamp: '2026-08-20T08:30:00Z', after: { total: 85, items: 3 } },
  { id: 'a8', tenantId: 't-1', actorId: 'u2', actorEmail: 'contable@sancleo.pe', action: 'REVERSE', resource: 'payment', resourceId: 'pay-098', timestamp: '2026-08-19T15:10:00Z', before: { amount: 199, status: 'COMPLETED' }, after: { status: 'REVERSED' } },
];

const MOCK_STATS: AuditStats = {
  byResource: [
    { resource: 'student', count: 45 },
    { resource: 'payment', count: 38 },
    { resource: 'grade', count: 32 },
    { resource: 'attendance', count: 28 },
    { resource: 'order', count: 15 },
    { resource: 'employee', count: 8 },
    { resource: 'tenant', count: 3 },
  ],
  topActions: [
    { action: 'CREATE', count: 62 },
    { action: 'UPDATE', count: 48 },
    { action: 'PUBLISH', count: 12 },
    { action: 'REVERSE', count: 3 },
  ],
  topActors: [
    { actorId: 'u1', email: 'director@sancleo.pe', count: 25 },
    { actorId: 'u3', email: 'admin@inmaculada.pe', count: 20 },
    { actorId: 'u2', email: 'contable@sancleo.pe', count: 15 },
    { actorId: 'u5', email: 'director@montessori.pe', count: 8 },
  ],
};

const ACTION_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  CREATE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  UPDATE: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  PUBLISH: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  REVERSE: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  DELETE: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
};

const RESOURCE_ICONS: Record<string, string> = {
  student: '👨‍🎓',
  payment: '💰',
  grade: '📝',
  attendance: '📋',
  order: '🛍️',
  employee: '👥',
  tenant: '🏫',
  activity: '🎯',
  payroll: '💼',
};

/* ────────────────────────────────────────────────────────────
   AUDIT VIEW
   ──────────────────────────────────────────────────────────── */
export default function AuditView() {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_LOGS);
  const [stats, setStats] = useState<AuditStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [l, s] = await Promise.all([
        getAuditLogs({ action: filterAction || undefined, resource: filterResource || undefined, limit: 50 }).catch(() => ({ data: MOCK_LOGS, total: MOCK_LOGS.length, page: 1, limit: 50 })),
        getAuditStats().catch(() => MOCK_STATS),
      ]);
      setLogs(l.data);
      setStats(s);
    } catch { /* use mocks */ }
    setLoading(false);
  }, [filterAction, filterResource]);

  useEffect(() => { reload(); }, [reload]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Registro de Auditoría</h1>
        <p className="text-sm text-slate-400 mt-1">Historial completo de acciones en la plataforma</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          {/* Top Resources */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Por Recurso</h3>
            <div className="space-y-2.5">
              {stats.byResource.map((r) => (
                <div key={r.resource} className="flex items-center gap-2.5">
                  <span className="text-sm w-6">{RESOURCE_ICONS[r.resource] ?? '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="font-bold text-white capitalize">{r.resource}</span>
                      <span className="text-slate-500">{r.count}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((r.count / (stats.byResource[0]?.count || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Por Acción</h3>
            <div className="space-y-2">
              {stats.topActions.map((a) => {
                const sty = ACTION_STYLES[a.action] ?? ACTION_STYLES.CREATE;
                return (
                  <div key={a.action} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sty.bg} ${sty.text} ${sty.border}`}>{a.action}</span>
                    <span className="text-xs font-bold text-white">{a.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Actors */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usuarios Más Activos</h3>
            <div className="space-y-2">
              {stats.topActors.map((a) => (
                <div key={a.actorId} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/20 flex items-center justify-center text-[9px] font-bold text-indigo-300">
                    {a.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white truncate">{a.email}</p>
                    <p className="text-[9px] text-slate-500">{a.count} acciones</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Filters */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">Todas las Acciones</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="PUBLISH">PUBLISH</option>
              <option value="REVERSE">REVERSE</option>
              <option value="DELETE">DELETE</option>
            </select>
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">Todos los Recursos</option>
              <option value="student">Student</option>
              <option value="payment">Payment</option>
              <option value="grade">Grade</option>
              <option value="attendance">Attendance</option>
              <option value="order">Order</option>
              <option value="employee">Employee</option>
              <option value="tenant">Tenant</option>
            </select>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-3 py-2 rounded-xl self-center">
              {logs.length} registros
            </span>
          </div>

          {/* Log entries */}
          <div className="divide-y divide-slate-800/60">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm">Cargando logs de auditoría...</div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">No se encontraron registros con los filtros aplicados.</div>
            ) : (
              logs.map((log) => {
                const sty = ACTION_STYLES[log.action] ?? ACTION_STYLES.CREATE;
                const isExpanded = expandedLog === log.id;
                return (
                  <div key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <button
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm w-6">{RESOURCE_ICONS[log.resource] ?? '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sty.bg} ${sty.text} ${sty.border}`}>
                            {log.action}
                          </span>
                          <span className="text-xs font-bold text-white">{log.resource}</span>
                          <span className="text-[10px] text-slate-500 font-mono">#{log.resourceId}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          por {log.actorEmail ?? log.actorId} • {new Date(log.timestamp).toLocaleString('es-PE')}
                        </p>
                      </div>
                      <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>→</span>
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {log.before && (
                            <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                              <p className="text-[10px] font-bold text-rose-400 uppercase mb-1.5">Antes</p>
                              <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap">{JSON.stringify(log.before, null, 2)}</pre>
                            </div>
                          )}
                          {log.after && (
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                              <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1.5">Después</p>
                              <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap">{JSON.stringify(log.after, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-4 text-[10px] text-slate-500">
                          <span>ID: <span className="font-mono text-slate-400">{log.id}</span></span>
                          <span>Tenant: <span className="font-mono text-slate-400">{log.tenantId}</span></span>
                          {log.ipAddress && <span>IP: <span className="font-mono text-slate-400">{log.ipAddress}</span></span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
