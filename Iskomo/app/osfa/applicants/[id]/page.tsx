'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { applicationApi, scholarshipApi, documentApi, workflowApi, type ApplicationResponse, type AuditEntryResponse, type ScholarshipResponse, type DocumentResponse, type WorkflowResponse, type ComplianceSubmission, type ComplianceDocType } from '@/lib/api-client';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';
import { MAIN_STAGES, STAGE_LABEL, SUB_STATUS_LABEL, stageIndex, isTerminal, formatInterviewDt } from '@/lib/workflow';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api';

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
  const { user: currentUser } = useCurrentUser();

  const [app,         setApp]         = useState<ApplicationResponse | null>(null);
  const [audit,       setAudit]       = useState<AuditEntryResponse[]>([]);
  const [scholarship, setScholarship] = useState<ScholarshipResponse | null>(null);
  const [loading,     setLoading]     = useState(true);

  const searchParams = useSearchParams();
  const [activeTab,            setActiveTab]            = useState<'workflow' | 'overview' | 'documents' | 'evaluation' | 'history' | 'messages'>(
    (searchParams.get('tab') as 'workflow' | 'overview' | 'documents' | 'evaluation' | 'history' | 'messages') ?? 'workflow'
  );
  const [messages,             setMessages]             = useState<Array<{ id: number; sender_id: number; sender_email: string; sender_role: string; body: string; created_at: string }>>([]);
  const [msgBody,              setMsgBody]              = useState('');
  const [msgSending,           setMsgSending]           = useState(false);
  const [workflow,             setWorkflow]             = useState<WorkflowResponse | null>(null);
  const [actionLoading,        setActionLoading]        = useState(false);
  const [activeDialog,         setActiveDialog]         = useState<string | null>(null);
  const [scheduleForm,         setScheduleForm]         = useState({ date: '', time: '', location: '', note: '' });
  const [dateError,            setDateError]            = useState('');
  const [evalForm,             setEvalForm]             = useState({ score: '', notes: '' });
  const [decideForm,           setDecideForm]           = useState({ decision: 'approved', remarks: '' });
  const [revisionNote,         setRevisionNote]         = useState('');
  const [failNote,             setFailNote]             = useState('');
  const [withdrawReason,       setWithdrawReason]       = useState('');
  const [showApproveDialog,    setShowApproveDialog]    = useState(false);
  const [showRejectDialog,     setShowRejectDialog]     = useState(false);
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);
  const [rejectReason,         setRejectReason]         = useState('');
  const [rejectNote,           setRejectNote]           = useState('');
  const [incompleteNote,       setIncompleteNote]       = useState('');
  const [rubric,       setRubric]       = useState({ financialNeed: 3, essay: 3, interview: 3, community: 3 });
  const [rubricSaving, setRubricSaving] = useState(false);
  const [rubricSaved,  setRubricSaved]  = useState(false);
  const [completionReqs, setCompletionReqs] = useState<Array<{ id: number; requirement_type: string; file_url: string | null; submitted_at: string | null }>>([]);
  const [internalNotes, setInternalNotes] = useState('');
  const [notesSaving,   setNotesSaving]   = useState(false);
  const [notesSaved,    setNotesSaved]    = useState(false);
  const [appealNote,   setAppealNote]   = useState('');
  const [appealSaving, setAppealSaving] = useState(false);
  const [documents,    setDocuments]    = useState<DocumentResponse[]>([]);
  const [docsLoading,  setDocsLoading]  = useState(false);
  const [compliance,   setCompliance]   = useState<ComplianceSubmission[]>([]);
  const [complianceDocTypes, setComplianceDocTypes] = useState<ComplianceDocType[]>([]);
  const [complianceVerifying, setComplianceVerifying] = useState<number | null>(null);

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

  async function loadDocuments(force = false) {
    if (!force && documents.length > 0) return;
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

  const refreshWorkflow = useCallback(async () => {
    try { setWorkflow(await workflowApi.get(Number(id))); } catch { /* silent */ }
  }, [id]);

  function isSafeUrl(url: string): boolean {
    try { return new URL(url).protocol === 'https:'; } catch { return false; }
  }

  async function doWorkflowAction(fn: () => Promise<WorkflowResponse>, msg: string) {
    setActionLoading(true);
    try {
      setWorkflow(await fn());
      // Re-fetch app so concurrent edits by other staff are reflected
      const updated = await applicationApi.get(Number(id));
      setApp(updated);
      addToast('success', msg);
      setActiveDialog(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      const isDeptError = message.toLowerCase().includes('department');
      addToast('error', isDeptError
        ? "You don't have permission to manage this application"
        : message);
      // Re-fetch to sync UI with actual DB state (handles stale state from failed network responses)
      await refreshWorkflow();
    } finally {
      setActionLoading(false);
    }
  }

  // Department isolation: super_admin can see all; staff only manage their department's applications
  // scholarship.category ('public'|'private') maps to the same values as user.department
  const staffDept = currentUser?.department;
  const appDept   = scholarship?.category ?? null;
  const wrongDept = currentUser?.role === 'osfa_staff' && staffDept && appDept && staffDept !== appDept;
  // Public scholarships use a paper-submission flow instead of a live interview
  const isPublic  = scholarship?.category === 'public';

  useEffect(() => {
    const numId = Number(id);
    Promise.all([
      applicationApi.get(numId),
      workflowApi.get(numId).catch(() => null),
    ]).then(async ([a, wf]) => {
      setApp(a);
      setInternalNotes((a as any).interview_notes ?? '');
      if (wf) setWorkflow(wf);
      if (a.eval_score) {
        setRubric({
          financialNeed: a.eval_score.financial_need ?? 3,
          essay:         a.eval_score.essay          ?? 3,
          interview:     a.eval_score.interview       ?? 3,
          community:     a.eval_score.community       ?? 3,
        });
        setRubricSaved(true);
      }
      const [aud, sch] = await Promise.all([
        applicationApi.getAudit(numId),
        scholarshipApi.get(a.scholarship_id),
      ]);
      setAudit(aud);
      setScholarship(sch);
      // Load compliance data at completion stage
      if (wf?.main_status === 'completion') {
        applicationApi.getCompliance(numId).then(setCompliance).catch(() => {});
        scholarshipApi.listComplianceDocs(a.scholarship_id).then(setComplianceDocTypes).catch(() => {});
      }
      // Pre-load messages if navigated directly to messages tab (e.g. from messages page)
      if (searchParams.get('tab') === 'messages') {
        import('@/lib/api').then(({ apiFetch }) =>
          apiFetch<{ items: typeof messages }>(`/api/applications/${numId}/messages`).then(r => setMessages(r.items)).catch(() => {})
        );
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  async function handleApprove() {
    try {
      if (workflow?.main_status === 'decision') {
        await doWorkflowAction(() => workflowApi.decide(Number(id), 'approved'), 'Application approved.');
      } else if (workflow?.main_status != null) {
        addToast('error', 'This application is managed by the workflow. Use the Decision step in the Workflow tab to approve.');
        setShowApproveDialog(false);
        return;
      } else {
        const updated = await applicationApi.updateStatus(Number(id), 'approved');
        setApp(updated);
        await refreshAudit();
        addToast('success', 'Application approved.');
      }
    } catch { addToast('error', 'Failed to approve application.'); }
    setShowApproveDialog(false);
  }

  async function handleReject() {
    if (!rejectReason) return;
    const note = `${rejectReason}${rejectNote ? ': ' + rejectNote : ''}`;
    try {
      if (workflow?.main_status === 'decision') {
        await doWorkflowAction(() => workflowApi.decide(Number(id), 'rejected', note), 'Application rejected.');
      } else if (workflow?.main_status != null) {
        addToast('error', 'This application is managed by the workflow. Use the Decision step in the Workflow tab to reject.');
        setShowRejectDialog(false);
        return;
      } else {
        const updated = await applicationApi.updateStatus(Number(id), 'rejected', note);
        setApp(updated);
        await refreshAudit();
        addToast('error', 'Application rejected.');
      }
    } catch { addToast('error', 'Failed to reject application.'); }
    setShowRejectDialog(false);
    setRejectReason('');
    setRejectNote('');
  }

  async function handleMarkIncomplete() {
    try {
      if (workflow?.main_status === 'verification') {
        // Workflow app at Verification — request-revision sets status=incomplete
        // and moves sub_status to revision_requested so the student gets notified.
        const note = incompleteNote.trim() || 'Please review and resubmit your documents.';
        await doWorkflowAction(() => workflowApi.requestRevision(Number(id), note), 'Revision requested.');
      } else if (workflow?.main_status != null) {
        // Workflow app at a stage where revision isn't applicable (Interview, Decision, etc.)
        addToast('error', 'Mark Incomplete is only available at the Verification stage. Use the Workflow tab to manage this application.');
        setShowIncompleteDialog(false);
        setIncompleteNote('');
        return;
      } else {
        // Pre-workflow / legacy application
        const updated = await applicationApi.updateStatus(Number(id), 'incomplete', incompleteNote || undefined);
        setApp(updated);
        await refreshAudit();
        addToast('warning', 'Application marked Incomplete.');
      }
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
  const appFinalized = ['approved', 'rejected'].includes(app.status);

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
            {!appFinalized && (
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
            {appFinalized && (
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
          ['workflow',   'Workflow'],
          ['overview',   'Overview'],
          ['documents',  `Documents${flaggedRequirements.length > 0 ? ` (${flaggedRequirements.length} flagged)` : ''}`],
          ['evaluation', 'Evaluation'],
          ['history',    `Activity (${audit.length})`],
          ['messages',   `Messages${messages.length > 0 ? ` (${messages.length})` : ''}`],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => {
            setActiveTab(key);
            if (key === 'documents') {
              loadDocuments();
              import('@/lib/api').then(({ apiFetch }) =>
                apiFetch<typeof completionReqs>(`/api/applications/${id}/completion-requirements`)
                  .then(setCompletionReqs).catch(() => {})
              );
            }
            if (key === 'messages') {
              import('@/lib/api').then(({ apiFetch }) =>
                apiFetch<{ items: typeof messages }>(`/api/applications/${id}/messages`).then(r => setMessages(r.items)).catch(() => {})
              );
            }
          }} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === key ? `2px solid ${TEAL}` : '2px solid transparent', marginBottom: -2, fontSize: 14, fontWeight: activeTab === key ? 700 : 500, color: activeTab === key ? TEAL : '#6b7280', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Workflow tab ── */}
      {activeTab === 'workflow' && (() => {
        const wf = workflow;
        const inp: React.CSSProperties = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
        const btn = (color: string, bg: string): React.CSSProperties => ({ padding: '9px 18px', border: 'none', borderRadius: 8, background: bg, color, fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.7 : 1 });

        if (!wf) return (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
            <p style={{ marginBottom: 16, fontSize: 14 }}>No workflow data yet.</p>
            <button onClick={() => doWorkflowAction(() => workflowApi.initialize(Number(id)), 'Workflow initialized.')} style={btn('#fff', TEAL)}>
              Initialize Workflow
            </button>
          </div>
        );

        const ms = wf.main_status ?? '';
        const ss = wf.sub_status  ?? '';
        const idx = stageIndex(ms);
        const terminal = isTerminal(ms, ss);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stage progress bar */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                {MAIN_STAGES.map((stage, i) => {
                  const done   = !terminal && i < idx;
                  const active = i === idx && !terminal;
                  const failed = terminal && i === idx;
                  const color  = done ? '#059669' : active ? TEAL : failed ? '#dc2626' : '#9ca3af';
                  return (
                    <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: i < MAIN_STAGES.length - 1 ? 1 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#059669' : active ? '#fff' : failed ? '#fef2f2' : '#f3f4f6', border: `2px solid ${color}`, boxShadow: active ? `0 0 0 4px ${TEAL}20` : 'none' }}>
                          {done   ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          : failed ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          : active ? <div style={{ width: 11, height: 11, borderRadius: '50%', background: TEAL }} />
                          : <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#d1d5db' }} />}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color, textAlign: 'center', maxWidth: 60 }}>{STAGE_LABEL[stage]}</span>
                      </div>
                      {i < MAIN_STAGES.length - 1 && <div style={{ flex: 1, height: 2, background: done ? '#059669' : '#e5e7eb', margin: '0 6px', marginBottom: 22 }} />}
                    </div>
                  );
                })}
              </div>

              {/* Sub-status */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, background: terminal ? '#fef2f2' : '#f0fdf4', border: `1px solid ${terminal ? '#fca5a5' : '#86efac'}` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: terminal ? '#dc2626' : TEAL }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: terminal ? '#dc2626' : '#15803d' }}>
                  {SUB_STATUS_LABEL[ss] ?? ss}
                </span>
              </div>

              {/* Initialize button for null workflow */}
              {!ms && (
                <div style={{ marginTop: 16 }}>
                  <button onClick={() => doWorkflowAction(() => workflowApi.initialize(Number(id)), 'Workflow initialized.')} style={btn('#fff', TEAL)}>
                    Initialize Workflow
                  </button>
                </div>
              )}
            </div>

            {/* Interview / Submission card */}
            {ms === 'interview' && wf.interview_datetime && (
              <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${TEAL}30`, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>
                    {isPublic ? 'Submission Deadline Set' : 'Interview Scheduled'}
                  </h3>
                </div>
                <div style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>
                  <strong>{isPublic ? 'Submit documents by:' : 'Date & Time:'}</strong> {formatInterviewDt(wf.interview_datetime)}
                </div>
                {wf.interview_location && (
                  <div style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>
                    <strong>{isPublic ? 'Submit to:' : 'Location:'}</strong> {wf.interview_location}
                  </div>
                )}
                {wf.interview_instructions && (
                  <div style={{ fontSize: 14, color: '#374151' }}>
                    <strong>Note:</strong> {wf.interview_instructions}
                  </div>
                )}
              </div>
            )}

            {/* Decision banner */}
            {ms === 'decision' && (
              <div style={{ background: ss === 'approved' ? '#f0fdf4' : ss === 'rejected' ? '#fef2f2' : '#fffbeb', border: `1.5px solid ${ss === 'approved' ? '#86efac' : ss === 'rejected' ? '#fca5a5' : '#fde68a'}`, borderRadius: 14, padding: '18px 24px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: ss === 'approved' ? '#15803d' : ss === 'rejected' ? '#dc2626' : '#92400e', marginBottom: wf.decision_remarks ? 8 : 0 }}>
                  {ss === 'approved' ? '✓ Application Approved' : ss === 'rejected' ? '✗ Application Rejected' : ss === 'waitlisted' ? '⏳ Waitlisted' : '⏳ Under Review'}
                </div>
                {wf.decision_remarks && <div style={{ fontSize: 13, color: '#374151' }}>{wf.decision_remarks}</div>}
              </div>
            )}

            {/* Completion stage banner */}
            {ms === 'completion' && (
              <div style={{ background: ss === 'completed' ? '#f0fdf4' : '#f0f9ff', border: `1.5px solid ${ss === 'completed' ? '#86efac' : '#bae6fd'}`, borderRadius: 14, padding: '18px 24px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: ss === 'completed' ? '#15803d' : '#0369a1', marginBottom: 6 }}>
                  {ss === 'completed' ? '✓ Scholar Onboarded — Completed' : ss === 'requirements_submitted' ? 'Documents Submitted — Ready to Finalize' : '⏳ Awaiting Completion Documents from Scholar'}
                </div>
                <div style={{ fontSize: 13, color: '#374151' }}>
                  {ss === 'completed' ? 'The scholar has been fully onboarded.' : ss === 'requirements_submitted' ? 'The scholar has submitted their completion documents. Review and finalize to complete onboarding.' : 'The applicant has been approved. Waiting for them to submit their completion documents before finalization.'}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!terminal && ms && (() => {
              const actions: React.ReactNode[] = [];

              if (ms === 'application') {
                if (ss === 'submitted')
                  actions.push(<button key="screen" style={btn('#fff', TEAL)} onClick={() => doWorkflowAction(() => workflowApi.screen(Number(id)), 'Screening started.')}>Start Screening</button>);
                if (ss === 'screening')
                  actions.push(
                    <button key="pass" style={btn('#fff', '#059669')} onClick={() => doWorkflowAction(() => workflowApi.screeningResult(Number(id), true), 'Screening passed.')}>Pass Screening</button>,
                    <button key="fail" style={btn('#fff', '#dc2626')} onClick={() => setActiveDialog('fail_screening')}>Fail Screening</button>,
                  );
                if (ss === 'screening_passed')
                  actions.push(<button key="verify" style={btn('#fff', TEAL)} onClick={() => doWorkflowAction(() => workflowApi.startVerification(Number(id)), 'Verification started.')}>Start Verification</button>);
              }

              if (ms === 'verification') {
                if (ss === 'pending_validation')
                  actions.push(
                    <button key="validated" style={btn('#fff', '#059669')} onClick={() => doWorkflowAction(() => workflowApi.verificationResult(Number(id), true), 'Documents validated.')}>Validated ✓</button>,
                    <button key="revision" style={btn('#fff', '#d97706')} onClick={() => setActiveDialog('revision')}>Request Revision</button>,
                    <button key="fail_val" style={btn('#fff', '#dc2626')} onClick={() => doWorkflowAction(() => workflowApi.verificationResult(Number(id), false), 'Validation failed.')}>Fail Validation</button>,
                  );
                if (ss === 'revision_requested')
                  actions.push(<button key="resubmit" style={btn('#fff', TEAL)} onClick={() => doWorkflowAction(() => workflowApi.startVerification(Number(id)), 'Marked as resubmitted.')}>Mark as Resubmitted</button>);
                if (ss === 'validated')
                  actions.push(<button key="open_sched" style={btn('#fff', TEAL)} onClick={() => doWorkflowAction(() => workflowApi.openScheduling(Number(id)), isPublic ? 'Submission period opened.' : 'Interview scheduling opened.')}>{isPublic ? 'Open Submission Period' : 'Open Interview Scheduling'}</button>);
              }

              if (ms === 'interview') {
                if (ss === 'not_scheduled' || ss === 'rescheduled')
                  actions.push(<button key="sched" style={btn('#fff', TEAL)} onClick={() => setActiveDialog('schedule')}>{isPublic ? 'Set Submission Date' : 'Schedule Interview'}</button>);
                if (ss === 'scheduled')
                  actions.push(
                    <button key="complete" style={btn('#fff', '#059669')} onClick={() => doWorkflowAction(() => workflowApi.completeInterview(Number(id)), isPublic ? 'Documents marked as submitted.' : 'Interview completed.')}>{isPublic ? 'Mark as Submitted' : 'Complete Interview'}</button>,
                    <button key="reschedule" style={btn('#374151', '#f3f4f6')} onClick={() => setActiveDialog('reschedule')}>{isPublic ? 'Change Date' : 'Reschedule'}</button>,
                  );
                if (ss === 'interview_completed')
                  actions.push(<button key="evaluate" style={btn('#fff', TEAL)} onClick={() => setActiveDialog('evaluate')}>Submit Evaluation</button>);
                if (ss === 'evaluated')
                  actions.push(<button key="review" style={btn('#fff', TEAL)} onClick={() => doWorkflowAction(() => workflowApi.moveToReview(Number(id)), 'Moved to review.')}>Move to Review</button>);
              }

              if (ms === 'decision' && (ss === 'under_review' || ss === 'waitlisted'))
                actions.push(<button key="decide" style={btn('#fff', TEAL)} onClick={() => setActiveDialog('decide')}>Make Decision</button>);

              if (ms === 'completion' && ss === 'requirements_submitted')
                actions.push(<button key="finalize" style={btn('#fff', '#059669')} onClick={() => doWorkflowAction(() => workflowApi.finalize(Number(id)), 'Application finalized.')}>Finalize Application</button>);

              if (!actions.length) return null;
              if (wrongDept) return (
                <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>You don&apos;t have permission to manage this application — it belongs to a different department.</span>
                </div>
              );
              return (
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions</h3>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>
                </div>
              );
            })()}

            {/* Dialogs */}
            {activeDialog === 'fail_screening' && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #fca5a5', padding: '20px 24px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Fail Screening</h3>
                <textarea value={failNote} onChange={e => setFailNote(e.target.value)} placeholder="Reason (optional)" rows={3} style={{ ...inp, marginBottom: 12, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={btn('#fff', '#dc2626')} onClick={() => doWorkflowAction(() => workflowApi.screeningResult(Number(id), false, failNote || undefined), 'Screening failed.')}>Confirm Fail</button>
                  <button style={btn('#374151', '#f3f4f6')} onClick={() => { setActiveDialog(null); setFailNote(''); }}>Cancel</button>
                </div>
              </div>
            )}

            {activeDialog === 'revision' && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #fde68a', padding: '20px 24px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Request Revision</h3>
                <textarea value={revisionNote} onChange={e => setRevisionNote(e.target.value)} placeholder="What needs to be revised? (required)" rows={3} style={{ ...inp, marginBottom: 12, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={btn('#fff', '#d97706')} onClick={() => { if (!revisionNote.trim()) return; doWorkflowAction(() => workflowApi.requestRevision(Number(id), revisionNote), 'Revision requested.'); }}>Send Request</button>
                  <button style={btn('#374151', '#f3f4f6')} onClick={() => { setActiveDialog(null); setRevisionNote(''); }}>Cancel</button>
                </div>
              </div>
            )}

            {(activeDialog === 'schedule' || activeDialog === 'reschedule') && (
              <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${TEAL}40`, padding: '20px 24px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827' }}>
                  {isPublic
                    ? (activeDialog === 'reschedule' ? 'Change Submission Date' : 'Set Submission Deadline')
                    : (activeDialog === 'reschedule' ? 'Reschedule Interview' : 'Schedule Interview')}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                      {isPublic ? 'Submission Deadline' : 'Date & Time'}
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="date"
                        value={scheduleForm.date}
                        onChange={e => { setScheduleForm(f => ({ ...f, date: e.target.value })); setDateError(''); }}
                        style={{ ...inp, flex: 1 }}
                      />
                      <input
                        type="time"
                        value={scheduleForm.time}
                        onChange={e => { setScheduleForm(f => ({ ...f, time: e.target.value })); setDateError(''); }}
                        style={{ ...inp, width: 120 }}
                      />
                    </div>
                    {dateError && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#dc2626' }}>{dateError}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                      {isPublic ? 'Submission Location (optional)' : 'Location'}
                    </label>
                    <input type="text" value={scheduleForm.location} onChange={e => setScheduleForm(f => ({ ...f, location: e.target.value }))}
                      placeholder={isPublic ? 'e.g. OSFA Office, Room 301 (leave blank if not needed)' : 'e.g. Room 301, Admin Building'} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                      {isPublic ? 'Instructions (optional)' : 'Note (optional)'}
                    </label>
                    <input type="text" value={scheduleForm.note} onChange={e => setScheduleForm(f => ({ ...f, note: e.target.value }))}
                      placeholder={isPublic ? 'e.g. Bring original copies of all documents' : 'Any additional notes'} style={inp} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={btn('#fff', TEAL)} onClick={() => {
                    // Location optional for public (paper submission), required for private (interview)
                    if (!scheduleForm.date || !scheduleForm.time || (!isPublic && !scheduleForm.location)) {
                      setDateError(isPublic ? 'Date and time are required.' : 'Date, time, and location are required.');
                      return;
                    }
                    const dt = new Date(`${scheduleForm.date}T${scheduleForm.time}`);
                    if (dt <= new Date()) { setDateError(isPublic ? 'Submission date must be in the future.' : 'Interview date must be in the future.'); return; }
                    setDateError('');
                    const data = { interview_datetime: dt.toISOString(), location: scheduleForm.location, ...(scheduleForm.note ? { note: scheduleForm.note } : {}) };
                    doWorkflowAction(() => workflowApi.scheduleInterview(Number(id), data),
                      isPublic
                        ? (activeDialog === 'reschedule' ? 'Submission date updated.' : 'Submission deadline set.')
                        : (activeDialog === 'reschedule' ? 'Interview rescheduled.' : 'Interview scheduled.'));
                  }}>Confirm</button>
                  <button style={btn('#374151', '#f3f4f6')} onClick={() => { setActiveDialog(null); setScheduleForm({ date: '', time: '', location: '', note: '' }); }}>Cancel</button>
                </div>
              </div>
            )}

            {activeDialog === 'evaluate' && (
              <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${TEAL}40`, padding: '20px 24px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Submit Evaluation</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Score (1–10)</label>
                    <input type="number" min="1" max="10" value={evalForm.score} onChange={e => setEvalForm(f => ({ ...f, score: e.target.value }))} style={{ ...inp, width: 100 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Evaluation Notes</label>
                    <textarea value={evalForm.notes} onChange={e => setEvalForm(f => ({ ...f, notes: e.target.value }))} placeholder="Interviewer observations..." rows={4} style={{ ...inp, resize: 'vertical' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={btn('#fff', TEAL)} onClick={() => doWorkflowAction(() => workflowApi.evaluate(Number(id), { ...(evalForm.score ? { score: Number(evalForm.score) } : {}), ...(evalForm.notes ? { notes: evalForm.notes } : {}) }), 'Evaluation submitted.')}>Submit</button>
                  <button style={btn('#374151', '#f3f4f6')} onClick={() => { setActiveDialog(null); setEvalForm({ score: '', notes: '' }); }}>Cancel</button>
                </div>
              </div>
            )}

            {activeDialog === 'decide' && (
              <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${TEAL}40`, padding: '20px 24px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Make Decision</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Decision</label>
                    <select value={decideForm.decision} onChange={e => setDecideForm(f => ({ ...f, decision: e.target.value }))} style={inp}>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                      <option value="waitlisted">Waitlist</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Remarks {decideForm.decision === 'rejected' ? '(required)' : '(optional)'}</label>
                    <textarea value={decideForm.remarks} onChange={e => setDecideForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Add remarks..." rows={3} style={{ ...inp, resize: 'vertical' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={btn('#fff', decideForm.decision === 'approved' ? '#059669' : decideForm.decision === 'rejected' ? '#dc2626' : '#d97706')}
                    onClick={() => { if (decideForm.decision === 'rejected' && !decideForm.remarks.trim()) { addToast('error', 'Remarks are required for rejection.'); return; } doWorkflowAction(() => workflowApi.decide(Number(id), decideForm.decision, decideForm.remarks || undefined), `Decision: ${decideForm.decision}.`); }}>
                    Confirm {decideForm.decision.charAt(0).toUpperCase() + decideForm.decision.slice(1)}
                  </button>
                  <button style={btn('#374151', '#f3f4f6')} onClick={() => setActiveDialog(null)}>Cancel</button>
                </div>
              </div>
            )}

            {/* Audit trail */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Workflow Audit Trail</h3>
              {(!wf.logs || wf.logs.length === 0) ? (
                <p style={{ color: '#9ca3af', fontSize: 13 }}>No audit entries yet.</p>
              ) : (
                <div style={{ position: 'relative', paddingLeft: 24 }}>
                  <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: '#f3f4f6', borderRadius: 99 }} />
                  {[...wf.logs].reverse().map((log, i) => (
                    <div key={log.id} style={{ position: 'relative', marginBottom: i < wf.logs.length - 1 ? 20 : 0 }}>
                      <div style={{ position: 'absolute', left: -20, top: 4, width: 10, height: 10, borderRadius: '50%', background: i === 0 ? TEAL : '#d1d5db', border: `2px solid ${i === 0 ? TEAL : '#e5e7eb'}` }} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                        {log.from_main ? `${STAGE_LABEL[log.from_main] ?? log.from_main} → ` : ''}{STAGE_LABEL[log.to_main] ?? log.to_main}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
                        {SUB_STATUS_LABEL[log.to_sub] ?? log.to_sub}
                      </div>
                      {log.note && <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 2 }}>{log.note}</div>}
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        );
      })()}

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
                { label: 'Year Level',     value: student?.year_level ? (['1st','2nd','3rd'][student.year_level - 1] ?? `${student.year_level}th`) + ' Year' : '—' },
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

          {/* Address & Family Background — only shown when data exists */}
          {(student?.street_barangay || student?.father_name || student?.income_source) && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', gridColumn: '1 / -1' }}>
              <h3 style={sectionTitle}>Address &amp; Family Background</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
                {[
                  { label: 'Street / Barangay',   value: student?.street_barangay   ?? '—' },
                  { label: 'City / Municipality',  value: student?.city_municipality ?? '—' },
                  { label: 'Province',             value: student?.province          ?? '—' },
                  { label: 'Zip Code',             value: student?.zip_code          ?? '—' },
                  { label: "Father's Name",        value: student?.father_name       ?? '—' },
                  { label: "Father's Occupation",  value: student?.father_occupation ?? '—' },
                  { label: "Mother's Name",        value: student?.mother_name       ?? '—' },
                  { label: "Mother's Occupation",  value: student?.mother_occupation ?? '—' },
                  { label: 'Income Source',        value: student?.income_source     ?? '—' },
                  { label: 'Monthly Family Income',value: student?.monthly_income    ?? '—' },
                ].map(f => (
                  <div key={f.label}><div style={fieldLabel}>{f.label}</div><div style={fieldValue}>{f.value}</div></div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', gridColumn: '1 / -1' }}>
            <h3 style={sectionTitle}>Student Essay</h3>
            {app.essay_text
              ? <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{app.essay_text}</p>
              : <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>No essay was submitted with this application.</p>
            }
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
              <button onClick={() => loadDocuments(true)} style={{ fontSize: 12, color: TEAL, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Refresh</button>
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
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => isSafeUrl(doc.file_url) && window.open(doc.file_url, '_blank')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, color: '#15803d', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            View
                          </button>
                          <button onClick={async () => {
                            try {
                              const res = await fetch(doc.file_url);
                              const blob = await res.blob();
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url; a.download = doc.file_name || 'document';
                              a.click(); URL.revokeObjectURL(url);
                            } catch { window.open(doc.file_url, '_blank'); }
                          }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completion Requirements — submitted by student after approval */}
          {completionReqs.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #bfdbfe', padding: '24px 28px' }}>
              <h3 style={{ ...sectionTitle, marginBottom: 16 }}>Completion Requirements Submitted</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {completionReqs.map(req => (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e' }}>{req.requirement_type}</div>
                        {req.submitted_at && <div style={{ fontSize: 11, color: '#7dd3fc', marginTop: 2 }}>Submitted {new Date(req.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
                      </div>
                    </div>
                    {req.file_url && isSafeUrl(req.file_url) && (
                      <a href={req.file_url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#0284c7', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        View File
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Documents — visible when at COMPLETION stage */}
          {workflow?.main_status === 'completion' && (() => {
            const requiredTypes = complianceDocTypes.filter(d => d.is_required);
            const allVerified = requiredTypes.length > 0 && requiredTypes.every(d =>
              compliance.some(c => c.requirement_type === d.name && c.is_verified)
            );
            return (
              <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${allVerified ? '#86efac' : '#bfdbfe'}`, padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <h3 style={{ ...sectionTitle, margin: 0 }}>Compliance Documents</h3>
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: allVerified ? '#dcfce7' : '#eff6ff', color: allVerified ? '#15803d' : '#1d4ed8' }}>
                    {compliance.filter(c => c.is_verified).length} / {requiredTypes.length} verified
                  </span>
                </div>

                {complianceDocTypes.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9ca3af' }}>No compliance document types configured for this scholarship.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {complianceDocTypes.map(docType => {
                      const submitted = compliance.find(c => c.requirement_type === docType.name);
                      const isVerified = submitted?.is_verified;
                      return (
                        <div key={docType.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: isVerified ? '#f0fdf4' : submitted ? '#eff6ff' : '#f9fafb', border: `1px solid ${isVerified ? '#86efac' : submitted ? '#bfdbfe' : '#f3f4f6'}` }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isVerified ? '#dcfce7' : submitted ? '#dbeafe' : '#e5e7eb' }}>
                            {isVerified
                              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              : submitted
                              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                              {docType.name}
                              <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: docType.is_required ? '#dc2626' : '#9ca3af' }}>{docType.is_required ? 'Required' : 'Optional'}</span>
                            </div>
                            {submitted && (
                              <div style={{ fontSize: 11, color: isVerified ? '#15803d' : '#1d4ed8', marginTop: 2 }}>
                                {isVerified
                                  ? `Verified${submitted.verified_at ? ` · ${new Date(submitted.verified_at).toLocaleDateString()}` : ''}`
                                  : `Submitted · awaiting verification`}
                              </div>
                            )}
                          </div>
                          {submitted && !isVerified && !wrongDept && (
                            <button
                              disabled={complianceVerifying === submitted.id}
                              onClick={async () => {
                                setComplianceVerifying(submitted.id);
                                try {
                                  const updated = await applicationApi.verifyCompliance(app.id, submitted.id);
                                  setCompliance(prev => prev.map(c => c.id === updated.id ? updated : c));
                                  addToast('success', `"${docType.name}" verified.`);
                                } catch (err) {
                                  addToast('error', err instanceof Error ? err.message : 'Failed to verify.');
                                } finally {
                                  setComplianceVerifying(null);
                                }
                              }}
                              style={{ padding: '6px 14px', border: 'none', borderRadius: 8, background: complianceVerifying === submitted.id ? '#9ca3af' : '#059669', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                              {complianceVerifying === submitted.id ? 'Verifying…' : 'Verify ✓'}
                            </button>
                          )}
                          {isVerified && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', padding: '3px 10px', borderRadius: 20, background: '#dcfce7', flexShrink: 0 }}>Verified</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {allVerified && !wrongDept && (
                  <div style={{ marginTop: 16, padding: '14px 18px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>All required documents verified — ready to finalize.</div>
                    <button onClick={() => doWorkflowAction(() => workflowApi.finalize(Number(id)), 'Application finalized.')}
                      style={{ padding: '8px 20px', background: '#059669', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                      Finalize Application
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Generate Documents */}
          {workflow?.main_status === 'completion' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 24px' }}>
              <h3 style={{ ...sectionTitle, marginBottom: 12 }}>Generate Documents</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={applicationApi.documentUrl(app.id, 'confirmation-letter')} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', color: '#374151', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Confirmation Letter
                </a>
                <a href={applicationApi.documentUrl(app.id, 'terms')} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', color: '#374151', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Terms & Conditions
                </a>
              </div>
            </div>
          )}

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
          { key: 'interview' as const,     label: isPublic ? 'Document Quality' : 'Interview Performance',     score: rubric.interview,     max: 5, note: 'Optional — set 0 if N/A' },
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

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                disabled={rubricSaving}
                onClick={async () => {
                  setRubricSaving(true);
                  try {
                    await applicationApi.updateEvalScore(Number(id), {
                      financial_need: rubric.financialNeed,
                      essay:          rubric.essay,
                      interview:      rubric.interview,
                      community:      rubric.community,
                    });
                    setRubricSaved(true);
                    addToast('success', 'Evaluation scores saved.');
                  } catch {
                    addToast('error', 'Failed to save evaluation scores.');
                  } finally {
                    setRubricSaving(false);
                  }
                }}
                style={{ flex: 1, padding: '11px 0', background: rubricSaving ? '#9ca3af' : TEAL, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff', cursor: rubricSaving ? 'not-allowed' : 'pointer' }}>
                {rubricSaving ? 'Saving…' : 'Save Evaluation'}
              </button>
              {rubricSaved && !rubricSaving && (
                <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>✓ Saved</span>
              )}
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

      {/* Messages tab */}
      {activeTab === 'messages' && (() => {
        async function sendOsfaMessage() {
          if (!msgBody.trim()) return;
          setMsgSending(true);
          try {
            const { apiFetch } = await import('@/lib/api');
            const sent = await apiFetch<typeof messages[0]>(`/api/applications/${id}/messages`, { method: 'POST', body: JSON.stringify({ body: msgBody.trim() }) });
            setMessages(prev => [...prev, sent]);
            setMsgBody('');
          } finally { setMsgSending(false); }
        }
        return (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '28px' }}>
            <h3 style={sectionTitle}>Messages with Student</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto', marginBottom: 16 }}>
              {messages.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 13 }}>No messages yet.</p>
              ) : messages.map(m => {
                const isOsfa = m.sender_role !== 'student';
                return (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isOsfa ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '75%', background: isOsfa ? TEAL : '#f3f4f6', color: isOsfa ? '#fff' : '#111827', borderRadius: isOsfa ? '12px 12px 2px 12px' : '12px 12px 12px 2px', padding: '10px 14px', fontSize: 14, lineHeight: 1.5 }}>
                      {m.body}
                    </div>
                    <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                      {isOsfa ? m.sender_email : name} · {new Date(m.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
            {currentUser?.role === 'super_admin' ? (
              <div style={{ padding: '10px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
                View only — Super Admin cannot reply to messages
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  value={msgBody}
                  onChange={e => setMsgBody(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendOsfaMessage(); } }}
                  placeholder="Type a reply to the student…"
                  style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '9px 14px', fontSize: 13, outline: 'none', color: '#111827' }}
                />
                <button onClick={sendOsfaMessage} disabled={!msgBody.trim() || msgSending}
                  style={{ padding: '9px 18px', background: msgBody.trim() ? TEAL : '#e5e7eb', border: 'none', borderRadius: 8, color: msgBody.trim() ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: 700, cursor: msgBody.trim() ? 'pointer' : 'not-allowed' }}>
                  {msgSending ? 'Sending…' : 'Send'}
                </button>
              </div>
            )}
          </div>
        );
      })()}

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

      {/* Internal Notes */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px', marginTop: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Internal Notes</span>
          </div>
          <span style={{ fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20 }}>Visible to OSFA staff only</span>
        </div>
        <textarea
          value={internalNotes}
          onChange={e => { setInternalNotes(e.target.value); setNotesSaved(false); }}
          rows={4}
          placeholder="Add internal notes, observations, or reminders about this applicant…"
          style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6, color: '#111827' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <button
            onClick={async () => {
              setNotesSaving(true);
              try {
                await apiFetch(`/api/applications/${id}/notes`, { method: 'PATCH', body: JSON.stringify({ notes: internalNotes }) });
                setNotesSaved(true);
                setTimeout(() => setNotesSaved(false), 3000);
              } catch { /* silent */ } finally { setNotesSaving(false); }
            }}
            disabled={notesSaving}
            style={{ padding: '8px 18px', background: notesSaving ? '#9ca3af' : '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: notesSaving ? 'not-allowed' : 'pointer' }}>
            {notesSaving ? 'Saving…' : 'Save Notes'}
          </button>
          {notesSaved && <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>✓ Saved</span>}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
