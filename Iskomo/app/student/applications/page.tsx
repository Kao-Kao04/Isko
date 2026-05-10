'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { COLORS } from '@/lib/theme';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { applicationApi, type ApplicationResponse } from '@/lib/api-client';
import { SUB_STATUS_LABEL } from '@/lib/workflow';

const M = COLORS.maroon;
const MD = COLORS.maroonD;

const STATUS_BADGE: Record<string, { bg: string; color: string; border: string; stripe: string }> = {
  pending:    { bg: '#fef3c7', color: '#92400e', border: '#fde68a', stripe: '#f59e0b' },
  approved:   { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', stripe: '#22c55e' },
  rejected:   { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', stripe: '#ef4444' },
  incomplete: { bg: '#fef9c3', color: '#713f12', border: '#fde68a', stripe: '#eab308' },
  withdrawn:  { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb', stripe: '#9ca3af' },
};

const FILTER_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const StatIcon = ({ type }: { type: string }) => {
  if (type === 'Total') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  );
  if (type === 'Approved') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
  if (type === 'In Review') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  );
};

export default function ApplicationsPage() {
  const [applications, setApplications]     = useState<ApplicationResponse[]>([]);
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState('All');
  const [withdrawTarget, setWithdrawTarget] = useState<number | null>(null);
  const [withdrawing, setWithdrawing]       = useState(false);

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
          <div style={{ width: 36, height: 36, border: `3px solid #f3f4f6`, borderTop: `3px solid ${M}`, borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <style>{`
        .app-card-action:hover { opacity: 0.85; }
        .app-card-row:hover { background: #fafafa !important; }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${M}, ${MD})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>My Applications</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Track all your scholarship applications in real time.</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {([
          { label: 'Total',     value: stats.total,    color: '#374151', bg: '#fff',      border: '#e5e7eb', iconColor: '#374151' },
          { label: 'Approved',  value: stats.approved, color: '#15803d', bg: '#f0fdf4',   border: '#bbf7d0', iconColor: '#22c55e' },
          { label: 'In Review', value: stats.review,   color: '#0369a1', bg: '#eff6ff',   border: '#bfdbfe', iconColor: '#3b82f6' },
          { label: 'Pending',   value: stats.pending,  color: '#92400e', bg: '#fffbeb',   border: '#fde68a', iconColor: '#f59e0b' },
        ] as const).map(stat => (
          <div key={stat.label} style={{ background: stat.bg, borderRadius: 14, border: `1px solid ${stat.border}`, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.7)', border: `1px solid ${stat.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.iconColor }}>
              <StatIcon type={stat.label} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, fontWeight: 500 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="apps-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }}>
        <div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: '#f3f4f6', borderRadius: 12, padding: 4 }}>
            {FILTER_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? M : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                transition: 'all 0.15s',
              }}>
                {tab}
                {tab !== 'All' && tab === 'Pending' && stats.pending > 0 && (
                  <span style={{ marginLeft: 5, fontSize: 10, background: activeTab === tab ? M : '#d1d5db', color: activeTab === tab ? '#fff' : '#6b7280', padding: '1px 5px', borderRadius: 99, fontWeight: 800 }}>
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <EmptyState
                icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                title={applications.length === 0 ? 'No applications yet' : 'No applications in this category'}
                subtitle={applications.length === 0 ? 'Start by browsing available iskolarships.' : ''}
                action={applications.length === 0
                  ? <Link href="/student/iskolarships" style={{ padding: '9px 22px', background: `linear-gradient(135deg, ${M}, ${MD})`, color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Browse Iskolarships</Link>
                  : undefined}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(app => {
                const badge  = STATUS_BADGE[app.status] ?? STATUS_BADGE.pending;
                const scholarshipName = app.scholarship?.name ?? `Scholarship #${app.scholarship_id}`;

                return (
                  <div key={app.id} className="app-card-row" style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', transition: 'background 0.12s' }}>
                    {/* Status stripe */}
                    <div style={{ width: 4, background: badge.stripe, flexShrink: 0 }} />

                    <div style={{ flex: 1, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#111827' }}>{scholarshipName}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 11px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, border: `1px solid ${badge.border}`, textTransform: 'capitalize' }}>
                              {app.sub_status ? (SUB_STATUS_LABEL[app.sub_status] ?? app.status) : app.status}
                            </span>
                            {app.eval_status === 'in_review' && app.status === 'pending' && !app.sub_status && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: '#eff6ff', color: '#0369a1', fontSize: 11, fontWeight: 700, border: '1px solid #bfdbfe' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                Evaluating
                              </span>
                            )}
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>
                              {new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          {app.remarks && (
                            <p style={{ margin: '10px 0 0', fontSize: 12, color: '#6b7280', lineHeight: 1.6, padding: '8px 12px', background: '#f9fafb', borderRadius: 8, borderLeft: '3px solid #e5e7eb' }}>
                              {app.remarks}
                            </p>
                          )}
                        </div>
                        <div className="app-actions" style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'flex-start' }}>
                          {['pending', 'incomplete'].includes(app.status) && (
                            <button onClick={() => setWithdrawTarget(app.id)} className="app-card-action" style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#dc2626', transition: 'opacity 0.15s' }}>
                              Withdraw
                            </button>
                          )}
                          <Link href={`/student/applications/${app.id}`} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#374151', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                            View Details
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </Link>
                        </div>
                      </div>

                      {/* Appeal status */}
                      {app.appeal && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                            Appeal — {app.appeal.status}
                          </div>
                          <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{app.appeal.reason}</p>
                          {app.appeal.review_note && (
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>Note: {app.appeal.review_note}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="apps-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: `linear-gradient(135deg, ${M}, ${MD})`, borderRadius: 14, padding: 20, color: '#fff', boxShadow: `0 4px 14px ${M}40` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Apply for More</div>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
              There may be more iskolarships available for you.
            </p>
            <Link href="/student/iskolarships" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
              Browse Iskolarships
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>

          {/* Summary card */}
          {applications.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#111827' }}>Quick Summary</h4>
              {[
                { label: 'Active applications', value: stats.total },
                { label: 'Under review', value: stats.review },
                { label: 'Withdrawn', value: applications.filter(a => a.status === 'withdrawn').length },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
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
