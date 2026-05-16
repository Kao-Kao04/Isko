'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { scholarshipApi, applicationApi, documentApi, type ScholarshipResponse } from '@/lib/api-client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { COLORS } from '@/lib/theme';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ConfirmModal from '@/components/ui/ConfirmModal';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const DRAFT_KEY = (id: string) => `iskomo_draft_${id}`;

const FALLBACK_REQS = [
  { id: 'proofOfEnrollment', label: 'Proof of Enrollment / Certificate of Registration', required: true,  hint: 'PDF, JPG, or PNG (Max 5MB)' },
  { id: 'transcript',        label: 'Transcript of Records / Copy of Grades',            required: true,  hint: 'PDF, JPG, or PNG (Max 5MB)' },
  { id: 'validId',           label: 'Valid Government ID',                                required: true,  hint: 'PDF, JPG, or PNG (Max 5MB)' },
  { id: 'form',              label: 'Application Form / Personal Data Sheet',             required: true,  hint: 'PDF or DOC (Max 5MB)' },
];

export default function ApplyPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const [scholarship,    setScholarship]    = useState<ScholarshipResponse | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [dataLoading,    setDataLoading]    = useState(true);
  const [submitError,    setSubmitError]    = useState('');

  const [files,       setFiles]       = useState<Record<string, string>>({});
  const [fileObjects, setFileObjects] = useState<Record<string, File>>({});
  const [fileErrors,  setFileErrors]  = useState<Record<string, string>>({});
  const [essay,      setEssay]      = useState('');
  const [agreed,     setAgreed]     = useState({ declaration: false, terms: false });
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [hasDraft,   setHasDraft]   = useState(false);

  useEffect(() => {
    Promise.all([
      scholarshipApi.get(Number(id)),
      applicationApi.list(1, 50),
    ]).then(([sch, apps]) => {
      setScholarship(sch);
      setAlreadyApplied(apps.items.some(a => a.scholarship_id === Number(id)));
    }).catch(() => {}).finally(() => setDataLoading(false));
  }, [id]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY(id));
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.essay) setEssay(draft.essay);
        setHasDraft(true);
      }
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    if (submitted) return;
    try { localStorage.setItem(DRAFT_KEY(id), JSON.stringify({ essay, files })); } catch { /* ignore */ }
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
    setFiles(prev => ({ ...prev, [key]: f.name }));
    setFileObjects(prev => ({ ...prev, [key]: f }));
  }

  async function confirmSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const application = await applicationApi.submit(Number(id));
      // Upload each file that was attached
      const uploadPromises = docsConfig
        .filter(doc => fileObjects[doc.id])
        .map(doc => documentApi.upload(application.id, doc.label, fileObjects[doc.id]));
      await Promise.allSettled(uploadPromises);
      clearDraft();
      setShowModal(false);
      setSubmitted(true);
    } catch (err: unknown) {
      setShowModal(false);
      const msg = err instanceof Error ? err.message : 'Failed to submit application.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const loading = userLoading || dataLoading;

  const labelStyle: React.CSSProperties   = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
  const inputStyle: React.CSSProperties   = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box' };
  const sectionStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 28px', marginBottom: 20 };
  const sectionTitle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' };

  if (loading) {
    return (
      <div style={{ maxWidth: 860, margin: '80px auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: `3px solid #f3f4f6`, borderTop: `3px solid ${COLORS.maroon}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
            You already have an existing application for <strong>{scholarship?.name}</strong>. You can track its status in My Applications.
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

  // Eligibility check
  const userCollege  = user?.student_profile?.college  ?? '';
  const userProgram  = user?.student_profile?.program  ?? '';
  const eligColleges = scholarship.eligible_colleges ?? [];
  const eligPrograms = scholarship.eligible_programs ?? [];
  const collegeOk    = eligColleges.length === 0 || eligColleges.includes(userCollege);
  const programOk    = eligPrograms.length === 0 || eligPrograms.includes(userProgram);
  const isEligible   = collegeOk && programOk;

  if (scholarship.status !== 'active') {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '48px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Applications Not Open</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>
            <strong>{scholarship.name}</strong> is currently <strong>{scholarship.status}</strong> and not accepting applications yet.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => router.push('/student/iskolarships')} style={{ background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Browse Other Scholarships</button>
            <button onClick={() => router.back()} style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (!isEligible) {
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
            <strong>{scholarship.name}</strong> is restricted to specific colleges or programs and you do not meet the requirements.
          </div>
          {(eligColleges.length > 0 || eligPrograms.length > 0) && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
              {eligColleges.length > 0 && (
                <div style={{ marginBottom: eligPrograms.length > 0 ? 10 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Open to Colleges</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {eligColleges.map(c => (
                      <span key={c} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {eligPrograms.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Open to Programs</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {eligPrograms.map(p => (
                      <span key={p} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
                Your college: <strong>{userCollege || '—'}</strong> · Program: <strong>{userProgram || '—'}</strong>
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
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Application Submitted!</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>
            Your application for <strong>{scholarship.name}</strong> has been received by OSFA. You can track its progress in My Applications.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => router.push('/student/applications')} style={{ background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Track My Applications</button>
            <button onClick={() => router.push('/student/iskolarships')} style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Browse More</button>
          </div>
        </div>
      </div>
    );
  }

  const docsConfig = scholarship.requirements.length
    ? scholarship.requirements.map(r => ({
        id:       String(r.id),
        label:    r.name,
        required: r.is_required,
        hint:     r.description ?? 'PDF, JPG, or PNG (Max 5MB)',
        accept:   '.pdf,.jpg,.jpeg,.png,.doc,.docx',
      }))
    : FALLBACK_REQS.map(r => ({
        id:       r.id,
        label:    r.label,
        required: r.required,
        hint:     r.hint ?? 'PDF, JPG, or PNG (Max 5MB)',
        accept:   '.pdf,.jpg,.jpeg,.png,.doc,.docx',
      }));

  const requiredDocs        = docsConfig.filter(d => d.required);
  const uploadedCount       = requiredDocs.filter(d => files[d.id]).length;
  const allRequiredUploaded = uploadedCount === requiredDocs.length && essay.trim().length > 0;

  const profile = user?.student_profile;
  const fullName = profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() : '';

  const slotsLeft = (scholarship.slots ?? 0) - scholarship.applicants_count;
  const deadline = scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set';

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

      <Breadcrumb items={[
        { label: 'Iskolarships', href: '/student/iskolarships' },
        { label: scholarship.name, href: `/student/iskolarships/${id}` },
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

      <form onSubmit={e => { e.preventDefault(); setShowModal(true); }}>

        {/* Scholarship info */}
        <div style={sectionStyle}>
          <div style={sectionTitle}>Scholarship Information</div>
          <div style={{ background: '#fff5f5', border: `1px solid ${COLORS.maroon}25`, borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.maroonD }}>{scholarship.name}</div>
            <div style={{ fontSize: 13, color: '#374151', marginTop: 6, lineHeight: 1.6 }}>{scholarship.description}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              {scholarship.amount_raw && <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.maroon }}>₱{scholarship.amount_raw.toLocaleString()} {scholarship.period}</span>}
              <span style={{ fontSize: 13, color: '#6b7280' }}>Deadline: {deadline}</span>
              <span style={{ fontSize: 13, color: slotsLeft < 5 ? '#dc2626' : '#6b7280' }}>{slotsLeft} slots left</span>
            </div>
          </div>
        </div>

        {/* Student info */}
        <div style={sectionStyle}>
          <div style={sectionTitle}>Student Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {[
              { label: 'Full Name',        value: fullName },
              { label: 'Email Address',    value: user?.email ?? '' },
              { label: 'Student Number',   value: profile?.student_number ?? '—' },
              { label: 'College',          value: profile?.college ?? '—' },
              { label: 'Course / Program', value: profile?.program ?? '—' },
              { label: 'Year Level',       value: profile?.year_level ? (['1st','2nd','3rd'][profile.year_level - 1] ?? `${profile.year_level}th`) + ' Year' : '—' },
            ].map(f => (
              <div key={f.label}>
                <label style={labelStyle}>{f.label}</label>
                <input type="text" value={f.value} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div style={sectionStyle}>
          <div style={sectionTitle}>Required Documents</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {docsConfig.map(doc => {
              const hasFile  = !!files[doc.id];
              const hasError = !!fileErrors[doc.id];
              return (
                <div key={doc.id}>
                  <label style={labelStyle}>
                    {doc.label} {doc.required && <span style={{ color: '#dc2626' }}>*</span>}
                  </label>
                  <label htmlFor={doc.id} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                    border: `2px dashed ${hasError ? '#dc2626' : hasFile ? COLORS.maroon : '#d1d5db'}`,
                    borderRadius: 10, padding: '20px 16px', cursor: 'pointer',
                    background: hasError ? '#fef2f2' : hasFile ? '#fff5f5' : '#fafafa',
                    transition: 'all 0.15s',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={hasError ? '#dc2626' : hasFile ? COLORS.maroon : '#9ca3af'} strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 500, color: hasError ? '#dc2626' : hasFile ? COLORS.maroonD : '#374151', textAlign: 'center' }}>
                      {hasFile ? <><span style={{ color: '#15803d', marginRight: 4 }}>✓</span>{files[doc.id]}</> : 'Click to upload'}
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{doc.hint}</span>
                    <input type="file" id={doc.id} name={doc.id} accept={doc.accept} required={doc.required && !hasFile} style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden' }} onChange={e => handleFileChange(e, doc.id)} />
                  </label>
                  {hasError && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#dc2626' }}>{fileErrors[doc.id]}</p>}
                </div>
              );
            })}

            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label htmlFor="essay" style={labelStyle}>Bakit ka nag-aaply para sa scholarship na ito? <span style={{ color: '#dc2626' }}>*</span></label>
                <span style={{ fontSize: 12, color: essay.length > 800 ? '#15803d' : essay.length > 400 ? '#d97706' : '#9ca3af' }}>
                  {essay.length} characters {essay.length < 200 && essay.length > 0 ? '— too short' : ''}
                </span>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                Isulat ang iyong dahilan sa pag-apply. Maaari kang gumamit ng Filipino o English — gamitin ang wikang komportable ka.
              </p>
              <textarea id="essay" name="essay" rows={6} required value={essay} onChange={e => setEssay(e.target.value)}
                placeholder="Halimbawa: Nag-aaply ako dahil gusto kong matulungan ang aking pamilya at matupad ang aking pangarap na maging..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
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

        {submitError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {submitError}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={() => router.back()} style={{ padding: '11px 24px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={submitting} style={{ padding: '11px 28px', borderRadius: 8, border: 'none', background: submitting ? '#9ca3af' : `linear-gradient(135deg, ${COLORS.maroon}, ${COLORS.maroonD})`, fontSize: 14, fontWeight: 700, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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
          { label: 'Dahilan sa pag-apply', ok: essay.trim().length >= 50, required: true },
          { label: 'Agreements checked', ok: agreed.declaration && agreed.terms, required: true },
        ]}
      />
    </div>
  );
}
