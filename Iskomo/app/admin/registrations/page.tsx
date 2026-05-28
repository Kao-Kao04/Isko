'use client';

import { useState, useEffect, useCallback } from 'react';
import { userApi, type StudentUserResponse } from '@/lib/api-client';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';
import { Skel } from '@/components/shared/Skeleton';

const M  = COLORS.maroon;
const MD = COLORS.maroonD;
const ML = COLORS.maroonL;

type AccountStatus = 'pending_verification' | 'verified' | 'rejected' | 'unregistered';

interface RegDoc { id: number; doc_type: string; filename: string; url: string; }

const STATUS_CFG: Record<AccountStatus, { bg: string; color: string; dot: string; label: string }> = {
  pending_verification: { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b', label: 'Pending Review' },
  verified:             { bg: '#f0fdf4', color: '#059669', dot: '#10b981', label: 'Verified' },
  rejected:             { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626', label: 'Rejected' },
  unregistered:         { bg: '#f3f4f6', color: '#6b7280', dot: '#d1d5db', label: 'Not Submitted' },
};


const studentName = (s: StudentUserResponse) => {
  if (!s.student_profile) return s.email;
  const { first_name, middle_name, last_name } = s.student_profile;
  return [first_name, middle_name, last_name].filter(Boolean).join(' ');
};

export default function AdminRegistrationsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [students,      setStudents]      = useState<StudentUserResponse[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState<AccountStatus | 'all'>('pending_verification');
  const [search,        setSearch]        = useState('');
  const [selectedId,    setSelectedId]    = useState<number | null>(null);
  const [selectedDocs,  setSelectedDocs]  = useState<RegDoc[]>([]);
  const [docsLoading,   setDocsLoading]   = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [showReject,    setShowReject]    = useState(false);
  const [saving,        setSaving]        = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const res = await userApi.list(1, 100, status);
      setStudents(res.items as StudentUserResponse[]);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function openDocs(s: StudentUserResponse) {
    setSelectedId(s.id); setSelectedDocs([]); setDocsLoading(true);
    try { setSelectedDocs(await userApi.getRegistrationDocuments(s.id) as unknown as RegDoc[]); }
    catch { /* silent */ } finally { setDocsLoading(false); }
  }

  async function approve(s: StudentUserResponse) {
    setSaving(true);
    try {
      await userApi.approveStudent(s.id);
      addToast('success', `${studentName(s)} verified.`);
      await load(); setSelectedId(null);
    } catch (err) { addToast('error', err instanceof Error ? err.message : 'Failed.'); }
    finally { setSaving(false); }
  }

  async function reject() {
    const selected = students.find(s => s.id === selectedId);
    if (!selected || !rejectRemarks.trim()) return;
    setSaving(true);
    try {
      await userApi.rejectStudent(selected.id, rejectRemarks.trim());
      addToast('warning', `${studentName(selected)} rejected.`);
      setShowReject(false); setRejectRemarks('');
      await load(); setSelectedId(null);
    } catch (err) { addToast('error', err instanceof Error ? err.message : 'Failed.'); }
    finally { setSaving(false); }
  }

  const selected      = students.find(s => s.id === selectedId) ?? null;
  const baseFiltered  = filter === 'all'
    ? students
    : students.filter(s => s.account_status === filter);
  const displayed = search.trim()
    ? baseFiltered.filter(s => {
        const q = search.toLowerCase();
        return studentName(s).toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.student_profile?.student_number ?? '').toLowerCase().includes(q);
      })
    : baseFiltered;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Registrations</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Review and approve student registration documents</p>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {(['pending_verification', 'verified', 'rejected', 'all'] as const).map(s => (
          <button key={s} onClick={() => { setFilter(s); setSelectedId(null); }}
            style={{ padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: filter === s ? M : '#f3f4f6', color: filter === s ? '#fff' : '#374151', transition: 'all 0.15s' }}>
            {s === 'all' ? 'All' : s === 'pending_verification' ? 'Pending Review' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Search + bulk info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, student no…" style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #e5e7eb', borderRadius: 20, fontSize: 12, outline: 'none', width: 240 }} />
        </div>
        <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>{displayed.length} students</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedId ? '1fr 1.4fr' : '1fr', gap: 20 }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Skel w={36} h={36} r={18} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <Skel h={14} w="40%" r={6} mb={6} />
                    <Skel h={11} w="55%" r={5} />
                  </div>
                  <Skel h={22} w={90} r={20} />
                  <Skel h={30} w={80} r={8} />
                </div>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No students in this category.</div>
          ) : displayed.map(s => {
            const cfg        = STATUS_CFG[s.account_status as AccountStatus] ?? STATUS_CFG.unregistered;
            const name       = studentName(s);
            const isSelected = selectedId === s.id;
            return (
              <button key={s.id} onClick={() => openDocs(s)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `1.5px solid ${isSelected ? M : '#e5e7eb'}`, background: isSelected ? ML : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', boxShadow: isSelected ? `0 0 0 3px ${M}20` : 'none' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${M}, ${MD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>{name[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{s.email}</div>
                  {s.student_profile && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.student_profile.college} · {s.student_profile.student_number}</div>}
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />{cfg.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px 28px', height: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#111827' }}>{studentName(selected)}</h3>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{selected.email}</div>
              </div>
              <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af', padding: 4 }}>✕</button>
            </div>

            {selected.student_profile && (() => {
              const p = selected.student_profile;
              const row = (label: string, val: string | number | null | undefined) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{label}</span>
                  <span style={{ color: '#111827', fontSize: 12, fontWeight: 500, textAlign: 'right' }}>{val ?? '—'}</span>
                </div>
              );
              const sec = (title: string) => (
                <div key={title} style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 10, marginBottom: 2 }}>{title}</div>
              );
              return (
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 16 }}>
                  {sec('Academic')}
                  {row('Student No.', p.student_number)}
                  {row('College', p.college)}
                  {row('Program', p.program)}
                  {row('Year Level', p.year_level ? `Year ${p.year_level}` : null)}
                  {sec('Address')}
                  {row('Street / Barangay', p.street_barangay)}
                  {row('City / Municipality', p.city_municipality)}
                  {row('Province', p.province)}
                  {row('Zip Code', p.zip_code)}
                  {sec('Family Background')}
                  {row("Father's Name", p.father_name)}
                  {row("Father's Occupation", p.father_occupation)}
                  {row("Mother's Name", p.mother_name)}
                  {row("Mother's Occupation", p.mother_occupation)}
                  {sec('Financial')}
                  {row('Income Source', p.income_source)}
                  {row('Monthly Income', (() => {
                    const v = p.monthly_income;
                    if (!v) return null;
                    return isNaN(Number(v)) ? v : `₱${Number(v).toLocaleString()}`;
                  })())}
                </div>
              );
            })()}

            {selected.rejection_remarks && (
              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
                <strong>Previous rejection reason:</strong> {selected.rejection_remarks}
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Submitted Documents</div>
            {docsLoading ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading…</div>
            ) : selectedDocs.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No documents found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {selectedDocs.map(doc => {
                  const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.filename);
                  return (
                    <div key={doc.id} style={{ borderRadius: 10, background: '#f9fafb', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                      {isImg && doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <img src={doc.url} alt={doc.doc_type} style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block', borderBottom: '1px solid #f3f4f6' }} />
                        </a>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{doc.doc_type === 'school_id' ? 'School ID' : 'Certificate of Registration (COR)'}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{doc.filename}</div>
                        </div>
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, color: '#2563eb', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            Open
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selected.account_status === 'pending_verification' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => approve(selected)} disabled={saving || docsLoading}
                  style={{ flex: 1, padding: '11px', background: saving ? '#9ca3af' : '#059669', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Processing…' : '✓ Approve'}
                </button>
                <button onClick={() => setShowReject(true)} disabled={saving || docsLoading}
                  style={{ flex: 1, padding: '11px', background: saving ? '#9ca3af' : '#dc2626', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  ✗ Reject
                </button>
              </div>
            )}
            {selected.account_status === 'unregistered' && (
              <div style={{ padding: '12px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
                This student has not submitted registration documents yet.
              </div>
            )}

            {selected.account_status === 'verified' && (
              <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 9, fontSize: 13, color: '#15803d', fontWeight: 600, textAlign: 'center' }}>✓ This student is verified.</div>
            )}
            {selected.account_status === 'rejected' && (
              <button onClick={() => approve(selected)} disabled={saving || docsLoading}
                style={{ width: '100%', padding: '11px', background: saving || docsLoading ? '#9ca3af' : '#059669', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: saving || docsLoading ? 'not-allowed' : 'pointer' }}>
                Re-approve this student
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {showReject && selected && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowReject(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Reject Registration</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>Provide a reason so the student knows what to fix.</p>
            <textarea rows={4} value={rejectRemarks} onChange={e => setRejectRemarks(e.target.value)} placeholder="e.g. School ID is blurry, please re-upload a clearer photo." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6, marginBottom: 18 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowReject(false); setRejectRemarks(''); }} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={reject} disabled={!rejectRemarks.trim() || saving} style={{ flex: 1, padding: 10, background: !rejectRemarks.trim() || saving ? '#fca5a5' : '#dc2626', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: !rejectRemarks.trim() || saving ? 'not-allowed' : 'pointer', color: '#fff' }}>
                {saving ? 'Rejecting…' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
