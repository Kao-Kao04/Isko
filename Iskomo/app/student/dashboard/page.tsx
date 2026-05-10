'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { COLORS } from '@/lib/theme';
import ScholarshipCard from '@/components/scholarship/ScholarshipCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { applicationApi, scholarshipApi, scholarApi, notificationApi, type ApplicationResponse, type ScholarResponse, type NotificationResponse } from '@/lib/api-client';
import { mapScholarship } from '@/lib/adapters';
import { STUDENT_SUB_STATUS_LABEL } from '@/lib/workflow';
import type { Scholarship } from '@/lib/osfa-data';

const M       = COLORS.maroon;
const MD      = COLORS.maroonD;
const M_LIGHT = '#fff5f5';

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef3c7', color: '#92400e' },
  approved:   { bg: '#dcfce7', color: '#15803d' },
  rejected:   { bg: '#fee2e2', color: '#dc2626' },
  incomplete: { bg: '#fef9c3', color: '#713f12' },
};

function timeAgo(d: string): string {
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return 'Just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days === 1)  return 'Yesterday';
  return `${days} days ago`;
}

const NOTIF_TYPE: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  approved:   { color: '#059669', bg: '#f0fdf4', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
  rejected:   { color: '#dc2626', bg: '#fef2f2', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
  incomplete: { color: '#ea580c', bg: '#fff7ed', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  deadline:   { color: '#d97706', bg: '#fffbeb', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  resubmit:   { color: '#7c3aed', bg: '#f5f3ff', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg> },
  info:       { color: '#2563eb', bg: '#eff6ff', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></svg> },
};

export default function Page() {
  const { user, loading: userLoading } = useCurrentUser();
  const [applications,  setApplications]  = useState<ApplicationResponse[]>([]);
  const [scholarships,  setScholarships]  = useState<Scholarship[]>([]);
  const [myScholars,    setMyScholars]    = useState<ScholarResponse[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState('');

  const isPending  = user?.account_status === 'pending_verification';
  const isRejected = user?.account_status === 'rejected';

  const fetchData = useCallback(async () => {
    setFetchError('');
    try {
      const [appsResult, scholResult, myScholarsResult, notifsResult] = await Promise.allSettled([
        applicationApi.list(1, 50),
        scholarshipApi.list(1, 10),
        scholarApi.getMyScholars(),
        notificationApi.list(1, 20),
      ]);
      if (appsResult.status === 'fulfilled')      setApplications(appsResult.value.items);
      if (scholResult.status === 'fulfilled')      setScholarships(scholResult.value.items.map(mapScholarship));
      if (myScholarsResult.status === 'fulfilled') setMyScholars(myScholarsResult.value);
      if (notifsResult.status === 'fulfilled')     setNotifications(notifsResult.value.items);

      const failed = [appsResult, scholResult].filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        const err = (failed[0] as PromiseRejectedResult).reason;
        setFetchError(err instanceof Error ? err.message : 'Some data failed to load.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const firstName = user?.student_profile?.first_name ?? user?.email?.split('@')[0] ?? 'Student';
  const studentNo = user?.student_profile?.student_number ?? '—';
  const program   = user?.student_profile?.program ?? '—';
  const yearLevel = user?.student_profile?.year_level
    ? `${user.student_profile.year_level}${['st','nd','rd'][user.student_profile.year_level - 1] ?? 'th'} Year`
    : '—';

  const activeScholarships = scholarships.filter(s => s.status === 'Active').slice(0, 3);
  const latestApp          = applications.filter(a => a.status !== 'withdrawn')[0];
  const approvedCount      = applications.filter(a => a.status === 'approved').length;
  const unreadCount        = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
        .notif-row:hover { background: #f8fafc !important; }
      `}</style>

      {/* Error banner */}
      {fetchError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {fetchError}
          <button onClick={fetchData} style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#dc2626', background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {/* Pending banner */}
      {isPending && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#92400e' }}>Account Pending OSFA Approval</p>
            <p style={{ margin: 0, fontSize: 13, color: '#b45309', lineHeight: 1.5 }}>Your registration is under review. You can browse scholarships but cannot apply until approved by OSFA.</p>
          </div>
        </div>
      )}

      {/* Rejected banner */}
      {isRejected && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#991b1b' }}>Registration Rejected</p>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#b91c1c', lineHeight: 1.5 }}>
              {user?.rejection_remarks ?? 'Your documents were rejected by OSFA. Please re-upload corrected documents.'}
            </p>
            <a href="/student/registration" style={{ display: 'inline-block', padding: '7px 16px', background: '#dc2626', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Re-upload Documents →
            </a>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="dash-hero" style={{ background: `linear-gradient(135deg, ${M} 0%, ${MD} 60%, #C9A027 100%)`, borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -70, right: 100, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.01) 40px, rgba(255,255,255,0.01) 80px)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Student Dashboard</p>
              <h1 style={{ margin: '0 0 18px', fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Welcome back, <span style={{ color: '#F5D060' }}>{userLoading ? '...' : firstName}!</span>
              </h1>
              <div className="dash-hero-chips" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'Student No.', value: studentNo },
                  { label: 'Program',     value: program.length > 28 ? program.split('(')[0].trim() : program },
                  { label: 'Year Level',  value: yearLevel },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 30, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="dash-hero-stat" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '14px 20px', border: '1px solid rgba(255,255,255,0.18)', minWidth: 150, textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>My Applications</div>
              <div className="dash-hero-stat-num" style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{applications.filter(a => a.status !== 'withdrawn').length}</div>
              <div style={{ fontSize: 12, color: '#F5D060', marginTop: 6, fontWeight: 600 }}>{approvedCount} approved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Left — Available Scholarships */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: M_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Available Scholarships</h2>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Open scholarships from OSFA</p>
              </div>
            </div>
            <Link href="/student/iskolarships" style={{ fontSize: 12, fontWeight: 700, color: M, textDecoration: 'none', padding: '6px 14px', background: M_LIGHT, borderRadius: 20, border: `1px solid ${M}30`, display: 'flex', alignItems: 'center', gap: 4 }}>
              View All
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
          <div style={{ padding: '10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ height: 80, background: '#f9fafb', borderRadius: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))
            ) : activeScholarships.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px' }}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
                <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>No active scholarships at the moment.</p>
              </div>
            ) : activeScholarships.map(s => (
              <div key={s.id} style={{ position: 'relative' }}>
                {s.daysLeft < 999 && (
                  <span style={{ position: 'absolute', top: 8, right: 8, zIndex: 1, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: s.urgency === 'critical' ? '#fef2f2' : s.urgency === 'warning' ? '#fffbeb' : '#f0fdf4', color: s.urgency === 'critical' ? '#dc2626' : s.urgency === 'warning' ? '#d97706' : '#15803d', border: `1px solid ${s.urgency === 'critical' ? '#fecaca' : s.urgency === 'warning' ? '#fde68a' : '#bbf7d0'}` }}>
                    {s.daysLeft === 0 ? 'Due today' : `${s.daysLeft}d left`}
                  </span>
                )}
                <ScholarshipCard scholarship={s} variant="row" applyDisabled={isPending} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="dash-right" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Application Status */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Application Status</h3>
            </div>
            <div style={{ padding: 16 }}>
              {latestApp ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', border: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{latestApp.scholarship?.name ?? `Scholarship #${latestApp.scholarship_id}`}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: STATUS_BADGE[latestApp.status]?.bg ?? '#f3f4f6', color: STATUS_BADGE[latestApp.status]?.color ?? '#374151' }}>
                        {latestApp.sub_status
                          ? (STUDENT_SUB_STATUS_LABEL[latestApp.sub_status] ?? latestApp.sub_status)
                          : (latestApp.status.charAt(0).toUpperCase() + latestApp.status.slice(1))}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {new Date(latestApp.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {applications.filter(a => a.status !== 'withdrawn').length > 1 && (
                    <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', padding: '4px 0' }}>
                      +{applications.filter(a => a.status !== 'withdrawn').length - 1} more application{applications.filter(a => a.status !== 'withdrawn').length > 2 ? 's' : ''}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px', background: '#f9fafb', borderRadius: 12, border: '1.5px dashed #e5e7eb', marginBottom: 12 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>No Application Yet</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.5 }}>Start your scholarship journey.</div>
                  <Link href="/student/iskolarships" style={{ padding: '7px 18px', background: `linear-gradient(135deg, ${M}, ${MD})`, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>Find Scholarships</Link>
                </div>
              )}
              <Link href="/student/applications" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 14px', background: '#fff', border: `1.5px solid ${M}`, color: M, borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700, marginTop: latestApp ? 10 : 0 }}>
                View All Applications
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>

          {/* Scholar Status */}
          {myScholars.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: M_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                </div>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Scholar Status</h3>
              </div>
              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myScholars.map(s => {
                  const cfg: Record<string, { bg: string; color: string; label: string }> = {
                    active:       { bg: '#dcfce7', color: '#15803d', label: 'Scholar' },
                    probationary: { bg: '#fef9c3', color: '#854d0e', label: 'Probationary' },
                    terminated:   { bg: '#fee2e2', color: '#dc2626', label: 'Terminated' },
                    graduated:    { bg: '#eff6ff', color: '#1d4ed8', label: 'Graduated' },
                  };
                  const c = cfg[s.status] ?? cfg.active;
                  return (
                    <div key={s.id} style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Scholarship #{s.scholarship_id}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Since {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.color, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {c.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notifications */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: M_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Notifications</h3>
              {unreadCount > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, background: M, color: '#fff', padding: '2px 8px', borderRadius: 99 }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '28px 18px', textAlign: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px' }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>No notifications yet.</p>
                </div>
              ) : notifications.slice(0, 5).map((n, idx) => {
                const c = NOTIF_TYPE.info;
                const notifHref = n.route ? `/student${n.route}` : n.application_id ? `/student/applications/${n.application_id}` : '/student/applications';
                return (
                  <Link key={n.id} href={notifHref} className="notif-row"
                    style={{
                      textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '11px 16px',
                      borderBottom: idx < Math.min(notifications.length, 5) - 1 ? '1px solid #f3f4f6' : 'none',
                      background: n.is_read ? '#fff' : '#fafffe',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.is_read ? '#fff' : '#fafffe'}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      {c.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 2px', fontSize: 12, color: '#111827', lineHeight: 1.5, fontWeight: n.is_read ? 400 : 600 }}>{n.title}</p>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{timeAgo(n.created_at)}</span>
                    </div>
                    {!n.is_read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: M, flexShrink: 0, marginTop: 7 }} />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
