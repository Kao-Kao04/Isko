'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { initialApplicants, type Applicant, type AppStatus } from '@/lib/osfa-data';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';

const TEAL = '#1D9E75';
const TEAL_DARK = '#178a64';
const TEAL_LIGHT = '#e8faf4';

const statusStyle: Record<AppStatus, { bg: string; color: string; dot: string }> = {
  Pending:        { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  'Under Review': { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  Approved:       { bg: '#ecfdf5', color: '#059669', dot: '#10b981' },
  Rejected:       { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
  Incomplete:     { bg: '#fff7ed', color: '#ea580c', dot: '#f97316' },
  Duplicate:      { bg: '#faf5ff', color: '#7c3aed', dot: '#a78bfa' },
};

function StatusBadge({ status }: { status: AppStatus }) {
  const s = statusStyle[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 13, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  );
}

export default function ApplicantProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'history'>('overview');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog]   = useState(false);
  const [rejectReason, setRejectReason]           = useState('');
  const [rejectNote, setRejectNote]               = useState('');

  const applicantOrUndef = applicants.find(a => a.id === id);

  if (!applicantOrUndef) {
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

  const applicant = applicantOrUndef;

  const TERMINAL: AppStatus[] = ['Approved', 'Rejected', 'Duplicate'];
  const isTerminal = TERMINAL.includes(applicant.status);
  const submittedDocs = applicant.docs.filter(d => d.submitted).length;
  const missingDocs   = applicant.docs.length - submittedDocs;
  const gwaNum        = parseFloat(applicant.gwa);
  const gwaColor      = gwaNum <= 1.75 ? '#059669' : gwaNum <= 2.0 ? '#d97706' : '#dc2626';

  function handleApprove() {
    setApplicants(prev => prev.map(a => a.id === id
      ? { ...a, status: 'Approved' as AppStatus, audit: [...a.audit, { date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), action: 'Application approved', by: 'OSFA Staff' }] }
      : a));
    addToast('success', `${applicant.name} has been approved.`);
    setShowApproveDialog(false);
  }

  function handleReject() {
    if (!rejectReason) return;
    setApplicants(prev => prev.map(a => a.id === id
      ? { ...a, status: 'Rejected' as AppStatus, audit: [...a.audit, { date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), action: `Application rejected — ${rejectReason.replace(/_/g, ' ')}${rejectNote ? ': ' + rejectNote : ''}`, by: 'OSFA Staff' }] }
      : a));
    addToast('error', `${applicant.name}'s application has been rejected.`);
    setShowRejectDialog(false);
    setRejectReason('');
    setRejectNote('');
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    margin: '0 0 14px',
  };

  const fieldLabel: React.CSSProperties = {
    fontSize: 11, color: '#9ca3af', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3,
  };

  const fieldValue: React.CSSProperties = {
    fontSize: 14, fontWeight: 600, color: '#111827',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 12 }}>
        <Link href="/osfa/home" style={{ color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
        <span style={{ color: '#d1d5db' }}>/</span>
        <Link href="/osfa/applicants" style={{ color: '#9ca3af', textDecoration: 'none' }}>Applicants</Link>
        <span style={{ color: '#d1d5db' }}>/</span>
        <span style={{ color: '#374151', fontWeight: 500 }}>{applicant.name}</span>
      </div>

      {/* Profile header card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ height: 6, background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})` }} />
        <div style={{ padding: '28px 32px', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 800, flexShrink: 0, boxShadow: `0 4px 16px ${TEAL}40` }}>
            {applicant.initials}
          </div>

          {/* Name / info */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>{applicant.name}</h1>
              <StatusBadge status={applicant.status} />
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{applicant.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l1.62-1.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{applicant.contact}</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flexShrink: 0 }}>
            {[
              { label: 'GWA', value: applicant.gwa, color: gwaColor },
              { label: 'Year Level', value: applicant.yearLevel, color: '#374151' },
              { label: 'Documents', value: `${submittedDocs}/${applicant.docs.length}`, color: missingDocs > 0 ? '#dc2626' : '#059669' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 18px', textAlign: 'center', minWidth: 80, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {!isTerminal && (
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, alignSelf: 'center' }}>
              <Link href={`/osfa/evaluation?autoOpen=${applicant.id}`} style={{ padding: '9px 18px', background: TEAL_LIGHT, color: TEAL, border: `1.5px solid #bbf7d0`, borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Open Evaluation
              </Link>
              <button onClick={() => setShowApproveDialog(true)} disabled={missingDocs > 0} title={missingDocs > 0 ? 'Documents are missing' : undefined} style={{ padding: '9px 18px', background: missingDocs > 0 ? '#d1fae5' : '#059669', color: missingDocs > 0 ? '#6ee7b7' : '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: missingDocs > 0 ? 'not-allowed' : 'pointer' }}>
                Approve
              </button>
              <button onClick={() => setShowRejectDialog(true)} style={{ padding: '9px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Reject
              </button>
            </div>
          )}
          {isTerminal && (
            <div style={{ padding: '9px 18px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, color: '#9ca3af', alignSelf: 'center' }}>
              Application {applicant.status.toLowerCase()} — no further action required
            </div>
          )}
        </div>

        {/* Scholarship banner */}
        <div style={{ padding: '14px 32px', background: '#f8fafc', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span style={{ fontSize: 13, color: '#374151' }}>Applied for: <strong>{applicant.scholarship}</strong></span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>|</span>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Submitted: {applicant.applied}</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>|</span>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Monthly Income: {applicant.income}</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #f3f4f6', marginBottom: 22 }}>
        {([['overview', 'Overview'], ['documents', `Documents (${submittedDocs}/${applicant.docs.length})`], ['history', `Activity (${applicant.audit.length})`]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === key ? `2px solid ${TEAL}` : '2px solid transparent', marginBottom: -2, fontSize: 14, fontWeight: activeTab === key ? 700 : 500, color: activeTab === key ? TEAL : '#6b7280', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Overview ────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Personal Info */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={sectionTitle}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { label: 'Full Name', value: applicant.name },
                { label: 'Email Address', value: applicant.email },
                { label: 'Contact Number', value: applicant.contact },
                { label: 'Year Level', value: applicant.yearLevel },
              ].map(f => (
                <div key={f.label}>
                  <div style={fieldLabel}>{f.label}</div>
                  <div style={fieldValue}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Info */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={sectionTitle}>Academic & Financial</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { label: 'School', value: applicant.school },
                { label: 'Program', value: applicant.program },
                { label: 'GWA', value: applicant.gwa, color: gwaColor },
                { label: 'Family Income', value: applicant.income },
              ].map(f => (
                <div key={f.label}>
                  <div style={fieldLabel}>{f.label}</div>
                  <div style={{ ...fieldValue, color: (f as { color?: string }).color || '#111827' }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Document summary */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ ...sectionTitle, margin: 0 }}>Document Status</h3>
              <div style={{ display: 'flex', gap: 14 }}>
                <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>{submittedDocs} submitted</span>
                {missingDocs > 0 && <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{missingDocs} missing</span>}
              </div>
            </div>
            <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, marginBottom: 16 }}>
              <div style={{ height: '100%', width: `${(submittedDocs / applicant.docs.length) * 100}%`, background: missingDocs === 0 ? '#059669' : TEAL, borderRadius: 99 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {applicant.docs.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 9, background: doc.submitted ? '#ecfdf5' : '#fef2f2', border: `1px solid ${doc.submitted ? '#a7f3d0' : '#fecaca'}` }}>
                  {doc.submitted
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                  <span style={{ fontSize: 13, color: doc.submitted ? '#065f46' : '#991b1b', fontWeight: 500, flex: 1 }}>{doc.label}</span>
                  {doc.submitted && <button style={{ fontSize: 11, color: TEAL, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, flexShrink: 0 }}>View</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Documents ───────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={sectionTitle}>Submitted Documents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {applicant.docs.map((doc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 10, background: doc.submitted ? '#f0fdf9' : '#fef2f2', border: `1px solid ${doc.submitted ? '#a7f3d0' : '#fecaca'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: doc.submitted ? '#ecfdf5' : '#fff', border: `1.5px solid ${doc.submitted ? '#6ee7b7' : '#fecaca'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {doc.submitted
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{doc.label}</div>
                    <div style={{ fontSize: 12, color: doc.submitted ? '#059669' : '#dc2626', marginTop: 2 }}>
                      {doc.submitted ? 'Submitted' : 'Not yet submitted'}
                    </div>
                  </div>
                </div>
                {doc.submitted
                  ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ padding: '7px 16px', background: TEAL_LIGHT, color: TEAL, border: `1px solid #bbf7d0`, borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View</button>
                      <button style={{ padding: '7px 14px', background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Download</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', padding: '5px 12px', background: '#fef2f2', borderRadius: 7, border: '1px solid #fecaca' }}>Missing</span>
                  )}
              </div>
            ))}
          </div>
          {missingDocs > 0 && (
            <div style={{ marginTop: 20, padding: '14px 18px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>
                  {missingDocs} required document{missingDocs > 1 ? 's are' : ' is'} missing
                </div>
                <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>Approval is blocked until all required documents are submitted.</div>
              </div>
              <button
                onClick={() => addToast('info', `Document request sent to ${applicant.email}`)}
                style={{ padding: '8px 18px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Request Missing Docs
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: History ─────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={sectionTitle}>Activity History</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[...applicant.audit].reverse().map((entry, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 20, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: TEAL, marginTop: 5, border: `2px solid #fff`, boxShadow: `0 0 0 2px ${TEAL}40` }} />
                  {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: '#e5e7eb', marginTop: 6 }} />}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <div style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>{entry.action}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>
                    {entry.date} &mdash; by <strong style={{ color: '#6b7280' }}>{entry.by}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Approve Dialog ───────────────────────────────────────── */}
      {showApproveDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowApproveDialog(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Confirm Approval</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              You are approving <strong>{applicant.name}</strong> for the <strong>{applicant.scholarship}</strong>. The student will be notified via email. This action is recorded in the audit log.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowApproveDialog(false)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleApprove} style={{ flex: 1, padding: 10, background: '#059669', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reject Dialog ────────────────────────────────────────── */}
      {showRejectDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setShowRejectDialog(false); setRejectReason(''); setRejectNote(''); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Reject Application</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>Provide a reason for rejecting <strong>{applicant.name}&apos;s</strong> application. This will be included in the notification sent to the student.</p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Reason <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none' }}>
                <option value="">Select a reason...</option>
                <option value="missing_docs">Missing required documents</option>
                <option value="eligibility_criteria">Does not meet eligibility criteria</option>
                <option value="gwa_requirement">GWA does not meet the minimum requirement</option>
                <option value="duplicate_application">Duplicate application</option>
                <option value="incomplete_form">Incomplete application form</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Additional Note <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Provide specific details for the applicant..." rows={3} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowRejectDialog(false); setRejectReason(''); setRejectNote(''); }} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button disabled={!rejectReason} onClick={handleReject} style={{ flex: 1, padding: 10, background: rejectReason ? '#dc2626' : '#fca5a5', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: rejectReason ? 'pointer' : 'not-allowed', color: '#fff' }}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
