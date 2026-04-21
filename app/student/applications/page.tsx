'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useOsfaContext } from '@/lib/osfa-context';
import { COLORS, STATUS_BADGE, SCHOLAR_STATUS_BADGE } from '@/lib/theme';
import { MOCK_STUDENT } from '@/lib/data/mock-user';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import ConfirmModal from '@/components/ui/ConfirmModal';

type StepStatus = 'done' | 'active' | 'pending';
const STEPS = ['Submitted', 'Under Review', 'Interview', 'Doc Validation', 'Decision'];
const STATUS_STEP: Record<string, number> = {
  'Pending': 0, 'Under Review': 1, 'Interview': 2, 'Incomplete': 0,
  'Approved': 4, 'Rejected': 4, 'Duplicate': 0,
};

function getStepStatus(stepIndex: number, currentStep: number): StepStatus {
  if (stepIndex < currentStep) return 'done';
  if (stepIndex === currentStep) return 'active';
  return 'pending';
}

const FILTER_TABS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'];

export default function ApplicationsPage() {
  const { applicants, setApplicants, scholarships } = useOsfaContext();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [withdrawnIds, setWithdrawnIds] = useState<Set<string>>(new Set());
  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null);

  // Auto-incomplete: mark Pending apps with missing docs whose scholarship deadline has passed
  useEffect(() => {
    const toMark = applicants.filter(a => {
      if (a.email !== MOCK_STUDENT.email) return false;
      if (a.status !== 'Pending') return false;
      const hasMissing = a.docs.some(d => !d.submitted);
      if (!hasMissing) return false;
      const sc = scholarships.find(s => s.id === a.scholarshipId);
      return sc && sc.daysLeft <= 0;
    });
    if (toMark.length > 0) {
      setApplicants(prev => prev.map(a =>
        toMark.find(m => m.id === a.id) ? { ...a, status: 'Incomplete' as const } : a
      ));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myApps = applicants.filter(a => a.email === MOCK_STUDENT.email && !withdrawnIds.has(a.id));

  const filtered = myApps.filter(a => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return ['Pending', 'Incomplete', 'Duplicate'].includes(a.status);
    return a.status === activeTab;
  });

  const stats = {
    total:    myApps.length,
    approved: myApps.filter(a => a.status === 'Approved').length,
    review:   myApps.filter(a => a.status === 'Under Review').length,
    pending:  myApps.filter(a => ['Pending', 'Interview', 'Incomplete'].includes(a.status)).length,
  };

  const scholarEntry = myApps.find(a => a.scholarStatus);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>My Applications</h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Track all your scholarship applications in real time.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total',       value: stats.total,    color: '#374151', bg: '#f9fafb', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
          { label: 'Approved',    value: stats.approved, color: '#15803d', bg: '#f0fdf4', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Under Review',value: stats.review,   color: '#0369a1', bg: '#eff6ff', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
          { label: 'Pending',     value: stats.pending,  color: '#92400e', bg: '#fffbeb', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, borderRadius: 12, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }}>

        {/* Applications list */}
        <div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f3f4f6', borderRadius: 10, padding: 4 }}>
            {FILTER_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? COLORS.maroon : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>
                {tab}
                {tab !== 'All' && (
                  <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>
                    ({myApps.filter(a => {
                      if (tab === 'Pending') return ['Pending', 'Incomplete', 'Duplicate'].includes(a.status);
                      return a.status === tab;
                    }).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <EmptyState
                icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                title={myApps.length === 0 ? "No applications yet" : "No applications in this category"}
                subtitle={myApps.length === 0 ? "Start by browsing available iskolarships." : ""}
                action={myApps.length === 0
                  ? <Link href="/student/iskolarships" style={{ padding: '8px 20px', background: COLORS.maroon, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Browse Iskolarships</Link>
                  : undefined}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filtered.map(app => {
                const isOpen        = expanded === app.id;
                const currentStep   = STATUS_STEP[app.status] ?? 0;
                const badge         = STATUS_BADGE[app.status] ?? STATUS_BADGE['Pending'];
                const submittedDocs = app.docs.filter(d => d.submitted).length;
                const missingDocs   = app.docs.length - submittedDocs;
                const completeness  = Math.round((submittedDocs / app.docs.length) * 100);
                const lastAudit     = app.audit[app.audit.length - 1];

                return (
                  <div key={app.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#111827' }}>{app.scholarship}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <Badge label={app.status} bg={badge.bg} color={badge.color} />
                          {app.evalStatus === 'In Progress' && app.status !== 'Approved' && app.status !== 'Rejected' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, background: '#eff6ff', color: '#0369a1', fontSize: 11, fontWeight: 700, border: '1px solid #bfdbfe' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0369a1', animation: 'pulse 1.5s infinite' }} />
                              Evaluating
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: '#6b7280' }}>Submitted {app.applied}</span>
                          {lastAudit && (
                            <span style={{ fontSize: 12, color: '#9ca3af' }}>· Updated {lastAudit.date}</span>
                          )}
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 99,
                            background: completeness === 100 ? '#dcfce7' : completeness >= 60 ? '#fffbeb' : '#fee2e2',
                            color: completeness === 100 ? '#15803d' : completeness >= 60 ? '#92400e' : '#dc2626',
                          }}>
                            {completeness}% complete
                          </span>
                          {missingDocs > 0 && (
                            <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                              ⚠ {missingDocs} doc{missingDocs > 1 ? 's' : ''} missing
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {app.status === 'Incomplete' && (
                          <Link
                            href={`/student/iskolarships/${app.scholarshipId}/apply?resubmit=true`}
                            style={{ background: COLORS.maroon, border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff', textDecoration: 'none' }}
                          >
                            Update Documents
                          </Link>
                        )}
                        {['Pending', 'Incomplete'].includes(app.status) && (
                          <button
                            onClick={() => setWithdrawTarget(app.id)}
                            style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#dc2626' }}
                          >
                            Withdraw
                          </button>
                        )}
                        <Link
                          href={`/student/applications/${app.id}`}
                          style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#374151', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => setExpanded(isOpen ? null : app.id)}
                          style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {isOpen ? 'Collapse' : 'Progress'}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f3f4f6' }}>

                        {/* Progress stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20, marginBottom: 20 }}>
                          {STEPS.map((step, i) => {
                            const s = getStepStatus(i, currentStep);
                            return (
                              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                  <div style={{
                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: s === 'done' ? COLORS.maroon : s === 'active' ? '#fff' : '#f3f4f6',
                                    border: s === 'pending' ? '2px solid #e5e7eb' : `2px solid ${COLORS.maroon}`,
                                  }}>
                                    {s === 'done' ? (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                    ) : s === 'active' ? (
                                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.maroon }} />
                                    ) : (
                                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db' }} />
                                    )}
                                  </div>
                                  <span style={{ fontSize: 10, fontWeight: s === 'active' ? 700 : 500, color: s === 'pending' ? '#9ca3af' : s === 'active' ? COLORS.maroon : '#374151', textAlign: 'center', lineHeight: 1.2, maxWidth: 60 }}>
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

                        {/* Document checklist */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            {app.docs.map((doc, di) => (
                              <div key={di} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '8px 10px', background: '#f9fafb', borderRadius: 7 }}>
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: doc.submitted ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {doc.submitted
                                    ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                    : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                  }
                                </div>
                                <span style={{ color: doc.submitted ? '#374151' : '#dc2626', fontSize: 12 }}>{doc.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Appeal */}
                        {app.appeal && (
                          <div style={{ marginTop: 14, padding: '12px 14px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Appeal — {app.appeal.status}</div>
                            <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{app.appeal.reason}</p>
                            {app.appeal.reviewNote && (
                              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>Note: {app.appeal.reviewNote}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Scholar status */}
          {scholarEntry?.scholarStatus && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Scholar Status</h3>
              <Badge
                label={SCHOLAR_STATUS_BADGE[scholarEntry.scholarStatus]?.label ?? scholarEntry.scholarStatus}
                bg={SCHOLAR_STATUS_BADGE[scholarEntry.scholarStatus]?.bg ?? '#f3f4f6'}
                color={SCHOLAR_STATUS_BADGE[scholarEntry.scholarStatus]?.color ?? '#374151'}
              />
              {scholarEntry.semesterRecords && scholarEntry.semesterRecords.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Semester Records</div>
                  {[...scholarEntry.semesterRecords].reverse().map((rec, i) => (
                    <div key={i} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px', border: '1px solid #f3f4f6', marginBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{rec.semester}, {rec.academicYear}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.maroon }}>GWA {rec.gwa}</span>
                      </div>
                      {rec.notes && <div style={{ fontSize: 11, color: '#6b7280' }}>{rec.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick action */}
          <div style={{ background: `linear-gradient(135deg, ${COLORS.maroon}, ${COLORS.maroonD})`, borderRadius: 12, padding: 20, color: '#fff' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Apply for More</div>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
              There may be more iskolarships available for you.
            </p>
            <Link href="/student/iskolarships" style={{ display: 'block', padding: '9px 0', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              Browse Iskolarships →
            </Link>
          </div>
        </div>

      </div>

      <ConfirmModal
        open={withdrawTarget !== null}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This cannot be undone and you may need to re-apply."
        confirmLabel="Yes, Withdraw"
        cancelLabel="Keep Application"
        danger
        onCancel={() => setWithdrawTarget(null)}
        onConfirm={() => {
          if (withdrawTarget) {
            setWithdrawnIds(prev => new Set([...prev, withdrawTarget]));
            setExpanded(null);
          }
          setWithdrawTarget(null);
        }}
      />
    </div>
  );
}
