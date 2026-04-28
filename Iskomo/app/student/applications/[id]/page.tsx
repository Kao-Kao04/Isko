'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { applicationApi, type ApplicationResponse, type AuditEntryResponse } from '@/lib/api-client';
import { COLORS } from '@/lib/theme';

const STEPS = ['Submitted', 'Under Review', 'Interview', 'Doc Validation', 'Decision'];

const STATUS_STEP: Record<string, number> = {
  pending:    0,
  incomplete: 0,
  withdrawn:  0,
  approved:   4,
  rejected:   4,
};

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  approved:   { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
  rejected:   { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
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
  rejected:        { label: 'Application Rejected',            color: '#dc2626' },
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

  const [app,   setApp]   = useState<ApplicationResponse | null>(null);
  const [audit, setAudit] = useState<AuditEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [appealText,       setAppealText]       = useState('');
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [appealSubmitted,  setAppealSubmitted]  = useState(false);
  const [appealError,      setAppealError]      = useState('');

  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitError, setResubmitError] = useState('');

  useEffect(() => {
    const numId = Number(id);
    applicationApi.get(numId)
      .then(async (a) => {
        setApp(a);
        const aud = await applicationApi.getAudit(numId).catch(() => []);
        setAudit(aud);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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
      const aud = await applicationApi.getAudit(Number(id)).catch(() => audit);
      setAudit(aud);
    } catch (err: unknown) {
      setResubmitError(err instanceof Error ? err.message : 'Failed to resubmit. Please try again.');
    } finally {
      setResubmitting(false);
    }
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
  const currentStep     = STATUS_STEP[app.status] ?? 0;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 16px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Progress stepper */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Progress</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {STEPS.map((step, i) => {
                const s = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending';
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: s === 'done' ? COLORS.maroon : s === 'active' ? '#fff' : '#f3f4f6',
                        border: s === 'pending' ? '2px solid #e5e7eb' : `2px solid ${COLORS.maroon}`,
                        boxShadow: s === 'active' ? `0 0 0 4px ${COLORS.maroon}20` : 'none',
                      }}>
                        {s === 'done' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : s === 'active' ? (
                          <div style={{ width: 11, height: 11, borderRadius: '50%', background: COLORS.maroon }} />
                        ) : (
                          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#d1d5db' }} />
                        )}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: s === 'active' ? 700 : 500, color: s === 'pending' ? '#9ca3af' : s === 'active' ? COLORS.maroon : '#374151', textAlign: 'center', lineHeight: 1.3, maxWidth: 58 }}>
                        {step}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: s === 'done' ? COLORS.maroon : '#e5e7eb', margin: '0 4px', marginBottom: 22 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

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

          {/* Resubmit section — shown when OSFA marks application as Incomplete */}
          {app.status === 'incomplete' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #fed7aa', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Action Required</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Your application needs additional documents</div>
                </div>
              </div>

              {app.remarks && (
                <div style={{ padding: '12px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 9, marginBottom: 14, fontSize: 13, color: '#9a3412', lineHeight: 1.6 }}>
                  <strong>OSFA Note:</strong> {app.remarks}
                </div>
              )}

              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                Upload the missing documents to your application, then click <strong>Resubmit Application</strong> to send it back for review.
              </p>

              {resubmitError && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 12 }}>
                  {resubmitError}
                </div>
              )}

              <button
                onClick={handleResubmit}
                disabled={resubmitting}
                style={{ width: '100%', padding: '11px 0', background: resubmitting ? '#9ca3af' : '#ea580c', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, color: '#fff', cursor: resubmitting ? 'not-allowed' : 'pointer' }}>
                {resubmitting ? 'Resubmitting…' : '↩ Resubmit Application'}
              </button>
            </div>
          )}

          {/* Appeal section */}
          {app.status === 'rejected' && (
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

          {/* Application info */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</h3>
            {[
              { label: 'Student',    value: studentName },
              { label: 'Program',    value: app.student?.program ?? '—' },
              { label: 'Year Level', value: app.student?.year_level ? `${app.student.year_level}th Year` : '—' },
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
