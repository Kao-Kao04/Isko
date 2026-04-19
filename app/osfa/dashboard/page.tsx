'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOsfaContext } from '@/lib/osfa-context';

const TEAL = '#800000';
const TEAL_DARK = '#5C0000';
const TEAL_LIGHT = '#fff5f5';

const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)';
const CARD_SHADOW_HOVER = '0 8px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)';

const urgencyStyle: Record<string, { bg: string; border: string; color: string; chip: string }> = {
  critical: { bg: '#fff5f5', border: '#fca5a5', color: '#dc2626', chip: '#fef2f2' },
  warning:  { bg: '#fffdf0', border: '#fde68a', color: '#d97706', chip: '#fffbeb' },
  normal:   { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', chip: '#f1f5f9' },
};

const announcements = [
  { title: 'System Maintenance Scheduled', body: 'IskoMo will be unavailable on Apr 20, 2026 from 2:00 AM – 4:00 AM for scheduled maintenance.', tag: 'System', tagBg: '#f1f5f9', tagColor: '#475569', accent: '#94a3b8', time: 'Today' },
  { title: 'New Evaluation Guidelines', body: 'Updated scoring rubrics for financial need assessment are now in effect for all new evaluations.', tag: 'Policy', tagBg: TEAL_LIGHT, tagColor: TEAL_DARK, accent: TEAL, time: '3 days ago' },
];

export default function Page() {
  // Live stats — always reflect the current global state
  const { applicants, scholarships } = useOsfaContext();

  const totalApplicants  = applicants.length;
  const pendingCount     = applicants.filter(a => a.status === 'Pending' || a.status === 'Under Review').length;
  const approvedCount    = applicants.filter(a => a.status === 'Approved').length;
  const rejectedCount    = applicants.filter(a => a.status === 'Rejected').length;
  const incompleteCount  = applicants.filter(a => a.status === 'Incomplete').length;
  const underReviewCount = applicants.filter(a => a.status === 'Under Review').length;
  const firstPending     = applicants.find(a => a.evalStatus === 'Pending Review');
  const activeScholarships = scholarships.filter(s => s.status === 'Active');

  const stats = [
    {
      label: 'Total Applicants',
      value: String(totalApplicants),
      change: `${applicants.filter(a => a.applied.startsWith('Jan 2')).length} new this week`,
      trend: 'up' as const,
      href: '/osfa/applicants',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    },
    {
      label: 'Pending Review',
      value: String(pendingCount),
      change: `${applicants.filter(a => a.evalStatus === 'Pending Review').length} in queue`,
      trend: 'warn' as const,
      href: '/osfa/applicants?status=Pending',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
    },
    {
      label: 'Approved',
      value: String(approvedCount),
      change: `${totalApplicants > 0 ? Math.round((approvedCount / totalApplicants) * 100) : 0}% approval rate`,
      trend: 'up' as const,
      href: '/osfa/applicants?status=Approved',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
    },
    {
      label: 'Rejected',
      value: String(rejectedCount),
      change: `${incompleteCount} incomplete`,
      trend: 'down' as const,
      href: '/osfa/applicants?status=Rejected',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>),
    },
  ];

  const trendColor = (t: 'up' | 'warn' | 'down') =>
    t === 'up' ? '#059669' : t === 'warn' ? '#d97706' : '#dc2626';

  const recentActivity = [
    { id: '1', title: 'New Application Received',   description: 'Juan dela Cruz applied for Academic Excellence Grant',          time: '2 min ago',  href: '/osfa/applicants/1', dot: '#3b82f6' },
    { id: '2', title: 'Application Approved',        description: 'Ana Santos approved for STEM Innovation Award',                time: '1 hr ago',   href: '/osfa/applicants/3', dot: '#10b981' },
    { id: '3', title: 'Application Rejected',        description: 'Jose Mendoza — GWA does not meet minimum requirement',         time: '3 hr ago',   href: '/osfa/applicants/6', dot: '#ef4444' },
    { id: '4', title: 'Scholarship Published',       description: 'Community Service Scholarship is now open for applications',   time: '1 day ago',  href: '/osfa/scholarships', dot: TEAL },
    { id: '5', title: 'Evaluation Completed',        description: 'Carlos Reyes evaluation finalized — Academic Excellence Grant', time: '2 days ago', href: '/osfa/applicants/4', dot: '#8b5cf6' },
  ];

  const applicationSummary = [
    { label: 'Pending',      count: applicants.filter(a => a.status === 'Pending').length, color: '#f59e0b' },
    { label: 'Under Review', count: underReviewCount,                                       color: '#3b82f6' },
    { label: 'Approved',     count: approvedCount,                                          color: '#10b981' },
    { label: 'Rejected',     count: rejectedCount,                                          color: '#ef4444' },
    { label: 'Incomplete',   count: incompleteCount,                                        color: '#f97316' },
  ];
  const summaryTotal = applicationSummary.reduce((s, r) => s + r.count, 0);

  const [hoveredCard, setHoveredCard]         = useState<string | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  const [hoveredDeadline, setHoveredDeadline] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 28px' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/osfa/applicants?tab=Pending+Review" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#fff', border: '1px solid #e2e8f0', color: '#374151', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Review Next Pending
            {firstPending && <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>{applicants.filter(a => a.evalStatus === 'Pending Review').length}</span>}
          </Link>
          <Link href="/osfa/scholarships" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 600, boxShadow: `0 2px 10px ${TEAL}50` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Scholarship
          </Link>
        </div>
      </div>

      {/* ── Stats row — live from context ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
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

      {/* ── Main two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

        {/* LEFT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Recent Activity — timeline */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: CARD_SHADOW }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 3, height: 16, borderRadius: 99, background: TEAL, flexShrink: 0 }} />
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Recent Activity</h2>
                </div>
                <p style={{ margin: '4px 0 0 11px', fontSize: 12, color: '#94a3b8' }}>Latest actions across all scholarship programs</p>
              </div>
              <Link href="/osfa/applicants" style={{ fontSize: 12, fontWeight: 700, color: TEAL, textDecoration: 'none', padding: '5px 12px', background: TEAL_LIGHT, borderRadius: 7, border: '1px solid #F5D060' }}>View All</Link>
            </div>
            <div style={{ position: 'relative', padding: '6px 0' }}>
              <div style={{ position: 'absolute', left: 29, top: 20, bottom: 20, width: 1.5, background: '#e2e8f0', zIndex: 0 }} />
              {recentActivity.map(a => {
                const isHov = hoveredActivity === a.id;
                return (
                  <div key={a.id} onMouseEnter={() => setHoveredActivity(a.id)} onMouseLeave={() => setHoveredActivity(null)}
                    style={{ display: 'flex', alignItems: 'flex-start', padding: '13px 24px', background: isHov ? '#f8fafc' : 'transparent', transition: 'background 0.15s ease' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: a.dot, border: '2.5px solid #fff', boxShadow: `0 0 0 2.5px ${a.dot}38`, flexShrink: 0, marginTop: 4, marginRight: 16, zIndex: 1 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{a.title}</div>
                        <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>{a.time}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.45 }}>{a.description}</div>
                      <Link href={a.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600, color: isHov ? TEAL : '#94a3b8', textDecoration: 'none', marginTop: 6, transition: 'color 0.15s ease' }}>
                        View details
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Summary — live from context */}
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
                  <Link key={s.label} href={`/osfa/applicants?status=${s.label.replace(' ', '+')}`}
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
              {activeScholarships.map(s => {
                const u = urgencyStyle[s.urgency];
                const isHov = hoveredDeadline === s.id;
                return (
                  <Link key={s.id} href={`/osfa/applicants?scholarship=${encodeURIComponent(s.title)}`}
                    onMouseEnter={() => setHoveredDeadline(s.id)} onMouseLeave={() => setHoveredDeadline(null)}
                    style={{ textDecoration: 'none', padding: '12px 14px', borderRadius: 10, background: u.bg, border: `1px solid ${u.border}`, display: 'block', transform: isHov ? 'translateX(3px)' : 'none', transition: 'transform 0.15s ease' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>{s.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{s.deadline}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: u.color, padding: '2px 9px', borderRadius: 20, background: u.chip }}>
                        {s.daysLeft <= 0 ? 'Expired' : s.daysLeft >= 999 ? 'No deadline' : `${s.daysLeft}d left`}
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
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: TEAL, color: '#fff', borderRadius: 99, padding: '2px 8px' }}>{announcements.length}</span>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {announcements.map((a, i) => (
                <div key={i} style={{ padding: '14px 16px', background: '#fafafa', borderRadius: 10, borderLeft: `4px solid ${a.accent}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{a.title}</h4>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: a.tagBg, color: a.tagColor, flexShrink: 0, marginLeft: 8 }}>{a.tag}</span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: '#475569', lineHeight: 1.55 }}>{a.body}</p>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
