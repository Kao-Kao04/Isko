'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { COLORS } from '@/lib/theme';
import ScholarshipCard from '@/components/scholarship/ScholarshipCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { applicationApi, scholarshipApi, type ApplicationResponse } from '@/lib/api-client';
import { mapScholarship } from '@/lib/adapters';
import type { Scholarship } from '@/lib/osfa-data';

const TEAL      = COLORS.maroon;
const TEAL_DARK = COLORS.maroonD;
const TEAL_LIGHT = '#fff5f5';

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef3c7', color: '#92400e' },
  approved:   { bg: '#dcfce7', color: '#15803d' },
  rejected:   { bg: '#fee2e2', color: '#dc2626' },
  incomplete: { bg: '#fef9c3', color: '#713f12' },
};

const announcements = [
  { title: 'OSFA Scholarship Announcement', body: 'The Office of Scholarship and Financial Assistance is now accepting applications for available scholarship programs.', tag: 'Featured', tagBg: TEAL_LIGHT, tagColor: TEAL, border: TEAL, time: 'Today', icon: '📢' },
  { title: 'Deadline Reminder', body: 'Check your application deadlines and make sure all required documents are submitted on time.', tag: 'Update', tagBg: '#fffbeb', tagColor: '#92400e', border: '#F0C040', time: '2 days ago', icon: '📅' },
];

export default function Page() {
  const { user, loading: userLoading } = useCurrentUser();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  const isPending  = user?.account_status === 'pending';
  const isRejected = user?.account_status === 'rejected';

  const fetchData = useCallback(async () => {
    try {
      const [appsRes, scholRes] = await Promise.all([
        applicationApi.list(1, 50),
        scholarshipApi.list(1, 10),
      ]);
      setApplications(appsRes.items);
      setScholarships(scholRes.items.map(mapScholarship));
    } catch { /* silent fail */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const firstName = user?.student_profile?.first_name ?? 'Student';
  const studentNo = user?.student_profile?.student_number ?? '—';
  const program   = user?.student_profile?.program ?? '—';
  const yearLevel = user?.student_profile?.year_level ? `${user.student_profile.year_level}${['st','nd','rd'][user.student_profile.year_level - 1] ?? 'th'} Year` : '—';

  const activeScholarships = scholarships.filter(s => s.status === 'Active').slice(0, 3);
  const latestApp = applications.filter(a => a.status !== 'withdrawn')[0];
  const approvedCount = applications.filter(a => a.status === 'approved').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Pending Banner */}
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

      {isRejected && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#991b1b' }}>Account Registration Rejected</p>
            <p style={{ margin: 0, fontSize: 13, color: '#b91c1c', lineHeight: 1.5 }}>Your registration was not approved. Please contact the OSFA office for more information.</p>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 60%, #C9A027 100%)`, borderRadius: 18, padding: '32px 36px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Student Dashboard</p>
              <h1 style={{ margin: '0 0 20px', fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Welcome back, <span style={{ color: '#F5D060' }}>{userLoading ? '...' : firstName}!</span> 👋
              </h1>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'Student No.', value: studentNo },
                  { label: 'Program',     value: program.length > 30 ? program.split('(')[0].trim() : program },
                  { label: 'Year Level',  value: yearLevel },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', borderRadius: 30, padding: '6px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginRight: 6 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.18)', minWidth: 160 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Applications</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{applications.filter(a => a.status !== 'withdrawn').length}</div>
              <div style={{ fontSize: 12, color: '#F5D060', marginTop: 4 }}>{approvedCount} approved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* Left — Available Scholarships */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Available Scholarships</h2>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Open scholarships from OSFA</p>
            </div>
            <Link href="/student/iskolarships" style={{ fontSize: 12, fontWeight: 700, color: TEAL, textDecoration: 'none', padding: '6px 14px', background: TEAL_LIGHT, borderRadius: 20, border: '1px solid #fca5a5' }}>
              View All →
            </Link>
          </div>
          <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading...</div>
            ) : activeScholarships.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No active scholarships at the moment.</div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Application Status */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Application Status</h3>
            </div>
            <div style={{ padding: 20 }}>
              {latestApp ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', border: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{latestApp.scholarship?.name ?? `Scholarship #${latestApp.scholarship_id}`}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: STATUS_BADGE[latestApp.status]?.bg ?? '#f3f4f6', color: STATUS_BADGE[latestApp.status]?.color ?? '#374151', textTransform: 'capitalize' }}>
                        {latestApp.status}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {new Date(latestApp.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {applications.filter(a => a.status !== 'withdrawn').length > 1 && (
                    <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                      +{applications.filter(a => a.status !== 'withdrawn').length - 1} more application{applications.filter(a => a.status !== 'withdrawn').length > 2 ? 's' : ''}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 16px', background: 'linear-gradient(135deg, #f8fafc, #f0fdf4)', borderRadius: 12, border: '1.5px dashed #fca5a5', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>No Application Yet</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, textAlign: 'center' }}>Start your scholarship journey by applying below.</div>
                  <Link href="/student/iskolarships" style={{ padding: '8px 20px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>Find Scholarships</Link>
                </div>
              )}
              <Link href="/student/applications" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', background: '#fff', border: `1.5px solid ${TEAL}`, color: TEAL, borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700, marginTop: latestApp ? 10 : 0 }}>
                View Full Status Tracking
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>

          {/* Announcements */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: TEAL_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Announcements</h3>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.map((a, i) => (
                <div key={i} style={{ padding: '14px 14px 14px 16px', background: '#fafafa', borderRadius: 10, borderLeft: `3px solid ${a.border}`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 18, opacity: 0.15 }}>{a.icon}</div>
                  <h4 style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{a.title}</h4>
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>{a.body}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: a.tagBg, color: a.tagColor }}>{a.tag}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
