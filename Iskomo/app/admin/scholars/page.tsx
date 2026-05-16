'use client';

import { useState, useEffect, useCallback } from 'react';
import { scholarApi, type ScholarResponse, type ScholarStatus } from '@/lib/api-client';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

const STATUS_CFG: Record<ScholarStatus, { bg: string; color: string; dot: string; label: string }> = {
  active:       { bg: '#dcfce7', color: '#15803d', dot: '#10b981', label: 'Active' },
  probationary: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', label: 'Probationary' },
  under_review: { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6', label: 'Under Review' },
  on_leave:     { bg: '#f5f3ff', color: '#6d28d9', dot: '#8b5cf6', label: 'On Leave' },
  suspended:    { bg: '#fff7ed', color: '#c2410c', dot: '#f97316', label: 'Suspended' },
  terminated:   { bg: '#fee2e2', color: '#dc2626', dot: '#dc2626', label: 'Terminated' },
  graduated:    { bg: '#f0fdf4', color: '#059669', dot: '#34d399', label: 'Graduated' },
};

function Spin() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>;
}

export default function AdminScholarsPage() {
  const [items,    setItems]    = useState<ScholarResponse[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [filter,   setFilter]   = useState<ScholarStatus | 'all'>('all');
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await scholarApi.list(p, 25);
      setItems(res.items); setTotal(res.total);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 25));
  const displayed  = items.filter(s => {
    const matchStatus = filter === 'all' || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || (s.student_name ?? '').toLowerCase().includes(q) || (s.scholarship_name ?? '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>All Scholars</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>System-wide view of all scholarship recipients — {total} total</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
          {(['all', ...Object.keys(STATUS_CFG)] as const).map(s => (
            <button key={s} onClick={() => setFilter(s as ScholarStatus | 'all')}
              style={{ padding: '7px 12px', borderRadius: 7, border: 'none', background: filter === s ? '#fff' : 'transparent', color: filter === s ? M : '#6b7280', fontSize: 11, fontWeight: filter === s ? 700 : 500, cursor: 'pointer', boxShadow: filter === s ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              {s === 'all' ? 'All' : STATUS_CFG[s as ScholarStatus].label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or scholarship…" style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 20, fontSize: 12, outline: 'none', width: 220 }} />
        </div>
      </div>

      {loading ? <Spin /> : displayed.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>No scholars found</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{search ? 'Try a different search term.' : filter !== 'all' ? `No ${filter} scholars in the system.` : 'No scholars have been awarded yet.'}</div>
          {(search || filter !== 'all') && <button onClick={() => { setSearch(''); setFilter('all'); }} style={{ marginTop: 14, padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Clear filters</button>}
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['ID', 'Student', 'Scholarship', 'Status', 'GWA', 'Semesters', 'Benefit'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((s, i) => {
                  const cfg     = STATUS_CFG[s.status];
                  const lastRec = s.semester_records?.[s.semester_records.length - 1];
                  return (
                    <tr key={s.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontFamily: 'monospace', fontSize: 12 }}>#{s.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{s.student_name ?? '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#374151', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.scholarship_name ?? '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#374151', fontFamily: 'monospace', fontSize: 12 }}>{lastRec?.gwa ?? '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#374151', fontSize: 12 }}>{s.semester_records?.length ?? 0} sem</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: s.allowance_status === 'released' ? '#dcfce7' : '#f3f4f6', color: s.allowance_status === 'released' ? '#15803d' : '#6b7280' }}>
                          {s.allowance_status ?? '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {total > 25 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); load(p); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: page <= 1 ? '#f9fafb' : '#fff', color: page <= 1 ? '#9ca3af' : '#374151', fontSize: 13, cursor: page <= 1 ? 'default' : 'pointer' }}>← Prev</button>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Page {page} of {totalPages} · {total} total</span>
              <button disabled={page >= totalPages} onClick={() => { const p = page + 1; setPage(p); load(p); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: page >= totalPages ? '#f9fafb' : '#fff', color: page >= totalPages ? '#9ca3af' : '#374151', fontSize: 13, cursor: page >= totalPages ? 'default' : 'pointer' }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
