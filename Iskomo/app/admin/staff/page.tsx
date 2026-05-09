'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, type StaffResponse } from '@/lib/api-client';
import { apiFetch, getAccessToken } from '@/lib/api';
import { COLORS } from '@/lib/theme';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';

const MAROON = COLORS.maroon;

const DEPT_CONFIG = {
  public:  { label: 'Public',  bg: '#eff6ff', color: '#1d4ed8', desc: "Gov't / State-funded" },
  private: { label: 'Private', bg: '#fdf4ff', color: '#7e22ce', desc: 'Corporate / Foundation' },
};

const ACCT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  unregistered:         { bg: '#f3f4f6', color: '#6b7280',  label: 'Unregistered' },
  pending_verification: { bg: '#fef3c7', color: '#92400e',  label: 'Pending Review' },
  verified:             { bg: '#dcfce7', color: '#15803d',  label: 'Verified' },
  rejected:             { bg: '#fee2e2', color: '#dc2626',  label: 'Rejected' },
  approved:             { bg: '#dcfce7', color: '#15803d',  label: 'Approved' },
};

type TabKey = 'dashboard' | 'staff' | 'students' | 'audit' | 'broadcast' | 'reports';

interface AdminStats {
  students:     { total: number; pending_verification: number; verified: number; rejected: number; unregistered: number };
  staff:        { total: number; active: number };
  scholarships: { total: number; active: number; draft: number; archived: number };
  applications: { total: number; pending: number; approved: number; rejected: number; withdrawn: number };
}

interface AdminStudent {
  id: number;
  email: string;
  account_status: string;
  created_at: string;
  student_profile: { first_name: string; last_name: string; student_number: string; college: string; program: string } | null;
}

interface AuditLog {
  id: number;
  application_id: number | null;
  actor_email: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
}

interface Paginated<T> { items: T[]; total: number; page: number; }

const PAGE_SIZE = 20;

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtDt(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function initials(email: string) { return email.split('@')[0].slice(0, 2).toUpperCase(); }

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
  borderRadius: 8, fontSize: 13, color: '#111827', background: '#f9fafb',
  outline: 'none', boxSizing: 'border-box',
};

