'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Skel } from '@/components/shared/Skeleton';

const M  = COLORS.maroon;
const MD = COLORS.maroonD;
const ML = COLORS.maroonL;

interface AdminStats {
  students:     { total: number; pending_verification: number; verified: number; rejected: number; unregistered: number; scholars: number };
  staff:        { total: number; active: number };
  scholarships: { total: number; active: number; draft: number; archived: number };
  applications: { total: number; in_progress: number; approved: number; rejected: number; withdrawn: number };
}

export default function AdminDashboardPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try { setStats(await apiFetch<AdminStats>('/api/admin/stats')); }
    catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const displayName = user?.student_profile?.first_name ?? user?.email?.split('@')[0] ?? 'Admin';

  const statCards = !stats ? [] : [
    {
      label: 'Total Students', value: stats.students.total,
      sub: `${stats.students.scholars} scholars`,
      subColor: M,
      href: '/admin/students',
      bg: '#f0fdf4', iconColor: '#059669',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
      label: 'Pending Review', value: stats.students.pending_verification,
      sub: `${stats.students.unregistered} unregistered`,
      subColor: '#d97706',
      href: '/admin/registrations',
      bg: '#fffbeb', iconColor: '#d97706',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    {
      label: 'Active Scholarships', value: stats.scholarships.active,
      sub: `${stats.scholarships.total} total`,
      subColor: '#2563eb',
      href: '/osfa/scholarships?status=active',
      bg: '#eff6ff', iconColor: '#2563eb',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>,
    },
    {
      label: 'Total Applications', value: stats.applications.total,
      sub: `${stats.applications.in_progress} in progress`,
      subColor: stats.applications.in_progress > 0 ? '#d97706' : '#059669',
      href: '/admin/applications',
      bg: '#f5f3ff', iconColor: '#7c3aed',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    },
  ];

  const studentBreakdown = !stats ? [] : [
    { label: 'Verified',     count: stats.students.verified,             color: '#059669', status: 'verified' },
    { label: 'Scholars',     count: stats.students.scholars,             color: M,         status: 'scholars' },
    { label: 'Pending',      count: stats.students.pending_verification, color: '#d97706', status: 'pending_verification' },
    { label: 'Rejected',     count: stats.students.rejected,             color: '#dc2626', status: 'rejected' },
    { label: 'Unregistered', count: stats.students.unregistered,         color: '#9ca3af', status: 'unregistered' },
  ];

  const appBreakdown = !stats ? [] : [
    { label: 'In Progress', count: stats.applications.in_progress, color: '#d97706', status: 'pending' },
    { label: 'Approved',    count: stats.applications.approved,    color: '#059669', status: 'approved' },
    { label: 'Rejected',    count: stats.applications.rejected,    color: '#dc2626', status: 'rejected' },
    { label: 'Withdrawn',   count: stats.applications.withdrawn,   color: '#9ca3af', status: 'withdrawn' },
  ];

  const studentTotal = stats?.students.total ?? 0;
  const appTotal     = appBreakdown.reduce((a, r) => a + r.count, 0);

  if (loading) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <Skel h={30} w={220} r={8} mb={8} />
      <Skel h={13} w={300} r={6} mb={28} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px' }}>
            <Skel h={11} w="60%" r={5} mb={10} />
            <Skel h={32} w={60} r={6} mb={6} />
            <Skel h={10} w="40%" r={5} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[0,1].map(i => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px' }}>
            <Skel h={14} w={140} r={6} mb={16} />
            {[...Array(4)].map((_, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <Skel w={34} h={34} r={17} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Skel h={13} w="50%" r={5} mb={5} />
                  <Skel h={11} w="65%" r={5} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px' }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* ── Hero Banner ── */}
      <div style={{ background: `linear-gradient(135deg, ${M} 0%, ${MD} 60%, #C9A027 100%)`, borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -70, right: 100, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.01) 40px, rgba(255,255,255,0.01) 80px)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Super Admin Dashboard</p>
              <h1 style={{ margin: '0 0 18px', fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Welcome back, <span style={{ color: '#F5D060' }}>{userLoading ? '…' : displayName}!</span>
              </h1>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'Students',     value: stats ? String(stats.students.total) : '…' },
                  { label: 'Staff',        value: stats ? String(stats.staff.active) + ' active' : '…' },
                  { label: 'Scholarships', value: stats ? String(stats.scholarships.active) + ' active' : '…' },
                  { label: 'Today',        value: new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }) },
                ].map(chip => (
                  <div key={chip.label} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 30, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>{chip.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{chip.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending stat box */}
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '16px 22px', border: '1px solid rgba(255,255,255,0.18)', minWidth: 150, textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pending Review</div>
              <div style={{ fontSize: 38, fontWeight: 800, color: (stats?.students.pending_verification ?? 0) > 0 ? '#F5D060' : '#fff', lineHeight: 1 }}>
                {loading ? '…' : (stats?.students.pending_verification ?? 0)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>{stats ? stats.students.total : '…'} total students</div>
            </div>
          </div>

          {/* Quick action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              { href: '/admin/students',  label: 'Manage Students', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
              { href: '/admin/staff',     label: 'Manage Staff',    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              { href: '/admin/audit',     label: 'Audit Logs',      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
              { href: '/admin/broadcast', label: 'Broadcast',       icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 17H2a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h20a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3zm-8 4H10"/></svg> },
              { href: '/admin/reports',   label: 'Export Reports',  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
            ].map(btn => (
              <Link key={btn.href} href={btn.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.25)' }}>
                {btn.icon}
                {btn.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} style={{ height: 96, background: '#f9fafb', borderRadius: 14, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))
        ) : statCards.map(c => (
          <Link key={c.label} href={c.href}
            style={{ textDecoration: 'none', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.15s, transform 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: c.iconColor }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: 2 }}>{c.value}</div>
              <div style={{ fontSize: 11, color: c.subColor, marginTop: 3, fontWeight: 600 }}>{c.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* LEFT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Student Breakdown */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Student Breakdown</h2>
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Account status distribution</p>
                </div>
              </div>
              <Link href="/admin/students" style={{ fontSize: 12, fontWeight: 700, color: M, textDecoration: 'none', padding: '6px 14px', background: ML, borderRadius: 20, border: `1px solid ${M}30`, display: 'flex', alignItems: 'center', gap: 4 }}>
                View All
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
            <div style={{ padding: '10px 22px 16px' }}>
              {loading ? (
                [1,2,3,4,5].map(i => <div key={i} style={{ height: 36, background: '#f9fafb', borderRadius: 8, marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />)
              ) : studentBreakdown.map(row => {
                const pct = studentTotal > 0 ? Math.round((row.count / studentTotal) * 100) : 0;
                const href = row.status === 'scholars' ? '/admin/scholars' : row.status === 'pending_verification' ? '/admin/registrations' : `/admin/students?account_status=${row.status}`;
                return (
                  <Link key={row.label} href={href}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151', minWidth: 100, fontWeight: 500 }}>{row.label}</span>
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

          {/* Applications Breakdown */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Application Breakdown</h2>
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Status distribution across all scholarships</p>
                </div>
              </div>
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Total: {stats?.applications.total ?? '…'}</span>
            </div>
            <div style={{ padding: '10px 22px 16px' }}>
              {loading ? (
                [1,2,3,4].map(i => <div key={i} style={{ height: 36, background: '#f9fafb', borderRadius: 8, marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />)
              ) : appBreakdown.map(row => {
                const pct = appTotal > 0 ? Math.round((row.count / appTotal) * 100) : 0;
                return (
                  <Link key={row.label} href={`/admin/applications?status=${row.status}`}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151', minWidth: 100, fontWeight: 500 }}>{row.label}</span>
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

          {/* Staff Panel */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Staff</h3>
              </div>
              <Link href="/admin/staff" style={{ fontSize: 11, color: M, fontWeight: 600, textDecoration: 'none' }}>Manage →</Link>
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', gap: 0 }}>
              {loading || !stats ? (
                <div style={{ height: 52, width: '100%', background: '#f9fafb', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ) : [
                { label: 'Total',    value: stats.staff.total,                     color: '#374151' },
                { label: 'Active',   value: stats.staff.active,                    color: '#059669' },
                { label: 'Inactive', value: stats.staff.total - stats.staff.active, color: '#9ca3af' },
              ].map((s, i, arr) => (
                <Link key={s.label} href="/admin/staff"
                  style={{ flex: 1, textDecoration: 'none', padding: '10px 12px', borderRadius: 8, borderRight: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none', textAlign: 'center', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Scholarships Panel */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                </div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Scholarships</h3>
              </div>
              <Link href="/osfa/scholarships" style={{ fontSize: 11, color: M, fontWeight: 600, textDecoration: 'none' }}>Manage →</Link>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {loading || !stats ? (
                [1,2,3,4].map(i => <div key={i} style={{ height: 32, background: '#f9fafb', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />)
              ) : ([
                { label: 'Total',    value: stats.scholarships.total,    color: '#374151', href: '/osfa/scholarships' },
                { label: 'Active',   value: stats.scholarships.active,   color: '#059669', href: '/osfa/scholarships?status=active' },
                { label: 'Draft',    value: stats.scholarships.draft,    color: '#6b7280', href: '/osfa/scholarships?status=draft' },
                { label: 'Archived', value: stats.scholarships.archived, color: '#9ca3af', href: '/osfa/scholarships?status=archived' },
              ] as const).map(s => (
                <Link key={s.label} href={s.href}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: '#f9fafb', border: '1px solid #f3f4f6', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f1f5f9'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Quick Links</h3>
            </div>
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Pending Registrations', href: '/admin/registrations',              color: '#d97706', bg: '#fffbeb' },
                { label: 'All Students',           href: '/admin/students',                   color: '#059669', bg: '#f0fdf4' },
                { label: 'Scholars',               href: '/admin/scholars',                   color: M,         bg: ML       },
                { label: 'All Applications',       href: '/admin/applications',               color: '#7c3aed', bg: '#f5f3ff' },
                { label: 'Audit Logs',             href: '/admin/audit',                      color: '#374151', bg: '#f9fafb' },
                { label: 'Export Reports',         href: '/admin/reports',                    color: '#2563eb', bg: '#eff6ff' },
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
