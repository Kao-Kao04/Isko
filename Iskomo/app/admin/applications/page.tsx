'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { applicationApi, type ApplicationResponse, type ApplicationStatus } from '@/lib/api-client';
import { COLORS } from '@/lib/theme';
import { Skel } from '@/components/shared/Skeleton';

const M = COLORS.maroon;

const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  approved:   { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
  rejected:   { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  incomplete: { bg: '#fff7ed', color: '#c2410c', label: 'Incomplete' },
  withdrawn:  { bg: '#f3f4f6', color: '#6b7280', label: 'Withdrawn' },
};

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'incomplete', 'withdrawn'] as const;

function Spin() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>;
}

function fmt(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

export default function AdminApplicationsPage() {
  const searchParams = useSearchParams();
  const [items,   setItems]   = useState<ApplicationResponse[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [status,  setStatus]  = useState<string>(() => searchParams.get('status') ?? 'all');
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p = 1, s = 'all') => {
    setLoading(true);
    try {
      const res = await applicationApi.list(p, 25, s === 'all' ? undefined : s);
      setItems(res.items); setTotal(res.total);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1, status); }, [load, status]);

  const totalPages = Math.max(1, Math.ceil(total / 25));
  const displayed  = search.trim()
    ? items.filter(a => {
        const q   = search.toLowerCase();
        const name = a.student ? `${a.student.first_name ?? ''} ${a.student.last_name ?? ''}`.toLowerCase() : '';
        return name.includes(q) || (a.student?.email ?? '').toLowerCase().includes(q) || (a.scholarship?.name ?? '').toLowerCase().includes(q);
      })
    : items;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>All Applications</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>System-wide view of all scholarship applications — {total} total</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: status === s ? '#fff' : 'transparent', color: status === s ? M : '#6b7280', fontSize: 12, fontWeight: status === s ? 700 : 500, cursor: 'pointer', boxShadow: status === s ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize' }}>
              {s === 'all' ? 'All' : STATUS_CFG[s]?.label ?? s}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or scholarship…" style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 20, fontSize: 12, outline: 'none', width: 230 }} />
        </div>
      </div>

      {loading ? (
        <div>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
              <Skel w={36} h={36} r={18} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skel h={14} w="45%" r={6} mb={6} />
                <Skel h={11} w="65%" r={5} />
              </div>
              <Skel h={22} w={80} r={20} />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>No applications found</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{search ? 'Try a different search term.' : status !== 'all' ? `No ${status} applications in the system.` : 'No applications have been submitted yet.'}</div>
          {(search || status !== 'all') && <button onClick={() => { setSearch(''); setStatus('all'); }} style={{ marginTop: 14, padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Clear filters</button>}
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['ID', 'Student', 'Student No.', 'Scholarship', 'Status', 'Submitted', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((a, i) => {
                  const cfg   = STATUS_CFG[a.status] ?? STATUS_CFG.pending;
                  const name  = a.student ? `${a.student.first_name ?? ''} ${a.student.last_name ?? ''}`.trim() : '—';
                  return (
                    <tr key={a.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontFamily: 'monospace', fontSize: 12 }}>#{a.id}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{name || '—'}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{a.student?.email ?? ''}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#374151', fontFamily: 'monospace', fontSize: 12 }}>{a.student?.student_number ?? '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#374151', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.scholarship?.name ?? '—'}</td>
                      <td style={{ padding: '12px 16px' }}><span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700 }}>{cfg.label}</span></td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12, whiteSpace: 'nowrap' }}>{fmt(a.submitted_at)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <Link href={`/osfa/applicants/${a.id}`} target="_blank"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 7, color: '#374151', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                          View
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {total > 25 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); load(p, status); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: page <= 1 ? '#f9fafb' : '#fff', color: page <= 1 ? '#9ca3af' : '#374151', fontSize: 13, cursor: page <= 1 ? 'default' : 'pointer' }}>← Prev</button>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Page {page} of {totalPages} · {total} total</span>
              <button disabled={page >= totalPages} onClick={() => { const p = page + 1; setPage(p); load(p, status); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: page >= totalPages ? '#f9fafb' : '#fff', color: page >= totalPages ? '#9ca3af' : '#374151', fontSize: 13, cursor: page >= totalPages ? 'default' : 'pointer' }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
