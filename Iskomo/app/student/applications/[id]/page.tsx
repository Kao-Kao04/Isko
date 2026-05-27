'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { applicationApi, documentApi, workflowApi, type ApplicationResponse, type AuditEntryResponse, type WorkflowResponse, type ComplianceSubmission } from '@/lib/api-client';
import { COLORS } from '@/lib/theme';
import { MAIN_STAGES, STAGE_LABEL, STUDENT_SUB_STATUS_LABEL, stageIndex, isTerminal, formatInterviewDt } from '@/lib/workflow';

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  approved:   { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
  rejected:   { bg: '#fee2e2', color: '#dc2626', label: 'Not Selected' },
  incomplete: { bg: '#fef9c3', color: '#713f12', label: 'Incomplete' },
  withdrawn:  { bg: '#f3f4f6', color: '#374151', label: 'Withdrawn' },
};

function formatTime(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  submitted:       { label: 'Application Submitted',           color: '#2563eb' },
  resubmitted:     { label: 'Application Resubmitted',         color: '#2563eb' },
  withdrawn:       { label: 'Application Withdrawn',           color: '#6b7280' },
  approved:        { label: 'Application Approved',            color: '#059669' },
  rejected:        { label: 'Not Selected',                    color: '#dc2626' },
  incomplete:      { label: 'Marked as Incomplete',            color: '#ea580c' },
  appeal_approved: { label: 'Appeal Approved — Under Review',  color: '#059669' },
  appeal_denied:   { label: 'Appeal Rejected',                 color: '#dc2626' },
};

function formatAction(action: string): { label: string; color: string } {
  if (ACTION_LABEL[action]) return ACTION_LABEL[action];
  // Handle raw enum strings like "status_changed_to_ApplicationStatus.incomplete"
  const clean = action
    .replace(/status_changed_to_ApplicationStatus\./i, 'Status Changed to ')
    .replace(/appeal_approved/i, 'Appeal Approved')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return { label: clean, color: '#374151' };
}

