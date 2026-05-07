'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { COLORS } from '@/lib/theme';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { applicationApi, type ApplicationResponse } from '@/lib/api-client';

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef3c7', color: '#92400e' },
  approved:   { bg: '#dcfce7', color: '#15803d' },
  rejected:   { bg: '#fee2e2', color: '#dc2626' },
  incomplete: { bg: '#fef9c3', color: '#713f12' },
  withdrawn:  { bg: '#f3f4f6', color: '#6b7280' },
};

const FILTER_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

export default function ApplicationsPage() {
  const [applications, setApplications]   = useState<ApplicationResponse[]>([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState('All');
  const [withdrawTarget, setWithdrawTarget] = useState<number | null>(null);
  const [withdrawing, setWithdrawing]     = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await applicationApi.list(1, 50);
      setApplications(res.items);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const filtered = applications.filter(a => {
    if (activeTab === 'All')      return a.status !== 'withdrawn';
    if (activeTab === 'Pending')  return ['pending', 'incomplete'].includes(a.status);
    if (activeTab === 'Approved') return a.status === 'approved';
    if (activeTab === 'Rejected') return a.status === 'rejected';
    return true;
  });

  const stats = {
    total:    applications.filter(a => a.status !== 'withdrawn').length,
    approved: applications.filter(a => a.status === 'approved').length,
    review:   applications.filter(a => a.eval_status === 'in_review').length,
    pending:  applications.filter(a => ['pending', 'incomplete'].includes(a.status)).length,
  };

  async function handleWithdraw(id: number) {
    setWithdrawing(true);
    try {
      await applicationApi.withdraw(id);
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch { /* ignore */ } finally {
      setWithdrawing(false);
      setWithdrawTarget(null);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: `3px solid #f3f4f6`, borderTop: `3px solid ${COLORS.maroon}`, borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>My Applications</h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Track all your scholarship applications in real time.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total',       value: stats.total,    color: '#374151', bg: '#f9fafb' },
          { label: 'Approved',    value: stats.approved, color: '#15803d', bg: '#f0fdf4' },
          { label: 'In Review',   value: stats.review,   color: '#0369a1', bg: '#eff6ff' },
          { label: 'Pending',     value: stats.pending,  color: '#92400e', bg: '#fffbeb' },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, borderRadius: 12, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }}>
        <div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f3f4f6', borderRadius: 10, padding: 4 }}>
            {FILTER_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? COLORS.maroon : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
                {tab}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <EmptyState
                icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                title={applications.length === 0 ? 'No applications yet' : 'No applications in this category'}
                subtitle={applications.length === 0 ? 'Start by browsing available iskolarships.' : ''}
                action={applications.length === 0
                  ? <Link href="/student/iskolarships" style={{ padding: '8px 20px', background: COLORS.maroon, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Browse Iskolarships</Link>
                  : undefined}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filtered.map(app => {
                const badge = STATUS_BADGE[app.status] ?? STATUS_BADGE.pending;
                const scholarshipName = app.scholarship?.name ?? `Scholarship #${app.scholarship_id}`;

                return (
                  <div key={app.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#111827' }}>{scholarshipName}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 10px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                            {app.status}
                          </span>
                          {app.eval_status === 'in_review' && app.status === 'pending' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, background: '#eff6ff', color: '#0369a1', fontSize: 11, fontWeight: 700, border: '1px solid #bfdbfe' }}>
                              Evaluating
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: '#6b7280' }}>
                            Submitted {new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        {app.remarks && (
                          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6b7280', lineHeight: 1.5, padding: '8px 12px', background: '#f9fafb', borderRadius: 8 }}>
                            {app.remarks}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {['pending', 'incomplete'].includes(app.status) && (
                          <button onClick={() => setWithdrawTarget(app.id)} style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#dc2626' }}>
                            Withdraw
                          </button>
                        )}
                        <Link href={`/student/applications/${app.id}`} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#374151', textDecoration: 'none' }}>
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Appeal status */}
                    {app.appeal && (
                      <div style={{ padding: '0 20px 16px' }}>
                        <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Appeal — {app.appeal.status}</div>
                          <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{app.appeal.reason}</p>
                          {app.appeal.review_note && (
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>Note: {app.appeal.review_note}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: `linear-gradient(135deg, ${COLORS.maroon}, ${COLORS.maroonD})`, borderRadius: 12, padding: 20, color: '#fff' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Apply for More</div>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
              There may be more iskolarships available for you.
            </p>
            <Link href="/student/iskolarships" style={{ display: 'block', padding: '9px 0', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
              Browse Iskolarships →
            </Link>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={withdrawTarget !== null}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This cannot be undone."
        confirmLabel={withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
        cancelLabel="Keep Application"
        danger
        onCancel={() => setWithdrawTarget(null)}
        onConfirm={() => withdrawTarget && handleWithdraw(withdrawTarget)}
      />
    </div>
  );
}
