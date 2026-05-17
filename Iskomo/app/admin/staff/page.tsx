'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminApi, type StaffResponse } from '@/lib/api-client';
import { apiFetch } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';

// Redirect old ?tab= URLs to proper routes
function TabRedirect() {
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const tab = params.get('tab');
    const redirects: Record<string, string> = {
      dashboard:  '/admin/dashboard',
      students:   '/admin/students',
      audit:      '/admin/audit',
      broadcast:  '/admin/broadcast',
      reports:    '/admin/reports',
    };
    if (tab && redirects[tab]) router.replace(redirects[tab]);
  }, [params, router]);
  return null;
}

const M = COLORS.maroon;

const DEPT_CONFIG = {
  public:  { label: 'Public',  bg: '#eff6ff', color: '#1d4ed8', desc: "Gov't / State-funded" },
  private: { label: 'Private', bg: '#fdf4ff', color: '#7e22ce', desc: 'Corporate / Foundation' },
};

const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' };

function Spin() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>;
}
function fmt(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function initials(email: string) { return email.split('@')[0].slice(0, 2).toUpperCase(); }

export default function AdminStaffPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [staff,        setStaff]        = useState<StaffResponse[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [formEmail,    setFormEmail]    = useState('');
  const [formPass,     setFormPass]     = useState('');
  const [formDept,     setFormDept]     = useState<'public' | 'private'>('public');
  const [showPass,     setShowPass]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [formError,    setFormError]    = useState('');
  const [editingStaff, setEditingStaff] = useState<StaffResponse | null>(null);
  const [editDept,     setEditDept]     = useState<'public' | 'private'>('public');
  const [editSaving,   setEditSaving]   = useState(false);
  const [confirmToggle,setConfirmToggle]= useState<StaffResponse | null>(null);
  const [toggling,     setToggling]     = useState(false);
  const [confirmDelete,setConfirmDelete]= useState<StaffResponse | null>(null);
  const [deleting,     setDeleting]     = useState(false);
  const [resetTarget,  setResetTarget]  = useState<StaffResponse | null>(null);
  const [newPassword,  setNewPassword]  = useState('');
  const [showNewPass,  setShowNewPass]  = useState(false);
  const [resetting,    setResetting]    = useState(false);
  const [search,       setSearch]       = useState('');

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try { setStaff(await adminApi.listStaff()); }
    catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setFormError('');
    if (formPass.length < 8) { setFormError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      const created = await adminApi.createStaff({ email: formEmail.trim(), password: formPass, department: formDept });
      setStaff(prev => [created, ...prev]);
      setShowForm(false); setFormEmail(''); setFormPass(''); setFormDept('public');
      addToast('success', `Staff account created for ${created.email}`);
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Failed to create account.'); }
    finally { setSaving(false); }
  }

  async function handleEditDept() {
    if (!editingStaff) return; setEditSaving(true);
    try {
      const updated = await adminApi.updateStaff(editingStaff.id, { department: editDept });
      setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
      addToast('success', 'Department updated.'); setEditingStaff(null);
    } catch { addToast('error', 'Failed to update department.'); }
    finally { setEditSaving(false); }
  }

  async function handleToggleActive() {
    if (!confirmToggle) return; setToggling(true);
    try {
      const updated = await adminApi.updateStaff(confirmToggle.id, { is_active: !confirmToggle.is_active });
      setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
      addToast('success', `Account ${updated.is_active ? 'reactivated' : 'deactivated'}.`); setConfirmToggle(null);
    } catch { addToast('error', 'Failed to update status.'); }
    finally { setToggling(false); }
  }

  async function handleDeleteStaff() {
    if (!confirmDelete) return; setDeleting(true);
    try {
      await apiFetch(`/api/admin/staff/${confirmDelete.id}`, { method: 'DELETE' });
      setStaff(prev => prev.filter(s => s.id !== confirmDelete.id));
      addToast('success', 'Staff account permanently deleted.'); setConfirmDelete(null);
    } catch (err) { addToast('error', err instanceof Error ? err.message : 'Failed to delete.'); }
    finally { setDeleting(false); }
  }

  async function handleResetPassword() {
    if (!resetTarget || newPassword.length < 8) return; setResetting(true);
    try {
      await apiFetch(`/api/admin/staff/${resetTarget.id}/reset-password`, { method: 'PATCH', body: JSON.stringify({ new_password: newPassword }) });
      addToast('success', `Password reset for ${resetTarget.email}.`); setResetTarget(null); setNewPassword('');
    } catch (err) { addToast('error', err instanceof Error ? err.message : 'Failed to reset password.'); }
    finally { setResetting(false); }
  }

  const displayed = search.trim() ? staff.filter(s => s.email.toLowerCase().includes(search.toLowerCase())) : staff;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Suspense fallback={null}><TabRedirect /></Suspense>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>OSFA Staff</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Manage staff accounts and department assignments</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email…" style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 20, fontSize: 12, outline: 'none', width: 200 }} />
          </div>
          <button onClick={() => { setShowForm(true); setFormError(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: `linear-gradient(135deg, ${M}, #5C0000)`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: `0 2px 8px ${M}40` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Staff
          </button>
        </div>
      </div>

      {loading ? <Spin /> : displayed.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{search ? 'No staff match your search.' : 'No staff accounts yet'}</div>
          {!search && <button onClick={() => setShowForm(true)} style={{ padding: '9px 20px', background: M, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add Staff</button>}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Staff Account', 'Department', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((s, i) => {
                const dept = s.department ? DEPT_CONFIG[s.department] : null;
                return (
                  <tr key={s.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid #f3f4f6' : 'none', opacity: s.is_active ? 1 : 0.6 }}>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: s.is_active ? `linear-gradient(135deg, ${M}, #5C0000)` : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.is_active ? '#fff' : '#9ca3af', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{initials(s.email)}</div>
                        <div><div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.email}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>ID #{s.id}</div></div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>{dept ? <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: dept.bg, color: dept.color, fontSize: 11, fontWeight: 700 }}>{dept.label}</span> : <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>}</td>
                    <td style={{ padding: '13px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: s.is_active ? '#f0fdf4' : '#f3f4f6', color: s.is_active ? '#059669' : '#9ca3af', fontSize: 11, fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: s.is_active ? '#10b981' : '#d1d5db' }} />{s.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ padding: '13px 16px', fontSize: 12, color: '#6b7280' }}>{fmt(s.created_at)}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <button onClick={() => { setEditingStaff(s); setEditDept(s.department ?? 'public'); }} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb', color: '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => { setResetTarget(s); setNewPassword(''); }} style={{ padding: '5px 10px', border: '1px solid #bfdbfe', borderRadius: 6, background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reset PW</button>
                        <button onClick={() => setConfirmToggle(s)} style={{ padding: '5px 10px', border: `1px solid ${s.is_active ? '#fecaca' : '#bbf7d0'}`, borderRadius: 6, background: s.is_active ? '#fef2f2' : '#f0fdf4', color: s.is_active ? '#dc2626' : '#059669', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{s.is_active ? 'Deactivate' : 'Reactivate'}</button>
                        <button onClick={() => setConfirmDelete(s)} style={{ padding: '5px 10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODALS ── */}
      {showForm && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Add OSFA Staff</h2>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>Create a new OSFA staff account and assign their department.</p>
            {formError && <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>{formError}</div>}
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="osfa.staff@pup.edu.ph" style={inp} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password <span style={{ color: '#dc2626' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={formPass} onChange={e => setFormPass(e.target.value)} placeholder="Min. 8 characters" style={{ ...inp, paddingRight: 40 }} required minLength={8} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{showPass ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Department <span style={{ color: '#dc2626' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(['public', 'private'] as const).map(dept => {
                    const cfg = DEPT_CONFIG[dept]; const sel = formDept === dept;
                    return (
                      <label key={dept} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 16px', borderRadius: 10, border: `2px solid ${sel ? cfg.color : '#e5e7eb'}`, background: sel ? cfg.bg : '#f9fafb', cursor: 'pointer' }}>
                        <input type="radio" name="dept" value={dept} checked={sel} onChange={() => setFormDept(dept)} style={{ display: 'none' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: sel ? cfg.color : '#374151' }}>{cfg.label}</span>
                        <span style={{ fontSize: 11, color: sel ? cfg.color : '#9ca3af' }}>{cfg.desc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: 11, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: 11, border: 'none', borderRadius: 9, background: saving ? '#9ca3af' : `linear-gradient(135deg, ${M}, #5C0000)`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Creating…' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingStaff && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setEditingStaff(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Change Department</h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>Updating for <strong>{editingStaff.email}</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {(['public', 'private'] as const).map(dept => {
                const cfg = DEPT_CONFIG[dept]; const sel = editDept === dept;
                return (
                  <label key={dept} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 16px', borderRadius: 10, border: `2px solid ${sel ? cfg.color : '#e5e7eb'}`, background: sel ? cfg.bg : '#f9fafb', cursor: 'pointer' }}>
                    <input type="radio" name="editDept" value={dept} checked={sel} onChange={() => setEditDept(dept)} style={{ display: 'none' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: sel ? cfg.color : '#374151' }}>{cfg.label}</span>
                    <span style={{ fontSize: 11, color: sel ? cfg.color : '#9ca3af' }}>{cfg.desc}</span>
                  </label>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditingStaff(null)} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleEditDept} disabled={editSaving} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: editSaving ? '#9ca3af' : M, color: '#fff', fontSize: 14, fontWeight: 600, cursor: editSaving ? 'not-allowed' : 'pointer' }}>{editSaving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {resetTarget && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setResetTarget(null); setNewPassword(''); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Reset Password</h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>Set a new password for <strong>{resetTarget.email}</strong></p>
            <div style={{ marginBottom: 22, position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>New Password <span style={{ color: '#dc2626' }}>*</span></label>
              <input type={showNewPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" style={{ ...inp, paddingRight: 40 }} minLength={8} />
              <button type="button" onClick={() => setShowNewPass(p => !p)} style={{ position: 'absolute', right: 10, bottom: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{showNewPass ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setResetTarget(null); setNewPassword(''); }} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleResetPassword} disabled={resetting || newPassword.length < 8} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: resetting || newPassword.length < 8 ? '#9ca3af' : '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: resetting || newPassword.length < 8 ? 'not-allowed' : 'pointer' }}>{resetting ? 'Resetting…' : 'Reset Password'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmToggle && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmToggle(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{confirmToggle.is_active ? 'Deactivate' : 'Reactivate'} Account</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              {confirmToggle.is_active ? <>Deactivate <strong>{confirmToggle.email}</strong>? They will lose access immediately.</> : <>Reactivate <strong>{confirmToggle.email}</strong>? They will regain full access.</>}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmToggle(null)} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleToggleActive} disabled={toggling} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: confirmToggle.is_active ? '#dc2626' : '#059669', color: '#fff', fontSize: 14, fontWeight: 600, cursor: toggling ? 'not-allowed' : 'pointer' }}>{toggling ? 'Processing…' : confirmToggle.is_active ? 'Deactivate' : 'Reactivate'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Delete Staff Account</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>Permanently delete <strong>{confirmDelete.email}</strong>? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteStaff} disabled={deleting} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: deleting ? '#9ca3af' : '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer' }}>{deleting ? 'Deleting…' : 'Delete Permanently'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
