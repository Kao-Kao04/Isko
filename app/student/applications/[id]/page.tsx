'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOsfaContext } from '@/lib/osfa-context';
import { MOCK_STUDENT } from '@/lib/data/mock-user';
import { COLORS, STATUS_BADGE } from '@/lib/theme';

const STEPS = ['Submitted', 'Under Review', 'Interview', 'Doc Validation', 'Decision'];
const STATUS_STEP: Record<string, number> = {
  'Pending': 0, 'Under Review': 1, 'Interview': 2, 'Incomplete': 0,
  'Approved': 4, 'Rejected': 4, 'Duplicate': 0,
};

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { applicants, setApplicants } = useOsfaContext();

  const app = applicants.find(a => a.id === id && a.email === MOCK_STUDENT.email);

  const [appealText, setAppealText] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  if (!app) {
    return (
      <div style={{ maxWidth: 700, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Application not found</h2>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>This application may have been withdrawn or doesn't belong to your account.</p>
        <Link href="/student/applications" style={{ padding: '9px 22px', background: COLORS.maroon, color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          Back to Applications
        </Link>
      </div>
    );
  }

  const currentStep = STATUS_STEP[app.status] ?? 0;
  const badge = STATUS_BADGE[app.status] ?? STATUS_BADGE['Pending'];
  const flagged = app.rejectedDocs ?? [];
  const isResubmitted = app.audit.some(a => a.action.toLowerCase().includes('resubmit'));

  function submitAppeal() {
    if (!app || !appealText.trim()) return;
    const appId = app.id;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    setApplicants(prev => prev.map(a =>
      a.id === appId ? {
        ...a,
        appeal: { status: 'Pending', reason: appealText.trim(), submittedDate: today },
        audit: [...a.audit, { date: today, action: 'Appeal submitted by student', by: MOCK_STUDENT.name }],
      } : a
    ));
    setAppealText('');
    setAppealSubmitted(true);
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 16px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13 }}>
        <Link href="/student/applications" style={{ color: COLORS.maroon, textDecoration: 'none', fontWeight: 500 }}>My Applications</Link>
        <span style={{ color: '#d1d5db' }}>/</span>
        <span style={{ color: '#374151', fontWeight: 600 }}>{app.scholarship}</span>
      </div>

      {/* Header card */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '22px 24px', marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#111827' }}>{app.scholarship}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 700 }}>
                {app.status}
              </span>
              {isResubmitted && (
                <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, background: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 700, border: '1px solid #bfdbfe' }}>
                  📤 Resubmitted
                </span>
              )}
              {app.evalStatus === 'In Progress' && app.status !== 'Approved' && app.status !== 'Rejected' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 12px', borderRadius: 20, background: '#eff6ff', color: '#0369a1', fontSize: 12, fontWeight: 700 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0369a1', animation: 'pulse 1.5s infinite' }} />
                  Under Evaluation
                </span>
              )}
              <span style={{ fontSize: 13, color: '#6b7280' }}>Applied {app.applied}</span>
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

          {/* Document checklist */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents</h3>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {app.docs.filter(d => d.submitted).length} / {app.docs.length} submitted
              </span>
            </div>

            {flagged.length > 0 && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#9a3412' }}>
                <strong>Action Required:</strong> OSFA has flagged {flagged.length} document{flagged.length > 1 ? 's' : ''} that need resubmission. Please update your documents.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {app.docs.map((doc, i) => {
                const isFlagged = flagged.includes(doc.label);
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: isFlagged ? '#fff7ed' : doc.submitted ? '#f0fdf4' : '#fef2f2',
                    borderRadius: 9, border: `1px solid ${isFlagged ? '#fed7aa' : doc.submitted ? '#bbf7d0' : '#fecaca'}`,
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: isFlagged ? '#fed7aa' : doc.submitted ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isFlagged ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="3"><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="#c2410c" stroke="none"/></svg>
                      ) : doc.submitted ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      )}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, color: isFlagged ? '#9a3412' : doc.submitted ? '#166534' : '#dc2626', fontWeight: isFlagged ? 600 : 400 }}>
                      {doc.label}
                    </span>
                    {isFlagged && (
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: '#fed7aa', color: '#9a3412', letterSpacing: '0.05em' }}>
                        FLAGGED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {(app.status === 'Incomplete' || flagged.length > 0) && (
              <div style={{ marginTop: 14 }}>
                <Link
                  href={`/student/iskolarships/${app.scholarshipId}/apply?resubmit=true`}
                  style={{ display: 'block', padding: '10px 0', background: COLORS.maroon, color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
                  Update & Resubmit Documents
                </Link>
              </div>
            )}
          </div>

          {/* Audit timeline */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity Timeline</h3>
            {app.audit.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13 }}>No activity yet.</p>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 24 }}>
                <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: '#f3f4f6', borderRadius: 99 }} />
                {[...app.audit].reverse().map((entry, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: i < app.audit.length - 1 ? 20 : 0 }}>
                    <div style={{ position: 'absolute', left: -20, top: 4, width: 10, height: 10, borderRadius: '50%', background: i === 0 ? COLORS.maroon : '#d1d5db', border: `2px solid ${i === 0 ? COLORS.maroon : '#e5e7eb'}` }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>{entry.action}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{entry.date} · by {entry.by}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appeal section */}
          {app.status === 'Rejected' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#111827' }}>File an Appeal</h3>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                If you believe this decision was made in error, you may submit an appeal for review by OSFA.
              </p>

              {app.appeal ? (
                <div style={{ padding: '14px 16px', background: '#fef3c7', borderRadius: 9, border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                      background: app.appeal.status === 'Approved' ? '#dcfce7' : app.appeal.status === 'Denied' ? '#fee2e2' : '#fef3c7',
                      color: app.appeal.status === 'Approved' ? '#15803d' : app.appeal.status === 'Denied' ? '#dc2626' : '#92400e',
                    }}>{app.appeal.status}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Filed {app.appeal.submittedDate}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{app.appeal.reason}</p>
                  {app.appeal.reviewNote && (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>OSFA note: {app.appeal.reviewNote}</p>
                  )}
                </div>
              ) : appealSubmitted ? (
                <div style={{ padding: '14px 16px', background: '#dcfce7', borderRadius: 9, border: '1px solid #bbf7d0', fontSize: 13, color: '#166534', fontWeight: 600 }}>
                  ✓ Appeal submitted. OSFA will review your request.
                </div>
              ) : (
                <div>
                  <textarea
                    value={appealText}
                    onChange={e => setAppealText(e.target.value)}
                    placeholder="Explain why you believe this rejection should be reconsidered..."
                    rows={4}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, color: '#374151', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none' }}
                  />
                  <button
                    onClick={submitAppeal}
                    disabled={!appealText.trim()}
                    style={{ marginTop: 10, width: '100%', padding: '10px 0', background: appealText.trim() ? COLORS.maroon : '#fca5a5', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, color: '#fff', cursor: appealText.trim() ? 'pointer' : 'not-allowed' }}>
                    Submit Appeal
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
              { label: 'Student', value: app.name },
              { label: 'Program', value: app.program },
              { label: 'Year Level', value: app.yearLevel },
              { label: 'GWA', value: app.gwa },
              { label: 'Annual Income', value: app.income },
              { label: 'Evaluation', value: app.evalStatus },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#6b7280', flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Scholar status if approved */}
          {app.scholarStatus && (
            <div style={{ background: '#f0fdf4', borderRadius: 14, border: '1px solid #bbf7d0', padding: '18px 20px' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scholar Status</h3>
              <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: '#dcfce7', color: '#15803d', fontSize: 12, fontWeight: 700 }}>
                ✓ {app.scholarStatus} Scholar
              </span>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {app.status === 'Incomplete' && (
                <Link href={`/student/iskolarships/${app.scholarshipId}/apply?resubmit=true`} style={{ display: 'block', padding: '9px 14px', background: COLORS.maroon, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                  Update Documents
                </Link>
              )}
              <Link href={`/student/iskolarships/${app.scholarshipId}`} style={{ display: 'block', padding: '9px 14px', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, textAlign: 'center', background: '#f9fafb' }}>
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
