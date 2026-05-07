'use client';

import { useRef, useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;

const readonlyInput: React.CSSProperties = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: '#6b7280',
  background: '#f9fafb', boxSizing: 'border-box', outline: 'none',
  cursor: 'default',
};

const editableInput: React.CSSProperties = {
  width: '100%', border: '1px solid #d1d5db', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: '#111827',
  background: '#fff', boxSizing: 'border-box', outline: 'none',
};

const label: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em',
};

function ReadOnlyField({ lbl, value }: { lbl: string; value: string }) {
  return (
    <div>
      <label style={label}>{lbl}</label>
      <input type="text" style={readonlyInput} value={value} readOnly />
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
        <div style={{ width: 36, height: 36, border: `3px solid #f3f4f6`, borderTop: `3px solid ${TEAL}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>

      {/* Avatar */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff', border: '3px solid #fecaca' }}>
            {initials}
          </div>
          <button onClick={() => photoInputRef.current?.click()} title="Upload photo" style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '2px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} />
        </div>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#111827' }}>
            {p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : 'My Profile'}
          </h2>
          <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6b7280' }}>
            {p?.program ?? '—'} · {yearLabel(p?.year_level)}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{user?.email ?? ''}</p>
        </div>
      </div>

      {/* Read-only registration info */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Personal Information</h3>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            From Registration
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
          <ReadOnlyField lbl="First Name"      value={p?.first_name ?? '—'} />
          <ReadOnlyField lbl="Last Name"       value={p?.last_name ?? '—'} />
          <ReadOnlyField lbl="Middle Name"     value={p?.middle_name ?? '—'} />
          <ReadOnlyField lbl="Student Number"  value={p?.student_number ?? '—'} />
          <ReadOnlyField lbl="Email Address"   value={user?.email ?? '—'} />
          <ReadOnlyField lbl="College"         value={p?.college ?? '—'} />
          <div style={{ gridColumn: '1 / -1' }}>
            <ReadOnlyField lbl="Program / Course" value={p?.program ?? '—'} />
          </div>
          <ReadOnlyField lbl="Year Level"      value={yearLabel(p?.year_level)} />
        </div>
      </div>

      {/* Editable GWA only */}
      <form onSubmit={handleSave}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#111827', paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>Academic Information</h3>
          <div style={{ maxWidth: 240 }}>
            <label style={label}>General Weighted Average (GWA)</label>
            <input
              type="number" step="0.01" min="1.0" max="5.0"
              style={editableInput}
              value={gwa}
              onChange={e => setGwa(e.target.value)}
              placeholder="e.g., 1.75"
            />
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9ca3af' }}>Updates each semester. Lower is better (PUP scale).</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="submit" disabled={saving} style={{ padding: '11px 32px', background: saving ? '#9ca3af' : TEAL, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Update GWA'}
          </button>
          {saved && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: TEAL }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
