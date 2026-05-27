'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';
import { Skel } from '@/components/shared/Skeleton';

const M = COLORS.maroon;
const PAGE_SIZE = 20;

const ACCT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  unregistered:         { bg: '#f3f4f6', color: '#6b7280', label: 'Unregistered' },
  pending_verification: { bg: '#fef3c7', color: '#92400e', label: 'Pending Review' },
  verified:             { bg: '#dcfce7', color: '#15803d', label: 'Verified' },
  rejected:             { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
};

const SCHOLAR_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  active:       { bg: '#dcfce7', color: '#15803d', label: 'Scholar' },
  probationary: { bg: '#fef3c7', color: '#92400e', label: 'Probationary' },
  under_review: { bg: '#eff6ff', color: '#1d4ed8', label: 'Under Review' },
  on_leave:     { bg: '#f3f4f6', color: '#374151', label: 'On Leave' },
  suspended:    { bg: '#fee2e2', color: '#dc2626', label: 'Suspended' },
  graduated:    { bg: '#f0fdf4', color: '#166534', label: 'Graduated' },
  terminated:   { bg: '#fee2e2', color: '#dc2626', label: 'Terminated' },
};

interface AdminStudent {
  id: number; email: string; account_status: string; is_active: boolean; created_at: string;
  scholar_status: string | null;
  student_profile: { first_name: string; last_name: string; student_number: string; college: string; program: string } | null;
}
interface Paginated<T> { items: T[]; total: number; page: number; }

const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' };

function Spin() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>;
}

