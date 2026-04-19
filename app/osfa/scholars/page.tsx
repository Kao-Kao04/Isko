'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type Applicant, type ScholarStatus } from '@/lib/osfa-data';
import { useOsfaContext } from '@/lib/osfa-context';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';

const TEAL = '#800000';
const TEAL_DARK = '#5C0000';
const TEAL_LIGHT = '#fff5f5';

const statusStyle: Record<ScholarStatus, { bg: string; color: string; dot: string }> = {
  'Active':       { bg: '#fff5f5', color: '#059669', dot: '#10b981' },
  'Probationary': { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  'Terminated':   { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
  'Graduated':    { bg: '#f5f3ff', color: '#7c3aed', dot: '#8b5cf6' },
};

function StatusBadge({ status }: { status: ScholarStatus }) {
  const s = statusStyle[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  );
}

type TabFilter = 'Active' | 'Probationary' | 'Terminated' | 'Graduated';

const EMPTY_SEM = { semester: '1st Sem', academicYear: 'AY 2025–2026', gwa: '', enrollmentVerified: true, notes: '' };

export default function Page() {
  const { applicants, setApplicants } = useOsfaContext();
  const { toasts, addToast, removeToast } = useToast();

  const [activeTab, setActiveTab]   = useState<TabFilter>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected]     = useState<Applicant | null>(null);

  // Modals
  const [showUpdateSem, setShowUpdateSem]   = useState(false);
  const [showTerminate, setShowTerminate]   = useState(false);
  const [showGraduate, setShowGraduate]     = useState(false);
  const [showAppeal, setShowAppeal]         = useState(false);
  const [showHistory, setShowHistory]       = useState(false);
  const [appealMode, setAppealMode]         = useState<'file' | 'review'>('file');

  // Form states
  const [semForm, setSemForm]           = useState(EMPTY_SEM);
  const [terminateReason, setTerminateReason] = useState('');
  const [appealReason, setAppealReason] = useState('');
  const [appealReviewNote, setAppealReviewNote] = useState('');

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const scholars    = applicants.filter(a => a.scholarStatus !== undefined);
  const nonGraduated = scholars.filter(a => a.scholarStatus !== 'Graduated');
  const graduated   = scholars.filter(a => a.scholarStatus === 'Graduated');

  const counts = {
    Active:       nonGraduated.filter(a => a.scholarStatus === 'Active').length,
    Probationary: nonGraduated.filter(a => a.scholarStatus === 'Probationary').length,
    Terminated:   nonGraduated.filter(a => a.scholarStatus === 'Terminated').length,
    Graduated:    graduated.length,
  };

  const pool     = activeTab === 'Graduated' ? graduated : nonGraduated.filter(a => a.scholarStatus === activeTab);
  const filtered = pool.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.scholarship.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function update(id: string, patch: Partial<Applicant>) {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }

  function handleUpdateSemester() {
    if (!selected || !semForm.gwa) return;
    const gwa = parseFloat(semForm.gwa);
    let newStatus: ScholarStatus = selected.scholarStatus!;

    if (gwa > 2.0 && selected.scholarStatus === 'Active') {
      newStatus = 'Probationary';
    } else if (gwa <= 2.0 && selected.scholarStatus === 'Probationary') {
      newStatus = 'Active';
    }

    const newRecord = {
      semester: semForm.semester,
      academicYear: semForm.academicYear,
      gwa: semForm.gwa,
      status: newStatus,
      enrollmentVerified: semForm.enrollmentVerified,
      notes: semForm.notes,
      verifiedBy: 'OSFA Staff',
      date: today,
    };

    update(selected.id, {
      gwa: semForm.gwa,
      scholarStatus: newStatus,
      semesterRecords: [...(selected.semesterRecords ?? []), newRecord],
      audit: [...selected.audit, { date: today, action: `Semester record added — ${semForm.semester} ${semForm.academicYear}, GWA ${semForm.gwa}${newStatus !== selected.scholarStatus ? ` → status changed to ${newStatus}` : ''}`, by: 'OSFA Staff' }],
    });

    if (newStatus !== selected.scholarStatus) {
      addToast(newStatus === 'Active' ? 'success' : 'warning',
        `${selected.name} status changed to ${newStatus} (GWA ${semForm.gwa}).`);
    } else {
      addToast('success', `Semester record saved for ${selected.name}.`);
    }
    setShowUpdateSem(false);
    setSemForm(EMPTY_SEM);
  }

  function handleTerminate() {
    if (!selected || !terminateReason) return;
    update(selected.id, {
      scholarStatus: 'Terminated',
      audit: [...selected.audit, { date: today, action: `Scholarship terminated — ${terminateReason}`, by: 'OSFA Staff' }],
    });
    addToast('error', `${selected.name}'s scholarship has been terminated.`);
    setShowTerminate(false);
    setTerminateReason('');
    setSelected(null);
  }

  function handleGraduate() {
    if (!selected) return;
    update(selected.id, {
      scholarStatus: 'Graduated',
      isGraduating: false,
      audit: [...selected.audit, { date: today, action: 'Marked as Graduated — removed from active scholars list', by: 'OSFA Staff' }],
    });
    addToast('success', `${selected.name} has been marked as Graduated.`);
    setShowGraduate(false);
    setSelected(null);
  }

  function handleFileAppeal() {
    if (!selected || !appealReason) return;
    update(selected.id, {
      appeal: { status: 'Pending', reason: appealReason, submittedDate: today },
      audit: [...selected.audit, { date: today, action: 'Appeal filed for terminated scholarship', by: 'OSFA Staff' }],
    });
    addToast('info', `Appeal filed for ${selected.name}. Pending review.`);
    setShowAppeal(false);
    setAppealReason('');
  }

  function handleReviewAppeal(approve: boolean) {
    if (!selected) return;
    const newStatus: ScholarStatus = approve ? 'Probationary' : 'Terminated';
    update(selected.id, {
      scholarStatus: newStatus,
      appeal: {
        ...selected.appeal!,
        status: approve ? 'Approved' : 'Denied',
        reviewNote: appealReviewNote,
        reviewedDate: today,
      },
      audit: [...selected.audit, {
        date: today,
        action: `Appeal ${approve ? 'approved — reinstated on Probationary status' : 'denied — remains Terminated'}${appealReviewNote ? `: ${appealReviewNote}` : ''}`,
        by: 'OSFA Staff',
      }],
    });
    addToast(approve ? 'success' : 'error',
      approve ? `${selected.name} reinstated on Probationary status.` : `${selected.name}'s appeal was denied.`);
    setShowAppeal(false);
    setAppealReviewNote('');
    setSelected(null);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
    fontSize: 13, color: '#111827', background: '#f9fafb', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

  const tabConfig: { key: TabFilter; color: string; bg: string; border: string }[] = [
    { key: 'Active',       color: '#059669', bg: '#fff5f5', border: '#6ee7b7' },
    { key: 'Probationary', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
    { key: 'Terminated',   color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
    { key: 'Graduated',    color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Scholars</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>Scholar Management</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Track and manage active scholars, semester records, and appeals</p>
      </div>

      {/* Stats tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {tabConfig.map(({ key, color, bg, border }) => (
          <div key={key} onClick={() => setActiveTab(key)}
            style={{ background: activeTab === key ? bg : '#fff', border: `1px solid ${activeTab === key ? border : '#e2e8f0'}`, borderRadius: 11, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{counts[key]}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, fontWeight: 500 }}>{key}</div>
            {key === 'Graduated' && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Auto-archived</div>}
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search by name, scholarship, or program..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#111827', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{filtered.length} scholar{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Graduated notice */}
      {activeTab === 'Graduated' && (
        <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 9, padding: '10px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          <span style={{ fontSize: 12, color: '#6d28d9', fontWeight: 500 }}>Graduated scholars are automatically archived and no longer appear in the active management list.</span>
        </div>
      )}

      {/* Scholar list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No scholars found</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              {activeTab === 'Graduated' ? 'No graduated scholars yet.' : `No ${activeTab.toLowerCase()} scholars found.`}
            </div>
          </div>
        ) : filtered.map(scholar => {
          const lastSem    = (scholar.semesterRecords ?? []).at(-1);
          const hasPending = scholar.appeal?.status === 'Pending';

          return (
            <div key={scholar.id} style={{
              background: '#fff', borderRadius: 14,
              border: hasPending ? '1.5px solid #fbbf24' : '1px solid #e2e8f0',
              padding: '18px 22px', boxShadow: hasPending ? '0 1px 3px rgba(0,0,0,0.06), 0 0 0 3px #fffbeb' : '0 1px 3px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
            }}>
              {/* Avatar */}
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{scholar.initials}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{scholar.name}</div>
                  <StatusBadge status={scholar.scholarStatus!} />
                  {scholar.isGraduating && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '2px 9px', borderRadius: 20, border: '1px solid #c4b5fd' }}>
                      Graduating — {scholar.expectedGraduation}
                    </span>
                  )}
                  {hasPending && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#b45309', background: '#fffbeb', padding: '2px 9px', borderRadius: 20, border: '1px solid #fcd34d' }}>
                      Appeal Pending
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{scholar.scholarship}</div>
                <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{scholar.program}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{scholar.yearLevel}</span>
                  {lastSem && (
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>Last GWA: <strong style={{ color: parseFloat(lastSem.gwa) > 2.0 ? '#d97706' : '#059669' }}>{lastSem.gwa}</strong> ({lastSem.semester} {lastSem.academicYear})</span>
                  )}
                  {!lastSem && (
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>GWA: {scholar.gwa}</span>
                  )}
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{(scholar.semesterRecords ?? []).length} semester record{(scholar.semesterRecords ?? []).length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Actions */}
              {activeTab !== 'Graduated' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>

                  {/* History */}
                  <button onClick={() => { setSelected(scholar); setShowHistory(true); }}
                    style={{ padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f9fafb', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    History
                  </button>

                  {/* Update semester — Active or Probationary */}
                  {(scholar.scholarStatus === 'Active' || scholar.scholarStatus === 'Probationary') && (
                    <button onClick={() => { setSelected(scholar); setShowUpdateSem(true); }}
                      style={{ padding: '7px 14px', border: 'none', borderRadius: 8, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: `0 2px 6px ${TEAL}40` }}>
                      Update Semester
                    </button>
                  )}

                  {/* Terminate — Active or Probationary */}
                  {(scholar.scholarStatus === 'Active' || scholar.scholarStatus === 'Probationary') && (
                    <button onClick={() => { setSelected(scholar); setShowTerminate(true); }}
                      style={{ padding: '7px 14px', border: '1px solid #fecaca', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Terminate
                    </button>
                  )}

                  {/* Graduate — Active or Probationary */}
                  {(scholar.scholarStatus === 'Active' || scholar.scholarStatus === 'Probationary') && (
                    <button onClick={() => { setSelected(scholar); setShowGraduate(true); }}
                      style={{ padding: '7px 14px', border: '1px solid #c4b5fd', borderRadius: 8, background: '#f5f3ff', color: '#7c3aed', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Graduate
                    </button>
                  )}

                  {/* Appeal — Terminated only */}
                  {scholar.scholarStatus === 'Terminated' && !hasPending && !scholar.appeal && (
                    <button onClick={() => { setSelected(scholar); setAppealMode('file'); setShowAppeal(true); }}
                      style={{ padding: '7px 14px', border: 'none', borderRadius: 8, background: '#f59e0b', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(245,158,11,0.35)' }}>
                      File Appeal
                    </button>
                  )}

                  {/* Review Appeal — Terminated with pending appeal */}
                  {scholar.scholarStatus === 'Terminated' && hasPending && (
                    <button onClick={() => { setSelected(scholar); setAppealMode('review'); setShowAppeal(true); }}
                      style={{ padding: '7px 14px', border: 'none', borderRadius: 8, background: '#f59e0b', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(245,158,11,0.35)' }}>
                      Review Appeal
                    </button>
                  )}

                  {/* Appeal result badge */}
                  {scholar.appeal && scholar.appeal.status !== 'Pending' && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: scholar.appeal.status === 'Approved' ? '#059669' : '#dc2626', background: scholar.appeal.status === 'Approved' ? '#fff5f5' : '#fef2f2', padding: '3px 9px', borderRadius: 20, border: `1px solid ${scholar.appeal.status === 'Approved' ? '#86efac' : '#fecaca'}` }}>
                      Appeal {scholar.appeal.status}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Update Semester Modal ─────────────────────────────────── */}
      {showUpdateSem && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowUpdateSem(false)}>
          <div style={{ background: '#fff', borderRadius: 18, maxWidth: 480, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>Update Semester Record</h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#9ca3af' }}>{selected.name} — {selected.scholarship}</p>
              </div>
              <button onClick={() => setShowUpdateSem(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Semester</label>
                  <select value={semForm.semester} onChange={e => setSemForm(p => ({ ...p, semester: e.target.value }))} style={inputStyle}>
                    <option>1st Sem</option>
                    <option>2nd Sem</option>
                    <option>Summer</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Academic Year</label>
                  <select value={semForm.academicYear} onChange={e => setSemForm(p => ({ ...p, academicYear: e.target.value }))} style={inputStyle}>
                    <option>AY 2024–2025</option>
                    <option>AY 2025–2026</option>
                    <option>AY 2026–2027</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>GWA <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="number" step="0.01" min="1.0" max="5.0" value={semForm.gwa} onChange={e => setSemForm(p => ({ ...p, gwa: e.target.value }))} placeholder="e.g., 1.75" style={inputStyle} />
                {semForm.gwa && parseFloat(semForm.gwa) > 2.0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#d97706', fontWeight: 500 }}>
                    GWA above 2.0 — scholar will be flagged as Probationary if currently Active.
                  </div>
                )}
                {semForm.gwa && parseFloat(semForm.gwa) <= 2.0 && selected.scholarStatus === 'Probationary' && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#059669', fontWeight: 500 }}>
                    GWA recovered — scholar will be reinstated to Active.
                  </div>
                )}
              </div>
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={semForm.enrollmentVerified} onChange={e => setSemForm(p => ({ ...p, enrollmentVerified: e.target.checked }))} style={{ width: 15, height: 15, accentColor: TEAL }} />
                  Enrollment verified for this semester
                </label>
              </div>
              <div>
                <label style={labelStyle}>Notes <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                <textarea value={semForm.notes} onChange={e => setSemForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Any observations or remarks..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10, justifyContent: 'flex-end', background: '#fafafa' }}>
              <button onClick={() => setShowUpdateSem(false)} style={{ padding: '9px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleUpdateSemester} disabled={!semForm.gwa} style={{ padding: '9px 24px', background: semForm.gwa ? `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` : '#fecaca', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: semForm.gwa ? 'pointer' : 'not-allowed', color: semForm.gwa ? '#fff' : '#6ee7b7' }}>Save Record</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Semester History Modal ────────────────────────────────── */}
      {showHistory && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowHistory(false)}>
          <div style={{ background: '#fff', borderRadius: 18, maxWidth: 540, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>Semester History</h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#9ca3af' }}>{selected.name} — {selected.scholarship}</p>
              </div>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '22px 24px', overflowY: 'auto' }}>
              {(selected.semesterRecords ?? []).length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No semester records yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...(selected.semesterRecords ?? [])].reverse().map((rec, i) => {
                    const s = statusStyle[rec.status];
                    return (
                      <div key={i} style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{rec.semester} — {rec.academicYear}</div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />{rec.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 20 }}>
                          <div><div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GWA</div><div style={{ fontSize: 15, fontWeight: 800, color: parseFloat(rec.gwa) > 2.0 ? '#d97706' : '#059669' }}>{rec.gwa}</div></div>
                          <div><div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enrollment</div><div style={{ fontSize: 13, fontWeight: 600, color: rec.enrollmentVerified ? '#059669' : '#dc2626' }}>{rec.enrollmentVerified ? 'Verified' : 'Not Verified'}</div></div>
                          <div><div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recorded</div><div style={{ fontSize: 12, color: '#6b7280' }}>{rec.date}</div></div>
                        </div>
                        {rec.notes && <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280', borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>{rec.notes}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Terminate Modal ───────────────────────────────────────── */}
      {showTerminate && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowTerminate(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Terminate Scholarship</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              <strong>{selected.name}</strong>'s scholarship will be terminated. They may still file an appeal afterward.
            </p>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Reason <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={terminateReason} onChange={e => setTerminateReason(e.target.value)} style={inputStyle}>
                <option value="">Select a reason...</option>
                <option value="GWA dropped below minimum for two consecutive semesters">GWA dropped below minimum for two consecutive semesters</option>
                <option value="Failed to maintain enrollment">Failed to maintain enrollment</option>
                <option value="Disciplinary violation">Disciplinary violation</option>
                <option value="Receiving another scholarship">Receiving another scholarship</option>
                <option value="Voluntary withdrawal">Voluntary withdrawal</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowTerminate(false); setTerminateReason(''); }} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button disabled={!terminateReason} onClick={handleTerminate} style={{ flex: 1, padding: 10, background: terminateReason ? '#dc2626' : '#fca5a5', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: terminateReason ? 'pointer' : 'not-allowed', color: '#fff' }}>Terminate</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Graduate Modal ────────────────────────────────────────── */}
      {showGraduate && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowGraduate(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Mark as Graduated</h2>
            <p style={{ margin: '0 0 6px', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
              <strong>{selected.name}</strong> will be marked as Graduated.
            </p>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
              They will be automatically removed from the active scholars list and moved to the Graduated archive. All records are preserved.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowGraduate(false)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleGraduate} style={{ flex: 1, padding: 10, background: '#7c3aed', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Confirm Graduation</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Appeal Modal (File + Review) ──────────────────────────── */}
      {showAppeal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowAppeal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>

            {appealMode === 'file' ? (
              <>
                <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827' }}>File an Appeal</h2>
                <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                  Filing an appeal for <strong>{selected.name}</strong>'s terminated scholarship. If approved, the scholar will be reinstated on Probationary status.
                </p>
                <div style={{ marginBottom: 22 }}>
                  <label style={labelStyle}>Appeal Reason / Justification <span style={{ color: '#dc2626' }}>*</span></label>
                  <textarea value={appealReason} onChange={e => setAppealReason(e.target.value)} rows={5}
                    placeholder="Describe the grounds for the appeal (e.g., medical circumstances, financial hardship, academic improvement plan)..."
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowAppeal(false)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                  <button disabled={!appealReason} onClick={handleFileAppeal} style={{ flex: 1, padding: 10, background: appealReason ? '#f59e0b' : '#fde68a', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: appealReason ? 'pointer' : 'not-allowed', color: '#fff' }}>Submit Appeal</button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Review Appeal</h2>
                <p style={{ margin: '0 0 14px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                  Appeal filed for <strong>{selected.name}</strong> on <strong>{selected.appeal?.submittedDate}</strong>.
                </p>
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 9, padding: '12px 16px', marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Student&apos;s Reason</div>
                  <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{selected.appeal?.reason}</p>
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={labelStyle}>Review Note <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                  <textarea value={appealReviewNote} onChange={e => setAppealReviewNote(e.target.value)} rows={3}
                    placeholder="Add a note explaining the decision..."
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowAppeal(false)} style={{ padding: '10px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                  <button onClick={() => handleReviewAppeal(false)} style={{ flex: 1, padding: 10, background: '#dc2626', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Deny</button>
                  <button onClick={() => handleReviewAppeal(true)} style={{ flex: 1, padding: 10, background: '#059669', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Approve — Reinstate</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
