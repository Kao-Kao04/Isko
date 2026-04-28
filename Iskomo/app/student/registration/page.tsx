'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { PUP_COLLEGE_PROGRAMS } from '@/lib/data/mock-user';
import { COLORS } from '@/lib/theme';

const TEAL      = COLORS.maroon;
const TEAL_DARK = COLORS.maroonD;
const TEAL_L    = COLORS.maroonL;

const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8,
  padding: '10px 14px', fontSize: 14, color: '#111827',
  background: '#fff', boxSizing: 'border-box', outline: 'none',
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: '#374151', marginBottom: 6,
};

function FileInput({ id, label, file, onChange, accept = '.pdf,.jpg,.jpeg,.png' }: {
  id: string; label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  accept?: string;
}) {
  return (
    <div>
      <label style={lbl}>{label} <span style={{ color: '#dc2626' }}>*</span></label>
      <label htmlFor={id} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        border: `2px dashed ${file ? TEAL : '#d1d5db'}`,
        borderRadius: 10, background: file ? TEAL_L : '#fafafa',
        cursor: 'pointer', transition: 'all 0.15s',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={file ? TEAL : '#9ca3af'} strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <div>
          {file
            ? <span style={{ fontSize: 13, fontWeight: 600, color: TEAL }}>✓ {file.name}</span>
            : <span style={{ fontSize: 13, color: '#6b7280' }}>Click to upload — PDF, JPG, PNG (max 5 MB)</span>
          }
        </div>
        <input id={id} type="file" accept={accept} style={{ display: 'none' }}
          onChange={e => onChange(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}

export default function RegistrationPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const [firstName,     setFirstName]     = useState('');
  const [lastName,      setLastName]      = useState('');
  const [middleName,    setMiddleName]    = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [college,       setCollege]       = useState('');
  const [program,       setProgram]       = useState('');
  const [yearLevel,     setYearLevel]     = useState('');
  const [schoolIdFile,  setSchoolIdFile]  = useState<File | null>(null);
  const [corFile,       setCorFile]       = useState<File | null>(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState('');
  const [submitted,     setSubmitted]     = useState(false);

  const isRejected = user?.account_status === 'rejected';
  const colleges   = Object.keys(PUP_COLLEGE_PROGRAMS);
  const programs   = college ? PUP_COLLEGE_PROGRAMS[college] ?? [] : [];

  // Pre-fill from existing profile
  useEffect(() => {
    if (!user?.student_profile) return;
    const p = user.student_profile;
    setFirstName(p.first_name ?? '');
    setLastName(p.last_name ?? '');
    setMiddleName(p.middle_name ?? '');
    setStudentNumber(p.student_number ?? '');
    setCollege(p.college ?? '');
    setProgram(p.program ?? '');
    setYearLevel(String(p.year_level ?? ''));
  }, [user]);

  // Redirect verified students away
  useEffect(() => {
    if (userLoading || !user) return;
    if (user.account_status === 'pending_verification' || user.account_status === 'verified') {
      router.replace('/student/dashboard');
    }
  }, [user, userLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolIdFile || !corFile) { setError('Please upload both your School ID and COR.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('first_name',     firstName);
      fd.append('last_name',      lastName);
      fd.append('middle_name',    middleName);
      fd.append('student_number', studentNumber);
      fd.append('college',        college);
      fd.append('program',        program);
      fd.append('year_level',     yearLevel);
      fd.append('school_id',      schoolIdFile);
      fd.append('cor',            corFile);

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const base  = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
      const res   = await fetch(`${base}/api/registration/submit`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Submission failed. Please try again.');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (userLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid #f3f4f6`, borderTop: `3px solid ${TEAL}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: '56px 48px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 800, color: '#111827' }}>Documents Submitted!</h2>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>
            Your registration documents are now under OSFA review. You can access your dashboard and profile while you wait. We&apos;ll notify you once your account is approved.
          </p>
          <button onClick={() => router.push('/student/dashboard')}
            style={{ width: '100%', padding: '13px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>
                {isRejected ? 'Re-submit Registration Documents' : 'Complete Your Registration'}
              </h1>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6b7280' }}>
                {isRejected ? 'Your documents were rejected. Please re-upload.' : 'Upload your documents to apply for scholarships.'}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 16 }}>
            {['Email Verified', 'Submit Documents', 'OSFA Review', 'Full Access'].map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: i === 0 ? '#f0fdf4' : i === 1 ? TEAL : '#f3f4f6', color: i === 0 ? '#15803d' : i === 1 ? '#fff' : '#9ca3af', border: `2px solid ${i === 0 ? '#86efac' : i === 1 ? TEAL : '#e5e7eb'}` }}>
                    {i === 0 ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: i === 1 ? 700 : 500, color: i === 1 ? TEAL : i === 0 ? '#15803d' : '#9ca3af', whiteSpace: 'nowrap' }}>{step}</span>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 2, background: i === 0 ? '#86efac' : '#e5e7eb', marginBottom: 18 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Rejection banner */}
        {isRejected && user?.rejection_remarks && (
          <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 13, marginBottom: 4 }}>
              ✗ Registration Rejected
            </div>
            <div style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.6 }}>
              <strong>OSFA Remarks:</strong> {user.rejection_remarks}
            </div>
          </div>
        )}

        {/* Form card */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

          {/* Personal Info */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
              <div>
                <label style={lbl}>First Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input style={inp} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Juan" required />
              </div>
              <div>
                <label style={lbl}>Last Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input style={inp} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Dela Cruz" required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Middle Name <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                <input style={inp} value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="e.g. Santos" />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Academic Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Student Number <span style={{ color: '#dc2626' }}>*</span></label>
                <input style={inp} value={studentNumber} onChange={e => setStudentNumber(e.target.value)} placeholder="e.g. 2021-00001-MN-0" required />
              </div>
              <div>
                <label style={lbl}>College <span style={{ color: '#dc2626' }}>*</span></label>
                <select style={{ ...inp, color: college ? '#111827' : '#9ca3af' }} value={college}
                  onChange={e => { setCollege(e.target.value); setProgram(''); }} required>
                  <option value="">Select college...</option>
                  {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Year Level <span style={{ color: '#dc2626' }}>*</span></label>
                <select style={{ ...inp, color: yearLevel ? '#111827' : '#9ca3af' }} value={yearLevel} onChange={e => setYearLevel(e.target.value)} required>
                  <option value="">Select year...</option>
                  {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : `${y}th`} Year</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Program <span style={{ color: '#dc2626' }}>*</span></label>
                <select style={{ ...inp, color: program ? '#111827' : '#9ca3af' }} value={program} onChange={e => setProgram(e.target.value)} required disabled={!college}>
                  <option value="">{college ? 'Select program...' : 'Select a college first'}</option>
                  {programs.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Required Documents</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FileInput id="school-id" label="School ID (front)" file={schoolIdFile} onChange={setSchoolIdFile} />
              <FileInput id="cor"       label="Certificate of Registration (COR)" file={corFile} onChange={setCorFile} />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 12, color: '#9ca3af' }}>
              Accepted formats: PDF, JPG, PNG. Max 5 MB per file.
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            style={{ width: '100%', padding: '14px', background: submitting ? '#9ca3af' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : `0 3px 12px ${TEAL}40` }}>
            {submitting ? 'Submitting…' : isRejected ? 'Re-submit Documents' : 'Submit for OSFA Review'}
          </button>

        </form>
      </div>
    </div>
  );
}
