'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const TEAL = '#1D9E75';
const TEAL_DARK = '#178a64';

const inp: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  color: '#111827',
  background: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
};

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const req = <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>;

const collegePrograms: Record<string, string[]> = {
  CAF:   ['BS Accountancy', 'BS Internal Auditing', 'BS Management Accounting'],
  CADBE: ['BS Architecture', 'BS Interior Design', 'Bachelor of Landscape Architecture'],
  CAL:   ['AB Communication Arts', 'AB English Language Studies', 'AB Filipino', 'AB Literature in English'],
  CBA:   ['BS Business Administration – Business Economics', 'BS Business Administration – Financial Management', 'BS Business Administration – Human Resource Development Management', 'BS Business Administration – Marketing Management', 'BS Business Administration – Operations Management'],
  COC:   ['BA Communication – Broadcasting', 'BA Communication – Journalism', 'BA Communication – Media Studies'],
  CCIS:  ['BS Computer Science', 'BS Information Technology', 'BS Information Systems'],
  COED:  ['Bachelor of Elementary Education', 'Bachelor of Secondary Education', 'Bachelor of Early Childhood Education'],
  CE:    ['BS Chemical Engineering', 'BS Civil Engineering', 'BS Electrical Engineering', 'BS Electronics Engineering', 'BS Industrial Engineering', 'BS Mechanical Engineering'],
  CHK:   ['BS Exercise and Sports Science', 'Bachelor of Physical Education'],
  CL:    ['Juris Doctor'],
  CPSPA: ['AB Political Science', 'BS Public Administration'],
  CSSD:  ['BS Social Work', 'AB Sociology', 'BS Economics'],
  CS:    ['BS Applied Physics', 'BS Biology', 'BS Chemistry', 'BS Mathematics', 'BS Statistics'],
  CTHTM: ['BS Hotel and Restaurant Management', 'BS Tourism Management', 'BS Transportation Management'],
  ITECH: ['BS Industrial Technology'],
};

const colleges = [
  { value: 'CAF',   label: 'College of Accountancy and Finance (CAF)' },
  { value: 'CADBE', label: 'College of Architecture, Design and the Built Environment (CADBE)' },
  { value: 'CAL',   label: 'College of Arts and Letters (CAL)' },
  { value: 'CBA',   label: 'College of Business Administration (CBA)' },
  { value: 'COC',   label: 'College of Communication (COC)' },
  { value: 'CCIS',  label: 'College of Computer and Information Sciences (CCIS)' },
  { value: 'COED',  label: 'College of Education (COED)' },
  { value: 'CE',    label: 'College of Engineering (CE)' },
  { value: 'CHK',   label: 'College of Human Kinetics (CHK)' },
  { value: 'CL',    label: 'College of Law (CL)' },
  { value: 'CPSPA', label: 'College of Political Science and Public Administration (CPSPA)' },
  { value: 'CSSD',  label: 'College of Social Sciences and Development (CSSD)' },
  { value: 'CS',    label: 'College of Science (CS)' },
  { value: 'CTHTM', label: 'College of Tourism, Hospitality and Transportation Management (CTHTM)' },
  { value: 'ITECH', label: 'Institute of Technology (ITECH)' },
];

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: '#e8faf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{title}</span>
    </div>
  );
}

function ToggleGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: '9px 18px',
            borderRadius: 10,
            border: `1.5px solid ${value === opt ? TEAL : '#e5e7eb'}`,
            background: value === opt ? '#e8faf4' : '#fff',
            color: value === opt ? TEAL : '#6b7280',
            fontWeight: value === opt ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function Page() {
  const [gender, setGender] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('');
  const [college, setCollege] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const programs = college ? collegePrograms[college] ?? [] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '48px 32px', background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', maxWidth: 440 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8faf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#111827' }}>Account Created!</h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
            Your IskoMo account has been submitted for review. You&apos;ll receive an email once your profile is verified.
          </p>
          <Link href="/login" style={{ display: 'inline-block', padding: '12px 32px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>

      {/* ── Left Panel ── */}
      <div style={{
        width: 360,
        flexShrink: 0,
        background: `linear-gradient(160deg, ${TEAL} 0%, ${TEAL_DARK} 55%, #0f6b4f 100%)`,
        display: 'flex',
        flexDirection: 'column',
        padding: '44px 36px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', top: '40%', right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
                alt="IskoMo"
                width={26}
                height={26}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>IskoMo</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Scholarship Platform</div>
            </div>
          </div>

          <h2 style={{ margin: '0 0 14px', fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            Start your scholarship journey today.
          </h2>
          <p style={{ margin: '0 0 36px', fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
            Create your IskoMo account and gain access to hundreds of scholarship opportunities made for Filipino students.
          </p>

          {/* Features */}
          {[
            'Find scholarships that match your profile',
            'Track your application status in real time',
            'Secure document submission & storage',
            'Connect with OSFA and scholarship sponsors',
          ].map((feat) => (
            <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '44px 52px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#111827' }}>Create Your Account</h1>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
              Fill in your details below to register as an IskoMo student.
              Already have an account?{' '}
              <Link href="/login" style={{ color: TEAL, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── A: Personal Identity ── */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <SectionHeader
                title="Personal Identity"
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                }
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                <div>
                  <label style={lbl}>First Name {req}</label>
                  <input type="text" style={inp} placeholder="Juan" required />
                </div>
                <div>
                  <label style={lbl}>Middle Name</label>
                  <input type="text" style={inp} placeholder="Santos" />
                </div>
                <div>
                  <label style={lbl}>Last Name {req}</label>
                  <input type="text" style={inp} placeholder="Dela Cruz" required />
                </div>
                <div>
                  <label style={lbl}>Date of Birth {req}</label>
                  <input type="date" style={inp} required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Sex {req}</label>
                  <ToggleGroup options={['Male', 'Female', 'Prefer not to say']} value={gender} onChange={setGender} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Mobile Number {req}</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ ...inp, width: 100, flexShrink: 0, display: 'flex', alignItems: 'center', background: '#f9fafb', color: '#374151', fontWeight: 600, fontSize: 13 }}>
                      🇵🇭 +63
                    </div>
                    <input type="tel" style={{ ...inp, flex: 1 }} placeholder="9xxxxxxxxx" pattern="9\d{9}" maxLength={10} required />
                  </div>
                </div>
              </div>
            </div>

            {/* ── B: Academic Information ── */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <SectionHeader
                title="PUP Academic Information"
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                }
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                <div>
                  <label style={lbl}>Student Number {req}</label>
                  <input type="text" style={inp} placeholder="2023-12345-MN-0" pattern="\d{4}-\d{5}-[A-Za-z]{2}-\d" maxLength={15} required />
                </div>
                <div>
                  <label style={lbl}>Campus</label>
                  <input type="text" style={{ ...inp, background: '#f9fafb', color: '#6b7280', cursor: 'not-allowed' }} value="PUP Sta. Mesa" readOnly />
                </div>

                {/* College */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>College / Institute {req}</label>
                  <select
                    style={inp}
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  >
                    <option value="">Select College / Institute</option>
                    {colleges.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Program — enabled only after college is chosen */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Program / Course {req}</label>
                  <select
                    style={{
                      ...inp,
                      background: college ? '#fff' : '#f9fafb',
                      color: college ? '#111827' : '#9ca3af',
                      cursor: college ? 'pointer' : 'not-allowed',
                    }}
                    required
                    disabled={!college}
                    defaultValue=""
                    key={college}
                  >
                    <option value="" disabled>
                      {college ? 'Select Program / Course' : 'Select a college first'}
                    </option>
                    {programs.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {!college && (
                    <p style={{ margin: '5px 0 0', fontSize: 11, color: '#9ca3af' }}>Choose a college above to unlock this field.</p>
                  )}
                </div>

                {/* Year Level */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Year Level {req}</label>
                  <ToggleGroup
                    options={['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Irregular']}
                    value={yearLevel}
                    onChange={setYearLevel}
                  />
                </div>

                <div>
                  <label style={lbl}>Section / Block {req}</label>
                  <input type="text" style={inp} placeholder="e.g., 3-1" required />
                </div>
                <div>
                  <label style={lbl}>Academic Year {req}</label>
                  <input type="text" style={inp} placeholder="e.g., 2025–2026" required />
                </div>

                {/* Semester */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Semester {req}</label>
                  <ToggleGroup options={['1st Semester', '2nd Semester', 'Summer']} value={semester} onChange={setSemester} />
                </div>
              </div>
            </div>

            {/* ── C: Family Details ── */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <SectionHeader
                title="Family Details"
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                }
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                <div>
                  <label style={lbl}>Father&apos;s Name {req}</label>
                  <input type="text" style={inp} placeholder="Full name" required />
                </div>
                <div>
                  <label style={lbl}>Father&apos;s Occupation {req}</label>
                  <input type="text" style={inp} placeholder="Occupation" required />
                </div>
                <div>
                  <label style={lbl}>Mother&apos;s Name {req}</label>
                  <input type="text" style={inp} placeholder="Full name" required />
                </div>
                <div>
                  <label style={lbl}>Mother&apos;s Occupation {req}</label>
                  <input type="text" style={inp} placeholder="Occupation" required />
                </div>
                <div>
                  <label style={lbl}>Annual Gross Income {req}</label>
                  <select style={inp} required defaultValue="">
                    <option value="" disabled>Select income bracket</option>
                    <option value="Below 120,000">Below ₱120,000</option>
                    <option value="120,000 - 240,000">₱120,000 – ₱240,000</option>
                    <option value="240,001 - 480,000">₱240,001 – ₱480,000</option>
                    <option value="480,001 - 720,000">₱480,001 – ₱720,000</option>
                    <option value="Above 720,000">Above ₱720,000</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Number of Siblings {req}</label>
                  <input type="number" style={inp} min="0" placeholder="0" required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Guardian&apos;s Name {req}</label>
                  <input type="text" style={inp} placeholder="Full name" required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Guardian&apos;s Contact Number {req}</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ ...inp, width: 100, flexShrink: 0, display: 'flex', alignItems: 'center', background: '#f9fafb', color: '#374151', fontWeight: 600, fontSize: 13 }}>
                      🇵🇭 +63
                    </div>
                    <input type="tel" style={{ ...inp, flex: 1 }} placeholder="9xxxxxxxxx" pattern="9\d{9}" maxLength={10} required />
                  </div>
                </div>
              </div>
            </div>

            {/* ── D: Documents ── */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <SectionHeader
                title="Required Documents"
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                }
              />
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: '1px solid #e5e7eb' }}>
                {['PUP ID (Front)', 'Certificate of Registration (Latest Semester)', 'Grade Slip (Latest Term)'].map((doc) => (
                  <div key={doc} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151' }}>{doc}</span>
                  </div>
                ))}
              </div>
              <div style={{ border: '2px dashed #d1d5db', borderRadius: 12, padding: '36px 24px', textAlign: 'center', background: '#fafafa', cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e8faf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#374151' }}>Drag and drop files here</p>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>PDF, JPG, or PNG — max 10 MB each</p>
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${TEAL}50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Complete Registration
            </button>

            <p style={{ margin: '0 0 40px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
              By registering you agree to our{' '}
              <Link href="/terms" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
