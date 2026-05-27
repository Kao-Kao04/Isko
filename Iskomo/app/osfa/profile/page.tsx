'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const TEAL      = COLORS.maroon;
const TEAL_DARK = COLORS.maroonD;
const TEAL_LIGHT = COLORS.maroonL;

type ProfileTab = 'Personal' | 'Security';

export default function Page() {
  const { user, loading: userLoading } = useCurrentUser();

  const [activeTab, setActiveTab] = useState<ProfileTab>('Personal');
  const [pwForm, setPwForm]       = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwError, setPwError]     = useState('');
  const [pwOk, setPwOk]           = useState('');

  const [form, setForm] = useState({ email: '', department: '' });

  useEffect(() => {
    if (!user) return;
    setForm({ email: user.email ?? '', department: user.department ?? '' });
  }, [user]);

  async function handlePasswordChange() {
    if (pwForm.next !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    if (pwForm.next.length < 8)         { setPwError('New password must be at least 8 characters.'); return; }
    setPwSaving(true); setPwError(''); setPwOk('');
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

  const initials   = user?.email ? user.email.slice(0, 2).toUpperCase() : 'OS';
  const isSuperAdmin = user?.role === 'super_admin';
  const roleLabel  = isSuperAdmin ? 'Super Admin' : 'OSFA Staff';
  const deptLabel  = isSuperAdmin                  ? 'All Departments'
                   : user?.department === 'public'  ? 'Public Scholarships'
                   : user?.department === 'private' ? 'Private Scholarships'
                   : 'OSFA';
  const deptColor  = isSuperAdmin                  ? { bg: '#fdf2f8', text: '#9d174d' }
                   : user?.department === 'private' ? { bg: '#fdf4ff', text: '#7e22ce' }
                   : { bg: '#f0fdf4', text: '#15803d' };

  const TABS: ProfileTab[] = ['Personal', 'Security'];

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
        <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
        <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Profile</span>
      </div>

      {/* ── Hero card ── */}
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e5e7eb', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'visible' }}>
        {/* Banner */}
        <div style={{ height: 110, background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 55%, #C9A027 100%)`, borderRadius: '18px 18px 0 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40,  width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -60, right: 80, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        </div>

        {/* Avatar + info row */}
        <div style={{ padding: '0 28px 22px', display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar — overlaps banner */}
          <div style={{
            width: 82, height: 82, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 26, fontWeight: 800,
            border: '4px solid #fff', boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            marginTop: -41, position: 'relative', zIndex: 1,
          }}>
            {userLoading ? '…' : initials}
          </div>

          {/* Name + badges */}
          <div style={{ flex: 1, minWidth: 200, paddingBottom: 2 }}>
            <h1 style={{ margin: '0 0 7px', fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>
              {userLoading ? 'Loading…' : form.email}
            </h1>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 11px', borderRadius: 20, background: '#eff6ff', color: '#1d4ed8' }}>
                {roleLabel}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 11px', borderRadius: 20, background: deptColor.bg, color: deptColor.text }}>
                {deptLabel}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 11px', borderRadius: 20, background: TEAL_LIGHT, color: TEAL }}>
                ✓ Verified Staff
              </span>
            </div>
          </div>

          {/* Managed by Admin */}
          <div style={{ paddingBottom: 2 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, color: '#64748b', fontWeight: 500 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Managed by Admin
            </span>
          </div>
        </div>
      </div>

      {/* ── Body grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

        {/* Main panel */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

          {/* Tabs */}
          <div style={{ borderBottom: '1px solid #f3f4f6', display: 'flex', padding: '0 4px' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '16px 24px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? TEAL : '#6b7280',
                borderBottom: activeTab === tab ? `2px solid ${TEAL}` : '2px solid transparent',
                marginBottom: -1,
              }}>
                {tab}
              </button>
            ))}
          </div>

          <div style={{ padding: '28px 32px' }}>

            {/* Personal tab */}
            {activeTab === 'Personal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Account Information</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Your account details are managed by the system administrator.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Email Address
                    </label>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                      {form.email || '—'}
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>Cannot be changed. Contact admin.</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Department
                    </label>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                      {deptLabel}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Role
                    </label>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                      {roleLabel}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Account Status
                    </label>
                    <div style={{ padding: '10px 14px', background: user?.is_active ? '#f0fdf4' : '#fef2f2', border: `1px solid ${user?.is_active ? '#bbf7d0' : '#fecaca'}`, borderRadius: 9, fontSize: 13, color: user?.is_active ? '#15803d' : '#dc2626', fontWeight: 600 }}>
                      {user?.is_active ? '● Active' : '● Inactive'}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px 18px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                    Additional profile fields (name, phone, position) will be available in a future update. For any changes, please contact your system administrator.
                  </p>
                </div>
              </div>
            )}

            {/* Security tab */}
            {activeTab === 'Security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Change Password</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Use a strong password with at least 8 characters.</p>
                </div>

                <div style={{ padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Password Security</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Keep your account secure by using a unique password.</div>
                  </div>
                </div>

                {pwError && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>{pwError}</div>
                )}
                {pwOk && (
                  <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#15803d' }}>{pwOk}</div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Current Password',     key: 'current',  placeholder: 'Enter current password' },
                    { label: 'New Password',          key: 'next',     placeholder: 'At least 8 characters' },
                    { label: 'Confirm New Password',  key: 'confirm',  placeholder: 'Repeat new password' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                      <input
                        type="password"
                        placeholder={f.placeholder}
                        value={pwForm[f.key as keyof typeof pwForm]}
                        onChange={e => { setPwForm(p => ({ ...p, [f.key]: e.target.value })); setPwError(''); }}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
                  style={{
                    padding: '12px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    background: (pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm) ? '#e5e7eb' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                    color: (pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm) ? '#9ca3af' : '#fff',
                    boxShadow: (!pwSaving && pwForm.current && pwForm.next && pwForm.confirm) ? `0 4px 12px ${TEAL}40` : 'none',
                  }}>
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Account Details */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Account Details</h3>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Role',         value: roleLabel,       highlight: false },
                { label: 'Department',   value: deptLabel,       highlight: false },
                { label: 'Status',       value: user?.is_active ? 'Active' : 'Inactive', highlight: true, ok: user?.is_active },
                { label: 'Verified',     value: user?.is_verified ? 'Verified' : 'Unverified', highlight: true, ok: user?.is_verified },
                { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—', highlight: false },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{row.label}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: row.highlight ? (row.ok ? '#059669' : '#dc2626') : '#111827',
                  }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Quick Links</h3>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Dashboard',    href: '/osfa/dashboard',    icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
                { label: 'Applicants',   href: '/osfa/applicants',   icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
                { label: 'Scholarships', href: '/osfa/scholarships', icon: 'M22 10v6M2 10l10-5 10 5-10 5z' },
                { label: 'Scholars',     href: '/osfa/scholars',     icon: 'M12 14l9-5-9-5-9 5 9 5z' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', color: '#374151', fontSize: 13, fontWeight: 500, background: '#fafafa', border: '1px solid #f0f0f0', transition: 'background 0.15s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><path d={link.icon}/></svg>
                  <span style={{ flex: 1 }}>{link.label}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
