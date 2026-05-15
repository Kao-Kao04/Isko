'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { reportsApi, type ReportsOverview, type ScholarshipBreakdown, type ApplicationTrend } from '@/lib/api-client';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;

// ── Status colour map — includes both old and new keys for safety ─────────────
const STATUS_COLOR: Record<string, string> = {
  in_progress: '#d97706',
  pending:     '#d97706', // backward-compat
  approved:    '#059669',
  rejected:    '#dc2626',
  incomplete:  '#ea580c',
  withdrawn:   '#6b7280',
  waitlisted:  '#6366f1',
};

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'In Progress',
  pending:     'In Progress',
  approved:    'Approved',
  rejected:    'Rejected',
  incomplete:  'Incomplete',
  withdrawn:   'Withdrawn',
  waitlisted:  'Waitlisted',
};

// ── Trends — main_status values from backend (lowercase after values_callable fix)
const TREND_LABEL: Record<string, string> = {
  application:  'Submitted',
  verification: 'Under Verification',
  interview:    'Interview',
  decision:     'Decision',
  completion:   'Completed',
  rejected:     'Rejected',
  withdrawn:    'Withdrawn',
  // legacy uppercase keys (backward compat)
  APPLICATION:  'Submitted',
  VERIFICATION: 'Under Verification',
  INTERVIEW:    'Interview',
  DECISION:     'Decision',
  COMPLETION:   'Completed',
  REJECTED:     'Rejected',
  WITHDRAWN:    'Withdrawn',
};

const TREND_COLOR: Record<string, string> = {
  application:  '#6366f1',
  verification: '#2563eb',
  interview:    '#7c3aed',
  decision:     '#d97706',
  completion:   '#059669',
  rejected:     '#dc2626',
  withdrawn:    '#6b7280',
  APPLICATION:  '#6366f1',
  VERIFICATION: '#2563eb',
  INTERVIEW:    '#7c3aed',
  DECISION:     '#d97706',
  COMPLETION:   '#059669',
  REJECTED:     '#dc2626',
  WITHDRAWN:    '#6b7280',
};

