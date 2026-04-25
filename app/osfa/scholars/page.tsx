'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { applicationApi, type ApplicationResponse } from '@/lib/api-client';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';

const TEAL = '#800000';
const TEAL_DARK = '#5C0000';

type TabFilter = 'Active' | 'Probationary' | 'Terminated' | 'Graduated';

const statusStyle: Record<string, { bg: string; color: string; dot: string }> = {
  active:       { bg: '#f0fdf4', color: '#059669', dot: '#10b981' },
  probationary: { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  terminated:   { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
  graduated:    { bg: '#f5f3ff', color: '#7c3aed', dot: '#8b5cf6' },
};

function getInitials(app: ApplicationResponse): string {
  if (!app.student?.first_name) return '??';
  return `${app.student.first_name[0]}${app.student.last_name?.[0] ?? ''}`.toUpperCase();
}

function getFullName(app: ApplicationResponse): string {
  if (!app.student) return `Student #${app.student_id}`;
  return `${app.student.first_name ?? ''} ${app.student.last_name ?? ''}`.trim();
}

export default function Page() {
  const { toasts, addToast, removeToast } = useToast();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<TabFilter>('Active');
  const [searchQuery, setSearchQuery]   = useState('');

  const fetchScholarships = useCallback(async () => {
    try {
      const res = await applicationApi.list(1, 200);
      setApplications(res.items.filter(a => a.status === 'approved'));
    } catch {
      addToast('error', 'Failed to load scholars.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchScholarships(); }, [fetchScholarships]);

  const counts = {
    Active:       applications.length,
    Probationary: 0,
    Terminated:   0,
    Graduated:    0,
  };

  const filtered = applications.filter(a => {
    const name         = getFullName(a).toLowerCase();
    const scholarship  = (a.scholarship?.name ?? '').toLowerCase();
    const program      = (a.student?.program ?? '').toLowerCase();
    return name.includes(searchQuery.toLowerCase()) ||
      scholarship.includes(searchQuery.toLowerCase()) ||
      program.includes(searchQuery.toLowerCase());
  });

  const tabConfig: { key: TabFilter; color: string; bg: string; border: string }[] = [
    { key: 'Active',       color: '#059669', bg: '#f0fdf4', border: '#6ee7b7' },
    { key: 'Probationary', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
    { key: 'Terminated',   color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
    { key: 'Graduated',    color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  ];

  if (loading) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: `3px solid #f3f4f6`, borderTop: `3px solid ${TEAL}`, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Scholars</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>Scholar Management</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Track and manage approved scholarship recipients</p>
      </div>

      {/* Stats tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {tabConfig.map(({ key, color, bg, border }) => (
          <div key={key} onClick={() => setActiveTab(key)}
            style={{ background: activeTab === key ? bg : '#fff', border: `1px solid ${activeTab === key ? border : '#e2e8f0'}`, borderRadius: 11, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{counts[key]}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, fontWeight: 500 }}>{key}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search by name, scholarship, or program..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#111827', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{filtered.length} scholar{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {activeTab !== 'Active' && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#64748b', textAlign: 'center' }}>
          {activeTab} scholars tracking coming soon — requires semester record management.
        </div>
      )}

      {/* Scholar list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No scholars found</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>Approved applications will appear here.</div>
          </div>
        ) : filtered.map(scholar => {
          const st = statusStyle.active;
          return (
            <div key={scholar.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {getInitials(scholar)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{getFullName(scholar)}</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, fontSize: 12, fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} />
                    Active
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{scholar.scholarship?.name ?? `Scholarship #${scholar.scholarship_id}`}</div>
                <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{scholar.student?.program ?? '—'}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Year {scholar.student?.year_level ?? '—'}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>
                    Approved {new Date(scholar.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <Link href={`/osfa/applicants/${scholar.id}`} style={{ padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f9fafb', color: '#374151', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  View Application
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
