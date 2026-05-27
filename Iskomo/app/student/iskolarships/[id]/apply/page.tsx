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


export default function ApplyPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const [scholarship,    setScholarship]    = useState<ScholarshipResponse | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [categoryBlock,  setCategoryBlock]  = useState<string | null>(null); // category already applied to
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
      applicationApi.list(1, 10),
    ]).then(([sch, apps]) => {
      setScholarship(sch);
      const active = apps.items.filter(a => !['withdrawn', 'rejected'].includes(a.status));
      setAlreadyApplied(active.some(a => a.scholarship_id === Number(id)));
      // One-per-category rule
      if (sch.category) {
        const conflict = active.find(a => a.scholarship_id !== Number(id) && a.scholarship?.category === sch.category);
        if (conflict) setCategoryBlock(sch.category);
      }
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
      const application = await applicationApi.submit(Number(id), essay.trim() || undefined);
      // Upload each attached file; track any failures to warn the user
      const docsToUpload = docsConfig.filter(doc => fileObjects[doc.id]);
      const uploadResults = await Promise.allSettled(
        docsToUpload.map(doc => documentApi.upload(application.id, doc.label, fileObjects[doc.id]))
      );
      const failedCount = uploadResults.filter(r => r.status === 'rejected').length;
      clearDraft();
      setShowModal(false);
      if (failedCount > 0) {
        setSubmitError(`Application submitted, but ${failedCount} document(s) failed to upload. You can re-upload them from your application page.`);
      }
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

  if (categoryBlock) {
    const label = categoryBlock === 'public' ? 'Public' : 'Private';
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '48px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Application Limit Reached</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8, lineHeight: 1.6 }}>
            You already have an active application for a <strong>{label}</strong> scholarship.
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28, lineHeight: 1.6 }}>
            Only one application per category is allowed. You can withdraw your current {label} application first if you want to apply to a different one.
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
  const userCollege   = user?.student_profile?.college    ?? '';
  const userProgram   = user?.student_profile?.program    ?? '';
  const userYearLevel = user?.student_profile?.year_level ?? 0;
  const eligColleges  = scholarship.eligible_colleges    ?? [];
  const eligPrograms  = scholarship.eligible_programs    ?? [];
  const eligYears     = scholarship.eligible_year_levels ?? [];
  const collegeOk  = eligColleges.length === 0 || eligColleges.includes(userCollege);
  const programOk  = eligPrograms.length === 0 || eligPrograms.includes(userProgram);
  const yearOk     = eligYears.length === 0    || eligYears.includes(userYearLevel);
  const isEligible = collegeOk && programOk && yearOk;

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
            <strong>{scholarship.name}</strong> is restricted to specific{!collegeOk ? ' colleges' : ''}{!programOk ? ' programs' : ''}{!yearOk ? ' year levels' : ''} and you do not meet the requirements.
          </div>
          {(eligColleges.length > 0 || eligPrograms.length > 0 || eligYears.length > 0) && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
              {eligColleges.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Open to Colleges</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {eligColleges.map(c => (
                      <span key={c} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {eligPrograms.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Open to Programs</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {eligPrograms.map(p => (
                      <span key={p} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {eligYears.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Open to Year Levels</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(['1st Year','2nd Year','3rd Year','4th Year'] as const).filter((_, i) => eligYears.includes(i + 1)).map(label => (
                      <span key={label} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>{label}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }}>
                Your profile: <strong>{userCollege || '—'}</strong> · <strong>{userProgram || '—'}</strong> · <strong>{userYearLevel ? (['1st','2nd','3rd','4th'][userYearLevel - 1] ?? userYearLevel) + ' Year' : '—'}</strong>
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

  const docsConfig = scholarship.requirements.map(r => ({
    id:       String(r.id),
    label:    r.name,
    required: r.is_required,
    hint:     r.description ?? 'PDF, JPG, or PNG (Max 5MB)',
    accept:   '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  }));

  const OSFA_FOLDER = 'https://drive.google.com/drive/folders/10rzE2Lej8tQ70PUXBAGknmss2UnkR7FR?usp=drive_link';
  const OSFA_FORM_MAP = [
    { keywords: ['personal data sheet', 'application form', 'pds'],            label: 'Personal Data Sheet (PUP-PDSA-5-OFSS-009)', href: OSFA_FOLDER },
    { keywords: ['non-disclosure', 'nda'],                                      label: 'Non-Disclosure Agreement',                  href: OSFA_FOLDER },
    { keywords: ['scholarship agreement'],                                       label: 'Scholarship Agreement Form',                href: OSFA_FOLDER },
    { keywords: ['student assistant endorsement', 'endorsement form'],          label: 'Student Assistant Endorsement Form',        href: OSFA_FOLDER },
    { keywords: ['student assistant evaluation', 'evaluation form'],            label: 'Student Assistant Evaluation Form',         href: OSFA_FOLDER },
    { keywords: ['clearing deficiency'],                                        label: 'Request for Clearing Deficiency',           href: OSFA_FOLDER },
  ];

  // Find which requirements have a matching downloadable OSFA form
  const osformsNeeded = docsConfig.flatMap(doc => {
    const lower = doc.label.toLowerCase();
    const match = OSFA_FORM_MAP.find(f => f.keywords.some(k => lower.includes(k)));
    return match ? [{ ...match, reqLabel: doc.label }] : [];
  });

  const requiredDocs        = docsConfig.filter(d => d.required);
  const uploadedCount       = requiredDocs.filter(d => files[d.id]).length;
  const MIN_WORDS           = 30;
  const wordCount           = essay.trim() ? essay.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const allRequiredUploaded = uploadedCount === requiredDocs.length && wordCount >= MIN_WORDS;

  const profile = user?.student_profile;
  const fullName = profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() : '';

  const slotsLeft = (scholarship.slots ?? 0) - (scholarship.awarded_count ?? 0);
  const deadline = scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set';

  const canSubmit = allRequiredUploaded && agreed.declaration && agreed.terms && !submitting;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 140px' }}>

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

      {/* What You'll Need — prepare documents before uploading */}
      {docsConfig.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${COLORS.maroon}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.maroon} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Prepare These Documents First</p>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Ihanda ang mga sumusunod bago ka mag-upload at mag-submit.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: osformsNeeded.length > 0 ? 16 : 0 }}>
            {docsConfig.map((doc, i) => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: doc.required ? `${COLORS.maroon}15` : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: doc.required ? COLORS.maroon : '#15803d' }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: 13, color: '#374151', flex: 1, lineHeight: 1.4 }}>{doc.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: doc.required ? '#dc2626' : '#9ca3af', flexShrink: 0 }}>
                  {doc.required ? 'REQUIRED' : 'OPTIONAL'}
                </span>
              </div>
            ))}
          </div>

          {osformsNeeded.length > 0 && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#92400e' }}>
                📥 Download &amp; fill out these OSFA forms before uploading:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {osformsNeeded.map((form, i) => (
                  <a key={i} href={form.href} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fff', border: '1px solid #fde68a', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: 12, fontWeight: 500 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span style={{ flex: 1 }}>{form.label}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </a>
                ))}
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 11, color: '#92400e' }}>
                For: <em>{osformsNeeded.map(f => f.reqLabel).join(', ')}</em>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Application Completeness</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: allRequiredUploaded ? '#15803d' : COLORS.maroon }}>
            {uploadedCount}/{requiredDocs.length} docs · {wordCount >= MIN_WORDS ? '✓' : '✗'} essay
          </span>
        </div>
        <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99, transition: 'width 0.3s ease',
            background: allRequiredUploaded ? '#15803d' : COLORS.maroon,
            width: `${Math.round(((uploadedCount + (wordCount >= MIN_WORDS ? 1 : 0)) / (requiredDocs.length + 1)) * 100)}%`,
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
              <span style={{ fontSize: 13, color: slotsLeft < 5 ? '#dc2626' : '#6b7280' }}>{slotsLeft} award slots left</span>
            </div>
          </div>
        </div>

        {/* Student info */}
        <div style={sectionStyle}>
          <div style={{ ...sectionTitle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>Student Information</span>
            <a href="/student/profile" style={{ fontSize: 11, fontWeight: 600, color: COLORS.maroon, textDecoration: 'none' }}>
              Edit in Profile →
            </a>
          </div>

          <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, fontSize: 12, color: '#0369a1' }}>
            This is the information OSFA will see when reviewing your application. Make sure everything is correct before submitting.
          </div>

          {/* Academic */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Academic</div>
          <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 20 }}>
            {[
              { label: 'Full Name',        value: fullName },
              { label: 'Email Address',    value: user?.email ?? '—' },
              { label: 'Student Number',   value: profile?.student_number ?? '—' },
              { label: 'GWA',              value: profile?.gwa ?? '—' },
              { label: 'College',          value: profile?.college ?? '—' },
              { label: 'Course / Program', value: profile?.program ?? '—' },
              { label: 'Year Level',       value: profile?.year_level ? (['1st','2nd','3rd','4th'][profile.year_level - 1] ?? `${profile.year_level}th`) + ' Year' : '—' },
            ].map(f => (
              <div key={f.label}>
                <label style={labelStyle}>{f.label}</label>
                <input type="text" value={f.value} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
              </div>
            ))}
          </div>

          {/* Address */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Address</div>
          <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 20 }}>
            {[
              { label: 'Street / Barangay',   value: profile?.street_barangay   ?? '—' },
              { label: 'City / Municipality', value: profile?.city_municipality ?? '—' },
              { label: 'Province',            value: profile?.province          ?? '—' },
              { label: 'ZIP Code',            value: profile?.zip_code          ?? '—' },
            ].map(f => (
              <div key={f.label}>
                <label style={labelStyle}>{f.label}</label>
                <input type="text" value={f.value} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
              </div>
            ))}
          </div>

          {/* Family Background */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Family Background</div>
          <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
            {[
              { label: "Father's Name",         value: profile?.father_name       ?? '—' },
              { label: "Father's Occupation",   value: profile?.father_occupation ?? '—' },
              { label: "Mother's Name",         value: profile?.mother_name       ?? '—' },
              { label: "Mother's Occupation",   value: profile?.mother_occupation ?? '—' },
              { label: 'Income Source',         value: profile?.income_source     ?? '—' },
              { label: 'Monthly Family Income', value: profile?.monthly_income    ?? '—' },
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
          {docsConfig.length === 0 ? (
            <div style={{ padding: '20px 24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>No documents required</div>
                <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>This scholarship does not require any document uploads.</div>
              </div>
            </div>
          ) : (
            <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
              {docsConfig.map(doc => {
                const hasFile  = !!files[doc.id];
                const hasError = !!fileErrors[doc.id];
                return (
                  <div key={doc.id}>
                    <label style={labelStyle}>
                      {doc.label} {doc.required && <span style={{ color: '#dc2626' }}>*</span>}
                    </label>
                    <div style={{
                      position: 'relative',
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
                      <input type="file" id={doc.id} name={doc.id} accept={doc.accept} required={doc.required && !hasFile} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} onChange={e => handleFileChange(e, doc.id)} />
                    </div>
                    {hasError && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#dc2626' }}>{fileErrors[doc.id]}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Essay */}
        <div style={sectionStyle}>
          <div style={sectionTitle}>Essay</div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label htmlFor="essay" style={labelStyle}>Why are you applying for this scholarship? <span style={{ color: '#dc2626' }}>*</span></label>
              <span style={{ fontSize: 12, fontWeight: 600, color: wordCount >= MIN_WORDS ? '#15803d' : wordCount > 0 ? '#dc2626' : '#9ca3af' }}>
                {wordCount} / min. {MIN_WORDS} words {wordCount >= MIN_WORDS ? '✓' : wordCount > 0 ? `(need ${MIN_WORDS - wordCount} more)` : ''}
              </span>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
              Write your reason for applying to this scholarship. You may use Filipino or English — use whichever language you are comfortable with. (Minimum 30 words)
            </p>
            <textarea id="essay" name="essay" rows={6} required value={essay}
              onChange={e => setEssay(e.target.value)}
              onBlur={e => {
                const wc = e.target.value.trim() ? e.target.value.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
                if (wc > 0 && wc < 30) {
                  e.target.style.borderColor = '#dc2626';
                } else {
                  e.target.style.borderColor = '';
                }
              }}
              onFocus={e => { e.target.style.borderColor = ''; }}
              placeholder="e.g. I am applying for this scholarship because I want to support my family and fulfill my dream of becoming..."
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, border: wordCount > 0 && wordCount < MIN_WORDS ? '1.5px solid #dc2626' : undefined }} />
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
      </form>

      {/* Sticky submit bar — two-row layout so it fits on any screen size */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: '#fff', borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
        padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Row 1: progress info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${canSubmit ? '#15803d' : COLORS.maroon}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: canSubmit ? '#15803d' : COLORS.maroon, lineHeight: 1, textAlign: 'center' }}>
              {Math.round(((uploadedCount + (wordCount >= MIN_WORDS ? 1 : 0)) / (requiredDocs.length + 1)) * 100)}%
            </span>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
              {canSubmit ? 'Ready to submit!' : 'Complete your application'}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {uploadedCount}/{requiredDocs.length} docs · {wordCount >= MIN_WORDS ? '✓' : '✗'} essay · {agreed.declaration && agreed.terms ? '✓' : '✗'} agreements
            </div>
          </div>
        </div>
        {/* Row 2: action buttons — full width */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => router.back()} style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => { if (!submitting) setShowModal(true); }}
            disabled={submitting}
            style={{
              flex: 2, padding: '11px 0', borderRadius: 8, border: 'none',
              background: canSubmit ? `linear-gradient(135deg, ${COLORS.maroon}, ${COLORS.maroonD})` : '#d1d5db',
              fontSize: 13, fontWeight: 700, color: canSubmit ? '#fff' : '#9ca3af',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              boxShadow: canSubmit ? '0 2px 8px rgba(139,0,0,0.3)' : 'none',
              transition: 'all 0.15s',
            }}>
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <ConfirmModal
        open={showModal}
        title="Review & Submit"
        message=""
        confirmLabel="Yes, Submit Application"
        cancelLabel="Go Back & Check"
        onConfirm={confirmSubmit}
        onCancel={() => setShowModal(false)}
        confirmDisabled={!canSubmit}
        checklist={[
          ...docsConfig.map(d => ({ label: d.label, ok: !!files[d.id], required: d.required })),
          { label: 'Dahilan sa pag-apply (min. 30 words)', ok: wordCount >= MIN_WORDS, required: true },
          { label: 'Agreements checked', ok: agreed.declaration && agreed.terms, required: true },
        ]}
      />
    </div>
  );
}
