'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

interface AdminStats {
  students:     { total: number; pending_verification: number; verified: number; rejected: number; unregistered: number };
  staff:        { total: number; active: number };
  scholarships: { total: number; active: number; draft: number; archived: number };
  applications: { total: number; in_progress: number; approved: number; rejected: number; withdrawn: number };
}

function Spin() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats]           = useState<AdminStats | null>(null);
  const [loading, setLoading]       = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try { setStats(await apiFetch<AdminStats>('/api/admin/stats')); }
    catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>Dashboard</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>System-wide overview of IskoMo</p>
      </div>

      {loading ? <Spin /> : !stats ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af', fontSize: 13 }}>
          Failed to load stats.{' '}
          <button onClick={fetchStats} style={{ color: M, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { href: '/admin/staff',    label: 'Manage Staff',    icon: '👥', color: '#1d4ed8', bg: '#eff6ff' },
              { href: '/admin/students', label: 'Manage Students', icon: '🎓', color: M, bg: '#fff5f5' },
              { href: '/admin/audit',    label: 'Audit Logs',      icon: '📋', color: '#059669', bg: '#f0fdf4' },
              { href: '/admin/broadcast',label: 'Broadcast',       icon: '📣', color: '#d97706', bg: '#fffbeb' },
              { href: '/admin/reports',  label: 'Export Reports',  icon: '📊', color: '#7c3aed', bg: '#f5f3ff' },
            ].map(q => (
              <Link key={q.href} href={q.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: q.bg, borderRadius: 12, border: `1px solid ${q.color}20`, textDecoration: 'none', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 20 }}>{q.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: q.color }}>{q.label}</span>
              </Link>
            ))}
          </div>

          {/* Students */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Students</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {[
                { label: 'Total',          value: stats.students.total,                color: '#374151', bg: '#f9fafb', border: '#e5e7eb' },
                { label: 'Pending Review', value: stats.students.pending_verification, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                { label: 'Verified',       value: stats.students.verified,             color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
                { label: 'Rejected',       value: stats.students.rejected,             color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                { label: 'Unregistered',   value: stats.students.unregistered,         color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 12, border: `1px solid ${s.border}`, padding: '18px 20px' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Three panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Staff */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Staff</div>
                <Link href="/admin/staff" style={{ fontSize: 11, color: M, fontWeight: 600, textDecoration: 'none' }}>Manage →</Link>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                {[{ label: 'Total', value: stats.staff.total, color: '#374151' }, { label: 'Active', value: stats.staff.active, color: '#059669' }, { label: 'Inactive', value: stats.staff.total - stats.staff.active, color: '#9ca3af' }].map(s => (
                  <div key={s.label}><div style={{ fontSize: 30, fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{s.label}</div></div>
                ))}
              </div>
            </div>

            {/* Scholarships */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Scholarships</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[{ label: 'Total', value: stats.scholarships.total, color: '#374151' }, { label: 'Active', value: stats.scholarships.active, color: '#059669' }, { label: 'Draft', value: stats.scholarships.draft, color: '#6b7280' }, { label: 'Archived', value: stats.scholarships.archived, color: '#9ca3af' }].map(s => (
                  <div key={s.label}><div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{s.label}</div></div>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Applications</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[{ label: 'Total', value: stats.applications.total, color: '#374151' }, { label: 'In Progress', value: stats.applications.in_progress, color: '#d97706' }, { label: 'Approved', value: stats.applications.approved, color: '#059669' }, { label: 'Rejected', value: stats.applications.rejected, color: '#dc2626' }].map(s => (
                  <div key={s.label}><div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{s.label}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
