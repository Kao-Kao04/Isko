'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TEAL = '#1D9E75';
const TEAL_DARK = '#178a64';

export default function Page() {
  const router = useRouter();
  const [files, setFiles] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState({ declaration: false, terms: false });
  const [submitted, setSubmitted] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    const f = e.target.files?.[0];
    if (f) setFiles(prev => ({ ...prev, [key]: f.name }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

  const sectionStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '24px 28px',
    marginBottom: 20,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '1px solid #f3f4f6',
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
          padding: '48px 40px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#ecfdf5', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
            Application Submitted!
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>
            Your scholarship application has been received. You will be notified by email once your application has been reviewed.
          </div>
          <button
            onClick={() => router.push('/student/iskolarships')}
            style={{
              background: TEAL, color: '#fff', border: 'none',
              borderRadius: 8, padding: '12px 28px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Back to Scholarships
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => router.push('/student/iskolarships')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: '#6b7280',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            padding: '0 0 12px 0',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Scholarships
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
          Scholarship Application
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          Complete the form below to apply for the scholarship.
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Scholarship Info */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Scholarship Information</div>
          <div style={{
            background: '#f0fdf9', border: `1px solid ${TEAL}30`,
            borderRadius: 10, padding: '16px 20px',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEAL_DARK }}>
              Merit-Based Academic Scholarship
            </div>
            <div style={{ fontSize: 13, color: '#374151', marginTop: 6, lineHeight: 1.6 }}>
              Open to undergraduate students with a GWA of 1.75 or better. Covers full tuition and a monthly stipend for one academic year.
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Student Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {[
              { label: 'Full Name', id: 'fullName', placeholder: 'Enter your full name', type: 'text' },
              { label: 'Email Address', id: 'email', placeholder: 'your.email@email.com', type: 'email' },
              { label: 'Contact Number', id: 'contactNumber', placeholder: '09XX-XXX-XXXX', type: 'tel' },
              { label: 'Student ID', id: 'studentId', placeholder: 'e.g., 2021-12345', type: 'text' },
              { label: 'School', id: 'school', placeholder: 'e.g., Polytechnic University of the Philippines', type: 'text' },
              { label: 'Course / Program', id: 'course', placeholder: 'e.g., BS Information Technology', type: 'text' },
            ].map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} style={labelStyle}>
                  {f.label} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input type={f.type} id={f.id} name={f.id} required placeholder={f.placeholder} style={inputStyle} />
              </div>
            ))}
            <div>
              <label htmlFor="yearLevel" style={labelStyle}>
                Year Level <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select id="yearLevel" name="yearLevel" required style={selectStyle}>
                <option value="">Select year level</option>
                {['1st Year','2nd Year','3rd Year','4th Year','5th Year'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Required Documents */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Required Documents</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {[
              { id: 'proofOfEnrollment', label: 'Proof of Enrollment', required: true, accept: '.pdf,.jpg,.jpeg,.png', hint: 'PDF, JPG, or PNG (Max 5MB)' },
              { id: 'transcript', label: 'Transcript of Records / Grades', required: true, accept: '.pdf,.jpg,.jpeg,.png', hint: 'PDF, JPG, or PNG (Max 5MB)' },
              { id: 'validId', label: 'Valid ID', required: true, accept: '.pdf,.jpg,.jpeg,.png', hint: 'PDF, JPG, or PNG (Max 5MB)' },
              { id: 'resume', label: 'Resume', required: false, accept: '.pdf,.doc,.docx', hint: 'PDF or DOC (Max 5MB) — Optional' },
            ].map(doc => (
              <div key={doc.id}>
                <label style={labelStyle}>
                  {doc.label} {doc.required && <span style={{ color: '#dc2626' }}>*</span>}
                </label>
                <label htmlFor={doc.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 6,
                  border: `2px dashed ${files[doc.id] ? TEAL : '#d1d5db'}`,
                  borderRadius: 10, padding: '20px 16px',
                  cursor: 'pointer', background: files[doc.id] ? '#f0fdf9' : '#fafafa',
                  transition: 'all 0.15s',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={files[doc.id] ? TEAL : '#9ca3af'} strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 500, color: files[doc.id] ? TEAL_DARK : '#374151' }}>
                    {files[doc.id] || 'Click to upload'}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{doc.hint}</span>
                  <input
                    type="file" id={doc.id} name={doc.id}
                    accept={doc.accept} required={doc.required}
                    style={{ display: 'none' }}
                    onChange={e => handleFileChange(e, doc.id)}
                  />
                </label>
              </div>
            ))}

            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="essay" style={labelStyle}>
                Essay / Motivation Letter <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                id="essay" name="essay" rows={6} required
                placeholder="Write your motivation letter explaining why you deserve this scholarship..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Other Documents <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>— Optional</span></label>
              <label htmlFor="otherDocuments" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                border: '2px dashed #d1d5db', borderRadius: 10, padding: '14px 18px',
                cursor: 'pointer', background: '#fafafa',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span style={{ fontSize: 13, color: '#6b7280' }}>
                  {files['otherDocuments'] || 'Attach supporting documents (multiple files allowed)'}
                </span>
                <input
                  type="file" id="otherDocuments" name="otherDocuments"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple
                  style={{ display: 'none' }}
                  onChange={e => handleFileChange(e, 'otherDocuments')}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Declaration & Submission</div>
          {[
            { key: 'declaration', text: 'I certify that all information provided in this application is true and accurate. I understand that providing false information may result in disqualification from this scholarship program.' },
            { key: 'terms', text: 'I have read and agree to the terms and conditions of this scholarship program.' },
          ].map(item => (
            <label key={item.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14, cursor: 'pointer' }}>
              <input
                type="checkbox"
                required
                checked={agreed[item.key as keyof typeof agreed]}
                onChange={e => setAgreed(prev => ({ ...prev, [item.key]: e.target.checked }))}
                style={{ marginTop: 2, accentColor: TEAL, width: 16, height: 16, flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                {item.text} <span style={{ color: '#dc2626' }}>*</span>
              </span>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            onClick={() => router.push('/student/iskolarships')}
            style={{
              padding: '11px 24px', borderRadius: 8,
              border: '1px solid #d1d5db', background: '#fff',
              fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '11px 28px', borderRadius: 8,
              border: 'none', background: TEAL,
              fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer',
            }}
          >
            Submit Application
          </button>
        </div>

      </form>
    </div>
  );
}
