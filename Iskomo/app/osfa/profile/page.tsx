'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api';

const TEAL = '#800000';
const TEAL_DARK = '#5C0000';
const TEAL_LIGHT = '#fff5f5';

type ProfileTab = 'Personal' | 'Security';

export default function Page() {
  const { user, loading: userLoading } = useCurrentUser();

  const [activeTab, setActiveTab]   = useState<ProfileTab>('Personal');
  const [editMode, setEditMode]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState('');
  const [saveOk, setSaveOk]         = useState('');

  const [pwForm, setPwForm]           = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving]       = useState(false);
  const [pwError, setPwError]         = useState('');
  const [pwOk, setPwOk]               = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName:  '',
    email:     '',
    department: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName:  '',
      lastName:   '',
      email:      user.email ?? '',
      department: user.department ?? '',
    });
  }, [user]);

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    setSaveOk('');
    try {
      await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({}),
      });
      setSaveOk('Profile updated.');
      setEditMode(false);
      setTimeout(() => setSaveOk(''), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange() {
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    setPwSaving(true);
    setPwError('');
    setPwOk('');
    try {
      await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.next }),
      });
      setPwOk('Password updated successfully.');
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwOk(''), 4000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setPwSaving(false);
    }
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'OS';
  const deptLabel = user?.department === 'public' ? 'Public Scholarships' : user?.department === 'private' ? 'Private Scholarships' : 'OSFA';

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
    color: '#111827', outline: 'none', boxSizing: 'border-box',
    border: `1px solid ${editMode ? '#e5e7eb' : '#f3f4f6'}`,
    background: editMode ? '#fff' : '#fafafa',
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
        <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
        <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Profile</span>
      </div>

      {/* Profile header */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ height: 100, background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 60%, #C9A027 100%)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div style={{ padding: '0 28px 24px', display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: -28, flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26, fontWeight: 800, border: '4px solid #fff', flexShrink: 0 }}>
            {userLoading ? '…' : initials}
          </div>
          <div style={{ flex: 1, paddingTop: 36, minWidth: 200 }}>
            <h1 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#111827' }}>
              {userLoading ? 'Loading…' : form.email}
            </h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#eff6ff', color: '#1d4ed8' }}>
                OSFA Staff
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: user?.department === 'private' ? '#fdf4ff' : '#f0fdf4', color: user?.department === 'private' ? '#7e22ce' : '#15803d' }}>
                {deptLabel}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: TEAL_LIGHT, color: TEAL }}>
                Verified Staff
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingTop: 36 }}>
            {activeTab === 'Personal' && (
              editMode ? (
                <>
                  <button onClick={() => { setEditMode(false); setSaveError(''); }} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} style={{ padding: '8px 18px', background: saving ? '#9ca3af' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Profile
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Tab body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ borderBottom: '1px solid #f3f4f6', display: 'flex' }}>
            {(['Personal', 'Security'] as ProfileTab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '14px', border: 'none', background: 'none', color: activeTab === tab ? TEAL : '#6b7280', fontWeight: activeTab === tab ? 700 : 500, fontSize: 13, cursor: 'pointer', borderBottom: activeTab === tab ? `2px solid ${TEAL}` : '2px solid transparent' }}>
                {tab}
              </button>
            ))}
          </div>

          <div style={{ padding: '24px 28px' }}>

            {activeTab === 'Personal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {saveError && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>{saveError}</div>
                )}
                {saveOk && (
                  <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#15803d' }}>{saveOk}</div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address</label>
                  <input type="email" value={form.email} readOnly style={{ ...inp, background: '#fafafa', border: '1px solid #f3f4f6', color: '#6b7280' }} />
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>Email cannot be changed. Contact admin if needed.</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department</label>
                  <input type="text" value={deptLabel} readOnly style={{ ...inp, background: '#fafafa', border: '1px solid #f3f4f6', color: '#6b7280' }} />
                </div>
                <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  Additional profile fields (name, phone, position) will be available in a future update. For changes contact your system administrator.
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Change your account password</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Use a strong password with at least 8 characters.</div>
                  </div>
                </div>

                {pwError && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>{pwError}</div>
                )}
                {pwOk && (
                  <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#15803d' }}>{pwOk}</div>
                )}

                {[
                  { label: 'Current Password', key: 'current' },
                  { label: 'New Password',     key: 'next' },
                  { label: 'Confirm New Password', key: 'confirm' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={pwForm[f.key as keyof typeof pwForm]}
                      onChange={e => { setPwForm(p => ({ ...p, [f.key]: e.target.value })); setPwError(''); }}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}

                <button
                  onClick={handlePasswordChange}
                  disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
                  style={{ padding: '11px', background: (pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm) ? '#9ca3af' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: (pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm) ? 'not-allowed' : 'pointer' }}>
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Account Details</h3>
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Role',       value: 'OSFA Staff' },
              { label: 'Status',     value: user?.is_active ? 'Active' : 'Inactive' },
              { label: 'Verified',   value: user?.is_verified ? 'Yes' : 'No' },
              { label: 'Department', value: deptLabel },
              { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
            ].map(row => (
              <div key={row.label}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{row.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: row.value === 'Active' || row.value === 'Yes' ? '#059669' : '#111827' }}>{row.value}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Dashboard',      href: '/osfa/dashboard' },
              { label: 'Applicants',     href: '/osfa/applicants' },
              { label: 'Scholarships',   href: '/osfa/scholarships' },
              { label: 'Scholars',       href: '/osfa/scholars' },
            ].map(link => (
              <Link key={link.label} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: 13, fontWeight: 500, background: '#fafafa', border: '1px solid #f3f4f6' }}>
                {link.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
