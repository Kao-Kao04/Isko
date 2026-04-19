'use client';

import { useState } from 'react';
import { useOsfaContext } from '@/lib/osfa-context';
import Link from 'next/link';

const TEAL = '#800000';
const CURRENT_STUDENT_EMAIL = 'juan.delacruz@student.edu.ph';

type StepStatus = 'done' | 'active' | 'pending';
const STEPS = ['Submitted', 'Under Review', 'Interview', 'Doc Validation', 'Approved'];

const STATUS_STEP: Record<string, number> = {
  'Pending': 0,
  'Under Review': 1,
  'Interview': 2,
  'Incomplete': 0,
  'Approved': 4,
  'Rejected': 4,
  'Duplicate': 0,
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  'Pending':      { bg: '#fef3c7', color: '#92400e' },
  'Under Review': { bg: '#e0f2fe', color: '#0369a1' },
  'Interview':    { bg: '#ede9fe', color: '#5b21b6' },
  'Incomplete':   { bg: '#fef9c3', color: '#713f12' },
  'Approved':     { bg: '#dcfce7', color: '#15803d' },
  'Rejected':     { bg: '#fee2e2', color: '#dc2626' },
  'Duplicate':    { bg: '#f3f4f6', color: '#374151' },
};

const SCHOLAR_STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  'Active':        { bg: '#dcfce7', color: '#15803d', label: 'Active Scholar' },
  'Probationary':  { bg: '#fef3c7', color: '#92400e', label: 'Probationary' },
  'Terminated':    { bg: '#fee2e2', color: '#dc2626', label: 'Terminated' },
  'Graduated':     { bg: '#e0f2fe', color: '#0369a1', label: 'Graduated' },
};

function getStepStatus(stepIndex: number, currentStep: number): StepStatus {
  if (stepIndex < currentStep) return 'done';
  if (stepIndex === currentStep) return 'active';
  return 'pending';
}

export default function Page() {
  const { applicants } = useOsfaContext();
  const [expanded, setExpanded] = useState<string | null>(null);

  const myApps = applicants.filter(a => a.email === CURRENT_STUDENT_EMAIL);

  const stats = {
    total: myApps.length,
    approved: myApps.filter(a => a.status === 'Approved').length,
    review: myApps.filter(a => a.status === 'Under Review').length,
    pending: myApps.filter(a => ['Pending', 'Interview'].includes(a.status)).length,
  };

  const scholarStatus = myApps.find(a => a.scholarStatus)?.scholarStatus;
  const semesterRecords = myApps.find(a => a.scholarStatus)?.semesterRecords ?? [];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Page heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>Application Status</h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Track your scholarship applications in real time.</p>
      </div>

      {/* Top 4-column stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Applications', value: stats.total,    color: '#374151', icon: '📋' },
          { label: 'Approved',           value: stats.approved, color: '#15803d', icon: '✅' },
          { label: 'Under Review',       value: stats.review,   color: '#0369a1', icon: '🔍' },
          { label: 'Pending / Interview',value: stats.pending,  color: '#92400e', icon: '⏳' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>

        {/* Left — Application list */}
        <div>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#111827' }}>My Applications</h2>

          {myApps.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '48px 24px', textAlign: 'center', color: '#6b7280' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p style={{ margin: '0 0 16px', fontWeight: 500 }}>No applications yet.</p>
              <Link href="/student/iskolarships" style={{ padding: '8px 20px', background: TEAL, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Browse Scholarships
              </Link>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {myApps.map((app) => {
              const isOpen = expanded === app.id;
              const currentStep = STATUS_STEP[app.status] ?? 0;
              const badge = STATUS_BADGE[app.status] ?? STATUS_BADGE['Pending'];
              const missingDocs = app.docs.filter(d => !d.submitted).length;
              return (
                <div key={app.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  {/* Card header */}
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111827' }}>{app.scholarship}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#6b7280', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, background: badge.bg, color: badge.color, fontWeight: 600, fontSize: 12 }}>
                          {app.status}
                        </span>
                        <span>Submitted {app.applied}</span>
                        {missingDocs > 0 && (
                          <span style={{ color: '#dc2626', fontWeight: 600, fontSize: 12 }}>
                            ⚠ {missingDocs} doc{missingDocs > 1 ? 's' : ''} missing
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpanded(isOpen ? null : app.id)}
                      style={{ flexShrink: 0, background: 'none', border: `1px solid #e5e7eb`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {isOpen ? 'Collapse' : 'View Progress'}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                  </div>

                  {/* Expandable stepper */}
                  {isOpen && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20 }}>
                        {STEPS.map((step, i) => {
                          const s = getStepStatus(i, currentStep);
                          return (
                            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: s === 'done' ? TEAL : s === 'active' ? '#fff' : '#f3f4f6',
                                  border: s === 'active' ? `2px solid ${TEAL}` : s === 'done' ? `2px solid ${TEAL}` : '2px solid #e5e7eb',
                                }}>
                                  {s === 'done' ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                      <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                  ) : s === 'active' ? (
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: TEAL }} />
                                  ) : (
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db' }} />
                                  )}
                                </div>
                                <span style={{ fontSize: 10, fontWeight: s === 'active' ? 700 : 500, color: s === 'pending' ? '#9ca3af' : s === 'active' ? TEAL : '#374151', textAlign: 'center', lineHeight: 1.2, maxWidth: 60 }}>
                                  {step}
                                </span>
                              </div>
                              {i < STEPS.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: s === 'done' ? TEAL : '#e5e7eb', margin: '0 4px', marginBottom: 22 }} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Document checklist */}
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {app.docs.map((doc, di) => (
                            <div key={di} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                              <div style={{ width: 18, height: 18, borderRadius: '50%', background: doc.submitted ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {doc.submitted ? (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                ) : (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                )}
                              </div>
                              <span style={{ color: doc.submitted ? '#374151' : '#dc2626' }}>{doc.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Scholar Status card */}
          {scholarStatus && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Scholar Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: SCHOLAR_STATUS_BADGE[scholarStatus]?.bg, color: SCHOLAR_STATUS_BADGE[scholarStatus]?.color }}>
                    {SCHOLAR_STATUS_BADGE[scholarStatus]?.label ?? scholarStatus}
                  </span>
                </div>
                {semesterRecords.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Semester Records</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[...semesterRecords].reverse().map((rec, i) => (
                        <div key={i} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px', border: '1px solid #f3f4f6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{rec.semester}, {rec.academicYear}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>GWA {rec.gwa}</span>
                          </div>
                          {rec.notes && <div style={{ fontSize: 11, color: '#6b7280' }}>{rec.notes}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Apply prompt if no applications */}
          {myApps.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Start by browsing available scholarships.</div>
              <Link href="/student/iskolarships" style={{ display: 'inline-block', padding: '8px 20px', background: TEAL, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Browse Scholarships
              </Link>
            </div>
          )}

          {/* Appeal status if any */}
          {myApps.map(a => a.appeal ? (
            <div key={a.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Appeal — {a.scholarship}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: a.appeal.status === 'Approved' ? '#dcfce7' : a.appeal.status === 'Denied' ? '#fee2e2' : '#fef3c7',
                  color: a.appeal.status === 'Approved' ? '#15803d' : a.appeal.status === 'Denied' ? '#dc2626' : '#92400e',
                }}>
                  {a.appeal.status}
                </span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Filed {a.appeal.submittedDate}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{a.appeal.reason}</p>
              {a.appeal.reviewNote && (
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>Note: {a.appeal.reviewNote}</p>
              )}
            </div>
          ) : null)}

        </div>
      </div>
    </div>
  );
}
