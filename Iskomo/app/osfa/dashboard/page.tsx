'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { applicationApi, scholarshipApi, notificationApi, dashboardApi, reportsApi, type ApplicationResponse, type ScholarshipResponse, type NotificationResponse, type DashboardStats, type CalendarEvent } from '@/lib/api-client';
import { resolveNotifRoute, withRoleBase } from '@/lib/notifications';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { COLORS } from '@/lib/theme';
import { Skel } from '@/components/shared/Skeleton';

const M      = COLORS.maroon;
const MD     = COLORS.maroonD;
const M_LIGHT = COLORS.maroonL;

function getDaysLeft(deadline: string | null): number {
  if (!deadline) return 999;
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline';
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(d: string): string {
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

const DEPT_LABEL: Record<string, string> = { public: 'Public', private: 'Private' };

export default function Page() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const displayName = user?.student_profile?.first_name ?? user?.email?.split('@')[0] ?? 'OSFA';
  const dept = user?.department ?? '';

  const [applications,   setApplications]   = useState<ApplicationResponse[]>([]);
  const [scholarships,   setScholarships]   = useState<ScholarshipResponse[]>([]);
  const [notifications,  setNotifications]  = useState<NotificationResponse[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [statsRes, appsRes, scholRes, notifsRes, calRes] = await Promise.allSettled([
      dashboardApi.stats(),
      applicationApi.list(1, 50),
      scholarshipApi.list(1, 100),
      notificationApi.list(1, 10),
      reportsApi.calendar(),
    ]);
    if (statsRes.status  === 'fulfilled') setDashboardStats(statsRes.value);
    if (appsRes.status   === 'fulfilled') setApplications(appsRes.value.items ?? []);
    if (scholRes.status  === 'fulfilled') setScholarships(scholRes.value.items ?? []);
    if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.items ?? []);
    if (calRes.status    === 'fulfilled') setCalendarEvents(calRes.value.events ?? []);
    setLoading(false);
  }, []);

  async function handleNotifClick(n: NotificationResponse) {
    try { await notificationApi.markRead(n.id); setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x)); } catch {}
    if (n.application_id) {
      router.push(`/osfa/applicants/${n.application_id}`);
      return;
    }
    if (n.route) {
      const resolved = resolveNotifRoute(n.route);
      if (resolved.external) {
        window.open(n.route, '_blank', 'noopener,noreferrer');
        return;
      }
      const bare = (resolved.path ?? n.route).replace(/^\/(osfa|student)/, '');
      const routeMap: Record<string, string> = {
        '/iskolarships': '/osfa/scholarships',
        '/registrations': '/osfa/registrations',
      };
      const dest = routeMap[bare] ?? withRoleBase(bare.replace(/^\/applications\/(\d+)/, '/applicants/$1'), '/osfa');
      router.push(dest);
      return;
    }
    router.push('/osfa/notifications');
  }

  useEffect(() => { fetchData(); }, [fetchData]);

  const s = dashboardStats;
  const totalApplicants = s?.total_applications ?? applications.length;
  const pendingCount    = s?.pending   ?? applications.filter(a => a.status === 'pending').length;
  const approvedCount   = s?.approved  ?? applications.filter(a => a.status === 'approved').length;
  const rejectedCount   = s?.rejected  ?? applications.filter(a => a.status === 'rejected').length;
  const incompleteCount = applications.filter(a => a.status === 'incomplete').length;
  const inReviewCount   = applications.filter(a => a.eval_status === 'in_review').length;
  const activeScholarships = scholarships.filter(sc => sc.status === 'active');
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const now = Date.now();
  const upcomingInterviews = calendarEvents
    .filter(e => new Date(e.interview_datetime).getTime() >= now)
    .sort((a, b) => new Date(a.interview_datetime).getTime() - new Date(b.interview_datetime).getTime())
    .slice(0, 5);

  const statCards = [
    {
      label: 'Total Applicants', value: totalApplicants, sub: `${pendingCount} pending`,
      subColor: pendingCount > 0 ? '#d97706' : '#059669',
      href: '/osfa/applicants',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      bg: '#eff6ff', iconColor: '#2563eb',
    },
    {
      label: 'Pending Review', value: pendingCount, sub: `${inReviewCount} in review`,
      subColor: '#d97706',
      href: '/osfa/applicants?status=pending',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      bg: '#fffbeb', iconColor: '#d97706',
    },
    {
      label: 'Approved', value: approvedCount,
      sub: `${totalApplicants > 0 ? Math.round((approvedCount / totalApplicants) * 100) : 0}% approval rate`,
      subColor: '#059669',
      href: '/osfa/applicants?status=approved',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
      bg: '#f0fdf4', iconColor: '#059669',
    },
    {
      label: 'Rejected', value: rejectedCount, sub: `${incompleteCount} incomplete`,
      subColor: '#dc2626',
      href: '/osfa/applicants?status=rejected',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
      bg: '#fef2f2', iconColor: '#dc2626',
    },
  ];

  const appSummary = [
    { label: 'Pending',    count: pendingCount,    color: '#f59e0b', status: 'pending' },
    { label: 'In Review',  count: inReviewCount,   color: '#3b82f6', status: 'in_review' },
    { label: 'Approved',   count: approvedCount,   color: '#10b981', status: 'approved' },
    { label: 'Rejected',   count: rejectedCount,   color: '#dc2626', status: 'rejected' },
    { label: 'Incomplete', count: incompleteCount, color: '#f97316', status: 'incomplete' },
  ];
  const summaryTotal = appSummary.reduce((a, r) => a + r.count, 0);

  if (loading || userLoading) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <Skel h={32} w={240} r={8} mb={8} />
      <Skel h={14} w={320} r={6} mb={28} />
      {/* stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px' }}>
            <Skel h={12} w="60%" r={5} mb={10} />
            <Skel h={32} w={70} r={6} mb={6} />
            <Skel h={11} w="40%" r={5} />
          </div>
        ))}
      </div>
      {/* two-column lower section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px' }}>
          <Skel h={16} w={160} r={6} mb={16} />
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Skel w={36} h={36} r={18} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skel h={13} w="50%" r={5} mb={5} />
                <Skel h={11} w="70%" r={5} />
              </div>
              <Skel h={22} w={70} r={20} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px' }}>
            <Skel h={14} w={140} r={6} mb={14} />
            {[...Array(3)].map((_, i) => <Skel key={i} h={54} r={10} mb={8} />)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px' }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${M} 0%, ${MD} 60%, #C9A027 100%)`, borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -70, right: 100, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.01) 40px, rgba(255,255,255,0.01) 80px)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>OSFA Portal</p>
              <h1 style={{ margin: '0 0 18px', fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Welcome back, <span style={{ color: '#F5D060' }}>{userLoading ? '…' : displayName}!</span>
              </h1>
              {/* Info chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {dept && (
                  <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 30, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>Department</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{DEPT_LABEL[dept] ?? dept}</span>
                  </div>
                )}
                <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 30, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>Active Scholarships</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{activeScholarships.length}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 30, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>Today</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending stat box */}
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '16px 22px', border: '1px solid rgba(255,255,255,0.18)', minWidth: 150, textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pending Review</div>
              <div style={{ fontSize: 38, fontWeight: 800, color: pendingCount > 0 ? '#F5D060' : '#fff', lineHeight: 1 }}>{loading ? '…' : pendingCount}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>{totalApplicants} total applicants</div>
            </div>
          </div>

          {/* Quick action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <Link href="/osfa/applicants?status=pending" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.25)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Review Pending
              {pendingCount > 0 && <span style={{ background: '#F5D060', color: '#92400e', fontSize: 11, fontWeight: 800, padding: '1px 7px', borderRadius: 20 }}>{pendingCount}</span>}
            </Link>
            <Link href="/osfa/scholarships" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.25)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Scholarship
            </Link>
            <Link href="/osfa/notifications" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.25)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Notifications
              {unreadCount > 0 && <span style={{ background: '#F5D060', color: '#92400e', fontSize: 11, fontWeight: 800, padding: '1px 7px', borderRadius: 20 }}>{unreadCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4 Stat Cards ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {statCards.map(c => (
          <Link key={c.label} href={c.href} style={{ textDecoration: 'none', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.15s, transform 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: c.iconColor }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: 2 }}>{loading ? '…' : c.value}</div>
              <div style={{ fontSize: 11, color: c.subColor, marginTop: 3, fontWeight: 600 }}>{c.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* LEFT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Recent Applications */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: M_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Recent Applications</h2>
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{dept ? `${DEPT_LABEL[dept]} Department` : 'Latest applications across all scholarships'}</p>
                </div>
              </div>
              <Link href="/osfa/applicants" style={{ fontSize: 12, fontWeight: 700, color: M, textDecoration: 'none', padding: '6px 14px', background: M_LIGHT, borderRadius: 20, border: `1px solid ${M}30`, display: 'flex', alignItems: 'center', gap: 4 }}>
                View All
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
            <div>
              {loading ? (
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Skel w={36} h={36} r={18} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <Skel h={13} w="50%" r={5} mb={5} />
                        <Skel h={11} w="70%" r={5} />
                      </div>
                      <Skel h={22} w={70} r={20} />
                    </div>
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>No applications yet.</p>
                </div>
              ) : applications.slice(0, 6).map((a, idx) => {
                const name = a.student ? `${a.student.first_name ?? ''} ${a.student.last_name ?? ''}`.trim() || a.student.email : `Student #${a.student_id}`;
                const BADGE: Record<string, { bg: string; color: string }> = {
                  pending:    { bg: '#fef3c7', color: '#92400e' },
                  approved:   { bg: '#dcfce7', color: '#15803d' },
                  rejected:   { bg: '#fee2e2', color: '#dc2626' },
                  incomplete: { bg: '#ffedd5', color: '#c2410c' },
                  withdrawn:  { bg: '#f3f4f6', color: '#6b7280' },
                };
                const bd = BADGE[a.status] ?? BADGE.withdrawn;
                return (
                  <Link key={a.id} href={`/osfa/applicants/${a.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: idx < Math.min(applications.length, 6) - 1 ? '1px solid #f9fafb' : 'none', textDecoration: 'none', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${M}, ${MD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>
                      {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.scholarship?.name ?? `Scholarship #${a.scholarship_id}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: bd.bg, color: bd.color, textTransform: 'capitalize' }}>{a.status}</span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{timeAgo(a.submitted_at)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Application Summary */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Application Breakdown</h2>
              </div>
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Total: {summaryTotal}</span>
            </div>
            <div style={{ padding: '10px 22px 16px' }}>
              {appSummary.map(row => {
                const pct = summaryTotal > 0 ? Math.round((row.count / summaryTotal) * 100) : 0;
                return (
                  <Link key={row.label} href={`/osfa/applicants?status=${row.status}`}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151', minWidth: 90, fontWeight: 500 }}>{row.label}</span>
                    <div style={{ flex: 1, height: 7, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: row.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#9ca3af', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', minWidth: 22, textAlign: 'right' }}>{row.count}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Upcoming Interviews */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{dept === 'public' ? 'Upcoming Submission Deadlines' : 'Upcoming Interviews'}</h3>
              <Link href="/osfa/calendar" style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: M, textDecoration: 'none', padding: '3px 10px', background: M_LIGHT, borderRadius: 20 }}>View Calendar →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...Array(3)].map((_, i) => <Skel key={i} h={54} r={10} />)}
                </div>
              ) : upcomingInterviews.length === 0 ? (
                <div style={{ padding: '24px 18px', textAlign: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px' }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>No upcoming interviews scheduled.</p>
                </div>
              ) : upcomingInterviews.map((ev, idx) => {
                const dt = new Date(ev.interview_datetime);
                const isToday = dt.toDateString() === new Date().toDateString();
                const isTomorrow = dt.toDateString() === new Date(Date.now() + 86400000).toDateString();
                const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
                const timeLabel = dt.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
                return (
                  <Link key={ev.application_id} href={`/osfa/calendar?date=${new Date(ev.interview_datetime).toISOString().slice(0, 10)}`}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: idx < upcomingInterviews.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: isToday ? '#f0fdf4' : '#f8fafc', border: `1px solid ${isToday ? '#86efac' : '#e5e7eb'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: isToday ? '#059669' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{dt.toLocaleDateString('en-PH', { month: 'short' })}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: isToday ? '#059669' : '#374151', lineHeight: 1.1 }}>{dt.getDate()}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.student_name}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.scholarship_name}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? '#059669' : '#374151' }}>{dateLabel}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>{timeLabel}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Upcoming Deadlines</h3>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeScholarships.length === 0 ? (
                <div style={{ padding: '20px 8px', textAlign: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>No active scholarships.</p>
                </div>
              ) : activeScholarships.slice(0, 5).map(sc => {
                const daysLeft = getDaysLeft(sc.deadline);
                const urgent = daysLeft <= 3;
                const warning = !urgent && daysLeft <= 10;
                const bg = urgent ? '#fef2f2' : warning ? '#fffbeb' : '#f8fafc';
                const border = urgent ? '#fecaca' : warning ? '#fde68a' : '#e5e7eb';
                const chipColor = urgent ? '#dc2626' : warning ? '#d97706' : '#64748b';
                const chipBg = urgent ? '#fee2e2' : warning ? '#fef9c3' : '#f1f5f9';
                return (
                  <Link key={sc.id} href={`/osfa/applicants?scholarship=${sc.id}`}
                    style={{ textDecoration: 'none', padding: '11px 13px', borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'block', transition: 'transform 0.12s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(3px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sc.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>{formatDeadline(sc.deadline)}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: chipColor, padding: '2px 8px', borderRadius: 20, background: chipBg }}>
                        {daysLeft <= 0 ? 'Expired' : daysLeft >= 999 ? 'Open' : `${daysLeft}d left`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: M_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Notifications</h3>
              {unreadCount > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, background: M, color: '#fff', padding: '2px 8px', borderRadius: 99 }}>{unreadCount} new</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...Array(3)].map((_, i) => <Skel key={i} h={54} r={10} />)}
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '28px 18px', textAlign: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px' }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>No notifications yet.</p>
                </div>
              ) : notifications.slice(0, 5).map((n, idx) => (
                <button key={n.id} onClick={() => handleNotifClick(n)}
                  style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '11px 16px', borderBottom: idx < Math.min(notifications.length, 5) - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10, transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: n.application_id ? M_LIGHT : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    {n.application_id
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 12, color: '#111827', fontWeight: n.is_read ? 400 : 600, lineHeight: 1.4 }}>{n.title}</p>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{timeAgo(n.created_at)}</span>
                  </div>
                  {!n.is_read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: M, flexShrink: 0, marginTop: 7 }} />}
                </button>
              ))}
            </div>
            {notifications.length > 0 && (
              <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                <Link href="/osfa/notifications" style={{ fontSize: 12, fontWeight: 700, color: M, textDecoration: 'none' }}>View all notifications →</Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Quick Links</h3>
            </div>
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Pending Applications',  href: '/osfa/applicants?status=pending',  color: '#d97706', bg: '#fffbeb' },
                { label: 'All Applicants',         href: '/osfa/applicants',                  color: '#2563eb', bg: '#eff6ff' },
                { label: 'Scholar Management',     href: '/osfa/scholars',                    color: '#059669', bg: '#f0fdf4' },
                { label: 'Manage Scholarships',    href: '/osfa/scholarships',                color: M,         bg: M_LIGHT  },
                { label: 'Registrations',          href: '/osfa/registrations',               color: '#7c3aed', bg: '#f5f3ff' },
              ].map(link => (
                <Link key={link.label} href={link.href}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 9, textDecoration: 'none', color: '#374151', fontSize: 13, fontWeight: 500, background: '#fafafa', border: '1px solid #f3f4f6', transition: 'background 0.12s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = link.bg; (e.currentTarget as HTMLElement).style.color = link.color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fafafa'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}>
                  {link.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