export default function AdminStudentsPage() {
  const searchParams = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();
  const [students, setStudents]           = useState<AdminStudent[]>([]);
  const [page, setPage]                   = useState(1);
  const [total, setTotal]                 = useState(0);
  const [filter, setFilter]               = useState(() => searchParams.get('account_status') ?? 'all');
  const [search, setSearch]               = useState('');
  const [loading, setLoading]             = useState(false);

  const [approvingId,         setApprovingId]         = useState<number | null>(null);
  const [rejectTarget,        setRejectTarget]        = useState<AdminStudent | null>(null);
  const [rejectRemarks,       setRejectRemarks]       = useState('');
  const [rejecting,           setRejecting]           = useState(false);
  const [toggleTarget,        setToggleTarget]        = useState<AdminStudent | null>(null);
  const [toggling,            setToggling]            = useState(false);
  const [deleteTarget,        setDeleteTarget]        = useState<AdminStudent | null>(null);
  const [deleting,            setDeleting]            = useState(false);

  const fetchStudents = useCallback(async (p = 1, f = 'all') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), page_size: String(PAGE_SIZE) });
      if (f === 'scholar') params.set('scholar_only', 'true');
      else if (f !== 'all') params.set('account_status', f);
      const res = await apiFetch<Paginated<AdminStudent>>(`/api/admin/students?${params}`);
      setStudents(res.items); setTotal(res.total);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStudents(1, filter); }, [fetchStudents, filter]);

  async function handleApprove(s: AdminStudent) {
    setApprovingId(s.id);
    try {
      await apiFetch(`/api/users/${s.id}/approve`, { method: 'PATCH' });
      setStudents(prev => prev.map(x => x.id === s.id ? { ...x, account_status: 'verified' } : x));
      addToast('success', `${s.student_profile?.first_name ?? s.email} approved.`);
    } catch (err) { addToast('error', err instanceof Error ? err.message : 'Failed.'); }
    finally { setApprovingId(null); }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await apiFetch(`/api/users/${rejectTarget.id}/reject`, { method: 'PATCH', body: JSON.stringify({ remarks: rejectRemarks }) });
      setStudents(prev => prev.map(x => x.id === rejectTarget.id ? { ...x, account_status: 'rejected' } : x));
      addToast('success', 'Registration rejected.'); setRejectTarget(null); setRejectRemarks('');
    } catch (err) { addToast('error', err instanceof Error ? err.message : 'Failed.'); }
    finally { setRejecting(false); }
  }

  async function handleToggle() {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      const res = await apiFetch<{ id: number; is_active: boolean; message: string }>(`/api/admin/students/${toggleTarget.id}/toggle-active`, { method: 'PATCH' });
      setStudents(prev => prev.map(x => x.id === res.id ? { ...x, is_active: res.is_active } : x));
      addToast('success', res.message); setToggleTarget(null);
    } catch (err) { addToast('error', err instanceof Error ? err.message : 'Failed.'); }
    finally { setToggling(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/students/${deleteTarget.id}`, { method: 'DELETE' });
      setStudents(prev => prev.filter(x => x.id !== deleteTarget.id));
      addToast('success', 'Student deleted.'); setDeleteTarget(null);
    } catch (err) { addToast('error', err instanceof Error ? err.message : 'Failed.'); }
    finally { setDeleting(false); }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const displayed  = search.trim() ? students.filter(s => {
    const q = search.toLowerCase();
    const name = s.student_profile ? `${s.student_profile.first_name} ${s.student_profile.last_name}`.toLowerCase() : '';
    return name.includes(q) || s.email.toLowerCase().includes(q) || (s.student_profile?.student_number ?? '').toLowerCase().includes(q);
  }) : students;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Students</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Manage student accounts and registration status</p>
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
          {[{ value: 'all', label: 'All' }, { value: 'pending_verification', label: 'Pending' }, { value: 'verified', label: 'Verified' }, { value: 'scholar', label: 'Scholars' }, { value: 'rejected', label: 'Rejected' }, { value: 'unregistered', label: 'Unregistered' }].map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
              style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: filter === f.value ? '#fff' : 'transparent', color: filter === f.value ? M : '#6b7280', fontSize: 12, fontWeight: filter === f.value ? 700 : 500, cursor: 'pointer', boxShadow: filter === f.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, student no…" style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 20, fontSize: 12, outline: 'none', width: 220 }} />
        </div>
      </div>

      {loading ? (
        <div>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
              <Skel w={38} h={38} r={19} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skel h={14} w="40%" r={6} mb={6} />
                <Skel h={11} w="60%" r={5} />
              </div>
              <Skel h={22} w={70} r={20} />
              <Skel h={30} w={80} r={8} />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '48px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No students found.</div>
      ) : (
        <>
          <div className="admin-table-wrap" style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Name', 'Student No.', 'Email', 'College', 'Status', 'Scholar', 'Active', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((s, i) => {
                  const badge  = ACCT_BADGE[s.account_status] ?? ACCT_BADGE.unregistered;
                  const name   = s.student_profile ? `${s.student_profile.first_name} ${s.student_profile.last_name}`.trim() : '—';
                  const active = s.is_active !== false;
                  return (
                    <tr key={s.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid #f3f4f6' : 'none', opacity: active ? 1 : 0.6 }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{name}</td>
                      <td style={{ padding: '12px 16px', color: '#374151', fontFamily: 'monospace', fontSize: 12 }}>{s.student_profile?.student_number ?? '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{s.student_profile?.college ?? '—'}</td>
                      <td style={{ padding: '12px 16px' }}><span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700 }}>{badge.label}</span></td>
                      <td style={{ padding: '12px 16px' }}>
                        {s.scholar_status ? (
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: (SCHOLAR_BADGE[s.scholar_status] ?? SCHOLAR_BADGE.active).bg, color: (SCHOLAR_BADGE[s.scholar_status] ?? SCHOLAR_BADGE.active).color, fontSize: 11, fontWeight: 700 }}>
                            {(SCHOLAR_BADGE[s.scholar_status] ?? SCHOLAR_BADGE.active).label}
                          </span>
                        ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: active ? '#f0fdf4' : '#f3f4f6', color: active ? '#059669' : '#9ca3af', fontSize: 11, fontWeight: 600 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: active ? '#10b981' : '#d1d5db' }} />{active ? 'Yes' : 'No'}</span></td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {s.account_status === 'pending_verification' && <>
                            <button disabled={approvingId === s.id} onClick={() => handleApprove(s)} style={{ padding: '5px 10px', border: '1px solid #bbf7d0', borderRadius: 6, background: '#f0fdf4', color: '#059669', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{approvingId === s.id ? '…' : 'Approve'}</button>
                            <button onClick={() => { setRejectTarget(s); setRejectRemarks(''); }} style={{ padding: '5px 10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                          </>}
                          <button onClick={() => setToggleTarget(s)} style={{ padding: '5px 10px', border: `1px solid ${active ? '#fecaca' : '#bbf7d0'}`, borderRadius: 6, background: active ? '#fef2f2' : '#f0fdf4', color: active ? '#dc2626' : '#059669', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{active ? 'Deactivate' : 'Reactivate'}</button>
                          <button onClick={() => setDeleteTarget(s)} style={{ padding: '5px 10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {total > PAGE_SIZE && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); fetchStudents(p, filter); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: page <= 1 ? '#f9fafb' : '#fff', color: page <= 1 ? '#9ca3af' : '#374151', fontSize: 13, cursor: page <= 1 ? 'default' : 'pointer' }}>← Prev</button>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => { const p = page + 1; setPage(p); fetchStudents(p, filter); }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: page >= totalPages ? '#f9fafb' : '#fff', color: page >= totalPages ? '#9ca3af' : '#374151', fontSize: 13, cursor: page >= totalPages ? 'default' : 'pointer' }}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {rejectTarget && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setRejectTarget(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Reject Registration</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>Rejecting <strong>{rejectTarget.student_profile ? `${rejectTarget.student_profile.first_name} ${rejectTarget.student_profile.last_name}` : rejectTarget.email}</strong>.</p>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Rejection Remarks <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <textarea value={rejectRemarks} onChange={e => setRejectRemarks(e.target.value)} placeholder="Explain why…" rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setRejectTarget(null)} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleReject} disabled={rejecting} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: rejecting ? '#9ca3af' : '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: rejecting ? 'not-allowed' : 'pointer' }}>{rejecting ? 'Rejecting…' : 'Confirm Rejection'}</button>
            </div>
          </div>
        </div>
      )}
      {toggleTarget && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setToggleTarget(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{toggleTarget.is_active !== false ? 'Deactivate' : 'Reactivate'} Student</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{toggleTarget.is_active !== false ? 'They will lose access immediately.' : 'They will regain full access.'}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setToggleTarget(null)} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleToggle} disabled={toggling} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: toggling ? '#9ca3af' : (toggleTarget.is_active !== false ? '#dc2626' : '#059669'), color: '#fff', fontSize: 14, fontWeight: 600, cursor: toggling ? 'not-allowed' : 'pointer' }}>{toggling ? 'Processing…' : (toggleTarget.is_active !== false ? 'Deactivate' : 'Reactivate')}</button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setDeleteTarget(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Delete Student Account</h2>
            <p style={{ margin: '0 0 6px', fontSize: 14, color: '#374151', fontWeight: 600 }}>{deleteTarget.student_profile ? `${deleteTarget.student_profile.first_name} ${deleteTarget.student_profile.last_name}` : deleteTarget.email}</p>
            <p style={{ margin: '0 0 6px', fontSize: 13, color: '#6b7280' }}>{deleteTarget.email}</p>
            <div style={{ margin: '12px 0 20px', padding: '10px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, fontSize: 12, color: '#7c2d12', lineHeight: 1.5 }}>This permanently deletes all account data. Students with active applications cannot be deleted.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: deleting ? '#9ca3af' : '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer' }}>{deleting ? 'Deleting…' : 'Delete Permanently'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
