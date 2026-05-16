'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;
const PAGE_SIZE = 50;

interface AuditLog {
  id: number; application_id: number | null; actor_email: string;
  action: string; from_status: string | null; to_status: string | null;
  note: string | null; created_at: string;
}

function Spin() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>;
}

function fmtDt(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminAuditPage() {
  const [logs,      setLogs]      = useState<AuditLog[]>([]);
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch<{ total: number; page: number; items: AuditLog[] }>(`/api/admin/audit?page=${p}&page_size=${PAGE_SIZE}`);
      setLogs(res.items); setTotal(res.total);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(1); }, [fetch]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const displayed  = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.action.toLowerCase().includes(q) || l.actor_email.toLowerCase().includes(q);
    const logDate = new Date(l.created_at);
    const matchFrom = !dateFrom || logDate >= new Date(dateFrom);
    const matchTo   = !dateTo   || logDate <= new Date(dateTo + 'T23:59:59');
    return matchSearch && matchFrom && matchTo;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Audit Logs</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Application status changes and staff actions</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 14px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by action or actor email…" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#111827', background: 'transparent' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Clear</button>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>From</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 12, color: '#111827', background: 'transparent', cursor: 'pointer' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 12, color: '#111827', background: 'transparent', cursor: 'pointer' }} />
          {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(''); setDateTo(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>✕</button>}
        </div>
        {displayed.length !== logs.length && <span style={{ fontSize: 12, color: '#6b7280' }}>{displayed.length} of {logs.length} entries</span>}
      </div>

      {loading ? <Spin /> : displayed.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{logs.length === 0 ? '📋' : '🔍'}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{logs.length === 0 ? 'No audit logs yet' : 'No logs match your filters'}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{logs.length === 0 ? 'Actions taken by staff will appear here.' : 'Try adjusting the search or date range.'}</div>
          {(search || dateFrom || dateTo) && <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }} style={{ marginTop: 14, padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Clear filters</button>}
        </div>
      ) : (
        <>
          <div className="admin-table-wrap" style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Date & Time', 'Actor', 'App ID', 'Action', 'From → To', 'Note'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '32px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No logs match &ldquo;{search}&rdquo;.</td></tr>
                ) : displayed.map((log, i) => (
                  <tr key={log.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '11px 16px', color: '#9ca3af', fontSize: 11, whiteSpace: 'nowrap' }}>{fmtDt(log.created_at)}</td>
                    <td style={{ padding: '11px 16px', color: '#374151', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.actor_email}</td>
                    <td style={{ padding: '11px 16px', color: log.application_id ? M : '#9ca3af', fontWeight: log.application_id ? 600 : 400 }}>{log.application_id ?? '—'}</td>
                    <td style={{ padding: '11px 16px', color: '#111827', fontWeight: 500, textTransform: 'capitalize' }}>{log.action.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '11px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {log.from_status && <span>{log.from_status}</span>}
                      {log.from_status && log.to_status && <span style={{ margin: '0 4px' }}>→</span>}
                      {log.to_status && <span style={{ fontWeight: 600, color: '#374151' }}>{log.to_status}</span>}
                      {!log.from_status && !log.to_status && '—'}
                    </td>
                    <td style={{ padding: '11px 16px', color: '#6b7280', fontStyle: log.note ? 'normal' : 'italic', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > PAGE_SIZE && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); fetch(p); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: page <= 1 ? '#f9fafb' : '#fff', color: page <= 1 ? '#9ca3af' : '#374151', fontSize: 13, cursor: page <= 1 ? 'default' : 'pointer' }}>← Prev</button>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => { const p = page + 1; setPage(p); fetch(p); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: page >= totalPages ? '#f9fafb' : '#fff', color: page >= totalPages ? '#9ca3af' : '#374151', fontSize: 13, cursor: page >= totalPages ? 'default' : 'pointer' }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