function Spin() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTop: `3px solid ${MAROON}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'staff',     label: 'Staff Management' },
  { key: 'students',  label: 'Students' },
  { key: 'audit',     label: 'Audit Logs' },
  { key: 'broadcast', label: 'Broadcast' },
  { key: 'reports',   label: 'Reports' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const { toasts, addToast, removeToast } = useToast();

  function showToast(type: 'success' | 'error', msg: string) {
    addToast(type, msg);
  }

  // ── Dashboard ──
  const [stats, setStats]             = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try { setStats(await apiFetch<AdminStats>('/api/admin/stats')); }
    catch { /* silent */ } finally { setStatsLoading(false); }
  }, []);

  // ── Staff ──
  const [staff, setStaff]               = useState<StaffResponse[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);

  const [showForm, setShowForm]   = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPass, setFormPass]   = useState('');
  const [formDept, setFormDept]   = useState<'public' | 'private'>('public');
  const [showPass, setShowPass]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');

  const [editingStaff, setEditingStaff] = useState<StaffResponse | null>(null);
  const [editDept, setEditDept]         = useState<'public' | 'private'>('public');
  const [editSaving, setEditSaving]     = useState(false);

  const [confirmToggle, setConfirmToggle] = useState<StaffResponse | null>(null);
  const [toggling, setToggling]           = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<StaffResponse | null>(null);
  const [deleting, setDeleting]           = useState(false);

  const [resetTarget, setResetTarget] = useState<StaffResponse | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [resetting, setResetting]     = useState(false);

  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    try { setStaff(await adminApi.listStaff()); }
    catch { /* silent */ } finally { setStaffLoading(false); }
  }, []);

  // ── Students ──
  const [students, setStudents]           = useState<AdminStudent[]>([]);
  const [studentsPage, setStudentsPage]   = useState(1);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [studentFilter, setStudentFilter] = useState('all');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsFetched, setStudentsFetched] = useState(false);

  const [approvingId, setApprovingId]   = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminStudent | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [rejecting, setRejecting]       = useState(false);

  const fetchStudents = useCallback(async (page = 1, filter = 'all') => {
    setStudentsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
      if (filter !== 'all') params.set('account_status', filter);
      const res = await apiFetch<Paginated<AdminStudent>>(`/api/admin/students?${params}`);
      setStudents(res.items);
      setStudentsTotal(res.total);
      setStudentsFetched(true);
    } catch { /* silent */ } finally { setStudentsLoading(false); }
  }, []);

  // ── Audit ──
  const [auditLogs, setAuditLogs]     = useState<AuditLog[]>([]);
  const [auditPage, setAuditPage]     = useState(1);
  const [auditTotal, setAuditTotal]   = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFetched, setAuditFetched] = useState(false);

  const fetchAudit = useCallback(async (page = 1) => {
    setAuditLoading(true);
    try {
      const res = await apiFetch<{ total: number; page: number; items: AuditLog[] }>(`/api/admin/audit?page=${page}&page_size=20`);
      setAuditLogs(res.items);
      setAuditTotal(res.total);
      setAuditFetched(true);
    } catch { /* silent */ } finally { setAuditLoading(false); }
  }, []);

  // ── Broadcast ──
  const [bcastTitle, setBcastTitle]   = useState('');
  const [bcastBody, setBcastBody]     = useState('');
  const [bcastTarget, setBcastTarget] = useState<'all' | 'students' | 'osfa_staff'>('all');
  const [bcasting, setBcasting]       = useState(false);

  // ── Reports ──
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});

  // Initial load
  useEffect(() => { fetchStats(); fetchStaff(); }, [fetchStats, fetchStaff]);

  // Lazy load on first tab visit
  useEffect(() => {
    if (activeTab === 'students' && !studentsFetched) fetchStudents(1, studentFilter);
    if (activeTab === 'audit'    && !auditFetched)    fetchAudit(1);
  }, [activeTab, studentsFetched, auditFetched, fetchStudents, fetchAudit, studentFilter]);

  // ── Handlers ──
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (formPass.length < 8) { setFormError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      const created = await adminApi.createStaff({ email: formEmail.trim(), password: formPass, department: formDept });
      setStaff(prev => [created, ...prev]);
      setShowForm(false); setFormEmail(''); setFormPass(''); setFormDept('public');
      showToast('success', `Staff account created for ${created.email}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create account.');
    } finally { setSaving(false); }
  }

  async function handleEditDept() {
    if (!editingStaff) return;
    setEditSaving(true);
    try {
      const updated = await adminApi.updateStaff(editingStaff.id, { department: editDept });
      setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast('success', 'Department updated.'); setEditingStaff(null);
    } catch { showToast('error', 'Failed to update department.'); }
    finally { setEditSaving(false); }
  }

  async function handleToggleActive() {
    if (!confirmToggle) return;
    setToggling(true);
    try {
      const updated = await adminApi.updateStaff(confirmToggle.id, { is_active: !confirmToggle.is_active });
      setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast('success', `Account ${updated.is_active ? 'reactivated' : 'deactivated'}.`);
      setConfirmToggle(null);
    } catch { showToast('error', 'Failed to update status.'); }
    finally { setToggling(false); }
  }

  async function handleDeleteStaff() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/staff/${confirmDelete.id}`, { method: 'DELETE' });
      setStaff(prev => prev.filter(s => s.id !== confirmDelete.id));
      showToast('success', 'Staff account permanently deleted.'); setConfirmDelete(null);
    } catch (err) { showToast('error', err instanceof Error ? err.message : 'Failed to delete.'); }
    finally { setDeleting(false); }
  }

  async function handleResetPassword() {
    if (!resetTarget || newPassword.length < 8) return;
    setResetting(true);
    try {
      await apiFetch(`/api/admin/staff/${resetTarget.id}/reset-password`, {
        method: 'PATCH', body: JSON.stringify({ new_password: newPassword }),
      });
      showToast('success', `Password reset for ${resetTarget.email}.`);
      setResetTarget(null); setNewPassword('');
    } catch (err) { showToast('error', err instanceof Error ? err.message : 'Failed to reset password.'); }
    finally { setResetting(false); }
  }

  async function handleApprove(student: AdminStudent) {
    setApprovingId(student.id);
    try {
      await apiFetch(`/api/users/${student.id}/approve`, { method: 'PATCH' });
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, account_status: 'verified' } : s));
      showToast('success', `${student.student_profile?.first_name ?? student.email} approved.`);
    } catch (err) { showToast('error', err instanceof Error ? err.message : 'Failed to approve.'); }
    finally { setApprovingId(null); }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await apiFetch(`/api/users/${rejectTarget.id}/reject`, {
        method: 'PATCH', body: JSON.stringify({ remarks: rejectRemarks }),
      });
      setStudents(prev => prev.map(s => s.id === rejectTarget.id ? { ...s, account_status: 'rejected' } : s));
      showToast('success', 'Registration rejected.'); setRejectTarget(null); setRejectRemarks('');
    } catch (err) { showToast('error', err instanceof Error ? err.message : 'Failed to reject.'); }
    finally { setRejecting(false); }
  }

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!bcastTitle.trim() || !bcastBody.trim()) return;
    setBcasting(true);
    try {
      const data = await apiFetch<{ message: string }>('/api/admin/broadcast', {
        method: 'POST', body: JSON.stringify({ title: bcastTitle.trim(), body: bcastBody.trim(), target: bcastTarget }),
      });
      showToast('success', data.message ?? 'Broadcast sent successfully.');
      setBcastTitle(''); setBcastBody('');
    } catch (err) { showToast('error', err instanceof Error ? err.message : 'Failed to send broadcast.'); }
    finally { setBcasting(false); }
  }

  async function downloadReport(type: string) {
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
      a.href = url; a.download = `iskowo_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      showToast('success', `${type} report downloaded.`);
    } catch (err) { showToast('error', err instanceof Error ? err.message : 'Download failed.'); }
    finally { setDownloading(prev => ({ ...prev, [type]: false })); }
  }

  const totalPages = (total: number) => Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>Super Admin Panel</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Full system access — IskoMo scholarship management</p>
        </div>
        {activeTab === 'staff' && (
          <button onClick={() => { setShowForm(true); setFormError(''); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: `linear-gradient(135deg, ${MAROON}, #5C0000)`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: `0 2px 8px ${MAROON}40` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Staff
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #f3f4f6', marginBottom: 28, overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '10px 22px', background: 'none', border: 'none', borderBottom: activeTab === tab.key ? `2px solid ${MAROON}` : '2px solid transparent', marginBottom: -2, fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500, color: activeTab === tab.key ? MAROON : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {activeTab === 'dashboard' && (
        statsLoading ? <Spin /> : !stats ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af', fontSize: 13 }}>Failed to load stats. <button onClick={fetchStats} style={{ color: MAROON, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Retry</button></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Students row */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Students</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Total',          value: stats.students.total,                color: '#374151', bg: '#f9fafb',  border: '#e5e7eb' },
                  { label: 'Pending Review', value: stats.students.pending_verification, color: '#d97706', bg: '#fffbeb',  border: '#fde68a' },
                  { label: 'Verified',       value: stats.students.verified,             color: '#059669', bg: '#f0fdf4',  border: '#bbf7d0' },
                  { label: 'Rejected',       value: stats.students.rejected,             color: '#dc2626', bg: '#fef2f2',  border: '#fecaca' },
                  { label: 'Unregistered',   value: stats.students.unregistered,         color: '#6b7280', bg: '#f3f4f6',  border: '#e5e7eb' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 12, border: `1px solid ${s.border}`, padding: '18px 20px' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 5 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Three panels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {/* Staff */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Staff</div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div><div style={{ fontSize: 30, fontWeight: 800, color: '#374151' }}>{stats.staff.total}</div><div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>Total</div></div>
                  <div><div style={{ fontSize: 30, fontWeight: 800, color: '#059669' }}>{stats.staff.active}</div><div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>Active</div></div>
                  <div><div style={{ fontSize: 30, fontWeight: 800, color: '#9ca3af' }}>{stats.staff.total - stats.staff.active}</div><div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>Inactive</div></div>
                </div>
              </div>

              {/* Scholarships */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Scholarships</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Total',    value: stats.scholarships.total,    color: '#374151' },
                    { label: 'Active',   value: stats.scholarships.active,   color: '#059669' },
                    { label: 'Draft',    value: stats.scholarships.draft,    color: '#6b7280' },
                    { label: 'Archived', value: stats.scholarships.archived, color: '#9ca3af' },
                  ].map(s => (
                    <div key={s.label}><div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{s.label}</div></div>
                  ))}
                </div>
              </div>

              {/* Applications */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Applications</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Total',    value: stats.applications.total,    color: '#374151' },
                    { label: 'Pending',  value: stats.applications.pending,  color: '#d97706' },
                    { label: 'Approved', value: stats.applications.approved, color: '#059669' },
                    { label: 'Rejected', value: stats.applications.rejected, color: '#dc2626' },
                  ].map(s => (
                    <div key={s.label}><div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{s.label}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* ── STAFF ── */}
      {activeTab === 'staff' && (
        staffLoading ? <Spin /> : staff.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No staff accounts yet</div>
            <button onClick={() => setShowForm(true)} style={{ padding: '9px 20px', background: MAROON, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add Staff</button>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 100px 90px 1fr', padding: '10px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Staff Account', 'Department', 'Status', 'Joined', 'Actions'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>
            {staff.map((s, i) => {
              const dept = s.department ? DEPT_CONFIG[s.department] : null;
              return (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 100px 90px 1fr', padding: '13px 24px', borderBottom: i < staff.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'center', opacity: s.is_active ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: s.is_active ? `linear-gradient(135deg, ${MAROON}, #5C0000)` : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.is_active ? '#fff' : '#9ca3af', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      {initials(s.email)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.email}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>ID #{s.id}</div>
                    </div>
                  </div>
                  <div>{dept ? <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: dept.bg, color: dept.color, fontSize: 11, fontWeight: 700 }}>{dept.label}</span> : <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>}</div>
                  <div><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: s.is_active ? '#f0fdf4' : '#f3f4f6', color: s.is_active ? '#059669' : '#9ca3af', fontSize: 11, fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: s.is_active ? '#10b981' : '#d1d5db' }} />{s.is_active ? 'Active' : 'Inactive'}</span></div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{fmt(s.created_at)}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <button onClick={() => { setEditingStaff(s); setEditDept(s.department ?? 'public'); }} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb', color: '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => setTimeout(() => { setResetTarget(s); setNewPassword(''); }, 50)} style={{ padding: '5px 10px', border: '1px solid #bfdbfe', borderRadius: 6, background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reset PW</button>
                    <button onClick={() => setConfirmToggle(s)} style={{ padding: '5px 10px', border: `1px solid ${s.is_active ? '#fecaca' : '#bbf7d0'}`, borderRadius: 6, background: s.is_active ? '#fef2f2' : '#f0fdf4', color: s.is_active ? '#dc2626' : '#059669', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{s.is_active ? 'Deactivate' : 'Reactivate'}</button>
                    <button onClick={() => setTimeout(() => setConfirmDelete(s), 50)} style={{ padding: '5px 10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── STUDENTS ── */}
      {activeTab === 'students' && (
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f3f4f6', borderRadius: 10, padding: 4, width: 'fit-content', flexWrap: 'wrap' }}>
            {[
              { value: 'all',                  label: 'All' },
              { value: 'pending_verification', label: 'Pending Review' },
              { value: 'verified',             label: 'Verified' },
              { value: 'rejected',             label: 'Rejected' },
              { value: 'unregistered',         label: 'Unregistered' },
            ].map(f => (
              <button key={f.value} onClick={() => { setStudentFilter(f.value); setStudentsPage(1); fetchStudents(1, f.value); }} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: studentFilter === f.value ? '#fff' : 'transparent', color: studentFilter === f.value ? MAROON : '#6b7280', fontSize: 12, fontWeight: studentFilter === f.value ? 700 : 500, cursor: 'pointer', boxShadow: studentFilter === f.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {f.label}
              </button>
            ))}
          </div>

          {studentsLoading ? <Spin /> : students.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '48px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No students found.</div>
          ) : (
            <>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 1fr 90px 120px 130px', padding: '10px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Name', 'Student No.', 'Email', 'College', 'Status', 'Actions'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                  ))}
                </div>
                {students.map((s, i) => {
                  const badge    = ACCT_BADGE[s.account_status] ?? ACCT_BADGE.unregistered;
                  const name     = s.student_profile ? `${s.student_profile.first_name} ${s.student_profile.last_name}`.trim() : '—';
                  const isPending = s.account_status === 'pending_verification';
                  return (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 1fr 90px 120px 130px', padding: '12px 24px', borderBottom: i < students.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{name}</div>
                      <div style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace' }}>{s.student_profile?.student_number ?? '—'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
                      <div style={{ fontSize: 12, color: '#374151' }}>{s.student_profile?.college ?? '—'}</div>
                      <div><span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700 }}>{badge.label}</span></div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {isPending && (
                          <>
                            <button disabled={approvingId === s.id} onClick={() => handleApprove(s)} style={{ padding: '5px 10px', border: '1px solid #bbf7d0', borderRadius: 6, background: '#f0fdf4', color: '#059669', fontSize: 11, fontWeight: 600, cursor: approvingId === s.id ? 'not-allowed' : 'pointer', opacity: approvingId === s.id ? 0.7 : 1 }}>
                              {approvingId === s.id ? '…' : 'Approve'}
                            </button>
                            <button onClick={() => { setRejectTarget(s); setRejectRemarks(''); }} style={{ padding: '5px 10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {studentsTotal > PAGE_SIZE && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
                  <button disabled={studentsPage <= 1} onClick={() => { const p = studentsPage - 1; setStudentsPage(p); fetchStudents(p, studentFilter); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: studentsPage <= 1 ? '#f9fafb' : '#fff', color: studentsPage <= 1 ? '#9ca3af' : '#374151', fontSize: 13, cursor: studentsPage <= 1 ? 'default' : 'pointer' }}>← Prev</button>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Page {studentsPage} of {totalPages(studentsTotal)}</span>
                  <button disabled={studentsPage >= totalPages(studentsTotal)} onClick={() => { const p = studentsPage + 1; setStudentsPage(p); fetchStudents(p, studentFilter); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: studentsPage >= totalPages(studentsTotal) ? '#f9fafb' : '#fff', color: studentsPage >= totalPages(studentsTotal) ? '#9ca3af' : '#374151', fontSize: 13, cursor: studentsPage >= totalPages(studentsTotal) ? 'default' : 'pointer' }}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── AUDIT LOGS ── */}
      {activeTab === 'audit' && (
        <div>
          {auditLoading ? <Spin /> : auditLogs.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '48px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No audit logs yet.</div>
          ) : (
            <>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px 1fr 130px 1fr', padding: '10px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Date & Time', 'Actor', 'App ID', 'Action', 'From → To', 'Note'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                  ))}
                </div>
                {auditLogs.map((log, i) => (
                  <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px 1fr 130px 1fr', padding: '11px 24px', borderBottom: i < auditLogs.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'start', fontSize: 12 }}>
                    <div style={{ color: '#9ca3af', fontSize: 11 }}>{fmtDt(log.created_at)}</div>
                    <div style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.actor_email}</div>
                    <div style={{ color: log.application_id ? MAROON : '#9ca3af', fontWeight: log.application_id ? 600 : 400 }}>{log.application_id ?? '—'}</div>
                    <div style={{ color: '#111827', fontWeight: 500, textTransform: 'capitalize' }}>{log.action.replace(/_/g, ' ')}</div>
                    <div style={{ color: '#6b7280', fontSize: 11 }}>
                      {log.from_status && <span>{log.from_status}</span>}
                      {log.from_status && log.to_status && <span style={{ margin: '0 4px' }}>→</span>}
                      {log.to_status && <span style={{ fontWeight: 600, color: '#374151' }}>{log.to_status}</span>}
                      {!log.from_status && !log.to_status && '—'}
                    </div>
                    <div style={{ color: '#6b7280', fontStyle: log.note ? 'normal' : 'italic' }}>{log.note ?? '—'}</div>
                  </div>
                ))}
              </div>
              {auditTotal > 20 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
                  <button disabled={auditPage <= 1} onClick={() => { const p = auditPage - 1; setAuditPage(p); fetchAudit(p); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: auditPage <= 1 ? '#f9fafb' : '#fff', color: auditPage <= 1 ? '#9ca3af' : '#374151', fontSize: 13, cursor: auditPage <= 1 ? 'default' : 'pointer' }}>← Prev</button>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Page {auditPage} of {Math.ceil(auditTotal / 20)}</span>
                  <button disabled={auditPage >= Math.ceil(auditTotal / 20)} onClick={() => { const p = auditPage + 1; setAuditPage(p); fetchAudit(p); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: auditPage >= Math.ceil(auditTotal / 20) ? '#f9fafb' : '#fff', color: auditPage >= Math.ceil(auditTotal / 20) ? '#9ca3af' : '#374151', fontSize: 13, cursor: auditPage >= Math.ceil(auditTotal / 20) ? 'default' : 'pointer' }}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── BROADCAST ── */}
      {activeTab === 'broadcast' && (
        <div style={{ maxWidth: 580 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '28px 32px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Send Broadcast</h2>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6b7280' }}>Send a notification to all users or a specific group.</p>
            <form onSubmit={handleBroadcast}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Target Audience</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { value: 'all',       label: 'All Users' },
                    { value: 'students',  label: 'Students Only' },
                    { value: 'osfa_staff',label: 'OSFA Staff Only' },
                  ].map(opt => (
                    <label key={opt.value} style={{ flex: 1, minWidth: 120, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: `2px solid ${bcastTarget === opt.value ? MAROON : '#e5e7eb'}`, borderRadius: 9, background: bcastTarget === opt.value ? '#fff5f5' : '#f9fafb', cursor: 'pointer', fontSize: 13, fontWeight: bcastTarget === opt.value ? 700 : 500, color: bcastTarget === opt.value ? MAROON : '#374151' }}>
                      <input type="radio" name="target" value={opt.value} checked={bcastTarget === opt.value} onChange={() => setBcastTarget(opt.value as 'all' | 'students' | 'osfa_staff')} style={{ display: 'none' }} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Title <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={bcastTitle} onChange={e => setBcastTitle(e.target.value)} placeholder="e.g. Application Deadline Reminder" style={inp} required />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message <span style={{ color: '#dc2626' }}>*</span></label>
                <textarea value={bcastBody} onChange={e => setBcastBody(e.target.value)} placeholder="Type your announcement here..." rows={5} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} required />
              </div>
              <button type="submit" disabled={bcasting || !bcastTitle.trim() || !bcastBody.trim()} style={{ width: '100%', padding: '12px', background: bcasting ? '#9ca3af' : `linear-gradient(135deg, ${MAROON}, #5C0000)`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: bcasting ? 'not-allowed' : 'pointer' }}>
                {bcasting ? 'Sending…' : 'Send Broadcast'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── REPORTS ── */}
      {activeTab === 'reports' && (
        <div style={{ maxWidth: 580 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '28px 32px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Export Reports</h2>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6b7280' }}>Download system data as CSV files for offline analysis.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { type: 'students',     label: 'Export Students',     desc: 'All student accounts with registration status', icon: '👥' },
                { type: 'applications', label: 'Export Applications', desc: 'All scholarship applications and statuses',      icon: '📋' },
                { type: 'scholars',     label: 'Export Scholars',     desc: 'Active and past scholarship recipients',         icon: '🎓' },
              ].map(r => (
                <div key={r.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 28 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{r.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{r.desc}</div>
                    </div>
                  </div>
                  <button disabled={downloading[r.type]} onClick={() => downloadReport(r.type)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: downloading[r.type] ? '#9ca3af' : MAROON, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: downloading[r.type] ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
                    {downloading[r.type]
                      ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Downloading…</>
                      : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download CSV</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ MODALS ═══════ */}

      {/* Create Staff */}
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
                <button type="submit" disabled={saving} style={{ flex: 1, padding: 11, border: 'none', borderRadius: 9, background: saving ? '#9ca3af' : `linear-gradient(135deg, ${MAROON}, #5C0000)`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Creating…' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dept */}
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
              <button onClick={handleEditDept} disabled={editSaving} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: editSaving ? '#9ca3af' : MAROON, color: '#fff', fontSize: 14, fontWeight: 600, cursor: editSaving ? 'not-allowed' : 'pointer' }}>
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password */}
      {resetTarget && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setResetTarget(null); setNewPassword(''); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
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
              <button onClick={handleResetPassword} disabled={resetting || newPassword.length < 8} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: resetting || newPassword.length < 8 ? '#9ca3af' : '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: resetting || newPassword.length < 8 ? 'not-allowed' : 'pointer' }}>
                {resetting ? 'Resetting…' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Active */}
      {confirmToggle && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmToggle(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: confirmToggle.is_active ? '#fef2f2' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={confirmToggle.is_active ? '#dc2626' : '#059669'} strokeWidth="2.5">{confirmToggle.is_active ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <polyline points="20 6 9 17 4 12"/>}</svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{confirmToggle.is_active ? 'Deactivate' : 'Reactivate'} Account</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              {confirmToggle.is_active ? <>Deactivate <strong>{confirmToggle.email}</strong>? They will lose access immediately.</> : <>Reactivate <strong>{confirmToggle.email}</strong>? They will regain full access.</>}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmToggle(null)} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleToggleActive} disabled={toggling} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: confirmToggle.is_active ? '#dc2626' : '#059669', color: '#fff', fontSize: 14, fontWeight: 600, cursor: toggling ? 'not-allowed' : 'pointer' }}>
                {toggling ? 'Processing…' : confirmToggle.is_active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Staff */}
      {confirmDelete && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Delete Staff Account</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              Permanently delete <strong>{confirmDelete.email}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteStaff} disabled={deleting} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: deleting ? '#9ca3af' : '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer' }}>
                {deleting ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Student */}
      {rejectTarget && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setRejectTarget(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Reject Registration</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              Rejecting <strong>{rejectTarget.student_profile ? `${rejectTarget.student_profile.first_name} ${rejectTarget.student_profile.last_name}` : rejectTarget.email}</strong>. The student will be notified with your remarks.
            </p>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Rejection Remarks <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <textarea value={rejectRemarks} onChange={e => setRejectRemarks(e.target.value)} placeholder="Explain why the registration is being rejected…" rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setRejectTarget(null)} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleReject} disabled={rejecting} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: rejecting ? '#9ca3af' : '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: rejecting ? 'not-allowed' : 'pointer' }}>
                {rejecting ? 'Rejecting…' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
