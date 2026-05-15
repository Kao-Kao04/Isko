'use client';

import { useRef, useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const M  = COLORS.maroon;
const MD = COLORS.maroonD;

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em',
};

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#475569', boxSizing: 'border-box', minHeight: 38 }}>
        {value || '—'}
      </div>
    </div>
  );
}

export default function Page() {
  const { user, loading } = useCurrentUser();
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [gwa, setGwa] = useState('');

  useEffect(() => {
    if (user?.student_profile) {
      setGwa(user.student_profile.gwa ?? '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ gwa: gwa || undefined }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  const p = user?.student_profile;
  const initials = p
    ? `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase()
    : '??';
  const yearLabel = (y: number | undefined) => {
    if (!y) return '—';
    return y === 1 ? '1st Year' : y === 2 ? '2nd Year' : y === 3 ? '3rd Year' : `${y}th Year`;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ width: 36, height: 36, border: `3px solid #f3f4f6`, borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <style>{`.gwa-input:focus { border-color: ${M} !important; box-shadow: 0 0 0 3px ${M}18 !important; }`}</style>

      {/* Avatar card */}
      <div style={{ background: `linear-gradient(135deg, ${M} 0%, ${MD} 60%, #C9A027 100%)`, borderRadius: 18, padding: '28px 28px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', border: '3px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(4px)' }}>
              {initials}
            </div>
            <button onClick={() => photoInputRef.current?.click()} title="Upload photo" style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#fff', border: '2px solid rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#fff' }}>
              {p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : 'My Profile'}
            </h2>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              {p?.program ?? '—'} · {yearLabel(p?.year_level)}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{user?.email ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Read-only registration info */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ background: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Personal Information</h3>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#64748b', background: '#e2e8f0', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            From Registration
          </span>
        </div>
        <div style={{ padding: 24 }}>
          <p style={{ margin: '0 0 18px', fontSize: 12, color: '#94a3b8', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '8px 12px' }}>
            These fields are set during registration and can only be changed by OSFA staff.
          </p>
          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
            <ReadOnlyField label="First Name"      value={p?.first_name ?? ''} />
            <ReadOnlyField label="Last Name"       value={p?.last_name ?? ''} />
            <ReadOnlyField label="Middle Name"     value={p?.middle_name ?? ''} />
            <ReadOnlyField label="Student Number"  value={p?.student_number ?? ''} />
            <ReadOnlyField label="Email Address"   value={user?.email ?? ''} />
            <ReadOnlyField label="College"         value={p?.college ?? ''} />
            <div style={{ gridColumn: '1 / -1' }}>
              <ReadOnlyField label="Program / Course" value={p?.program ?? ''} />
            </div>
            <ReadOnlyField label="Year Level"      value={yearLabel(p?.year_level)} />
          </div>
        </div>
      </div>

      {/* Editable GWA */}
      <form onSubmit={handleSave}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Academic Information</h3>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: M, fontWeight: 600, background: '#fff5f5', padding: '3px 10px', borderRadius: 20, border: `1px solid ${M}30` }}>Editable</span>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ maxWidth: 280 }}>
              <label style={lbl}>General Weighted Average (GWA)</label>
              <input
                type="number" step="0.01" min="1.0" max="5.0"
                className="gwa-input"
                style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#111827', background: '#fff', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                value={gwa}
                onChange={e => setGwa(e.target.value)}
                placeholder="e.g., 1.75"
              />
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                Updates each semester. Lower is better (PUP scale: 1.0 = excellent).
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '11px 28px',
              background: saving ? '#9ca3af' : `linear-gradient(135deg, ${M}, ${MD})`,
              color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : `0 3px 12px ${M}40`,
              transition: 'all 0.15s',
            }}>
            {saving ? 'Saving...' : 'Update GWA'}
          </button>
          {saved && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#15803d', background: '#f0fdf4', padding: '8px 16px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
