'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { applicationApi, scholarshipApi, notificationApi, type ApplicationResponse, type ScholarshipResponse, type NotificationResponse } from '@/lib/api-client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;
const TEAL_DARK = COLORS.maroonD;
const TEAL_LIGHT = COLORS.maroonL;
const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)';
const CARD_SHADOW_HOVER = '0 8px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)';

function getDaysLeft(deadline: string | null): number {
  if (!deadline) return 999;
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline';
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const urgencyStyle: Record<string, { bg: string; border: string; color: string; chip: string }> = {
  critical: { bg: '#fff5f5', border: '#fca5a5', color: '#dc2626', chip: '#fef2f2' },
  warning:  { bg: '#fffdf0', border: '#fde68a', color: '#d97706', chip: '#fffbeb' },
  normal:   { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', chip: '#f1f5f9' },
};

export default function Page() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const displayName = user?.student_profile?.first_name ?? user?.email?.split('@')[0] ?? 'OSFA';

  const [applications,  setApplications]  = useState<ApplicationResponse[]>([]);
  const [scholarships,  setScholarships]  = useState<ScholarshipResponse[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard]         = useState<string | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  const [hoveredDeadline, setHoveredDeadline] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [appsRes, scholRes, notifsRes] = await Promise.all([
        applicationApi.list(1, 100),
        scholarshipApi.list(1, 100),
        notificationApi.list(1, 10),
      ]);
      setApplications(appsRes.items ?? []);
      setScholarships(scholRes.items ?? []);
      setNotifications(notifsRes.items ?? []);
    } catch {
      // silent fail — dashboard shows zeros
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleNotifClick(n: NotificationResponse) {
    try {
      await notificationApi.markRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    } catch {}
    router.push(n.application_id ? `/osfa/applicants/${n.application_id}` : '/osfa/notifications');
  }

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalApplicants  = applications.length;
  const pendingCount     = applications.filter(a => a.status === 'pending').length;
  const approvedCount    = applications.filter(a => a.status === 'approved').length;
  const rejectedCount    = applications.filter(a => a.status === 'rejected').length;
  const incompleteCount  = applications.filter(a => a.status === 'incomplete').length;
  const inReviewCount    = applications.filter(a => a.eval_status === 'in_review').length;
  const activeScholarships = scholarships.filter(s => s.status === 'active');

  const stats = [
    {
      label: 'Total Applicants',
      value: String(totalApplicants),
      change: `${pendingCount} pending review`,
      trend: 'up' as const,
      href: '/osfa/applicants',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    },
    {
      label: 'Pending Review',
      value: String(pendingCount),
      change: `${inReviewCount} in review`,
      trend: 'warn' as const,
      href: '/osfa/applicants?status=pending',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
    },
    {
      label: 'Approved',
      value: String(approvedCount),
      change: `${totalApplicants > 0 ? Math.round((approvedCount / totalApplicants) * 100) : 0}% approval rate`,
      trend: 'up' as const,
      href: '/osfa/applicants?status=approved',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
    },
    {
      label: 'Rejected',
      value: String(rejectedCount),
      change: `${incompleteCount} incomplete`,
      trend: 'down' as const,
      href: '/osfa/applicants?status=rejected',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>),
    },
  ];

  const trendColor = (t: 'up' | 'warn' | 'down') =>
    t === 'up' ? '#059669' : t === 'warn' ? '#d97706' : '#dc2626';

  const applicationSummary = [
    { label: 'Pending',    count: pendingCount,    color: '#f59e0b', status: 'pending'    },
    { label: 'In Review',  count: inReviewCount,   color: '#3b82f6', status: 'in_review'  },
    { label: 'Approved',   count: approvedCount,   color: '#10b981', status: 'approved'   },
    { label: 'Rejected',   count: rejectedCount,   color: '#dc2626', status: 'rejected'   },
    { label: 'Incomplete', count: incompleteCount, color: '#f97316', status: 'incomplete' },
  ];
  const summaryTotal = applicationSummary.reduce((s, r) => s + r.count, 0);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 28px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Page header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Welcome, {displayName}!
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/osfa/applicants?status=pending" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#fff', border: '1px solid #e2e8f0', color: '#374151', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Review Pending
            {pendingCount > 0 && <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>{pendingCount}</span>}
          </Link>
          <Link href="/osfa/scholarships" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 600, boxShadow: `0 2px 10px ${TEAL}50` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Scholarship
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {stats.map(s => {
          const isHov = hoveredCard === s.label;
          return (
            <Link key={s.label} href={s.href} onMouseEnter={() => setHoveredCard(s.label)} onMouseLeave={() => setHoveredCard(null)}
              style={{ textDecoration: 'none', background: '#fff', borderRadius: 14, border: `1px solid ${isHov ? '#cbd5e1' : '#e2e8f0'}`, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: isHov ? CARD_SHADOW_HOVER : CARD_SHADOW, transform: isHov ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.2s ease' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#64748b' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: 4, letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: trendColor(s.trend), marginTop: 4, fontWeight: 600 }}>{s.change}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

        {/* LEFT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Recent Applications */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: CARD_SHADOW }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 3, height: 16, borderRadius: 99, background: TEAL, flexShrink: 0 }} />
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Recent Applications</h2>
                </div>
                <p style={{ margin: '4px 0 0 11px', fontSize: 12, color: '#94a3b8' }}>Latest applications across all scholarship programs</p>
              </div>
              <Link href="/osfa/applicants" style={{ fontSize: 12, fontWeight: 700, color: TEAL, textDecoration: 'none', padding: '5px 12px', background: TEAL_LIGHT, borderRadius: 7, border: '1px solid #F5D060' }}>View All</Link>
            </div>
            <div style={{ position: 'relative', padding: '6px 0' }}>
              {loading ? (
                <div style={{ padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 24, height: 24, border: `2.5px solid #f3f4f6`, borderTop: `2.5px solid ${TEAL}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : applications.length === 0 ? (
                <div style={{ padding: '32px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No applications yet.</div>
              ) : (
                <div style={{ position: 'absolute', left: 29, top: 20, bottom: 20, width: 1.5, background: '#e2e8f0', zIndex: 0 }} />
              )}
              {applications.slice(0, 5).map((a, idx) => {
                const isHov = hoveredActivity === String(a.id);
                const name = a.student ? `${a.student.first_name ?? ''} ${a.student.last_name ?? ''}`.trim() : `Student #${a.student_id}`;
                const dotColors: Record<string, string> = { pending: '#f59e0b', approved: '#10b981', rejected: '#dc2626', incomplete: '#f97316', withdrawn: '#94a3b8' };
                return (
                  <div key={a.id} onMouseEnter={() => setHoveredActivity(String(a.id))} onMouseLeave={() => setHoveredActivity(null)}
                    style={{ display: 'flex', alignItems: 'flex-start', padding: '13px 24px', background: isHov ? '#f8fafc' : 'transparent', transition: 'background 0.15s ease' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColors[a.status] ?? '#94a3b8', border: '2.5px solid #fff', boxShadow: `0 0 0 2.5px ${dotColors[a.status] ?? '#94a3b8'}38`, flexShrink: 0, marginTop: 4, marginRight: 16, zIndex: 1 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{name}</div>
                        <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {new Date(a.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        Applied for {a.scholarship?.name ?? `Scholarship #${a.scholarship_id}`} — <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{a.status}</span>
                      </div>
                      <Link href={`/osfa/applicants/${a.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600, color: isHov ? TEAL : '#94a3b8', textDecoration: 'none', marginTop: 6 }}>
                        View details
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Summary */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: CARD_SHADOW }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 3, height: 16, borderRadius: 99, background: '#64748b', flexShrink: 0 }} />
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Application Summary</h2>
              </div>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Total: {summaryTotal}</span>
            </div>
            <div style={{ padding: '12px 24px 18px' }}>
              {applicationSummary.map(s => {
                const pct = summaryTotal > 0 ? Math.round((s.count / summaryTotal) * 100) : 0;
                return (
                  <Link key={s.label} href={`/osfa/applicants?status=${s.status}`}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                    <span style={{ fontSize: 13, color: '#374151', minWidth: 110, fontWeight: 500 }}>{s.label}</span>
                    <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 34, textAlign: 'right' }}>{pct}%</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', minWidth: 24, textAlign: 'right' }}>{s.count}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Upcoming Deadlines */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: CARD_SHADOW }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Upcoming Deadlines</h3>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeScholarships.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No active scholarships.</div>
              ) : activeScholarships.map(s => {
                const daysLeft = getDaysLeft(s.deadline);
                const urgency = daysLeft <= 3 ? 'critical' : daysLeft <= 10 ? 'warning' : 'normal';
                const u = urgencyStyle[urgency];
                const isHov = hoveredDeadline === s.id;
                return (
                  <Link key={s.id} href={`/osfa/applicants?scholarship=${s.id}`}
                    onMouseEnter={() => setHoveredDeadline(s.id)} onMouseLeave={() => setHoveredDeadline(null)}
                    style={{ textDecoration: 'none', padding: '12px 14px', borderRadius: 10, background: u.bg, border: `1px solid ${u.border}`, display: 'block', transform: isHov ? 'translateX(3px)' : 'none', transition: 'transform 0.15s ease' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>{s.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{formatDeadline(s.deadline)}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: u.color, padding: '2px 9px', borderRadius: 20, background: u.chip }}>
                        {daysLeft <= 0 ? 'Expired' : daysLeft >= 999 ? 'No deadline' : `${daysLeft}d left`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Announcements */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: CARD_SHADOW }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: TEAL_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Announcements</h3>
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: TEAL, color: '#fff', borderRadius: 99, padding: '2px 8px' }}>
                  {notifications.filter(n => !n.is_read).length} unread
                </span>
              )}
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loading ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading...</div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No announcements.</div>
              ) : notifications.map(n => (
                <button key={n.id} onClick={() => handleNotifClick(n)}
                  style={{ textAlign: 'left', width: '100%', display: 'block', padding: '14px 16px', background: n.is_read ? '#fafafa' : '#fff9ff', borderRadius: 10, borderLeft: `4px solid ${n.application_id ? TEAL : '#94a3b8'}`, cursor: 'pointer', transition: 'background 0.15s', border: 'none', borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: n.application_id ? TEAL : '#94a3b8' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f1f5f9'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.is_read ? '#fafafa' : '#fff9ff'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: n.is_read ? 600 : 700, color: '#0f172a' }}>{n.title}</h4>
                    {!n.is_read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: TEAL, flexShrink: 0, marginLeft: 8, marginTop: 3 }} />}
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: '#475569', lineHeight: 1.55 }}>{n.body}</p>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
