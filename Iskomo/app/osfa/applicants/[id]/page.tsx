'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { applicationApi, scholarshipApi, documentApi, type ApplicationResponse, type AuditEntryResponse, type ScholarshipResponse, type DocumentResponse } from '@/lib/api-client';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';

const TEAL       = COLORS.maroon;
const TEAL_DARK  = COLORS.maroonD;
const TEAL_LIGHT = COLORS.maroonL;

type AppStatus = 'pending' | 'approved' | 'rejected' | 'incomplete' | 'withdrawn';

const statusStyle: Record<AppStatus, { bg: string; color: string; dot: string }> = {
  pending:    { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  approved:   { bg: '#f0fdf4', color: '#059669', dot: '#10b981' },
  rejected:   { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626' },
  incomplete: { bg: '#fff7ed', color: '#ea580c', dot: '#f97316' },
  withdrawn:  { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' },
};

const statusLabel: Record<AppStatus, string> = {
  pending:    'Pending',
  approved:   'Approved',
  rejected:   'Rejected',
  incomplete: 'Incomplete',
  withdrawn:  'Withdrawn',
};

function StatusBadge({ status }: { status: AppStatus }) {
  const s = statusStyle[status] ?? statusStyle.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 13, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
      {statusLabel[status]}
    </span>
  );
}

function formatTime(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  submitted:       { label: 'Application Submitted',           color: '#2563eb' },
  resubmitted:     { label: 'Application Resubmitted',         color: '#2563eb' },
  withdrawn:       { label: 'Application Withdrawn',           color: '#6b7280' },
  approved:        { label: 'Application Approved',            color: '#059669' },
  rejected:        { label: 'Application Rejected',            color: '#dc2626' },
  incomplete:      { label: 'Marked as Incomplete',            color: '#ea580c' },
  appeal_approved: { label: 'Appeal Approved — Under Review',  color: '#059669' },
  appeal_denied:   { label: 'Appeal Rejected',                 color: '#dc2626' },
};

function formatAction(action: string): { label: string; color: string } {
  if (ACTION_LABEL[action]) return ACTION_LABEL[action];
  const clean = action
    .replace(/status_changed_to_ApplicationStatus\./i, 'Status Changed to ')
    .replace(/appeal_approved/i, 'Appeal Approved')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return { label: clean, color: '#374151' };
}

export default function ApplicantProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { toasts, addToast, removeToast } = useToast();

  const [app,         setApp]         = useState<ApplicationResponse | null>(null);
  const [audit,       setAudit]       = useState<AuditEntryResponse[]>([]);
  const [scholarship, setScholarship] = useState<ScholarshipResponse | null>(null);
  const [loading,     setLoading]     = useState(true);

  const [activeTab,            setActiveTab]            = useState<'overview' | 'documents' | 'evaluation' | 'history'>('overview');
  const [showApproveDialog,    setShowApproveDialog]    = useState(false);
  const [showRejectDialog,     setShowRejectDialog]     = useState(false);
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);
  const [rejectReason,         setRejectReason]         = useState('');
  const [rejectNote,           setRejectNote]           = useState('');
  const [incompleteNote,       setIncompleteNote]       = useState('');
  const [rubric, setRubric] = useState({ financialNeed: 3, essay: 3, interview: 3, community: 3 });
  const [appealNote,   setAppealNote]   = useState('');
  const [appealSaving, setAppealSaving] = useState(false);
  const [documents,    setDocuments]    = useState<DocumentResponse[]>([]);
  const [docsLoading,  setDocsLoading]  = useState(false);

  async function handleReviewAppeal(approved: boolean) {
    if (!app) return;
    setAppealSaving(true);
    try {
      await applicationApi.reviewAppeal(app.id, approved, appealNote || undefined);
      const updated = await applicationApi.get(app.id);
      setApp(updated);
      await refreshAudit();
      addToast('success', approved ? 'Appeal approved — application restored.' : 'Appeal rejected.');
      setAppealNote('');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to process appeal.');
    } finally {
      setAppealSaving(false);
    }
  }

  async function loadDocuments() {
    if (documents.length > 0) return;
    setDocsLoading(true);
    try {
      const docs = await documentApi.list(Number(id));
      setDocuments(docs);
    } catch { /* silent */ } finally {
      setDocsLoading(false);
    }
  }

  const refreshAudit = useCallback(async () => {
    try {
      const aud = await applicationApi.getAudit(Number(id));
      setAudit(aud);
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    const numId = Number(id);
    applicationApi.get(numId)
      .then(async (a) => {
        setApp(a);
        const [aud, sch] = await Promise.all([
          applicationApi.getAudit(numId),
          scholarshipApi.get(a.scholarship_id),
        ]);
        setAudit(aud);
        setScholarship(sch);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApprove() {
    try {
      const updated = await applicationApi.updateStatus(Number(id), 'approved');
      setApp(updated);
      await refreshAudit();
      addToast('success', `Application approved.`);
    } catch { addToast('error', 'Failed to approve application.'); }
    setShowApproveDialog(false);
  }

  async function handleReject() {
    if (!rejectReason) return;
    const note = `${rejectReason}${rejectNote ? ': ' + rejectNote : ''}`;
    try {
      const updated = await applicationApi.updateStatus(Number(id), 'rejected', note);
      setApp(updated);
      await refreshAudit();
      addToast('error', `Application rejected.`);
    } catch { addToast('error', 'Failed to reject application.'); }
    setShowRejectDialog(false);
    setRejectReason('');
    setRejectNote('');
  }

  async function handleMarkIncomplete() {
    try {
      const updated = await applicationApi.updateStatus(Number(id), 'incomplete', incompleteNote || undefined);
      setApp(updated);
      await refreshAudit();
      addToast('warning', `Application marked Incomplete.`);
    } catch { addToast('error', 'Failed to mark application incomplete.'); }
    setShowIncompleteDialog(false);
    setIncompleteNote('');
  }

  const sectionTitle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' };
  const fieldLabel:   React.CSSProperties = { fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 };
  const fieldValue:   React.CSSProperties = { fontSize: 14, fontWeight: 600, color: '#111827' };

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '80px auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid #f3f4f6`, borderTop: `3px solid ${TEAL}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '48px 40px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Applicant Not Found</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>The applicant you&apos;re looking for does not exist or has been removed.</div>
          <Link href="/osfa/applicants" style={{ padding: '10px 24px', background: TEAL, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Back to Applicants</Link>
        </div>
      </div>
    );
  }

  const student    = app.student;
  const name       = student ? `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() : `Student #${app.student_id}`;
  const initials   = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const isTerminal = ['approved', 'rejected'].includes(app.status);

  const rejectedDocIds  = app.rejected_docs ?? [];
  const requirements    = scholarship?.requirements ?? [];
  const flaggedRequirements = requirements.filter(r => rejectedDocIds.includes(r.id));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 12 }}>
        <Link href="/osfa/dashboard" style={{ color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
        <span aria-hidden="true" style={{ color: '#d1d5db' }}>/</span>
        <Link href="/osfa/applicants" style={{ color: '#9ca3af', textDecoration: 'none' }}>Applicants</Link>
        <span aria-hidden="true" style={{ color: '#d1d5db' }}>/</span>
        <span aria-current="page" style={{ color: '#374151', fontWeight: 500 }}>{name}</span>
      </nav>

      {/* Profile header */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ height: 6, background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})` }} />
        <div style={{ padding: '28px 32px', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 800, flexShrink: 0, boxShadow: `0 4px 16px ${TEAL}40` }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>{name}</h1>
              <StatusBadge status={app.status as AppStatus} />
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{student?.email ?? '—'}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, alignSelf: 'center', flexWrap: 'wrap' }}>
            {!isTerminal && (
              <>
                <button onClick={() => setShowIncompleteDialog(true)} style={{ padding: '9px 14px', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Mark Incomplete
                </button>
                <button onClick={() => setShowApproveDialog(true)} style={{ padding: '9px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Approve
                </button>
                <button onClick={() => setShowRejectDialog(true)} style={{ padding: '9px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Reject
                </button>
              </>
            )}
            {isTerminal && (
              <div style={{ padding: '9px 18px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, color: '#9ca3af' }}>
                {statusLabel[app.status as AppStatus]} — no further action required
              </div>
            )}
          </div>
        </div>

        {/* Scholarship banner */}
        <div style={{ padding: '14px 32px', background: '#f8fafc', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span style={{ fontSize: 13, color: '#374151' }}>Applied for: <strong>{app.scholarship?.name ?? `Scholarship #${app.scholarship_id}`}</strong></span>
          <span style={{ fontSize: 12, color: '#d1d5db' }}>|</span>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Submitted: {formatTime(app.submitted_at)}</span>
          {app.remarks && (
            <>
              <span style={{ fontSize: 12, color: '#d1d5db' }}>|</span>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Remarks: {app.remarks}</span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #f3f4f6', marginBottom: 22 }}>
        {([
          ['overview',   'Overview'],
          ['documents',  `Documents${flaggedRequirements.length > 0 ? ` (${flaggedRequirements.length} flagged)` : ''}`],
          ['evaluation', 'Evaluation'],
          ['history',    `Activity (${audit.length})`],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => { setActiveTab(key); if (key === 'documents') loadDocuments(); }} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === key ? `2px solid ${TEAL}` : '2px solid transparent', marginBottom: -2, fontSize: 14, fontWeight: activeTab === key ? 700 : 500, color: activeTab === key ? TEAL : '#6b7280', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px' }}>
            <h3 style={sectionTitle}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { label: 'Full Name',      value: name },
                { label: 'Email',          value: student?.email ?? '—' },
                { label: 'Student Number', value: student?.student_number ?? '—' },
                { label: 'Year Level',     value: student?.year_level ? `${student.year_level}th Year` : '—' },
              ].map(f => (
                <div key={f.label}><div style={fieldLabel}>{f.label}</div><div style={fieldValue}>{f.value}</div></div>
              ))}
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px' }}>
            <h3 style={sectionTitle}>Academic Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { label: 'College',  value: student?.college  ?? '—' },
                { label: 'Program',  value: student?.program  ?? '—' },
                { label: 'Eval Status', value: app.eval_status.replace(/_/g, ' ') },
                { label: 'Submission', value: formatTime(app.submitted_at) },
              ].map(f => (
                <div key={f.label}><div style={fieldLabel}>{f.label}</div><div style={fieldValue}>{f.value}</div></div>
              ))}
            </div>
          </div>

          {app.appeal && (
            <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${app.appeal.status === 'pending' ? '#fcd34d' : app.appeal.status === 'approved' ? '#86efac' : '#fca5a5'}`, padding: '24px 28px', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ ...sectionTitle, marginBottom: 0 }}>Student Appeal</h3>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                  background: app.appeal.status === 'approved' ? '#dcfce7' : app.appeal.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                  color: app.appeal.status === 'approved' ? '#15803d' : app.appeal.status === 'rejected' ? '#dc2626' : '#92400e',
                }}>{app.appeal.status.toUpperCase()}</span>
              </div>

              <div style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 9, border: '1px solid #f3f4f6', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Appeal Reason · Filed {formatTime(app.appeal.created_at)}</div>
                <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{app.appeal.reason}</p>
              </div>

              {app.appeal.review_note && (
                <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: 9, border: '1px solid #bfdbfe', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>OSFA Review Note</div>
                  <p style={{ margin: 0, fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>{app.appeal.review_note}</p>
                </div>
              )}

              {app.appeal.status === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Review Note (optional)</label>
                    <textarea
                      value={appealNote}
                      onChange={e => setAppealNote(e.target.value)}
                      rows={3}
                      placeholder="Add a note explaining your decision…"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => handleReviewAppeal(true)}
                      disabled={appealSaving}
                      style={{ flex: 1, padding: '10px', background: appealSaving ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: appealSaving ? 'not-allowed' : 'pointer' }}>
                      {appealSaving ? 'Processing…' : '✓ Approve Appeal'}
                    </button>
                    <button
                      onClick={() => handleReviewAppeal(false)}
                      disabled={appealSaving}
                      style={{ flex: 1, padding: '10px', background: appealSaving ? '#9ca3af' : '#dc2626', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: appealSaving ? 'not-allowed' : 'pointer' }}>
                      {appealSaving ? 'Processing…' : '✗ Reject Appeal'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Documents tab */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Uploaded files */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={sectionTitle}>Submitted Documents</h3>
              <button onClick={() => { setDocuments([]); loadDocuments(); }} style={{ fontSize: 12, color: TEAL, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Refresh</button>
            </div>
            {docsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: '#9ca3af', fontSize: 13 }}>
                <div style={{ width: 18, height: 18, border: `2px solid #f3f4f6`, borderTop: `2px solid ${TEAL}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Loading documents…
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : documents.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                No documents submitted yet by the student.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 10, background: doc.flagged ? '#fef2f2' : '#f9fafb', border: `1px solid ${doc.flagged ? '#fca5a5' : '#f3f4f6'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{doc.requirement_name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{doc.file_name} · {new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      {doc.flagged && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', padding: '3px 10px', borderRadius: 20, background: '#fef2f2', border: '1px solid #fca5a5' }}>FLAGGED</span>
                      )}
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, color: '#2563eb', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requirements checklist */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px' }}>
            <h3 style={sectionTitle}>Scholarship Requirements</h3>
            {requirements.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13 }}>No document requirements configured for this scholarship.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {requirements.map(req => {
                  const isFlagged = rejectedDocIds.includes(req.id);
                  const submitted = documents.some(d => d.requirement_name === req.name);
                  return (
                    <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: isFlagged ? '#fef2f2' : submitted ? '#f0fdf4' : '#f9fafb', border: `1px solid ${isFlagged ? '#fca5a5' : submitted ? '#86efac' : '#f3f4f6'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 16 }}>{submitted ? '✅' : isFlagged ? '❌' : '⏳'}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{req.name}</div>
                          {req.description && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{req.description}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: req.is_required ? '#dc2626' : '#9ca3af' }}>{req.is_required ? 'REQUIRED' : 'OPTIONAL'}</span>
                        {submitted && <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', padding: '2px 8px', borderRadius: 20, background: '#dcfce7' }}>SUBMITTED</span>}
                        {isFlagged && <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', padding: '2px 8px', borderRadius: 20, background: '#fef2f2', border: '1px solid #fca5a5' }}>FLAGGED</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evaluation tab */}
      {activeTab === 'evaluation' && (() => {
        const criteria = [
          { key: 'financialNeed' as const, label: 'Financial Need',            score: rubric.financialNeed, max: 5, note: 'Based on income declaration' },
          { key: 'essay' as const,         label: 'Motivation Letter / Essay', score: rubric.essay,         max: 5, note: 'Quality and relevance' },
          { key: 'interview' as const,     label: 'Interview Performance',     score: rubric.interview,     max: 5, note: 'Optional — set 0 if N/A' },
          { key: 'community' as const,     label: 'Community Involvement',     score: rubric.community,     max: 5, note: 'Activities / org participation' },
        ];
        const totalScore = Object.values(rubric).reduce((a, b) => a + b, 0);
        const maxScore   = 20;
        const pct        = Math.round((totalScore / maxScore) * 100);
        return (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={sectionTitle}>Evaluation Rubric</h3>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: pct >= 70 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626' }}>{totalScore}<span style={{ fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>/{maxScore}</span></div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{pct}% overall</div>
              </div>
            </div>
            <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, marginBottom: 24 }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: pct >= 70 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626', transition: 'width 0.3s' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {criteria.map(c => (
                <div key={c.key} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', padding: '14px 16px', borderRadius: 10, background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{c.note}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setRubric(prev => ({ ...prev, [c.key]: n }))} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: c.score >= n ? TEAL : '#e5e7eb', color: c.score >= n ? '#fff' : '#9ca3af', transition: 'all 0.1s' }}>{n}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 10, background: pct >= 70 ? '#f0fdf4' : pct >= 50 ? '#fffbeb' : '#fef2f2', border: `1px solid ${pct >= 70 ? '#bbf7d0' : pct >= 50 ? '#fde68a' : '#fecaca'}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: pct >= 70 ? '#15803d' : pct >= 50 ? '#92400e' : '#dc2626' }}>
                {pct >= 70 ? '✓ Recommend for Approval' : pct >= 50 ? '⚠ Needs Further Review' : '✗ Does Not Meet Threshold'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Threshold: 70% ({Math.round(maxScore * 0.7)}/{maxScore} pts) for approval recommendation.</div>
            </div>
          </div>
        );
      })()}

      {/* History tab */}
      {activeTab === 'history' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '28px' }}>
          <h3 style={sectionTitle}>Activity History</h3>
          {audit.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 13 }}>No activity recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[...audit].reverse().map((entry, i, arr) => (
                <div key={entry.id} style={{ display: 'flex', gap: 16, paddingBottom: 20, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: TEAL, marginTop: 5, border: `2px solid #fff`, boxShadow: `0 0 0 2px ${TEAL}40` }} />
                    {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: '#e5e7eb', marginTop: 6 }} />}
                  </div>
                  <div style={{ paddingBottom: 4 }}>
                    <div style={{ fontSize: 14, color: formatAction(entry.action).color, fontWeight: 600 }}>{formatAction(entry.action).label}</div>
                    {entry.note && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{entry.note}</div>}
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{formatTime(entry.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approve Dialog */}
      {showApproveDialog && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowApproveDialog(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Confirm Approval</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              You are approving <strong>{name}</strong> for <strong>{app.scholarship?.name}</strong>. The student will be notified and marked as an active scholar.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowApproveDialog(false)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleApprove} style={{ flex: 1, padding: 10, background: '#059669', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setShowRejectDialog(false); setRejectReason(''); setRejectNote(''); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Reject Application</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>The student will be notified with this reason.</p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Reason <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', outline: 'none' }}>
                <option value="">Select a reason...</option>
                <option value="Missing Required Documents">Missing Required Documents</option>
                <option value="Does Not Meet Eligibility Criteria">Does Not Meet Eligibility Criteria</option>
                <option value="GWA Does Not Meet The Minimum Requirement">GWA Does Not Meet The Minimum Requirement</option>
                <option value="Duplicate Application">Duplicate Application</option>
                <option value="Incomplete Application Form">Incomplete Application Form</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Additional Note <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Specific details for the applicant..." rows={3} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowRejectDialog(false); setRejectReason(''); setRejectNote(''); }} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button disabled={!rejectReason} onClick={handleReject} style={{ flex: 1, padding: 10, background: rejectReason ? '#dc2626' : '#fca5a5', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: rejectReason ? 'pointer' : 'not-allowed', color: '#fff' }}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Incomplete Dialog */}
      {showIncompleteDialog && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowIncompleteDialog(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Mark as Incomplete</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>Describe what the student needs to provide. They will receive a notification.</p>
            <textarea value={incompleteNote} onChange={e => setIncompleteNote(e.target.value)} placeholder="e.g. Missing transcript of records, please resubmit a certified copy..." rows={4} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowIncompleteDialog(false)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleMarkIncomplete} style={{ flex: 1, padding: 10, background: '#ea580c', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Notify Student</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