export default function ApplicationDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();

  const [app,      setApp]      = useState<ApplicationResponse | null>(null);
  const [audit,    setAudit]    = useState<AuditEntryResponse[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [wfActionLoading, setWfActionLoading] = useState(false);
  const [wfDialog, setWfDialog] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ datetime: '', location: '', note: '' });
  const [withdrawReason,   setWithdrawReason]   = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [completionReqs,   setCompletionReqs]   = useState<Array<{ type: string; url: string }>>([{ type: '', url: '' }]);
  const [wfError, setWfError] = useState('');

  const [appealText,       setAppealText]       = useState('');
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [appealSubmitted,  setAppealSubmitted]  = useState(false);
  const [appealError,      setAppealError]      = useState('');

  const [resubmitting,  setResubmitting]  = useState(false);
  const [resubmitError, setResubmitError] = useState('');
  const [newFiles,      setNewFiles]      = useState<Record<string, File>>({});
  const [newFileNames,  setNewFileNames]  = useState<Record<string, string>>({});
  const [docCount,      setDocCount]      = useState(0);

  const [messages,     setMessages]     = useState<Array<{ id: number; sender_id: number; sender_email: string; sender_role: string; body: string; created_at: string }>>([]);
  const [msgBody,      setMsgBody]      = useState('');
  const [msgSending,   setMsgSending]   = useState(false);
  const [msgError,     setMsgError]     = useState('');
  const [scholarshipReqs, setScholarshipReqs] = useState<{ id: number; name: string; is_required: boolean }[]>([]);
  const [compliance,    setCompliance]    = useState<ComplianceSubmission[]>([]);
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [complianceDocs,    setComplianceDocs]    = useState<{ id: number; name: string; is_required: boolean }[]>([]);
  const [complianceFiles,       setComplianceFiles]       = useState<Record<string, File>>({});
  const [complianceFileNames,   setComplianceFileNames]   = useState<Record<string, string>>({});
  const [complianceItemLoading, setComplianceItemLoading] = useState<string | null>(null);

  const DOC_LIMIT = 20;

  useEffect(() => {
    const numId = Number(id);
    Promise.all([
      applicationApi.get(numId),
      workflowApi.get(numId).catch(() => null),
      applicationApi.getAudit(numId).catch(() => [] as AuditEntryResponse[]),
      documentApi.list(numId).catch(() => [] as { id: number }[]),
    ]).then(([a, wf, aud, docs]) => {
      setApp(a);
      if (wf) setWorkflow(wf);
      setAudit(aud);
      setDocCount(docs.length);
      // Load messages
      import('@/lib/api').then(({ apiFetch }) =>
        apiFetch<{ items: typeof messages }>(`/api/applications/${numId}/messages`).then(r => setMessages(r.items)).catch(() => {})
      );
      // Load scholarship requirements when resubmission is needed
      if ((a.status === 'incomplete' || wf?.sub_status === 'revision_requested') && a.scholarship_id) {
        import('@/lib/api-client').then(({ scholarshipApi }) =>
          scholarshipApi.get(a.scholarship_id).then(s => setScholarshipReqs(s.requirements ?? [])).catch(() => {})
        );
      }
      // Load compliance if at completion stage
      if (wf?.main_status === 'completion') {
        applicationApi.getCompliance(numId).then(setCompliance).catch(() => {});
        if (a.scholarship_id) {
          import('@/lib/api-client').then(({ scholarshipApi }) =>
            scholarshipApi.listComplianceDocs(a.scholarship_id).then(setComplianceDocs).catch(() => {})
          );
        }
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  // Auto-refresh messages when OSFA sends a reply via WebSocket notification
  useEffect(() => {
    const numId = Number(id);
    const onNotif = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.application_id === numId) {
        import('@/lib/api').then(({ apiFetch }) =>
          apiFetch<{ items: typeof messages }>(`/api/applications/${numId}/messages`)
            .then(r => setMessages(r.items))
            .catch(() => {})
        );
      }
    };
    window.addEventListener('iskomo:notification', onNotif);
    return () => window.removeEventListener('iskomo:notification', onNotif);
  }, [id]);

  async function doWfAction(fn: () => Promise<WorkflowResponse>, msg: string) {
    setWfActionLoading(true);
    setWfError('');
    try {
      setWorkflow(await fn());
      setWfDialog(null);
    } catch (err) {
      setWfError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setWfActionLoading(false);
    }
  }

  async function sendMessage() {
    if (!msgBody.trim()) return;
    setMsgSending(true); setMsgError('');
    try {
      const { apiFetch } = await import('@/lib/api');
      const sent = await apiFetch<typeof messages[0]>(`/api/applications/${id}/messages`, { method: 'POST', body: JSON.stringify({ body: msgBody.trim() }) });
      setMessages(prev => [...prev, sent]);
      setMsgBody('');
    } catch { setMsgError('Failed to send message. Please try again.'); }
    finally { setMsgSending(false); }
  }

  async function submitAppeal() {
    if (!app || !appealText.trim()) return;
    setAppealSubmitting(true);
    setAppealError('');
    try {
      await applicationApi.fileAppeal(Number(id), appealText.trim());
      const updated = await applicationApi.get(Number(id));
      setApp(updated);
      const aud = await applicationApi.getAudit(Number(id)).catch(() => audit);
      setAudit(aud);
      setAppealText('');
      setAppealSubmitted(true);
    } catch (err: unknown) {
      setAppealError(err instanceof Error ? err.message : 'Failed to submit appeal.');
    } finally {
      setAppealSubmitting(false);
    }
  }

  async function handleResubmit() {
    if (!app) return;
    setResubmitting(true);
    setResubmitError('');
    try {
      const updated = await applicationApi.resubmit(Number(id));
      setApp(updated);
      const [aud, wf] = await Promise.all([
        applicationApi.getAudit(Number(id)).catch(() => audit),
        workflowApi.get(Number(id)).catch(() => null),
      ]);
      setAudit(aud);
      if (wf) setWorkflow(wf);
    } catch (err: unknown) {
      setResubmitError(err instanceof Error ? err.message : 'Failed to resubmit. Please try again.');
    } finally {
      setResubmitting(false);
    }
  }

  async function submitComplianceDoc(docName: string, file?: File) {
    setComplianceItemLoading(docName);
    try {
      let fileUrl: string | undefined;
      if (file) {
        const uploaded = await documentApi.upload(app!.id, docName, file);
        fileUrl = uploaded.file_url;
      }
      const sub = await applicationApi.submitCompliance(app!.id, {
        requirement_type: docName,
        ...(fileUrl ? { file_url: fileUrl } : {}),
      });
      setCompliance(prev => [...prev.filter(c => c.requirement_type !== docName), sub]);
      setComplianceFiles(prev => { const n = { ...prev }; delete n[docName]; return n; });
      setComplianceFileNames(prev => { const n = { ...prev }; delete n[docName]; return n; });
    } catch { /* silent */ }
    finally { setComplianceItemLoading(null); }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 860, margin: '80px auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: `3px solid #f3f4f6`, borderTop: `3px solid ${COLORS.maroon}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ maxWidth: 700, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Application not found</h2>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>This application may have been withdrawn or doesn&apos;t belong to your account.</p>
        <Link href="/student/applications" style={{ padding: '9px 22px', background: COLORS.maroon, color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          Back to Applications
        </Link>
      </div>
    );
  }

  const scholarshipName = app.scholarship?.name ?? `Scholarship #${app.scholarship_id}`;
  const studentName     = app.student ? `${app.student.first_name ?? ''} ${app.student.last_name ?? ''}`.trim() : '';
  const badge           = STATUS_BADGE[app.status] ?? STATUS_BADGE.pending;
  const isPublic        = app.scholarship?.category === 'public';

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 16px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13 }}>
        <Link href="/student/applications" style={{ color: COLORS.maroon, textDecoration: 'none', fontWeight: 500 }}>My Applications</Link>
        <span style={{ color: '#d1d5db' }}>/</span>
        <span style={{ color: '#374151', fontWeight: 600 }}>{scholarshipName}</span>
      </div>

      {/* Header card */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '22px 24px', marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#111827' }}>{scholarshipName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 700 }}>
                {badge.label}
              </span>
              {app.eval_status === 'in_review' && app.status !== 'approved' && app.status !== 'rejected' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 12px', borderRadius: 20, background: '#eff6ff', color: '#0369a1', fontSize: 12, fontWeight: 700 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0369a1' }} />
                  Under Evaluation
                </span>
              )}
              <span style={{ fontSize: 13, color: '#6b7280' }}>Applied {formatTime(app.submitted_at)}</span>
            </div>
          </div>
          <button onClick={() => router.back()} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ← Back
          </button>
        </div>
      </div>

      <div className="app-detail-grid">

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Workflow progress stepper */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Progress</h3>
            {workflow ? (() => {
              const ms = workflow.main_status ?? '';
              const ss = workflow.sub_status  ?? '';
              const terminal = isTerminal(ms, ss);
              // For terminal states (rejected/withdrawn), stageIndex returns -1.
              // Find the last stage before termination from the audit logs.
              const lastNonTerminalLog = [...(workflow.logs ?? [])].reverse()
                .find(l => l.to_main !== 'rejected' && l.to_main !== 'withdrawn');
              const displayMs = (ms === 'rejected' || ms === 'withdrawn')
                ? (lastNonTerminalLog?.from_main ?? lastNonTerminalLog?.to_main ?? 'application')
                : ms;
              const idx = stageIndex(displayMs);
              const MAROON = COLORS.maroon;
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                    {MAIN_STAGES.map((stage, i) => {
                      const done   = i < idx;
                      const active = i === idx && !terminal;
                      const fail   = terminal && i === idx;
                      const color  = done ? MAROON : active ? MAROON : fail ? '#dc2626' : '#9ca3af';
                      return (
                        <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: i < MAIN_STAGES.length - 1 ? 1 : 0 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? MAROON : fail ? '#fef2f2' : active ? '#fff' : '#f3f4f6', border: `2px solid ${color}`, boxShadow: active ? `0 0 0 4px ${MAROON}20` : 'none' }}>
                              {done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              : fail ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              : active ? <div style={{ width: 11, height: 11, borderRadius: '50%', background: MAROON }} />
                              : <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#d1d5db' }} />}
                            </div>
                            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color, textAlign: 'center', lineHeight: 1.3, maxWidth: 58 }}>{STAGE_LABEL[stage]}</span>
                          </div>
                          {i < MAIN_STAGES.length - 1 && <div style={{ flex: 1, height: 2, background: done ? MAROON : '#e5e7eb', margin: '0 4px', marginBottom: 22 }} />}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 20, background: terminal ? '#fef2f2' : `${MAROON}10`, border: `1.5px solid ${terminal ? '#fca5a5' : `${MAROON}40`}` }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: terminal ? '#dc2626' : MAROON }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: terminal ? '#dc2626' : MAROON }}>
                      {terminal && ms === 'rejected' ? 'Not Selected' : terminal && ms === 'withdrawn' ? 'Application Withdrawn' : (STUDENT_SUB_STATUS_LABEL[ss] ?? ss)}
                    </span>
                  </div>

                  {/* Interview / Submission Deadline card */}
                  {ms === 'interview' && workflow.interview_datetime && (
                    <div style={{ marginTop: 18, padding: '14px 16px', background: '#fff5f5', borderRadius: 10, border: `1px solid ${COLORS.maroon}30` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MAROON} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {isPublic ? 'Submission Deadline' : 'Interview Scheduled'}
                      </div>
                      <div style={{ fontSize: 13, color: '#374151', marginBottom: 3 }}><strong>{isPublic ? 'Submit documents by:' : 'Date & Time:'}</strong> {formatInterviewDt(workflow.interview_datetime)}</div>
                      {workflow.interview_location && <div style={{ fontSize: 13, color: '#374151', marginBottom: 3 }}><strong>{isPublic ? 'Submit to:' : 'Location:'}</strong> {workflow.interview_location}</div>}
                      {workflow.interview_instructions && (
                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff', borderRadius: 7, border: '1px solid #fde68a', fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
                          <strong>Instructions:</strong> {workflow.interview_instructions}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Public: OSFA hasn't set the deadline yet */}
                  {isPublic && ms === 'interview' && !workflow.interview_datetime && (
                    <div style={{ marginTop: 18, padding: '12px 16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe', fontSize: 13, color: '#1d4ed8' }}>
                      OSFA will notify you once the submission deadline is set.
                    </div>
                  )}

                  {/* Decision banner */}
                  {ms === 'decision' && (
                    <div style={{ marginTop: 18, padding: '14px 16px', background: ss === 'approved' ? '#f0fdf4' : ss === 'rejected' ? '#fef2f2' : '#fffbeb', borderRadius: 10, border: `1px solid ${ss === 'approved' ? '#86efac' : ss === 'rejected' ? '#fca5a5' : '#fde68a'}` }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ss === 'approved' ? '#15803d' : ss === 'rejected' ? '#dc2626' : '#92400e', marginBottom: workflow.decision_remarks ? 6 : 0 }}>
                        {ss === 'approved' ? '🎉 Congratulations! Your application has been approved.' : ss === 'rejected' ? 'Thank you for applying. After careful review, you were not selected as a recipient for this scholarship cycle. We appreciate your effort and encourage you to apply again in the future.' : ss === 'waitlisted' ? 'You are on the waitlist. Check back for updates.' : 'Your application is under review.'}
                      </div>
                      {workflow.decision_remarks && <div style={{ fontSize: 13, color: '#374151' }}>{workflow.decision_remarks}</div>}
                    </div>
                  )}

                  {/* Completion pending requirements */}
                  {ms === 'completion' && ss === 'pending_requirements' && (
                    <div style={{ marginTop: 18, padding: '14px 16px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', fontSize: 13, color: '#92400e', fontWeight: 600 }}>
                      Action required: Please submit your completion requirements to finalize your scholarship.
                    </div>
                  )}
                </>
              );
            })() : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', color: '#9ca3af', fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Workflow not yet initialized by OSFA.
              </div>
            )}
          </div>

          {/* Generate Documents — available at COMPLETION stage (shown before actions so student sees forms first) */}
          {workflow?.main_status === 'completion' && (() => {
            async function openDoc(type: 'confirmation-letter' | 'terms') {
              try {
                const { apiFetch } = await import('@/lib/api');
                const html = await apiFetch<string>(`/api/applications/${app!.id}/documents/${type}`, {}, 'text');
                const blob = new Blob([html], { type: 'text/html' });
                window.open(URL.createObjectURL(blob), '_blank');
              } catch {
                alert('Failed to generate document. Please try again.');
              }
            }
            const docBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' };

            const OSFA_FOLDER = process.env.NEXT_PUBLIC_OSFA_FORMS_FOLDER_URL ?? 'https://drive.google.com/drive/folders/10rzE2Lej8tQ70PUXBAGknmss2UnkR7FR?usp=drive_link';
            const OSFA_FORMS = [
              { label: 'Scholarship Agreement Form',                              href: OSFA_FOLDER },
              { label: 'Non-Disclosure Agreement',                                href: OSFA_FOLDER },
              { label: 'Personal Data Sheet (PUP-PDSA-5-OFSS-009)',              href: OSFA_FOLDER },
              { label: 'Request for Clearing Deficiency (with Code)',             href: OSFA_FOLDER },
              { label: 'Request for Clearing Deficiency (without Code)',          href: OSFA_FOLDER },
              { label: 'Student Assistant Endorsement Form',                      href: OSFA_FOLDER },
              { label: 'Student Assistant Evaluation Form',                       href: OSFA_FOLDER },
            ];

            return (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generate Documents</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                  <button onClick={() => openDoc('confirmation-letter')} style={docBtn}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Confirmation Letter
                  </button>
                  <button onClick={() => openDoc('terms')} style={docBtn}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Terms & Conditions
                  </button>
                </div>

                {/* OSFA Required Forms */}
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OSFA Required Forms</p>
                    <a href={OSFA_FOLDER} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, fontWeight: 600, color: COLORS.maroon, textDecoration: 'none' }}>
                      Open Folder ↗
                    </a>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {OSFA_FORMS.map((form, i) => (
                      <a key={i} href={form.href} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fafafa', textDecoration: 'none', color: '#374151', fontSize: 12, fontWeight: 500, transition: 'background 0.12s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f9ff'; (e.currentTarget as HTMLElement).style.borderColor = '#bfdbfe'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fafafa'; (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span style={{ flex: 1 }}>{form.label}</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Workflow student actions */}
          {workflow && !isTerminal(workflow.main_status ?? '', workflow.sub_status ?? '') && (() => {
            const ms = workflow.main_status ?? '';
            const ss = workflow.sub_status  ?? '';
            const inp: React.CSSProperties = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
            const showSchedule   = ms === 'interview' && ss === 'not_scheduled';
            const showReschedule = ms === 'interview' && (ss === 'scheduled' || ss === 'rescheduled');
            const showSubmitReqs = ms === 'completion' && ss === 'pending_requirements';
            const showWithdraw   = !isTerminal(ms, ss) && ms !== 'completion';
            if (!showSchedule && !showReschedule && !showWithdraw && !showSubmitReqs) return null;
            return (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</h3>
                {wfError && <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>{wfError}</div>}

                {/* Schedule Interview (only when not yet scheduled) */}
                {showSchedule && wfDialog !== 'schedule' && (
                  <button onClick={() => setWfDialog('schedule')} style={{ padding: '9px 18px', background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10, display: 'block' }}>
                    {isPublic ? 'Request Schedule' : 'Schedule Interview'}
                  </button>
                )}

                {wfDialog === 'schedule' && (
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px', marginBottom: 12 }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{isPublic ? 'Request Schedule' : 'Schedule Interview'}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Preferred Date & Time</label>
                        <input type="datetime-local" value={scheduleForm.datetime} onChange={e => setScheduleForm(f => ({ ...f, datetime: e.target.value }))} style={inp} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Location</label>
                        <input type="text" value={scheduleForm.location} onChange={e => setScheduleForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Room 301" style={inp} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Note (optional)</label>
                        <input type="text" value={scheduleForm.note} onChange={e => setScheduleForm(f => ({ ...f, note: e.target.value }))} placeholder="Any preferred notes" style={inp} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button disabled={wfActionLoading || !scheduleForm.datetime || !scheduleForm.location}
                        onClick={() => doWfAction(() => workflowApi.scheduleInterview(Number(id), { interview_datetime: new Date(scheduleForm.datetime).toISOString(), location: scheduleForm.location, ...(scheduleForm.note ? { note: scheduleForm.note } : {}) }), 'Interview scheduled.')}
                        style={{ padding: '8px 16px', background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: wfActionLoading ? 'not-allowed' : 'pointer', opacity: wfActionLoading ? 0.7 : 1 }}>
                        {wfActionLoading ? 'Submitting…' : 'Submit'}
                      </button>
                      <button onClick={() => { setWfDialog(null); setScheduleForm({ datetime: '', location: '', note: '' }); }} style={{ padding: '8px 14px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Request Reschedule (when already scheduled or rescheduled) */}
                {showReschedule && wfDialog !== 'reschedule' && (
                  <button onClick={() => setWfDialog('reschedule')} style={{ padding: '9px 18px', background: '#fff', color: COLORS.maroon, border: `1px solid ${COLORS.maroon}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10, display: 'block' }}>
                    {isPublic ? 'Request Reschedule / Extension' : 'Request Reschedule'}
                  </button>
                )}

                {wfDialog === 'reschedule' && (
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px', marginBottom: 12, border: `1px solid ${COLORS.maroon}30` }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{isPublic ? 'Request Reschedule / Extension' : 'Request Reschedule'}</h4>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Reason for rescheduling (required)</label>
                      <textarea value={rescheduleReason} onChange={e => setRescheduleReason(e.target.value)} placeholder="e.g. I have a class conflict on that day..." rows={3} style={{ ...inp, resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button disabled={wfActionLoading || !rescheduleReason.trim()}
                        onClick={() => doWfAction(() => workflowApi.requestReschedule(Number(id), rescheduleReason), 'Reschedule request submitted.')}
                        style={{ padding: '8px 16px', background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: wfActionLoading || !rescheduleReason.trim() ? 'not-allowed' : 'pointer', opacity: wfActionLoading || !rescheduleReason.trim() ? 0.7 : 1 }}>
                        {wfActionLoading ? 'Submitting…' : 'Submit Request'}
                      </button>
                      <button onClick={() => { setWfDialog(null); setRescheduleReason(''); }} style={{ padding: '8px 14px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Submit Completion Requirements */}
                {showSubmitReqs && wfDialog !== 'requirements' && (
                  <button onClick={() => { setWfDialog('requirements'); setCompletionReqs([{ type: '', url: '' }]); }} style={{ padding: '9px 18px', background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10, display: 'block' }}>
                    Submit Completion Requirements
                  </button>
                )}

                {wfDialog === 'requirements' && (
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px', marginBottom: 12, border: `1px solid ${COLORS.maroon}30` }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#111827' }}>Completion Requirements</h4>
                    <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>Add at least one requirement. Provide the requirement type and an optional file URL.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                      {completionReqs.map((req, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="text" value={req.type} onChange={e => setCompletionReqs(prev => prev.map((r, j) => j === i ? { ...r, type: e.target.value } : r))} placeholder="Requirement type (e.g. Transcript of Records)" style={{ ...inp, flex: 2 }} />
                          <input type="url" value={req.url} onChange={e => setCompletionReqs(prev => prev.map((r, j) => j === i ? { ...r, url: e.target.value } : r))} placeholder="File URL (optional)" style={{ ...inp, flex: 1 }} />
                          {completionReqs.length > 1 && (
                            <button onClick={() => setCompletionReqs(prev => prev.filter((_, j) => j !== i))} style={{ padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, cursor: 'pointer', color: '#dc2626', fontSize: 12, flexShrink: 0 }}>✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setCompletionReqs(prev => [...prev, { type: '', url: '' }])} style={{ fontSize: 12, color: COLORS.maroon, background: 'none', border: `1px dashed ${COLORS.maroon}`, borderRadius: 7, padding: '5px 12px', cursor: 'pointer', marginBottom: 12 }}>
                      + Add Requirement
                    </button>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        disabled={wfActionLoading || completionReqs.every(r => !r.type.trim())}
                        onClick={() => doWfAction(() => workflowApi.submitRequirements(Number(id), completionReqs.filter(r => r.type.trim()).map(r => ({ requirement_type: r.type.trim(), ...(r.url.trim() ? { file_url: r.url.trim() } : {}) }))), 'Requirements submitted.')}
                        style={{ padding: '8px 16px', background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: wfActionLoading ? 'not-allowed' : 'pointer', opacity: wfActionLoading ? 0.7 : 1 }}>
                        {wfActionLoading ? 'Submitting…' : 'Submit'}
                      </button>
                      <button onClick={() => setWfDialog(null)} style={{ padding: '8px 14px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                    </div>
                  </div>
                )}

                {showWithdraw && wfDialog !== 'withdraw' && (
                  <button onClick={() => setWfDialog('withdraw')} style={{ padding: '9px 18px', background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Withdraw Application
                  </button>
                )}

                {wfDialog === 'withdraw' && (
                  <div style={{ background: '#fef2f2', borderRadius: 10, padding: '16px', border: '1px solid #fca5a5' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#dc2626' }}>Withdraw Application</h4>
                    <textarea value={withdrawReason} onChange={e => setWithdrawReason(e.target.value)} placeholder="Reason for withdrawal (required)" rows={3} style={{ width: '100%', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', marginBottom: 10, resize: 'vertical', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button disabled={wfActionLoading || !withdrawReason.trim()}
                        onClick={() => doWfAction(() => workflowApi.withdraw(Number(id), withdrawReason), 'Application withdrawn.')}
                        style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: wfActionLoading ? 'not-allowed' : 'pointer', opacity: wfActionLoading ? 0.7 : 1 }}>
                        {wfActionLoading ? 'Withdrawing…' : 'Confirm Withdrawal'}
                      </button>
                      <button onClick={() => { setWfDialog(null); setWithdrawReason(''); }} style={{ padding: '8px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Remarks / status notes */}
          {app.remarks && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OSFA Remarks</h3>
              <div style={{ padding: '12px 16px', background: app.status === 'incomplete' ? '#fff7ed' : '#fef2f2', border: `1px solid ${app.status === 'incomplete' ? '#fed7aa' : '#fecaca'}`, borderRadius: 9, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                {app.remarks}
              </div>
            </div>
          )}

          {/* Activity timeline */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity Timeline</h3>
            {audit.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13 }}>No activity yet.</p>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 24 }}>
                <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: '#f3f4f6', borderRadius: 99 }} />
                {[...audit].reverse().map((entry, i) => (
                  <div key={entry.id} style={{ position: 'relative', marginBottom: i < audit.length - 1 ? 20 : 0 }}>
                    <div style={{ position: 'absolute', left: -20, top: 4, width: 10, height: 10, borderRadius: '50%', background: i === 0 ? COLORS.maroon : '#d1d5db', border: `2px solid ${i === 0 ? COLORS.maroon : '#e5e7eb'}` }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: formatAction(entry.action).color, lineHeight: 1.4 }}>{formatAction(entry.action).label}</div>
                    {entry.note && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{entry.note}</div>}
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{formatTime(entry.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resubmit section — shown when OSFA marks application as Incomplete or requests document revision */}
          {(app.status === 'incomplete' || workflow?.sub_status === 'revision_requested') && (() => {
            const requirements = scholarshipReqs;
            return (
              <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #fed7aa', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Action Required — Upload Missing Documents</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Upload the files below, then click Resubmit.</div>
                  </div>
                  <div style={{
                    fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                    background: docCount >= DOC_LIMIT ? '#fef2f2' : '#f3f4f6',
                    color: docCount >= DOC_LIMIT ? '#dc2626' : '#6b7280',
                    flexShrink: 0,
                  }}>
                    {docCount} / {DOC_LIMIT} docs
                  </div>
                </div>

                {app.remarks && (
                  <div style={{ padding: '12px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 9, marginBottom: 14, fontSize: 13, color: '#9a3412', lineHeight: 1.6 }}>
                    <strong>OSFA Note:</strong> {app.remarks}
                  </div>
                )}

                {/* Document upload inputs */}
                {requirements.length === 0 ? (
                  <div style={{ padding: '12px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9, marginBottom: 14, fontSize: 13, color: '#6b7280' }}>
                    No specific documents required — click Resubmit when you are ready.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                    {requirements.map(req => {
                      const hasFile = !!newFileNames[req.name];
                      return (
                        <div key={req.id}>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                            {req.name} {req.is_required && <span style={{ color: '#dc2626' }}>*</span>}
                          </label>
                          <label
                            htmlFor={`doc-${req.id}`}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                              border: `2px dashed ${hasFile ? '#ea580c' : docCount >= DOC_LIMIT ? '#fca5a5' : '#d1d5db'}`,
                              borderRadius: 9,
                              background: hasFile ? '#fff7ed' : docCount >= DOC_LIMIT ? '#fef2f2' : '#fafafa',
                              cursor: docCount >= DOC_LIMIT ? 'not-allowed' : 'pointer',
                              opacity: docCount >= DOC_LIMIT && !hasFile ? 0.6 : 1,
                            }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={hasFile ? '#ea580c' : docCount >= DOC_LIMIT ? '#dc2626' : '#9ca3af'} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span style={{ fontSize: 13, color: hasFile ? '#ea580c' : docCount >= DOC_LIMIT ? '#dc2626' : '#6b7280', fontWeight: hasFile ? 600 : 400 }}>
                              {hasFile
                                ? `✓ ${newFileNames[req.name]}`
                                : docCount >= DOC_LIMIT
                                ? 'Upload limit reached (20 documents max)'
                                : 'Click to upload (PDF, JPG, PNG — max 5MB)'}
                            </span>
                            <input id={`doc-${req.id}`} type="file" accept=".pdf,.jpg,.jpeg,.png"
                              disabled={docCount >= DOC_LIMIT}
                              style={{ display: 'none' }}
                              onChange={e => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  setNewFiles(prev => ({ ...prev, [req.name]: f }));
                                  setNewFileNames(prev => ({ ...prev, [req.name]: f.name }));
                                }
                              }} />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {resubmitError && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 12 }}>
                    {resubmitError}
                  </div>
                )}

                <button
                  onClick={async () => {
                    setResubmitting(true);
                    setResubmitError('');
                    try {
                      // Upload any new files first
                      const uploadEntries = Object.entries(newFiles);
                      const uploadResults = await Promise.allSettled(
                        uploadEntries.map(([reqName, file]) => documentApi.upload(Number(id), reqName, file))
                      );
                      const successCount = uploadResults.filter(r => r.status === 'fulfilled').length;
                      setDocCount(c => c + successCount);
                      const limitHit = uploadResults.find(r =>
                        r.status === 'rejected' &&
                        r.reason instanceof Error &&
                        r.reason.message.toLowerCase().includes('maximum 20')
                      );
                      if (limitHit) {
                        setResubmitError('Document limit reached: maximum 20 documents per application. Remove some before uploading more.');
                        setResubmitting(false);
                        return;
                      }
                      // Then resubmit
                      await handleResubmit();
                    } catch (err: unknown) {
                      setResubmitError(err instanceof Error ? err.message : 'Failed. Please try again.');
                    } finally {
                      setResubmitting(false);
                    }
                  }}
                  disabled={resubmitting}
                  style={{ width: '100%', padding: '11px 0', background: resubmitting ? '#9ca3af' : '#ea580c', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, color: '#fff', cursor: resubmitting ? 'not-allowed' : 'pointer' }}>
                  {resubmitting ? 'Uploading & Resubmitting…' : '↩ Resubmit Application'}
                </button>
              </div>
            );
          })()}

          {/* Compliance Checklist — COMPLETION + pending_requirements */}
          {workflow?.main_status === 'completion' && workflow?.sub_status === 'pending_requirements' && (() => {
            const requiredDocs = complianceDocs.filter(d => d.is_required);
            const verifiedCount = compliance.filter(c => c.is_verified).length;
            const totalRequired = requiredDocs.length;
            const allVerified = totalRequired > 0 && requiredDocs.every(d =>
              compliance.some(c => c.requirement_type === d.name && c.is_verified)
            );
            return (
              <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${allVerified ? '#86efac' : '#fcd34d'}`, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Compliance Checklist</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                      {verifiedCount} of {totalRequired} required documents verified
                    </p>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: allVerified ? '#dcfce7' : '#fffbeb', color: allVerified ? '#15803d' : '#92400e' }}>
                    {allVerified ? 'All Verified ✓' : `${totalRequired - verifiedCount} remaining`}
                  </div>
                </div>

                {allVerified ? (
                  <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: 9, border: '1px solid #bbf7d0', fontSize: 13, color: '#166534', lineHeight: 1.5 }}>
                    All required documents have been verified. Waiting for OSFA to finalize your scholarship.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {complianceDocs.map(docType => {
                      const submitted = compliance.find(c => c.requirement_type === docType.name);
                      const isVerified = submitted?.is_verified;
                      const isItemLoading = complianceItemLoading === docType.name;
                      const selectedFile = complianceFiles[docType.name];
                      const selectedFileName = complianceFileNames[docType.name];
                      return (
                        <div key={docType.id} style={{ borderRadius: 9, border: `1px solid ${isVerified ? '#bbf7d0' : submitted ? '#bfdbfe' : '#e5e7eb'}`, background: isVerified ? '#f0fdf4' : submitted ? '#eff6ff' : '#fafafa', overflow: 'hidden' }}>
                          {/* Header row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isVerified ? '#dcfce7' : submitted ? '#dbeafe' : '#f3f4f6' }}>
                              {isVerified
                                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                : submitted
                                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                                {docType.name}
                                {docType.is_required && <span style={{ marginLeft: 5, fontSize: 10, color: '#9ca3af' }}>Required</span>}
                              </div>
                              <div style={{ fontSize: 11, color: isVerified ? '#15803d' : submitted ? '#1d4ed8' : '#9ca3af', marginTop: 2 }}>
                                {isVerified
                                  ? `Verified by OSFA${submitted?.verified_at ? ` · ${new Date(submitted.verified_at).toLocaleDateString()}` : ''}`
                                  : submitted
                                  ? `Submitted — awaiting OSFA verification${submitted.file_url ? ' (with file)' : ' (physical)'}`
                                  : 'Not yet submitted'}
                              </div>
                            </div>
                          </div>

                          {/* Upload / submit row — only when not yet submitted */}
                          {!submitted && (
                            <div style={{ padding: '10px 14px 12px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
                              <p style={{ margin: '0 0 8px', fontSize: 11, color: '#6b7280' }}>
                                Bring the original to the OSFA office, or attach a scanned copy below.
                              </p>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* File picker */}
                                <label htmlFor={`compliance-${docType.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: `1px dashed ${selectedFile ? COLORS.maroon : '#d1d5db'}`, borderRadius: 7, background: selectedFile ? '#fff5f5' : '#fafafa', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: selectedFile ? COLORS.maroon : '#6b7280', flexShrink: 0 }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                  <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFileName ?? 'Attach file'}</span>
                                  <input id={`compliance-${docType.id}`} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
                                    onChange={e => {
                                      const f = e.target.files?.[0];
                                      if (f) {
                                        setComplianceFiles(prev => ({ ...prev, [docType.name]: f }));
                                        setComplianceFileNames(prev => ({ ...prev, [docType.name]: f.name }));
                                      }
                                    }} />
                                </label>

                                {/* Upload & Submit — only shown when a file is selected */}
                                {selectedFile && (
                                  <button
                                    disabled={isItemLoading}
                                    onClick={() => submitComplianceDoc(docType.name, selectedFile)}
                                    style={{ padding: '6px 14px', border: 'none', borderRadius: 7, background: isItemLoading ? '#9ca3af' : COLORS.maroon, color: '#fff', fontSize: 12, fontWeight: 600, cursor: isItemLoading ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
                                    {isItemLoading ? 'Uploading…' : 'Upload & Submit'}
                                  </button>
                                )}

                                {/* Mark as physically submitted (no file) */}
                                <button
                                  disabled={isItemLoading}
                                  onClick={() => submitComplianceDoc(docType.name)}
                                  style={{ padding: '6px 14px', border: '1px solid #e5e7eb', borderRadius: 7, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: isItemLoading ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: isItemLoading ? 0.6 : 1 }}>
                                  {isItemLoading ? 'Submitting…' : 'Mark as Submitted'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Appeal section */}
          {(app.status === 'rejected' || (workflow?.main_status === 'decision' && workflow?.sub_status === 'rejected')) && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#111827' }}>File an Appeal</h3>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                If you believe this decision was made in error, you may submit an appeal for review by OSFA.
              </p>

              {app.appeal ? (
                <div style={{ padding: '14px 16px', background: '#fef3c7', borderRadius: 9, border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                      background: app.appeal.status === 'approved' ? '#dcfce7' : app.appeal.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: app.appeal.status === 'approved' ? '#15803d' : app.appeal.status === 'rejected' ? '#dc2626' : '#92400e',
                    }}>{app.appeal.status}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Filed {formatTime(app.appeal.created_at)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{app.appeal.reason}</p>
                  {app.appeal.review_note && (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>OSFA note: {app.appeal.review_note}</p>
                  )}
                </div>
              ) : appealSubmitted ? (
                <div style={{ padding: '14px 16px', background: '#dcfce7', borderRadius: 9, border: '1px solid #bbf7d0', fontSize: 13, color: '#166534', fontWeight: 600 }}>
                  ✓ Appeal submitted. OSFA will review your request.
                </div>
              ) : (
                <div>
                  {appealError && (
                    <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 12 }}>
                      {appealError}
                    </div>
                  )}
                  <textarea
                    value={appealText}
                    onChange={e => setAppealText(e.target.value)}
                    placeholder="Explain why you believe this rejection should be reconsidered..."
                    rows={4}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, color: '#374151', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none' }}
                  />
                  <button
                    onClick={submitAppeal}
                    disabled={!appealText.trim() || appealSubmitting}
                    style={{ marginTop: 10, width: '100%', padding: '10px 0', background: appealText.trim() && !appealSubmitting ? COLORS.maroon : '#fca5a5', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, color: '#fff', cursor: appealText.trim() && !appealSubmitting ? 'pointer' : 'not-allowed' }}>
                    {appealSubmitting ? 'Submitting…' : 'Submit Appeal'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Messages */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Messages with OSFA
            </h3>
            <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: '#9ca3af' }}>No messages yet. Send a question to OSFA below.</div>
              ) : messages.map(m => {
                const isMe = m.sender_role === 'student';
                return (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '85%', background: isMe ? COLORS.maroon : '#f3f4f6', color: isMe ? '#fff' : '#111827', borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px', padding: '9px 13px', fontSize: 13, lineHeight: 1.5 }}>
                      {m.body}
                    </div>
                    <span style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>
                      {isMe ? 'You' : 'OSFA'} · {new Date(m.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
            {msgError && <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 8 }}>{msgError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={msgBody}
                onChange={e => setMsgBody(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Type a message…"
                style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', color: '#111827' }}
              />
              <button type="button" onClick={sendMessage} disabled={!msgBody.trim() || msgSending}
                style={{ padding: '8px 14px', background: msgBody.trim() ? COLORS.maroon : '#e5e7eb', border: 'none', borderRadius: 8, color: msgBody.trim() ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: msgBody.trim() ? 'pointer' : 'not-allowed' }}>
                {msgSending ? '…' : 'Send'}
              </button>
            </div>
          </div>

          {/* Application info */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</h3>
            {[
              { label: 'Student',    value: studentName },
              { label: 'Program',    value: app.student?.program ?? '—' },
              { label: 'Year Level', value: app.student?.year_level ? (['1st','2nd','3rd','4th'][app.student.year_level - 1] ?? `${app.student.year_level}th`) + ' Year' : '—' },
              { label: 'College',    value: app.student?.college ?? '—' },
              { label: 'Evaluation', value: ({ not_started: 'Not Started', in_review: 'In Review', completed: 'Completed' } as Record<string,string>)[app.eval_status] ?? app.eval_status },
              { label: 'Submitted',  value: formatTime(app.submitted_at) },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#6b7280', flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Scholar status if approved */}
          {app.status === 'approved' && (
            <div style={{ background: '#f0fdf4', borderRadius: 14, border: '1px solid #bbf7d0', padding: '18px 20px' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scholar Status</h3>
              <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: '#dcfce7', color: '#15803d', fontSize: 12, fontWeight: 700 }}>
                ✓ Active Scholar
              </span>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href={`/student/iskolarships/${app.scholarship_id}`} style={{ display: 'block', padding: '9px 14px', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, textAlign: 'center', background: '#f9fafb' }}>
                View Scholarship
              </Link>
              <Link href="/student/applications" style={{ display: 'block', padding: '9px 14px', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, textAlign: 'center', background: '#f9fafb' }}>
                All Applications
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
