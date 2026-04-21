'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { type AppStatus } from '@/lib/osfa-data';
import { useOsfaContext } from '@/lib/osfa-context';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';

const TEAL       = '#800000';
const TEAL_DARK  = '#5C0000';
const TEAL_LIGHT = '#fff5f5';

const statusStyle: Record<AppStatus, { bg: string; color: string; dot: string }> = {
  Pending:        { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  'Under Review': { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  Approved:       { bg: '#f0fdf4', color: '#059669', dot: '#10b981' },
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
  const { applicants, setApplicants, setScholarships, addNotification } = useOsfaContext();
  const { toasts, addToast, removeToast } = useToast();

  const [activeTab,          setActiveTab]          = useState<'overview' | 'documents' | 'evaluation' | 'history'>('overview');
  const [showApproveDialog,  setShowApproveDialog]  = useState(false);
  const [showRejectDialog,   setShowRejectDialog]   = useState(false);
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);
  const [rejectReason,       setRejectReason]       = useState('');
  const [rejectNote,         setRejectNote]         = useState('');
  const [selectedMissingDocs, setSelectedMissingDocs] = useState<string[]>([]);
  const [rubric, setRubric] = useState({ financialNeed: 3, essay: 3, interview: 3, community: 3 });

  const applicant = applicants.find(a => a.id === id);

  if (!applicant) {
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

  const TERMINAL: AppStatus[] = ['Approved', 'Rejected', 'Duplicate'];
  const isTerminal    = TERMINAL.includes(applicant.status);
  const submittedDocs = applicant.docs.filter(d => d.submitted).length;
  const missingDocs   = applicant.docs.length - submittedDocs;
  const gwaNum        = parseFloat(applicant.gwa);
  const gwaColor      = gwaNum <= 1.75 ? '#059669' : gwaNum <= 2.0 ? '#d97706' : '#dc2626';
  const today         = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  function handleApprove() {
    if (!applicant) return;
    setApplicants(prev => prev.map(a => a.id === id ? {
      ...a,
      status:       'Approved' as AppStatus,
      scholarStatus: 'Active' as const,
      evalStatus:   'Completed' as const,
      audit: [...a.audit, { date: today, action: 'Application approved', by: 'OSFA Staff' }],
    } : a));
    setScholarships(prev => prev.map(s =>
      s.id === applicant.scholarshipId ? { ...s, slots: Math.max(0, s.slots - 1) } : s
    ));
    addNotification({ type: 'approved', message: `Congratulations! Your application for ${applicant.scholarship} has been approved. You are now an active scholar.`, scholarshipId: applicant.scholarshipId });
    addToast('success', `${applicant.name} has been approved.`);
    setShowApproveDialog(false);
  }

  function handleReject() {
    if (!applicant || !rejectReason) return;
    setApplicants(prev => prev.map(a => a.id === id ? {
      ...a,
      status:     'Rejected' as AppStatus,
      evalStatus: 'Completed' as const,
      audit: [...a.audit, { date: today, action: `Application rejected — ${rejectReason.replace(/_/g, ' ')}${rejectNote ? ': ' + rejectNote : ''}`, by: 'OSFA Staff' }],
    } : a));
    addNotification({ type: 'rejected', message: `Your application for ${applicant.scholarship} has been rejected. Reason: ${rejectReason.replace(/_/g, ' ')}${rejectNote ? ' — ' + rejectNote : ''}.`, scholarshipId: applicant.scholarshipId });
    addToast('error', `${applicant.name}'s application has been rejected.`);
    setShowRejectDialog(false);
    setRejectReason('');
    setRejectNote('');
  }

  function handleMarkIncomplete() {
    if (!applicant) return;
    setApplicants(prev => prev.map(a => a.id === id ? {
      ...a,
      status:      'Incomplete' as AppStatus,
      rejectedDocs: selectedMissingDocs,
      audit: [...a.audit, { date: today, action: `Marked Incomplete — missing: ${selectedMissingDocs.join(', ') || 'unspecified'}`, by: 'OSFA Staff' }],
    } : a));
    addNotification({ type: 'incomplete', message: `Your application for ${applicant.scholarship} requires additional documents: ${selectedMissingDocs.join(', ') || 'see application'}. Please resubmit.`, scholarshipId: applicant.scholarshipId });
    addToast('warning', `${applicant.name}'s application marked Incomplete.`);
    setShowIncompleteDialog(false);
    setSelectedMissingDocs([]);
  }

  const sectionTitle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' };
  const fieldLabel:   React.CSSProperties = { fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 };
  const fieldValue:   React.CSSProperties = { fontSize: 14, fontWeight: 600, color: '#111827' };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 12 }}>
        <Link href="/osfa/dashboard" style={{ color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
        <span style={{ color: '#d1d5db' }}>/</span>
        <Link href="/osfa/applicants" style={{ color: '#9ca3af', textDecoration: 'none' }}>Applicants</Link>
        <span style={{ color: '#d1d5db' }}>/</span>
        <span style={{ color: '#374151', fontWeight: 500 }}>{applicant.name}</span>
      </div>

      {/* Profile header card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ height: 6, background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})` }} />
        <div style={{ padding: '28px 32px', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 800, flexShrink: 0, boxShadow: `0 4px 16px ${TEAL}40` }}>
            {applicant.initials}
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>{applicant.name}</h1>
              <StatusBadge status={applicant.status} />
              {applicant.status === 'Pending' && applicant.audit.some(e => e.action.toLowerCase().includes('resubmit')) && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, padding: '2px 10px' }}>📤 Resubmitted</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{applicant.email}</span>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{applicant.contact}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flexShrink: 0 }}>
            {[
              { label: 'GWA',       value: applicant.gwa,                                      color: gwaColor   },
              { label: 'Year',      value: applicant.yearLevel,                                color: '#374151'  },
              { label: 'Documents', value: `${submittedDocs}/${applicant.docs.length}`,        color: missingDocs > 0 ? '#dc2626' : '#059669' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 18px', textAlign: 'center', minWidth: 80, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, alignSelf: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.print()} style={{ padding: '9px 14px', background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Print</button>
            {!isTerminal && (
              <>
                <button onClick={() => { setSelectedMissingDocs(applicant.docs.filter(d => !d.submitted).map(d => d.label)); setShowIncompleteDialog(true); }} style={{ padding: '9px 14px', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Mark Incomplete
                </button>
                <button onClick={() => setShowApproveDialog(true)} disabled={missingDocs > 0} title={missingDocs > 0 ? 'Documents are missing' : undefined} style={{ padding: '9px 18px', background: missingDocs > 0 ? '#e5e7eb' : '#059669', color: missingDocs > 0 ? '#9ca3af' : '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: missingDocs > 0 ? 'not-allowed' : 'pointer' }}>
                  Approve
                </button>
                <button onClick={() => setShowRejectDialog(true)} style={{ padding: '9px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Reject
                </button>
              </>
            )}
            {isTerminal && (
              <div style={{ padding: '9px 18px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, color: '#9ca3af' }}>
                {applicant.status} — no further action required
              </div>
            )}
          </div>
        </div>

        {/* Scholarship banner */}
        <div style={{ padding: '14px 32px', background: '#f8fafc', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span style={{ fontSize: 13, color: '#374151' }}>Applied for: <strong>{applicant.scholarship}</strong></span>
          <span style={{ fontSize: 12, color: '#d1d5db' }}>|</span>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Submitted: {applicant.applied}</span>
          <span style={{ fontSize: 12, color: '#d1d5db' }}>|</span>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Income: {applicant.income}</span>
          <Link href={`/osfa/applicants?scholarship=${encodeURIComponent(applicant.scholarship)}`} style={{ marginLeft: 'auto', fontSize: 12, color: TEAL, textDecoration: 'none', fontWeight: 600 }}>View all applicants for this scholarship →</Link>
        </div>
      </div>

      {/* Completeness bar */}
      {(() => {
        const pct = Math.round((submittedDocs / applicant.docs.length) * 100);
        return (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '14px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Application Completeness</span>
            <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 99 }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: pct === 100 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626', transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: pct === 100 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626', whiteSpace: 'nowrap' }}>{pct}%</span>
          </div>
        );
      })()}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #f3f4f6', marginBottom: 22 }}>
        {([['overview', 'Overview'], ['documents', `Documents (${submittedDocs}/${applicant.docs.length})`], ['evaluation', 'Evaluation'], ['history', `Activity (${applicant.audit.length})`]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === key ? `2px solid ${TEAL}` : '2px solid transparent', marginBottom: -2, fontSize: 14, fontWeight: activeTab === key ? 700 : 500, color: activeTab === key ? TEAL : '#6b7280', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px' }}>
            <h3 style={sectionTitle}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[{ label: 'Full Name', value: applicant.name }, { label: 'Email', value: applicant.email }, { label: 'Contact', value: applicant.contact }, { label: 'Year Level', value: applicant.yearLevel }].map(f => (
                <div key={f.label}><div style={fieldLabel}>{f.label}</div><div style={fieldValue}>{f.value}</div></div>
              ))}
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px' }}>
            <h3 style={sectionTitle}>Academic & Financial</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[{ label: 'School', value: applicant.school, color: '#111827' }, { label: 'Program', value: applicant.program, color: '#111827' }, { label: 'GWA', value: applicant.gwa, color: gwaColor }, { label: 'Family Income', value: applicant.income, color: '#111827' }].map(f => (
                <div key={f.label}><div style={fieldLabel}>{f.label}</div><div style={{ ...fieldValue, color: f.color }}>{f.value}</div></div>
              ))}
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', gridColumn: '1 / -1' }}>
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
              {applicant.docs.map((doc, i) => {
                const isFlagged = applicant.rejectedDocs?.includes(doc.label);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 9, background: isFlagged ? '#fef2f2' : doc.submitted ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isFlagged ? '#fca5a5' : doc.submitted ? '#bbf7d0' : '#fecaca'}` }}>
                    {doc.submitted
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                    <span style={{ fontSize: 13, color: isFlagged ? '#dc2626' : doc.submitted ? '#065f46' : '#991b1b', fontWeight: 500, flex: 1 }}>{doc.label}</span>
                    {isFlagged && <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626' }}>FLAGGED</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Documents tab ── */}
      {activeTab === 'documents' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '28px' }}>
          <h3 style={sectionTitle}>Submitted Documents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {applicant.docs.map((doc, i) => {
              const isFlagged = applicant.rejectedDocs?.includes(doc.label);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 10, background: isFlagged ? '#fef2f2' : doc.submitted ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isFlagged ? '#fca5a5' : doc.submitted ? '#bbf7d0' : '#fecaca'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fff', border: `1.5px solid ${doc.submitted ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {doc.submitted
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{doc.label}</div>
                      <div style={{ fontSize: 12, color: isFlagged ? '#dc2626' : doc.submitted ? '#059669' : '#dc2626', marginTop: 2 }}>
                        {isFlagged ? '⚠ Flagged by OSFA — needs resubmission' : doc.submitted ? 'Submitted' : 'Not submitted'}
                      </div>
                    </div>
                  </div>
                  {doc.submitted
                    ? <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ padding: '7px 16px', background: TEAL_LIGHT, color: TEAL, border: `1px solid #fca5a5`, borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View</button>
                        <button style={{ padding: '7px 14px', background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Download</button>
                      </div>
                    : <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', padding: '5px 12px', background: '#fef2f2', borderRadius: 7, border: '1px solid #fecaca' }}>Missing</span>
                  }
                </div>
              );
            })}
          </div>
          {missingDocs > 0 && (
            <div style={{ marginTop: 20, padding: '14px 18px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>{missingDocs} document{missingDocs > 1 ? 's' : ''} missing</div>
                <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>Use Mark Incomplete to notify the student which documents are needed.</div>
              </div>
              <button onClick={() => { setSelectedMissingDocs(applicant.docs.filter(d => !d.submitted).map(d => d.label)); setShowIncompleteDialog(true); }} style={{ padding: '8px 18px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Mark Incomplete &amp; Notify
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Evaluation tab ── */}
      {activeTab === 'evaluation' && (() => {
        const gwaScore = gwaNum <= 1.5 ? 5 : gwaNum <= 1.75 ? 4 : gwaNum <= 2.0 ? 3 : gwaNum <= 2.25 ? 2 : 1;
        const docScore = Math.round((submittedDocs / applicant.docs.length) * 5);
        const totalScore = gwaScore + docScore + rubric.financialNeed + rubric.essay + rubric.interview + rubric.community;
        const maxScore = 30;
        const pct = Math.round((totalScore / maxScore) * 100);
        const criteria = [
          { key: 'gwa' as const,           label: 'Academic Performance (GWA)', score: gwaScore,             max: 5, auto: true,  note: `GWA ${applicant.gwa}` },
          { key: 'doc' as const,           label: 'Document Completeness',       score: docScore,             max: 5, auto: true,  note: `${submittedDocs}/${applicant.docs.length} submitted` },
          { key: 'financialNeed' as const, label: 'Financial Need',              score: rubric.financialNeed, max: 5, auto: false, note: 'Based on income declaration' },
          { key: 'essay' as const,         label: 'Motivation Letter / Essay',   score: rubric.essay,         max: 5, auto: false, note: 'Quality and relevance' },
          { key: 'interview' as const,     label: 'Interview Performance',        score: rubric.interview,     max: 5, auto: false, note: 'Optional — set 0 if N/A' },
          { key: 'community' as const,     label: 'Community Involvement',        score: rubric.community,     max: 5, auto: false, note: 'Activities / org participation' },
        ];
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
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{c.note} {c.auto && <span style={{ color: '#3b82f6', fontWeight: 600 }}>· Auto-scored</span>}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {c.auto ? (
                      <span style={{ fontSize: 20, fontWeight: 800, color: c.score >= 4 ? '#059669' : c.score >= 3 ? '#d97706' : '#dc2626', minWidth: 40, textAlign: 'center' }}>
                        {c.score}<span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>/{c.max}</span>
                      </span>
                    ) : (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1,2,3,4,5].map(n => (
                          <button key={n} onClick={() => setRubric(prev => ({ ...prev, [c.key]: n }))} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: c.score >= n ? TEAL : '#e5e7eb', color: c.score >= n ? '#fff' : '#9ca3af', transition: 'all 0.1s' }}>{n}</button>
                        ))}
                      </div>
                    )}
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

      {/* ── History tab ── */}
      {activeTab === 'history' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '28px' }}>
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
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{entry.date} — by <strong style={{ color: '#6b7280' }}>{entry.by}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Approve Dialog ── */}
      {showApproveDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowApproveDialog(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Confirm Approval</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              You are approving <strong>{applicant.name}</strong> for <strong>{applicant.scholarship}</strong>. The student will be notified and marked as an active scholar.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowApproveDialog(false)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleApprove} style={{ flex: 1, padding: 10, background: '#059669', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Dialog ── */}
      {showRejectDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setShowRejectDialog(false); setRejectReason(''); setRejectNote(''); }}>
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
                <option value="missing_docs">Missing required documents</option>
                <option value="eligibility_criteria">Does not meet eligibility criteria</option>
                <option value="gwa_requirement">GWA does not meet minimum requirement</option>
                <option value="duplicate_application">Duplicate application</option>
                <option value="incomplete_form">Incomplete application form</option>
                <option value="other">Other</option>
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

      {/* ── Mark Incomplete Dialog ── */}
      {showIncompleteDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowIncompleteDialog(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Mark as Incomplete</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>Select which documents need to be resubmitted. The student will receive a notification specifying what is required.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, maxHeight: 240, overflowY: 'auto' }}>
              {applicant.docs.map((doc, i) => {
                const checked = selectedMissingDocs.includes(doc.label);
                return (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, border: `1px solid ${checked ? '#fca5a5' : '#e5e7eb'}`, background: checked ? '#fef2f2' : '#f9fafb', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checked} onChange={() => setSelectedMissingDocs(prev => checked ? prev.filter(d => d !== doc.label) : [...prev, doc.label])} style={{ accentColor: '#ea580c', width: 15, height: 15 }} />
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, flex: 1 }}>{doc.label}</span>
                    {!doc.submitted && <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626' }}>MISSING</span>}
                  </label>
                );
              })}
            </div>
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
