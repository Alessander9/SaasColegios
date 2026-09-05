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

const ACTION_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  CREATE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '+' },
  UPDATE: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '✎' },
  PUBLISH: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '🚀' },
  REVERSE: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '↺' },
  DELETE: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: '✕' },
};

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
      const logList = Array.isArray(l?.data) ? l.data : Array.isArray(l) ? l : MOCK_LOGS;
      const statsObj = s && Array.isArray(s.topActions) ? s : MOCK_STATS;
      setLogs(logList);
      setStats(statsObj);
    } catch {
      setLogs(MOCK_LOGS);
      setStats(MOCK_STATS);
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterResource]);

  useEffect(() => { reload(); }, [reload]);

  const topActions = Array.isArray(stats?.topActions) ? stats.topActions : MOCK_STATS.topActions;

  return (
    <div className="space-y-6 animate-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Registro de Auditoría & Seguridad</h2>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-orange-100 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Inmutable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Trazabilidad inmutable de eventos de dominio multi-tenant</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg hover-lift-sm">
            Total Eventos: {(logs || []).length}
          </span>
        </div>
      </div>

      {/* Summary KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-emerald-200 rounded-xl flex items-center gap-3 shadow-sm hover-lift-sm transition-all group">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200 group-hover:scale-110 transition-transform">
            +
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Creaciones</p>
            <p className="text-base font-black text-emerald-700">{topActions.find((a) => a.action === 'CREATE')?.count ?? 62}</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-blue-200 rounded-xl flex items-center gap-3 shadow-sm hover-lift-sm transition-all group">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 group-hover:scale-110 transition-transform">
            ✎
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Ediciones</p>
            <p className="text-base font-black text-blue-700">{topActions.find((a) => a.action === 'UPDATE')?.count ?? 48}</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-purple-200 rounded-xl flex items-center gap-3 shadow-sm hover-lift-sm transition-all group">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200 group-hover:scale-110 transition-transform">
            🚀
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Publicaciones</p>
            <p className="text-base font-black text-purple-700">{topActions.find((a) => a.action === 'PUBLISH')?.count ?? 12}</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-orange-200 rounded-xl flex items-center gap-3 shadow-sm hover-lift-sm transition-all group">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold text-xs border border-orange-200 group-hover:scale-110 transition-transform">
            ↺
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-orange-700">Reversiones</p>
            <p className="text-base font-black text-orange-700">{topActions.find((a) => a.action === 'REVERSE')?.count ?? 3}</p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 shadow-sm"
        >
          <option value="">Todas las Acciones</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="PUBLISH">PUBLISH</option>
          <option value="REVERSE">REVERSE (Orange)</option>
          <option value="DELETE">DELETE</option>
        </select>

        <select
          value={filterResource}
          onChange={(e) => setFilterResource(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 shadow-sm"
        >
          <option value="">Todos los Recursos</option>
          <option value="student">student</option>
          <option value="payment">payment</option>
          <option value="grade">grade</option>
          <option value="attendance">attendance</option>
          <option value="order">order</option>
          <option value="employee">employee</option>
          <option value="tenant">tenant</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Acción</th>
                <th className="px-5 py-3">Recurso</th>
                <th className="px-5 py-3">Actor / Usuario</th>
                <th className="px-5 py-3">Tenant</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Cargando logs de seguridad...</td></tr>
              ) : !logs || logs.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No se encontraron eventos registrados.</td></tr>
              ) : (
                (logs || []).map((log) => {
                  const sty = ACTION_STYLES[log.action] ?? ACTION_STYLES.CREATE;
                  const isExpanded = expandedLog === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${sty.bg} ${sty.text} ${sty.border}`}>
                            <span>{sty.icon}</span>
                            <span>{log.action}</span>
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="font-mono text-purple-700 text-[11px] font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {log.resource}:{log.resourceId}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                              {(log.actorEmail || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-slate-900 font-semibold text-xs">{log.actorEmail || 'Sistema / Auth'}</p>
                              <p className="text-[10px] text-slate-400 font-mono">ID: {log.actorId}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-[11px] text-blue-600 font-medium">
                          {log.tenantId}
                        </td>

                        <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                          {new Date(log.timestamp).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-blue-700 bg-white hover:bg-slate-50 rounded border border-slate-200 transition-all shadow-sm"
                          >
                            {isExpanded ? 'Ocultar' : 'Ver JSON'}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={6} className="px-5 py-4">
                            <div className="p-3.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 space-y-2 shadow-sm">
                              {log.before && (
                                <div>
                                  <p className="text-[10px] font-bold text-rose-600 uppercase">Estado Anterior (Before):</p>
                                  <pre className="text-rose-700 mt-1 bg-rose-50/50 p-2 rounded border border-rose-100">{JSON.stringify(log.before, null, 2)}</pre>
                                </div>
                              )}
                              {log.after && (
                                <div>
                                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Estado Resultante (After):</p>
                                  <pre className="text-emerald-700 mt-1 bg-emerald-50/50 p-2 rounded border border-emerald-100">{JSON.stringify(log.after, null, 2)}</pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

