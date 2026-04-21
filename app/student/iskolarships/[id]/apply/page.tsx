'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useOsfaContext } from '@/lib/osfa-context';
import { COLORS } from '@/lib/theme';
import { MOCK_STUDENT, isEligible } from '@/lib/data/mock-user';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { Applicant } from '@/lib/osfa-data';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const DRAFT_KEY = (id: string) => `iskomo_draft_${id}`;

const FALLBACK_REQS = [
  { id: 'proofOfEnrollment', label: 'Proof of Enrollment / Certificate of Registration', required: true,  hint: 'PDF, JPG, or PNG (Max 5MB)' },
  { id: 'transcript',        label: 'Transcript of Records / Copy of Grades',            required: true,  hint: 'PDF, JPG, or PNG (Max 5MB)' },
  { id: 'validId',           label: 'Valid Government ID',                                required: true,  hint: 'PDF, JPG, or PNG (Max 5MB)' },
  { id: 'form',              label: 'Application Form / Personal Data Sheet',             required: true,  hint: 'PDF or DOC (Max 5MB)' },
];

export default function ApplyPage() {
  const { id }      = useParams<{ id: string }>();
  const router      = useRouter();
  const searchParams = useSearchParams();
  const isResubmit  = searchParams.get('resubmit') === 'true';
  const { scholarships, applicants, setApplicants, setScholarships, addNotification } = useOsfaContext();

  const scholarship    = scholarships.find(s => s.id === id);
  const existingApp    = applicants.find(a => a.email === MOCK_STUDENT.email && a.scholarshipId === id);
  const alreadyApplied = !!existingApp && !(isResubmit && existingApp.status === 'Incomplete');

  const docsConfig = (scholarship?.requirements?.length ? scholarship.requirements : FALLBACK_REQS).map(r => ({
    id:       r.id,
    label:    r.label,
    required: r.required,
    hint:     r.hint ?? 'PDF, JPG, or PNG (Max 5MB)',
    accept:   '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  }));

  const [files,      setFiles]      = useState<Record<string, string>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [uploading,  setUploading]  = useState<Record<string, number>>({});
  const [essay,      setEssay]      = useState('');
  const [agreed,     setAgreed]     = useState({ declaration: false, terms: false });
  const [submitted,  setSubmitted]  = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [hasDraft,   setHasDraft]   = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY(id));
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.essay) setEssay(draft.essay);
        if (draft.files) setFiles(draft.files);
        setHasDraft(true);
      }
    } catch { /* ignore */ }
  }, [id]);

  // Auto-save draft on changes
  useEffect(() => {
    if (submitted) return;
    try {
      localStorage.setItem(DRAFT_KEY(id), JSON.stringify({ essay, files }));
    } catch { /* ignore */ }
  }, [essay, files, id, submitted]);

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY(id)); } catch { /* ignore */ }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > MAX_FILE_BYTES) {
      setFileErrors(prev => ({ ...prev, [key]: `File too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Max is 5MB.` }));
      e.target.value = '';
      return;
    }
    const allowed = e.target.accept.split(',').map(s => s.trim().replace('.', ''));
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!allowed.includes(ext)) {
      setFileErrors(prev => ({ ...prev, [key]: `Invalid file type (.${ext}). Allowed: ${e.target.accept}` }));
      e.target.value = '';
      return;
    }

    setFileErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

    // Simulate upload progress
    const fileName = f.name;
    setUploading(prev => ({ ...prev, [key]: 0 }));
    let pct = 0;
    const tick = setInterval(() => {
      pct += Math.random() * 28 + 12;
      if (pct >= 100) {
        clearInterval(tick);
        setUploading(prev => { const n = { ...prev }; delete n[key]; return n; });
        setFiles(prev => ({ ...prev, [key]: fileName }));
      } else {
        setUploading(prev => ({ ...prev, [key]: Math.round(pct) }));
      }
    }, 100);
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowModal(true);
  }

  function confirmSubmit() {
    if (!scholarship) return;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (isResubmit && existingApp) {
      setApplicants(prev => prev.map(a => a.id === existingApp.id ? {
        ...a,
        status: 'Pending' as const,
        rejectedDocs: [],
        docs: docsConfig.map(d => ({ label: d.label, submitted: !!files[d.id] })),
        audit: [...a.audit, { date: today, action: 'Documents resubmitted via Student Portal', by: 'Student' }],
      } : a));
      addNotification({ type: 'resubmit', message: `Your updated documents for ${scholarship.title} have been received. Your application is back under review.`, scholarshipId: scholarship.id });
    } else {
      const newApplicant: Applicant = {
        id: String(Date.now()),
        ...MOCK_STUDENT,
        scholarship: scholarship.title,
        scholarshipId: scholarship.id,
        status: 'Pending',
        evalStatus: 'Pending Review',
        applied: today,
        gwa: '1.75',
        income: '₱14,500 / mo',
        applicantType: 'continuing',
        docs: docsConfig.map(d => ({ label: d.label, submitted: !!files[d.id] })),
        audit: [{ date: today, action: 'Application submitted via Student Portal', by: 'Student' }],
      };
      setApplicants(prev => [...prev, newApplicant]);
      // Increment scholarship applicant count
      setScholarships(prev => prev.map(s =>
        s.id === scholarship.id ? { ...s, applicants: s.applicants + 1 } : s
      ));
      addNotification({ type: 'info', message: `Your application for ${scholarship.title} has been received by OSFA. You will be notified of updates.`, scholarshipId: scholarship.id });
    }
    clearDraft();
    setShowModal(false);
    setSubmitted(true);
  }

  const labelStyle: React.CSSProperties   = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
  const inputStyle: React.CSSProperties   = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box' };
  const sectionStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 28px', marginBottom: 20 };
  const sectionTitle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' };

  // ── Already applied ──────────────────────────────────────────────────────
  if (alreadyApplied) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '48px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Already Applied</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>
            You already have an existing application for <strong>{scholarship?.title}</strong>. You can track its status in My Applications.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => router.push('/student/applications')} style={{ background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              View My Applications
            </button>
            <button onClick={() => router.back()} style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Scholarship not found.</p>
        <button onClick={() => router.push('/student/iskolarships')} style={{ marginTop: 16, padding: '10px 24px', background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Back to Iskolarships
        </button>
      </div>
    );
  }

  // ── Not eligible ─────────────────────────────────────────────────────────
  if (!isEligible(scholarship.colleges, scholarship.programs, MOCK_STUDENT)) {
    const restrictedColleges = scholarship.colleges ?? [];
    const restrictedPrograms = scholarship.programs ?? [];
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '48px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Not Eligible</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
            <strong>{scholarship.title}</strong> is restricted to specific colleges or programs and you do not meet the requirements.
          </div>
          {(restrictedColleges.length > 0 || restrictedPrograms.length > 0) && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
              {restrictedColleges.length > 0 && (
                <div style={{ marginBottom: restrictedPrograms.length > 0 ? 10 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Open to Colleges</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {restrictedColleges.map(c => (
                      <span key={c} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: c === MOCK_STUDENT.college ? '#fef2f2' : '#f3f4f6', color: c === MOCK_STUDENT.college ? '#dc2626' : '#374151', border: `1px solid ${c === MOCK_STUDENT.college ? '#fca5a5' : '#e5e7eb'}` }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {restrictedPrograms.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Open to Programs</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {restrictedPrograms.map(p => (
                      <span key={p} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
                Your college: <strong>{MOCK_STUDENT.college}</strong> · Program: <strong>{MOCK_STUDENT.program}</strong>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => router.push('/student/iskolarships')} style={{ background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Browse Other Scholarships
            </button>
            <button onClick={() => router.back()} style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '48px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
            {isResubmit ? 'Documents Updated!' : 'Application Submitted!'}
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>
            {isResubmit
              ? <>Your documents for <strong>{scholarship.title}</strong> have been updated. Your application is back under review.</>
              : <>Your application for <strong>{scholarship.title}</strong> has been received by OSFA. You can track its progress in My Applications.</>}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => router.push('/student/applications')} style={{ background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Track My Applications</button>
            <button onClick={() => router.push('/student/iskolarships')} style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Browse More</button>
          </div>
        </div>
      </div>
    );
  }

  const requiredDocs  = docsConfig.filter(d => d.required);
  const uploadedCount = requiredDocs.filter(d => files[d.id]).length;
  const allRequiredUploaded = uploadedCount === requiredDocs.length && essay.trim().length > 0;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

      <Breadcrumb items={[
        { label: 'Iskolarships', href: '/student/iskolarships' },
        { label: scholarship.title, href: `/student/iskolarships/${id}` },
        { label: 'Apply' },
      ]} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Scholarship Application</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Complete the form below to apply for this scholarship.</p>
        </div>
        {hasDraft && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>Draft restored</span>
            <button onClick={() => { clearDraft(); setFiles({}); setEssay(''); setHasDraft(false); }} style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear</button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Application Completeness</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: allRequiredUploaded ? '#15803d' : COLORS.maroon }}>
            {uploadedCount}/{requiredDocs.length} docs · {essay.trim().length > 0 ? '✓' : '✗'} essay
          </span>
        </div>
        <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99, transition: 'width 0.3s ease',
            background: allRequiredUploaded ? '#15803d' : COLORS.maroon,
            width: `${Math.round(((uploadedCount + (essay.trim().length > 0 ? 1 : 0)) / (requiredDocs.length + 1)) * 100)}%`,
          }} />
        </div>
      </div>

      <form onSubmit={handleFormSubmit}>

        {/* Scholarship info */}
        <div style={sectionStyle}>
          <div style={sectionTitle}>Scholarship Information</div>
          <div style={{ background: '#fff5f5', border: `1px solid ${COLORS.maroon}25`, borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.maroonD }}>{scholarship.title}</div>
            <div style={{ fontSize: 13, color: '#374151', marginTop: 6, lineHeight: 1.6 }}>{scholarship.description}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.maroon }}>{scholarship.amount} {scholarship.period}</span>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Deadline: {scholarship.deadline}</span>
              <span style={{ fontSize: 13, color: scholarship.slots - scholarship.applicants < 5 ? '#dc2626' : '#6b7280' }}>
                {scholarship.slots - scholarship.applicants} slots left
              </span>
            </div>
          </div>
        </div>

        {/* Student info */}
        <div style={sectionStyle}>
          <div style={sectionTitle}>Student Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {[
              { label: 'Full Name',        value: MOCK_STUDENT.name },
              { label: 'Email Address',    value: MOCK_STUDENT.email },
              { label: 'Contact Number',   value: MOCK_STUDENT.contact },
              { label: 'Student ID',       value: MOCK_STUDENT.studentId },
              { label: 'School',           value: MOCK_STUDENT.school },
              { label: 'Course / Program', value: MOCK_STUDENT.program },
            ].map(f => (
              <div key={f.label}>
                <label style={labelStyle}>{f.label}</label>
                <input type="text" value={f.value} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Year Level</label>
              <input type="text" value={MOCK_STUDENT.yearLevel} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div style={sectionStyle}>
          <div style={sectionTitle}>Required Documents</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {docsConfig.map(doc => {
              const isUploading = uploading[doc.id] !== undefined;
              const pct = uploading[doc.id] ?? 0;
              const hasFile = !!files[doc.id];
              const hasError = !!fileErrors[doc.id];
              return (
                <div key={doc.id}>
                  <label style={labelStyle}>
                    {doc.label} {doc.required && <span style={{ color: '#dc2626' }}>*</span>}
                  </label>
                  <label htmlFor={doc.id} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                    border: `2px dashed ${hasError ? '#dc2626' : hasFile ? COLORS.maroon : isUploading ? COLORS.maroon : '#d1d5db'}`,
                    borderRadius: 10, padding: '20px 16px', cursor: isUploading ? 'default' : 'pointer',
                    background: hasError ? '#fef2f2' : hasFile ? '#fff5f5' : isUploading ? '#fff5f5' : '#fafafa',
                    transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
                  }}>
                    {isUploading ? (
                      <>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLORS.maroon} strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.maroon }}>Uploading… {pct}%</span>
                        <div style={{ width: '100%', height: 4, background: '#fecaca', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS.maroon}, #C9A027)`, borderRadius: 99, transition: 'width 0.1s linear' }} />
                        </div>
                      </>
                    ) : (
                      <>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={hasError ? '#dc2626' : hasFile ? COLORS.maroon : '#9ca3af'} strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span style={{ fontSize: 13, fontWeight: 500, color: hasError ? '#dc2626' : hasFile ? COLORS.maroonD : '#374151', textAlign: 'center' }}>
                          {hasFile ? (
                            <><span style={{ color: '#15803d', marginRight: 4 }}>✓</span>{files[doc.id]}</>
                          ) : 'Click to upload'}
                        </span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{doc.hint}</span>
                      </>
                    )}
                    <input type="file" id={doc.id} name={doc.id} accept={doc.accept} required={doc.required && !hasFile} style={{ display: 'none' }} onChange={e => handleFileChange(e, doc.id)} disabled={isUploading} />
                  </label>
                  {hasError && (
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#dc2626' }}>{fileErrors[doc.id]}</p>
                  )}
                </div>
              );
            })}

            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label htmlFor="essay" style={labelStyle}>Motivation Letter <span style={{ color: '#dc2626' }}>*</span></label>
                <span style={{ fontSize: 12, color: essay.length > 800 ? '#15803d' : essay.length > 400 ? '#d97706' : '#9ca3af' }}>
                  {essay.length} characters {essay.length < 200 && essay.length > 0 ? '— too short' : ''}
                </span>
              </div>
              <textarea
                id="essay" name="essay" rows={6} required
                value={essay}
                onChange={e => setEssay(e.target.value)}
                placeholder="Explain why you deserve this scholarship and how it will help your academic journey..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div style={sectionStyle}>
          <div style={sectionTitle}>Declaration & Submission</div>
          {[
            { key: 'declaration', text: 'I certify that all information provided is true and accurate. I understand that providing false information may result in disqualification.' },
            { key: 'terms',       text: 'I have read and agree to the terms and conditions of this scholarship program.' },
          ].map(item => (
            <label key={item.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" required checked={agreed[item.key as keyof typeof agreed]} onChange={e => setAgreed(prev => ({ ...prev, [item.key]: e.target.checked }))} style={{ marginTop: 2, accentColor: COLORS.maroon, width: 16, height: 16, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{item.text} <span style={{ color: '#dc2626' }}>*</span></span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={() => router.back()} style={{ padding: '11px 24px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" style={{ padding: '11px 28px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${COLORS.maroon}, ${COLORS.maroonD})`, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
            Submit Application
          </button>
        </div>
      </form>

      {/* Confirm modal with doc checklist */}
      <ConfirmModal
        open={showModal}
        title="Review & Submit"
        message=""
        confirmLabel="Yes, Submit Application"
        cancelLabel="Go Back & Check"
        onConfirm={confirmSubmit}
        onCancel={() => setShowModal(false)}
        checklist={[
          ...docsConfig.map(d => ({ label: d.label, ok: !!files[d.id], required: d.required })),
          { label: 'Motivation Letter', ok: essay.trim().length >= 50, required: true },
          { label: 'Agreements checked', ok: agreed.declaration && agreed.terms, required: true },
        ]}
      />
    </div>
  );
}