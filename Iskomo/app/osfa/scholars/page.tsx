'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { scholarApi, academicPeriodApi, gwaSubmissionApi, type ScholarResponse, type ScholarStatus, type GwaSubmissionResponse } from '@/lib/api-client';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';
import { Skel } from '@/components/shared/Skeleton';

const TEAL      = COLORS.maroon;
const TEAL_DARK = COLORS.maroonD;

const STATUS_CFG: Record<ScholarStatus, { bg: string; color: string; dot: string; label: string }> = {
  active:       { bg: '#f0fdf4', color: '#059669', dot: '#10b981', label: 'Active'       },
  probationary: { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b', label: 'Probationary' },
  under_review: { bg: '#fff7ed', color: '#ea580c', dot: '#f97316', label: 'Under Review' },
  on_leave:     { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6', label: 'On Leave'     },
  suspended:    { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444', label: 'Suspended'    },
  terminated:   { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626', label: 'Terminated'   },
  graduated:    { bg: '#f5f3ff', color: '#7c3aed', dot: '#8b5cf6', label: 'Graduated'    },
};

const ALL_STATUSES: ScholarStatus[] = ['active', 'probationary', 'under_review', 'on_leave', 'suspended', 'terminated', 'graduated'];
// suspended is excluded from the modal — no API transition leads TO suspended (only from suspended → active/terminated)
const MODAL_STATUSES: ScholarStatus[] = ['active', 'probationary', 'under_review', 'on_leave', 'terminated', 'graduated'];
const REASON_REQUIRED: ScholarStatus[] = ['terminated'];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Page() {
  const { toasts, addToast, removeToast } = useToast();
  const [scholars, setScholars]       = useState<ScholarResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState<ScholarStatus>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedHistory, setExpandedHistory] = useState<Set<number>>(new Set());

  // Status update modal
  const [statusModal, setStatusModal]   = useState<ScholarResponse | null>(null);
  const [newStatus, setNewStatus]       = useState<ScholarStatus>('active');
  const [statusReason, setStatusReason] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError]   = useState('');

  // Semester record modal
  const [semModal, setSemModal] = useState<ScholarResponse | null>(null);
  const [semForm, setSemForm]   = useState({ semester: '1st Semester', academic_year: '2025-2026', gwa: '', notes: '', has_grade_below_2_5: false });
  const [semSaving, setSemSaving] = useState(false);

  // GWA review modal
  const [gwaModal,         setGwaModal]         = useState<ScholarResponse | null>(null);
  const [gwaModalSubs,     setGwaModalSubs]     = useState<GwaSubmissionResponse[]>([]);
  const [gwaModalLoading,  setGwaModalLoading]  = useState(false);
  const [gwaReviewForm,    setGwaReviewForm]    = useState<Record<number, { confirmedGwa: string; hasBelow25: boolean; notes: string; rejectRemarks: string }>>({});
  const [gwaSavingId,      setGwaSavingId]      = useState<number | null>(null);
  // pending count per scholar (scholar_id → count)
  const [pendingGwaCounts, setPendingGwaCounts] = useState<Record<number, number>>({});

  const fetchScholars = useCallback(async () => {
    setLoading(true);
    try {
      const first = await scholarApi.list(1, 100);
      const items = [...first.items];
      if (first.total > 100) {
        const pages = Math.min(Math.ceil(first.total / 100), 5);
        const rest = await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) => scholarApi.list(i + 2, 100))
        );
        rest.forEach(r => items.push(...r.items));
      }
      setScholars(items);
    } catch {
      addToast('error', 'Failed to load scholars.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchScholars(); }, [fetchScholars]);

  // Load pending GWA submission counts after scholars load
  useEffect(() => {
    if (scholars.length === 0) return;
    academicPeriodApi.getPendingSubmissions().then(subs => {
      const counts: Record<number, number> = {};
      for (const s of subs) {
        counts[s.scholar_id] = (counts[s.scholar_id] ?? 0) + 1;
      }
      setPendingGwaCounts(counts);
    }).catch(() => {});
  }, [scholars]);

  const counts = ALL_STATUSES.reduce((acc, k) => {
    acc[k] = scholars.filter(s => s.status === k).length;
    return acc;
  }, {} as Record<ScholarStatus, number>);

  const filtered = scholars.filter(s => {
    if (s.status !== activeTab) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.scholarship_id.toString().includes(q) ||
      s.student_id.toString().includes(q) ||
      (s.student_name ?? '').toLowerCase().includes(q) ||
      (s.scholarship_name ?? '').toLowerCase().includes(q)
    );
  });

  async function handleStatusUpdate() {
    if (!statusModal) return;
    if (REASON_REQUIRED.includes(newStatus) && !statusReason.trim()) {
      setStatusError(`A reason is required when setting status to "${STATUS_CFG[newStatus].label}".`);
      return;
    }
    setStatusSaving(true);
    setStatusError('');
    try {
      const updated = await scholarApi.updateStatus(statusModal.id, newStatus, {
        reason: statusReason.trim() || undefined,
      });
      setScholars(prev => prev.map(s => s.id === updated.id
        ? { ...updated, student_name: s.student_name, scholarship_name: s.scholarship_name }
        : s));
      const isTermination = newStatus === 'terminated';
      addToast('success', isTermination
        ? 'Scholar status updated. A termination notice has been emailed to the student.'
        : `Scholar status updated to ${STATUS_CFG[newStatus].label}.`
      );
      setStatusModal(null);
      setStatusReason('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      // Surface state-machine errors directly (e.g. "Cannot transition from X to Y")
      setStatusError(msg);
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleAddSemRecord() {
    if (!semModal) return;
    setSemSaving(true);
    const prevStatus = semModal.status;
    try {
      const record = await scholarApi.addSemesterRecord(semModal.id, {
        semester:             semForm.semester,
        academic_year:        semForm.academic_year,
        gwa:                  semForm.gwa || undefined,
        notes:                semForm.notes || undefined,
        is_enrolled:          true,
        has_grade_below_2_5:  semForm.has_grade_below_2_5,
      });

      // Re-fetch scholar to detect any auto-evaluation status change
      let updatedScholar: typeof semModal | null = null;
      try { updatedScholar = await scholarApi.get(semModal.id); } catch { /* silent */ }

      setScholars(prev => prev.map(s => {
        if (s.id !== semModal.id) return s;
        const base = updatedScholar ?? s;
        return { ...base, semester_records: [...base.semester_records.filter(r => r.id !== record.id), record] };
      }));

      addToast('success', 'Semester record added.');

      // Auto-evaluation toast
      const newStatus = updatedScholar?.status ?? prevStatus;
      if (newStatus !== prevStatus) {
        if (newStatus === 'probationary') {
          addToast('warning', 'Scholar placed on probation automatically based on submitted grades.');
        } else if (newStatus === 'active' && prevStatus === 'probationary') {
          addToast('success', "Scholar's probation lifted — grades meet retention requirements.");
        }
      }

      setSemModal(null);
      setSemForm({ semester: '1st Semester', academic_year: '2025-2026', gwa: '', notes: '', has_grade_below_2_5: false });
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to add record.');
    } finally {
      setSemSaving(false);
    }
  }

  function toggleHistory(id: number) {
    setExpandedHistory(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6,
  };

  if (loading) return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <Skel h={28} w={220} r={8} mb={8} />
      <Skel h={14} w={320} r={6} mb={20} />
      {/* status filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[...Array(7)].map((_, i) => <Skel key={i} h={60} w={100} r={10} />)}
      </div>
      {/* scholar rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Skel w={44} h={44} r={22} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Skel h={14} w="35%" r={6} mb={6} />
              <Skel h={11} w="55%" r={5} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Skel h={30} w={80} r={8} />
              <Skel h={30} w={100} r={8} />
              <Skel h={30} w={110} r={8} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Scholars</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Scholar Management</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Track, update status, and manage semester records of scholarship recipients</p>
        </div>
      </div>

      {/* Status tabs — scrollable row for 7 statuses */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, overflowX: 'auto', paddingBottom: 4 }}>
        {ALL_STATUSES.map(key => {
          const cfg = STATUS_CFG[key];
          const active = activeTab === key;
          return (
            <div key={key} onClick={() => setActiveTab(key)} style={{
              background: active ? cfg.bg : '#fff',
              border: `1px solid ${active ? cfg.dot + '88' : '#e5e7eb'}`,
              borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
              transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              flexShrink: 0, minWidth: 100, textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: active ? cfg.color : '#111827' }}>{counts[key]}</div>
              <div style={{ fontSize: 11, color: active ? cfg.color : '#6b7280', fontWeight: 600, marginTop: 2 }}>{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search by student name or scholarship name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#111827', background: 'transparent' }} />
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.length} scholar{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Scholar list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No {STATUS_CFG[activeTab].label} scholars</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              {activeTab === 'active' ? 'Scholars appear here when OSFA marks approved students as scholars.' : `No scholars currently in ${STATUS_CFG[activeTab].label} status.`}
            </div>
          </div>
        ) : filtered.map(scholar => {
          const cfg = STATUS_CFG[scholar.status];
          const latestRecord = scholar.semester_records.at(-1);
          const logs = scholar.status_logs ?? [];
          const historyOpen = expandedHistory.has(scholar.id);
          return (
            <div key={scholar.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

                {/* Avatar */}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {scholar.student_name ? scholar.student_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() : scholar.student_id.toString().slice(-2)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                      {scholar.student_name ?? `Student #${scholar.student_id}`}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot }} />
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{scholar.scholarship_name ?? `Scholarship #${scholar.scholarship_id}`}</span>
                    {latestRecord && (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Latest: {latestRecord.semester} {latestRecord.academic_year} · GWA: {latestRecord.gwa ?? '—'}</span>
                    )}
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{scholar.semester_records.length} semester record{scholar.semester_records.length !== 1 ? 's' : ''}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: scholar.allowance_status === 'released' ? '#15803d' : scholar.allowance_status === 'partial' ? '#d97706' : '#6b7280' }}>
                      Allowance: {scholar.allowance_status === 'released' ? 'Released' : scholar.allowance_status === 'partial' ? 'Partial' : 'Pending'}
                      {scholar.amount_released ? ` · ₱${scholar.amount_released.toLocaleString()}` : ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  {logs.length > 0 && (
                    <button onClick={() => toggleHistory(scholar.id)}
                      style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: historyOpen ? '#f3f4f6' : '#fafafa', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {historyOpen ? 'Hide History' : `History (${logs.length})`}
                    </button>
                  )}
                  {(pendingGwaCounts[scholar.id] ?? 0) > 0 && (
                    <button onClick={async () => {
                      setGwaModal(scholar); setGwaModalLoading(true); setGwaModalSubs([]);
                      try {
                        const subs = await gwaSubmissionApi.list(scholar.id);
                        setGwaModalSubs(subs);
                        const forms: typeof gwaReviewForm = {};
                        for (const sub of subs) {
                          forms[sub.id] = { confirmedGwa: sub.declared_gwa ?? '', hasBelow25: sub.has_grade_below_2_5, notes: '', rejectRemarks: '' };
                        }
                        setGwaReviewForm(forms);
                      } catch (err) {
                        addToast('error', err instanceof Error ? err.message : 'Failed to load GWA submissions.');
                      } finally { setGwaModalLoading(false); }
                    }}
                      style={{ position: 'relative', padding: '7px 14px', border: '1px solid #fbbf24', borderRadius: 8, background: '#fffbeb', color: '#92400e', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      GWA Review
                      <span style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {pendingGwaCounts[scholar.id]}
                      </span>
                    </button>
                  )}
                  <button onClick={() => { setSemModal(scholar); }}
                    style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    + Sem Record
                  </button>
                  <button onClick={() => { setStatusModal(scholar); setNewStatus(MODAL_STATUSES.includes(scholar.status) ? scholar.status : 'active'); setStatusReason(''); setStatusError(''); }}
                    style={{ padding: '7px 14px', border: `1px solid ${TEAL}33`, borderRadius: 8, background: '#fff5f5', color: TEAL, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Update Status
                  </button>
                  <Link href={`/osfa/applicants/${scholar.application_id}`} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    View Application
                  </Link>
                </div>
              </div>

              {/* Semester records */}
              {scholar.semester_records.length > 0 && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '10px 20px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
                    {scholar.semester_records.map((r, i) => (
                      <div key={r.id} style={{ padding: '6px 16px', borderRight: i < scholar.semester_records.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{r.semester} {r.academic_year}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: r.gwa ? (parseFloat(r.gwa) <= 2.0 ? '#059669' : parseFloat(r.gwa) <= 2.75 ? '#d97706' : '#dc2626') : '#111827' }}>
                          GWA: {r.gwa ?? '—'}
                        </div>
                        {r.has_grade_below_2_5 && (
                          <div style={{ display: 'inline-block', marginTop: 3, padding: '1px 7px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', fontSize: 10, fontWeight: 700, border: '1px solid #fecaca' }}>
                            ⚠ Low Grade
                          </div>
                        )}
                        {/* Benefit status */}
                        {r.benefit_released ? (
                          <div style={{ fontSize: 10, color: '#059669', fontWeight: 700, marginTop: 2 }}>
                            Benefit Released {r.benefit_released_at ? `· ${new Date(r.benefit_released_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                          </div>
                        ) : (
                          ['active', 'probationary'].includes(scholar.status) && (
                            <button
                              onClick={async () => {
                                try {
                                  const updated = await scholarApi.releaseBenefit(scholar.id, r.id);
                                  setScholars(prev => prev.map(s => s.id === scholar.id
                                    ? { ...s, semester_records: s.semester_records.map(sr => sr.id === updated.id ? updated : sr) }
                                    : s
                                  ));
                                  addToast('success', `Benefit released for ${r.semester} ${r.academic_year}.`);
                                } catch (err) {
                                  addToast('error', err instanceof Error ? err.message : 'Failed to release benefit.');
                                }
                              }}
                              style={{ marginTop: 4, padding: '2px 8px', border: '1px solid #86efac', borderRadius: 6, background: '#f0fdf4', color: '#15803d', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                              Release Benefit
                            </button>
                          )
                        )}
                        {/* Thank-you letter status — only if scholarship requires it */}
                        {r.thank_you_submitted ? (
                          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>
                            Thank you letter confirmed {r.thank_you_submitted_at ? `· ${new Date(r.thank_you_submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                          </div>
                        ) : r.benefit_released && (
                          <button
                            onClick={async () => {
                              try {
                                const updated = await scholarApi.confirmThankYou(scholar.id, r.id);
                                setScholars(prev => prev.map(s => s.id === scholar.id
                                  ? { ...s, semester_records: s.semester_records.map(sr => sr.id === updated.id ? updated : sr) }
                                  : s
                                ));
                                addToast('success', 'Thank you letter confirmed.');
                              } catch (err) {
                                addToast('error', err instanceof Error ? err.message : 'Failed to confirm letter.');
                              }
                            }}
                            style={{ marginTop: 4, padding: '2px 8px', border: '1px solid #d8b4fe', borderRadius: 6, background: '#faf5ff', color: '#7c3aed', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                            Confirm Physical Letter
                          </button>
                        )}
                        {r.notes && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{r.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status History timeline */}
              {historyOpen && logs.length > 0 && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px 20px', background: '#fafbff' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Status History</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[...logs].reverse().map((log, i) => {
                      const toCfg  = STATUS_CFG[log.to_status as ScholarStatus] ?? { color: '#374151', label: log.to_status };
                      const fromCfg = log.from_status
                        ? (STATUS_CFG[log.from_status as ScholarStatus] ?? { color: '#9ca3af', label: log.from_status })
                        : null;
                      return (
                        <div key={log.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: i < logs.length - 1 ? 14 : 0, position: 'relative' }}>
                          {/* Timeline dot + line */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: toCfg.color, border: '2px solid #fff', boxShadow: `0 0 0 1px ${toCfg.color}`, marginTop: 3 }} />
                            {i < logs.length - 1 && <div style={{ width: 1, flex: 1, background: '#e5e7eb', minHeight: 18, marginTop: 3 }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: log.reason ? 3 : 0 }}>
                              {fromCfg && (
                                <>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: fromCfg.color }}>{fromCfg.label}</span>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                </>
                              )}
                              <span style={{ fontSize: 12, fontWeight: 700, color: toCfg.color }}>{toCfg.label}</span>
                              <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{fmtDate(log.created_at)}</span>
                            </div>
                            {log.reason && (
                              <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>&ldquo;{log.reason}&rdquo;</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Status Update Modal ── */}
      {statusModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => { setStatusModal(null); setStatusError(''); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Update Scholar Status</h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>Scholar #{statusModal.id} · Student #{statusModal.student_id}</p>

            <label style={labelStyle}>New Status</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
              {MODAL_STATUSES.map(key => {
                const cfg = STATUS_CFG[key];
                return (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', borderRadius: 9, border: `1.5px solid ${newStatus === key ? cfg.dot : '#e5e7eb'}`, background: newStatus === key ? cfg.bg : '#fff', cursor: 'pointer' }}>
                    <input type="radio" name="status" value={key} checked={newStatus === key} onChange={() => { setNewStatus(key); setStatusError(''); }} style={{ accentColor: cfg.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                    {REASON_REQUIRED.includes(key) && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>reason required</span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Reason textarea */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                Reason
                {REASON_REQUIRED.includes(newStatus)
                  ? <span style={{ color: '#dc2626' }}> *</span>
                  : <span style={{ color: '#9ca3af', fontWeight: 400 }}> (optional)</span>}
              </label>
              <textarea
                value={statusReason}
                onChange={e => { setStatusReason(e.target.value); setStatusError(''); }}
                rows={3}
                placeholder={REASON_REQUIRED.includes(newStatus) ? 'Provide a reason for this status change…' : 'Optional — add context for the status change'}
                style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
              />
            </div>

            {statusError && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
                {statusError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setStatusModal(null); setStatusError(''); setStatusReason(''); }}
                style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                Cancel
              </button>
              <button onClick={handleStatusUpdate} disabled={statusSaving}
                style={{ flex: 1, padding: 10, background: statusSaving ? '#9ca3af' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: statusSaving ? 'not-allowed' : 'pointer', color: '#fff' }}>
                {statusSaving ? 'Saving…' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Semester Record Modal ── */}
      {semModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setSemModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Add Semester Record</h2>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: '#6b7280' }}>Scholar #{semModal.id} · Student #{semModal.student_id}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Semester</label>
                  <select value={semForm.semester} onChange={e => setSemForm(p => ({ ...p, semester: e.target.value }))} style={inp}>
                    <option>1st Semester</option>
                    <option>2nd Semester</option>
                    <option>Summer</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Academic Year</label>
                  <input type="text" value={semForm.academic_year} onChange={e => setSemForm(p => ({ ...p, academic_year: e.target.value }))} placeholder="2025-2026" style={inp} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>GWA <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                <input type="number" step="0.01" min="1" max="5" value={semForm.gwa} onChange={e => setSemForm(p => ({ ...p, gwa: e.target.value }))} placeholder="e.g. 1.75" style={inp} />
              </div>
              <div>
                <label style={labelStyle}>Notes <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                <textarea value={semForm.notes} onChange={e => setSemForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Any remarks for this semester..." style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
              </div>
              {/* Grade flag */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 9, border: `1.5px solid ${semForm.has_grade_below_2_5 ? '#fca5a5' : '#e5e7eb'}`, background: semForm.has_grade_below_2_5 ? '#fef2f2' : '#fafafa', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={semForm.has_grade_below_2_5}
                  onChange={e => setSemForm(p => ({ ...p, has_grade_below_2_5: e.target.checked }))}
                  style={{ marginTop: 1, accentColor: '#dc2626', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: semForm.has_grade_below_2_5 ? '#dc2626' : '#374151' }}>
                    Student has a subject grade below 2.5
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, lineHeight: 1.4 }}>
                    Tick this when the grade slip shows any individual subject grade of 3.0 or lower
                  </div>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setSemModal(null)}
                style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                Cancel
              </button>
              <button onClick={handleAddSemRecord} disabled={semSaving}
                style={{ flex: 1, padding: 10, background: semSaving ? '#9ca3af' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: semSaving ? 'not-allowed' : 'pointer', color: '#fff' }}>
                {semSaving ? 'Saving…' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GWA Review Modal ── */}
      {gwaModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setGwaModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 580, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#111827' }}>GWA Submissions</h2>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{gwaModal.student_name ?? `Scholar #${gwaModal.id}`}</p>
              </div>
              <button onClick={() => setGwaModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', fontSize: 18 }}>✕</button>
            </div>

            {gwaModalLoading ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>Loading submissions…</div>
            ) : gwaModalSubs.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No GWA submissions yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {gwaModalSubs.map(sub => {
                  const form = gwaReviewForm[sub.id] ?? { confirmedGwa: '', hasBelow25: false, notes: '', rejectRemarks: '' };
                  const badgeCfg = {
                    pending:  { bg: '#fef9c3', color: '#92400e', label: 'Pending Review' },
                    approved: { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
                    rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
                  }[sub.status];
                  return (
                    <div key={sub.id} style={{ borderRadius: 12, border: `1px solid ${sub.status === 'pending' ? '#fbbf24' : '#e5e7eb'}`, overflow: 'hidden' }}>
                      {/* Header */}
                      <div style={{ padding: '12px 16px', background: sub.status === 'pending' ? '#fffbeb' : '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{sub.period.label}</div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                            Declared GWA: <strong>{sub.declared_gwa ?? 'not provided'}</strong>
                            {sub.has_grade_below_2_5 && <span style={{ marginLeft: 10, color: '#ea580c', fontWeight: 600 }}>⚠ Has grade below 2.5</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {sub.proof_url && (
                            <a href={sub.proof_url} target="_blank" rel="noreferrer"
                              style={{ fontSize: 11, padding: '4px 10px', border: '1px solid #e5e7eb', borderRadius: 6, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                              View Slip
                            </a>
                          )}
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: badgeCfg.bg, color: badgeCfg.color }}>{badgeCfg.label}</span>
                        </div>
                      </div>

                      {/* Review form — only for pending */}
                      {sub.status === 'pending' && (
                        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                                Confirmed GWA <span style={{ color: '#9ca3af', fontWeight: 400 }}>(leave blank to use declared)</span>
                              </label>
                              <input type="text" placeholder={sub.declared_gwa ?? 'e.g. 1.75'} value={form.confirmedGwa}
                                onChange={e => setGwaReviewForm(p => ({ ...p, [sub.id]: { ...form, confirmedGwa: e.target.value } }))}
                                style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                          </div>

                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#374151' }}>
                            <input type="checkbox" checked={form.hasBelow25}
                              onChange={e => setGwaReviewForm(p => ({ ...p, [sub.id]: { ...form, hasBelow25: e.target.checked } }))}
                              style={{ accentColor: '#dc2626' }} />
                            Has subject grade below 2.5
                          </label>

                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Notes (optional)</label>
                            <input type="text" placeholder="Any remarks for this approval…" value={form.notes}
                              onChange={e => setGwaReviewForm(p => ({ ...p, [sub.id]: { ...form, notes: e.target.value } }))}
                              style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              disabled={gwaSavingId === sub.id}
                              onClick={async () => {
                                setGwaSavingId(sub.id);
                                try {
                                  const updated = await gwaSubmissionApi.approve(gwaModal.id, sub.id, {
                                    confirmed_gwa: form.confirmedGwa || undefined,
                                    has_grade_below_2_5: form.hasBelow25,
                                    notes: form.notes || undefined,
                                  });
                                  setGwaModalSubs(prev => prev.map(s => s.id === sub.id ? updated : s));
                                  setPendingGwaCounts(prev => ({ ...prev, [gwaModal.id]: Math.max(0, (prev[gwaModal.id] ?? 1) - 1) }));
                                  addToast('success', `GWA submission approved for ${sub.period.label}.`);
                                  // Refresh scholar to pick up new semester record
                                  scholarApi.get(gwaModal.id).then(updated => {
                                    setScholars(prev => prev.map(s => s.id === gwaModal.id
                                      ? { ...updated, student_name: s.student_name, scholarship_name: s.scholarship_name }
                                      : s
                                    ));
                                  }).catch(() => {});
                                } catch (err) {
                                  addToast('error', err instanceof Error ? err.message : 'Failed to approve.');
                                } finally { setGwaSavingId(null); }
                              }}
                              style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, background: gwaSavingId === sub.id ? '#9ca3af' : '#15803d', color: '#fff', fontSize: 13, fontWeight: 700, cursor: gwaSavingId === sub.id ? 'not-allowed' : 'pointer' }}>
                              {gwaSavingId === sub.id ? 'Saving…' : '✓ Approve & Record GWA'}
                            </button>
                          </div>

                          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>Reject — reason required</label>
                              <input type="text" placeholder="Reason for rejection…" value={form.rejectRemarks}
                                onChange={e => setGwaReviewForm(p => ({ ...p, [sub.id]: { ...form, rejectRemarks: e.target.value } }))}
                                style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #fca5a5', borderRadius: 7, fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <button
                              disabled={!form.rejectRemarks.trim() || gwaSavingId === sub.id}
                              onClick={async () => {
                                if (!form.rejectRemarks.trim()) return;
                                setGwaSavingId(sub.id);
                                try {
                                  const updated = await gwaSubmissionApi.reject(gwaModal.id, sub.id, form.rejectRemarks.trim());
                                  setGwaModalSubs(prev => prev.map(s => s.id === sub.id ? updated : s));
                                  setPendingGwaCounts(prev => ({ ...prev, [gwaModal.id]: Math.max(0, (prev[gwaModal.id] ?? 1) - 1) }));
                                  addToast('warning', `GWA submission rejected. Student can resubmit.`);
                                } catch (err) {
                                  addToast('error', err instanceof Error ? err.message : 'Failed to reject.');
                                } finally { setGwaSavingId(null); }
                              }}
                              style={{ padding: '8px 14px', border: '1.5px solid #fca5a5', borderRadius: 8, background: !form.rejectRemarks.trim() ? '#fef2f2' : '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: !form.rejectRemarks.trim() ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Rejected — show reason */}
                      {sub.status === 'rejected' && sub.rejection_remarks && (
                        <div style={{ padding: '10px 16px', background: '#fef2f2', fontSize: 12, color: '#dc2626' }}>
                          Rejection reason: {sub.rejection_remarks}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