function StatCard({ label, value, sub, color = '#111827' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function ReportsPage() {
  const [overview,  setOverview]  = useState<ReportsOverview | null>(null);
  const [breakdown, setBreakdown] = useState<ScholarshipBreakdown[]>([]);
  const [trends,    setTrends]    = useState<ApplicationTrend[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'scholarships' | 'trends'>('overview');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ov, bd, tr] = await Promise.all([
        reportsApi.overview(),
        reportsApi.scholarships(),
        reportsApi.trends(),
      ]);
      setOverview(ov);
      setBreakdown(bd);
      setTrends(tr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalApps = overview
    ? Object.values(overview.applications_by_status).reduce((a, b) => a + b, 0)
    : 0;

  // Trends — group by date, pivot by main_status
  const trendDates = [...new Set(trends.map(t => t.date?.slice(0, 10)))].sort().slice(-14);
  const trendStatuses = [...new Set(trends.map(t => t.status))].filter(s => TREND_LABEL[s]);
  const trendByDate = trendDates.map(date => {
    const rows = trends.filter(t => t.date?.startsWith(date));
    const counts: Record<string, number> = {};
    trendStatuses.forEach(s => {
      counts[s] = rows.find(r => r.status === s)?.count ?? 0;
    });
    return { date, counts, total: Object.values(counts).reduce((a, b) => a + b, 0) };
  });
  const maxTrendCount = Math.max(...trendByDate.map(d => d.total), 1);

  if (loading) return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid #f3f4f6`, borderTop: `3px solid ${TEAL}`, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading reports…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Reports</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Reports & Analytics</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Scholarship program performance and application statistics</p>
        </div>
        <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.08-1"/></svg>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#dc2626' }}>{error}</div>
      )}

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 2, background: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {(['overview', 'scholarships', 'trends'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? '#111827' : '#6b7280', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer', boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && overview && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
            <StatCard label="Total Applications" value={totalApps} color={TEAL} />
            <StatCard label="Active Scholarships" value={overview.active_scholarships} color="#2563eb" />
            <StatCard label="Total Scholars" value={overview.total_scholars} color="#059669" />
            <StatCard label="Approved"
              value={overview.applications_by_status['approved'] ?? 0}
              color="#059669"
              sub={totalApps ? `${Math.round(((overview.applications_by_status['approved'] ?? 0) / totalApps) * 100)}% approval rate` : undefined}
            />
            <StatCard label="In Progress" value={overview.applications_by_status['in_progress'] ?? 0} color="#d97706" />
            <StatCard label="Rejected"    value={overview.applications_by_status['rejected']    ?? 0} color="#dc2626" />
            {(overview.applications_by_status['waitlisted'] ?? 0) > 0 && (
              <StatCard label="Waitlisted" value={overview.applications_by_status['waitlisted']} color="#6366f1" />
            )}
          </div>

          {/* Status distribution bar */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Application Status Distribution</h3>
            <div style={{ display: 'flex', height: 32, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
              {Object.entries(overview.applications_by_status).filter(([, v]) => v > 0).map(([status, count]) => (
                <div key={status} title={`${STATUS_LABEL[status] ?? status}: ${count}`}
                  style={{ flex: count, background: STATUS_COLOR[status] ?? '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 24 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{count}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              {Object.entries(overview.applications_by_status).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLOR[status] ?? '#94a3b8', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{STATUS_LABEL[status] ?? status}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Scholarships ── */}
      {activeTab === 'scholarships' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Scholarship Breakdown</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{breakdown.length} scholarships</p>
          </div>
          {breakdown.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No scholarship data yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Scholarship', 'Slots', 'Total', 'Approved', 'In Progress', 'Rejected', 'Fill Rate'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((row, i) => {
                    const fillPct = row.slots ? Math.round((row.approved / row.slots) * 100) : null;
                    return (
                      <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827', maxWidth: 260 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#374151' }}>{row.slots ?? '—'}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#111827' }}>{row.total_applications}</td>
                        <td style={{ padding: '12px 16px', color: '#059669', fontWeight: 700 }}>{row.approved}</td>
                        <td style={{ padding: '12px 16px', color: '#d97706', fontWeight: 700 }}>{row.in_progress}</td>
                        <td style={{ padding: '12px 16px', color: '#dc2626', fontWeight: 700 }}>{row.rejected}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {fillPct !== null ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 60, height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(fillPct, 100)}%`, background: fillPct >= 90 ? '#dc2626' : fillPct >= 70 ? '#d97706' : TEAL, borderRadius: 99 }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: fillPct >= 90 ? '#dc2626' : '#374151' }}>{fillPct}%</span>
                            </div>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Trends ── */}
      {activeTab === 'trends' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Application Trends (Last 14 Days)</h3>
          <p style={{ margin: '0 0 28px', fontSize: 12, color: '#6b7280' }}>Daily submission counts by workflow stage</p>
          {trendByDate.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No trend data available yet.</div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 200 }}>
                {trendByDate.map(day => (
                  <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'column-reverse', width: '100%', gap: 1 }}>
                      {trendStatuses.map(s => {
                        const v = day.counts[s] ?? 0;
                        if (!v) return null;
                        const h = `${Math.round((v / maxTrendCount) * 180)}px`;
                        return (
                          <div key={s} style={{ height: h, background: TREND_COLOR[s] ?? '#94a3b8', minHeight: 3, borderRadius: 2 }}
                            title={`${TREND_LABEL[s] ?? s}: ${v}`} />
                        );
                      })}
                    </div>
                    <span style={{ fontSize: 9, color: '#9ca3af', writingMode: 'vertical-rl', transform: 'rotate(180deg)', marginTop: 4, whiteSpace: 'nowrap' }}>
                      {day.date?.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
                {trendStatuses.map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: TREND_COLOR[s] ?? '#94a3b8' }} />
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{TREND_LABEL[s] ?? s}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
