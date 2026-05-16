'use client';

import { useState } from 'react';
import { getAccessToken } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

const REPORTS = [
  { type: 'students',     label: 'Students Report',     desc: 'All student accounts with registration status and profile info', icon: '👥', color: '#1d4ed8', bg: '#eff6ff' },
  { type: 'applications', label: 'Applications Report', desc: 'All scholarship applications with statuses and timestamps',       icon: '📋', color: '#059669', bg: '#f0fdf4' },
  { type: 'scholars',     label: 'Scholars Report',     desc: 'Active and past scholarship recipients with semester records',    icon: '🎓', color: M,         bg: '#fff5f5' },
];

export default function AdminReportsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});

  async function download(type: string) {
    setDownloading(prev => ({ ...prev, [type]: true }));
    try {
      const token = getAccessToken();
      const base  = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
      const res   = await fetch(`${base}/api/admin/reports/export?type=${type}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `iskomo_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      addToast('success', `${type} report downloaded.`);
    } catch (err) { addToast('error', err instanceof Error ? err.message : 'Download failed.'); }
    finally { setDownloading(prev => ({ ...prev, [type]: false })); }
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Reports</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Download system data as CSV files for offline analysis</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {REPORTS.map(r => (
          <div key={r.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{r.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{r.desc}</div>
              </div>
            </div>
            <button disabled={downloading[r.type]} onClick={() => download(r.type)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: downloading[r.type] ? '#9ca3af' : r.color, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: downloading[r.type] ? 'not-allowed' : 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {downloading[r.type]
                ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Downloading…</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download CSV</>}
            </button>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
