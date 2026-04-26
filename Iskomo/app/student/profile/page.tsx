'use client';

import { useRef, useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api';

const TEAL = '#800000';

const input: React.CSSProperties = {
  width: '100%', border: '1px solid #d1d5db', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: '#111827',
  background: '#fff', boxSizing: 'border-box', outline: 'none',
};

const label: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em',
};

export default function Page() {
  const { user, loading } = useCurrentUser();
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name:  '',
    last_name:   '',
    middle_name: '',
    college:     '',
    program:     '',
    year_level:  '',
    gwa:         '',
  });

  useEffect(() => {
    if (user?.student_profile) {
      const p = user.student_profile;
      setForm({
        first_name:  p.first_name ?? '',
        last_name:   p.last_name ?? '',
        middle_name: p.middle_name ?? '',
        college:     p.college ?? '',
        program:     p.program ?? '',
        year_level:  String(p.year_level ?? ''),
        gwa:         p.gwa ?? '',
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          first_name:  form.first_name  || undefined,
          last_name:   form.last_name   || undefined,
          middle_name: form.middle_name || undefined,
          college:     form.college     || undefined,
          program:     form.program     || undefined,
          year_level:  form.year_level ? parseInt(form.year_level) : undefined,
          gwa:         form.gwa         || undefined,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  const initials = user?.student_profile
    ? `${user.student_profile.first_name?.[0] ?? ''}${user.student_profile.last_name?.[0] ?? ''}`.toUpperCase()
    : '??';

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
            {user?.student_profile ? `${user.student_profile.first_name ?? ''} ${user.student_profile.last_name ?? ''}`.trim() : 'My Profile'}
          </h2>
          <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6b7280' }}>
            {user?.student_profile?.program ?? '—'} · {user?.student_profile?.year_level ? `${user.student_profile.year_level}th Year` : '—'}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{user?.email ?? ''}</p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#111827', paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>Personal Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            <div>
              <label style={label}>First Name</label>
              <input type="text" style={input} value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
            </div>
            <div>
              <label style={label}>Last Name</label>
              <input type="text" style={input} value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
            </div>
            <div>
              <label style={label}>Middle Name</label>
              <input type="text" style={input} value={form.middle_name} onChange={e => setForm(p => ({ ...p, middle_name: e.target.value }))} />
            </div>
            <div>
              <label style={label}>Student Number</label>
              <input type="text" style={{ ...input, background: '#f9fafb', color: '#6b7280', cursor: 'not-allowed' }} value={user?.student_profile?.student_number ?? '—'} readOnly />
            </div>
            <div>
              <label style={label}>Email Address</label>
              <input type="email" style={{ ...input, background: '#f9fafb', color: '#6b7280', cursor: 'not-allowed' }} value={user?.email ?? ''} readOnly />
            </div>
            <div>
              <label style={label}>College</label>
              <input type="text" style={input} value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={label}>Program / Course</label>
              <input type="text" style={input} value={form.program} onChange={e => setForm(p => ({ ...p, program: e.target.value }))} />
            </div>
            <div>
              <label style={label}>Year Level</label>
              <select style={input} value={form.year_level} onChange={e => setForm(p => ({ ...p, year_level: e.target.value }))}>
                <option value="">Select year level</option>
                {['1','2','3','4','5'].map(y => <option key={y} value={y}>{y === '1' ? '1st' : y === '2' ? '2nd' : y === '3' ? '3rd' : `${y}th`} Year</option>)}
              </select>
            </div>
            <div>
              <label style={label}>GWA</label>
              <input type="number" step="0.01" min="1.0" max="5.0" style={input} value={form.gwa} onChange={e => setForm(p => ({ ...p, gwa: e.target.value }))} placeholder="e.g., 1.75" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="submit" disabled={saving} style={{ padding: '11px 32px', background: saving ? '#9ca3af' : TEAL, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
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
