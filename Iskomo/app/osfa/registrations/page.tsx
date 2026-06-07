'use client';

import { useState, useEffect, useCallback } from 'react';
import { userApi, type StudentUserResponse } from '@/lib/api-client';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';

const TEAL      = COLORS.maroon;
const TEAL_DARK = COLORS.maroonD;
const TEAL_L    = COLORS.maroonL;

type AccountStatus = 'pending_verification' | 'verified' | 'rejected' | 'unregistered';
type Student = StudentUserResponse;

interface RegDoc { id: number; doc_type: string; filename: string; url: string; uploaded_at: string; }

const STATUS_CFG: Record<AccountStatus, { bg: string; color: string; dot: string; label: string }> = {
  pending_verification: { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b', label: 'Pending Review' },
  verified:             { bg: '#f0fdf4', color: '#059669', dot: '#10b981', label: 'Verified'       },
  rejected:             { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626', label: 'Rejected'       },
  unregistered:         { bg: '#f3f4f6', color: '#6b7280', dot: '#d1d5db', label: 'Not Submitted'  },
};

export default function RegistrationsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [students,       setStudents]       = useState<Student[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [loadError,      setLoadError]      = useState<string | null>(null);
  const [filter,         setFilter]         = useState<'pending_verification' | 'verified' | 'rejected' | 'all' | 'gwa_pending'>('all');
  const [appFilter,      setAppFilter]      = useState<'' | 'with_application' | 'no_application'>();
  const [search,         setSearch]         = useState('');
  const [selectedId,     setSelectedId]     = useState<number | null>(null);
  const [selectedDocs,   setSelectedDocs]   = useState<RegDoc[]>([]);
  const [docsLoading,    setDocsLoading]    = useState(false);
  const [rejectRemarks,  setRejectRemarks]  = useState('');
  const [showReject,     setShowReject]     = useState(false);
  const [actionStudent,  setActionStudent]  = useState<Student | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [checkedIds,     setCheckedIds]     = useState<Set<number>>(new Set());
  const [bulkSaving,     setBulkSaving]     = useState(false);
  const [reminding,      setReminding]      = useState(false);
  const [emailingVerified, setEmailingVerified] = useState(false);
  const [gwaProofUrl,    setGwaProofUrl]    = useState<string | null>(null);
  const [gwaReviewing,   setGwaReviewing]   = useState(false);
  const [gwaRejectNote,  setGwaRejectNote]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setStudents([]);
    try {
      const statusParam = (filter === 'all' || filter === 'gwa_pending') ? undefined : filter;
      const res = await userApi.list(1, 100, statusParam, appFilter || undefined);
      setStudents(res.items);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filter, appFilter]);

  useEffect(() => { load(); }, [load]);

  async function openDocs(student: Student) {
    setSelectedId(student.id);
    setGwaProofUrl(null); setGwaRejectNote('');
    setSelectedDocs([]);
    setDocsLoading(true);
    try {
      const docs = await userApi.getRegistrationDocuments(student.id);
      setSelectedDocs(docs);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to load documents.');
    } finally {
      setDocsLoading(false);
    }
  }

  async function approve(student: Student) {
    setSaving(true);
    try {
      await userApi.approveStudent(student.id);
      addToast('success', `${studentName(student)} has been verified.`);
      await load();
      setSelectedId(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to approve.';
      addToast('error', msg);
      // Reload so the panel reflects the actual status — prevents stale
      // pending_verification state leaving the Approve button visible.
      await load();
    } finally { setSaving(false); }
  }

  async function reject() {
    if (!actionStudent || !rejectRemarks.trim()) return;
    setSaving(true);
    try {
      await userApi.rejectStudent(actionStudent.id, rejectRemarks.trim());
      addToast('error', `${studentName(actionStudent)} has been rejected.`);
      setShowReject(false);
      setRejectRemarks('');
      setActionStudent(null);
      await load();
      setSelectedId(null);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to reject.');
    } finally { setSaving(false); }
  }

  const studentName = (s: Student) => {
    if (!s.student_profile) return s.email;
    const { first_name, middle_name, last_name } = s.student_profile;
    return [first_name, middle_name, last_name].filter(Boolean).join(' ');
  };

  async function bulkApprove() {
    if (!checkedIds.size) return;
    setBulkSaving(true);
    let ok = 0, fail = 0;
    for (const id of checkedIds) {
      try { await userApi.approveStudent(id); ok++; } catch { fail++; }
    }
    if (ok) addToast('success', `${ok} student${ok > 1 ? 's' : ''} approved.`);
    if (fail) addToast('error', `${fail} failed.`);
    setCheckedIds(new Set());
    await load();
    setSelectedId(null);
    setBulkSaving(false);
  }

  function toggleCheck(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const gwaPendingCount = students.filter(s => s.student_profile?.gwa_request_status === 'pending').length;
  const baseFiltered = filter === 'all'
    ? students
    : filter === 'gwa_pending'
      ? students.filter(s => s.student_profile?.gwa_request_status === 'pending')
      : students.filter(s => s.account_status === filter);
  const filtered = search.trim()
    ? baseFiltered.filter(s => {
        const q = search.toLowerCase();
        return studentName(s).toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.student_profile?.student_number ?? '').toLowerCase().includes(q);
      })
    : baseFiltered;
  const selected = students.find(s => s.id === selectedId) ?? null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#111827' }}>Student Registrations</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Review submitted documents and verify student accounts.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={async () => {
              if (reminding) return;
              setReminding(true);
              try {
                const res = await userApi.sendRegistrationReminders();
                addToast('success', `Reminder sent to ${res.sent} student${res.sent !== 1 ? 's' : ''}.${res.failed > 0 ? ` ${res.failed} failed.` : ''}`);
              } catch {
                addToast('error', 'Failed to send reminders. Please try again.');
              } finally {
                setReminding(false);
              }
            }}
            disabled={reminding}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: reminding ? '#f3f4f6' : '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, fontWeight: 600, color: reminding ? '#9ca3af' : '#374151', cursor: reminding ? 'not-allowed' : 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            {reminding ? 'Sending…' : 'Remind Unregistered'}
          </button>
          <button
            onClick={async () => {
              if (emailingVerified) return;
              setEmailingVerified(true);
              try {
                const res = await userApi.sendVerifiedReminders();
                addToast('success', `Email sent to ${res.sent} student${res.sent !== 1 ? 's' : ''}.${res.failed > 0 ? ` ${res.failed} failed.` : ''}`);
              } catch {
                addToast('error', 'Failed to send emails. Please try again.');
              } finally {
                setEmailingVerified(false);
              }
            }}
            disabled={emailingVerified}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: emailingVerified ? '#f3f4f6' : '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, fontWeight: 600, color: emailingVerified ? '#9ca3af' : '#374151', cursor: emailingVerified ? 'not-allowed' : 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            {emailingVerified ? 'Sending…' : 'Email Verified Students'}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {([
          ['pending_verification', 'Pending Review'],
          ['verified',             'Verified'],
          ['rejected',             'Rejected'],
          ['all',                  'All'],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => { setFilter(key); setSelectedId(null); setAppFilter(undefined); }}
            style={{ padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: filter === key ? TEAL : '#f3f4f6', color: filter === key ? '#fff' : '#374151', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
        <button onClick={() => { setFilter('gwa_pending'); setSelectedId(null); setAppFilter(undefined); }}
          style={{ padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: filter === 'gwa_pending' ? '#d97706' : '#fff7ed', color: filter === 'gwa_pending' ? '#fff' : '#d97706', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
          GWA Requests
          {gwaPendingCount > 0 && (
            <span style={{ background: filter === 'gwa_pending' ? 'rgba(255,255,255,0.3)' : '#d97706', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px', lineHeight: 1.5 }}>
              {gwaPendingCount}
            </span>
          )}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {([
          [undefined, 'All Students'],
          ['with_application', 'With Application'],
          ['no_application',   'No Application'],
        ] as const).map(([key, label]) => (
          <button key={key ?? 'all'} onClick={() => { setAppFilter(key); setSelectedId(null); }}
            style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${(appFilter ?? undefined) === key ? TEAL : '#e5e7eb'}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: (appFilter ?? undefined) === key ? TEAL_L : '#fff', color: (appFilter ?? undefined) === key ? TEAL : '#6b7280', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, student no…"
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #e5e7eb', borderRadius: 20, fontSize: 12, outline: 'none', width: 220 }}
          />
        </div>
      </div>

      {/* Bulk action bar */}
      {checkedIds.size > 0 && filter === 'pending_verification' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1d4ed8' }}>{checkedIds.size} selected</span>
          <button onClick={bulkApprove} disabled={bulkSaving}
            style={{ padding: '6px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: bulkSaving ? 'not-allowed' : 'pointer' }}>
            {bulkSaving ? 'Approving…' : `✓ Approve ${checkedIds.size}`}
          </button>
          <button onClick={() => setCheckedIds(new Set())}
            style={{ padding: '6px 12px', background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedId ? '1fr 1.4fr' : '1fr', gap: 20 }}>

        {/* Student list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading…</div>
          ) : loadError ? (
            <div style={{ padding: 40, textAlign: 'center', fontSize: 13 }}>
              <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>Failed to load students</div>
              <div style={{ color: '#6b7280', marginBottom: 16 }}>{loadError}</div>
              <button onClick={load} style={{ padding: '8px 18px', background: TEAL, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No students in this category.</div>
          ) : filtered.map(s => {
            const cfg  = STATUS_CFG[s.account_status] ?? STATUS_CFG.unregistered;
            const name = studentName(s);
            const isSelected = selectedId === s.id;
            const isChecked  = checkedIds.has(s.id);
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {filter === 'pending_verification' && (
                  <input type="checkbox" checked={isChecked}
                    onChange={() => {}}
                    onClick={e => toggleCheck(s.id, e as unknown as React.MouseEvent)}
                    style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0, accentColor: TEAL }} />
                )}
                <button onClick={() => openDocs(s)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `1.5px solid ${isSelected ? TEAL : '#e5e7eb'}`, background: isSelected ? TEAL_L : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', boxShadow: isSelected ? `0 0 0 3px ${TEAL}20` : 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                    {name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{s.email}</div>
                    {s.student_profile && (
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                        {s.student_profile.college} · {s.student_profile.student_number}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
                      {cfg.label}
                    </span>
                    {s.student_profile?.gwa_request_status === 'pending' && (
                      <span style={{ padding: '3px 9px', borderRadius: 20, background: '#fff7ed', color: '#d97706', fontSize: 10, fontWeight: 700, border: '1px solid #fed7aa' }}>
                        GWA Pending
                      </span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Document review panel */}
        {selected && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'sticky', top: 24, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 28px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#111827' }}>{studentName(selected)}</h3>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{selected.email}</div>
              </div>
              <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af', padding: 4 }}>✕</button>
            </div>
            {selected.student_profile && (() => {
              const p = selected.student_profile;
              const row = (label: string, value: string | number | null | undefined) =>
                value ? (
                  <div key={label}>
                    <span style={{ color: '#9ca3af', fontWeight: 600 }}>{label}: </span>
                    <span style={{ color: '#111827', fontWeight: 500 }}>{value}</span>
                  </div>
                ) : null;
              const sectionTitle = (title: string) => (
                <div key={title} style={{ gridColumn: '1 / -1', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 8, marginBottom: 2 }}>{title}</div>
              );
              const address = [p.street_barangay, p.city_municipality, p.province, p.zip_code].filter(Boolean).join(', ');
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 16px', padding: '12px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 16, fontSize: 12 }}>
                  {sectionTitle('Academic')}
                  {row('Student No.', p.student_number)}
                  {row('Middle Name', p.middle_name)}
                  {row('College', p.college)}
                  {row('Program', p.program)}
                  {row('Year Level', `Year ${p.year_level}`)}
                  {row('GWA', p.gwa)}

                  {address && <>{sectionTitle('Address')}<div style={{ gridColumn: '1 / -1', color: '#111827', fontWeight: 500 }}>{address}</div></>}

                  {(p.father_name || p.mother_name) && sectionTitle('Family Background')}
                  {p.father_name && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ color: '#9ca3af', fontWeight: 600 }}>Father: </span>
                      <span style={{ color: '#111827', fontWeight: 500 }}>{p.father_name}{p.father_occupation ? ` · ${p.father_occupation}` : ''}</span>
                    </div>
                  )}
                  {p.mother_name && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ color: '#9ca3af', fontWeight: 600 }}>Mother: </span>
                      <span style={{ color: '#111827', fontWeight: 500 }}>{p.mother_name}{p.mother_occupation ? ` · ${p.mother_occupation}` : ''}</span>
                    </div>
                  )}

                  {(p.income_source || p.monthly_income) && sectionTitle('Financial')}
                  {row('Income Source', p.income_source)}
                  {row('Monthly Income', p.monthly_income ? (isNaN(Number(p.monthly_income)) ? p.monthly_income : `₱${Number(p.monthly_income).toLocaleString()}`) : null)}
                </div>
              );
            })()}

            {/* Rejection remarks (if any) */}
            {selected.rejection_remarks && (
              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
                <strong>Previous rejection reason:</strong> {selected.rejection_remarks}
              </div>
            )}

            {/* Documents */}
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Submitted Documents</div>
            {docsLoading ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading documents…</div>
            ) : selectedDocs.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No documents found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {selectedDocs.map(doc => {
                  const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.filename);
                  const isPdf = /\.pdf$/i.test(doc.filename);
                  return (
                    <div key={doc.id} style={{ borderRadius: 10, background: '#f9fafb', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                      {isImg && doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <img src={doc.url} alt={doc.doc_type} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block', borderBottom: '1px solid #f3f4f6' }} />
                        </a>
                      )}
                      {isPdf && doc.url && (
                        <iframe src={doc.url} title={doc.doc_type} style={{ width: '100%', height: 280, border: 'none', borderBottom: '1px solid #f3f4f6', display: 'block' }} />
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                            {doc.doc_type === 'school_id' ? 'School ID' : 'Certificate of Registration (COR)'}
                          </div>
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

            {/* GWA Request Review */}
            {selected.student_profile?.gwa_request_status === 'pending' && (
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>GWA Update Request</div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 13 }}>
                  <div><span style={{ color: '#9ca3af' }}>Current: </span><strong>{selected.student_profile.gwa ?? '—'}</strong></div>
                  <div><span style={{ color: '#9ca3af' }}>Requested: </span><strong style={{ color: '#d97706' }}>{selected.student_profile.pending_gwa}</strong></div>
                </div>
                <button
                    onClick={async () => {
                      if (gwaProofUrl) { setGwaProofUrl(null); return; }
                      try {
                        const { apiFetch } = await import('@/lib/api');
                        const res = await apiFetch<{ url: string }>(`/api/users/${selected.id}/gwa-proof`);
                        setGwaProofUrl(res.url);
                      } catch { addToast('error', 'Could not load proof.'); }
                    }}
                    style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', marginBottom: 10 }}>
                    {gwaProofUrl ? 'Hide Proof' : 'View SIS Screenshot'}
                  </button>
                {gwaProofUrl && (
                  gwaProofUrl.split('?')[0].toLowerCase().endsWith('.pdf')
                    ? <a href={gwaProofUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', marginBottom: 10, padding: '10px 14px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                        📄 Open PDF in new tab
                      </a>
                    : <a href={gwaProofUrl} target="_blank" rel="noopener noreferrer">
                        <img src={gwaProofUrl} alt="SIS proof" style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', display: 'block', marginBottom: 10 }} />
                      </a>
                )}
                <input value={gwaRejectNote} onChange={e => setGwaRejectNote(e.target.value)}
                  placeholder="Rejection reason (optional)" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '7px 10px', fontSize: 12, marginBottom: 10, boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button disabled={gwaReviewing} onClick={async () => {
                    setGwaReviewing(true);
                    try {
                      const { userApi } = await import('@/lib/api-client');
                      await userApi.approveGwaRequest(selected.id);
                      addToast('success', 'GWA update approved.');
                      setGwaProofUrl(null); setGwaRejectNote('');
                      setSelectedId(null);
                      await load();
                    } catch { addToast('error', 'Failed to approve.'); }
                    finally { setGwaReviewing(false); }
                  }} style={{ flex: 1, padding: '8px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    ✓ Approve
                  </button>
                  <button disabled={gwaReviewing} onClick={async () => {
                    setGwaReviewing(true);
                    try {
                      const { userApi } = await import('@/lib/api-client');
                      await userApi.rejectGwaRequest(selected.id, gwaRejectNote || undefined);
                      addToast('success', 'GWA update rejected.');
                      setGwaProofUrl(null); setGwaRejectNote('');
                      setSelectedId(null);
                      await load();
                    } catch { addToast('error', 'Failed to reject.'); }
                    finally { setGwaReviewing(false); }
                  }} style={{ flex: 1, padding: '8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    ✗ Reject
                  </button>
                </div>
              </div>
            )}

            {/* Actions — only for pending */}
            {selected.account_status === 'pending_verification' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => approve(selected)} disabled={saving || docsLoading}
                  style={{ flex: 1, padding: '11px', background: saving ? '#9ca3af' : '#059669', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Processing…' : '✓ Approve'}
                </button>
                <button onClick={() => { setActionStudent(selected); setShowReject(true); }} disabled={saving || docsLoading}
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
              <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 9, fontSize: 13, color: '#15803d', fontWeight: 600, textAlign: 'center' }}>
                ✓ This student is verified and has full access.
              </div>
            )}

            {selected.account_status === 'rejected' && (
              <button onClick={() => { setActionStudent(selected); setShowReject(false); approve(selected); }}
                disabled={saving} style={{ width: '100%', padding: '11px', background: saving ? '#9ca3af' : '#059669', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                Re-approve this student
              </button>
            )}
          </div>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {showReject && actionStudent && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowReject(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Reject Registration</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              Provide a reason so the student knows what to fix and re-upload.
            </p>
            <textarea
              rows={4}
              value={rejectRemarks}
              onChange={e => setRejectRemarks(e.target.value)}
              placeholder="e.g. School ID is blurry, please re-upload a clearer photo."
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6, marginBottom: 18 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowReject(false); setRejectRemarks(''); }}
                style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                Cancel
              </button>
              <button onClick={reject} disabled={!rejectRemarks.trim() || saving}
                style={{ flex: 1, padding: 10, background: !rejectRemarks.trim() || saving ? '#fca5a5' : '#dc2626', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: !rejectRemarks.trim() || saving ? 'not-allowed' : 'pointer', color: '#fff' }}>
                {saving ? 'Rejecting…' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
