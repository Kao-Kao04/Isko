'use client';

import { useRef, useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';
import { PUP_COLLEGE_PROGRAMS } from '@/lib/data/colleges';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

const M  = COLORS.maroon;
const MD = COLORS.maroonD;

const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' };
const inp: React.CSSProperties = { width: '100%', border: '1.5px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#111827', background: '#fff', boxSizing: 'border-box', outline: 'none' };
const sel: React.CSSProperties = { ...inp, cursor: 'pointer', background: '#fff' };

const INCOME_RANGES = ['Below ₱5,000','₱5,000 – ₱9,999','₱10,000 – ₱14,999','₱15,000 – ₱19,999','₱20,000 – ₱29,999','₱30,000 – ₱49,999','₱50,000 – ₱99,999','₱100,000 and above'];

function yearLabel(y: number | undefined) {
  if (!y) return '—';
  return ['1st Year','2nd Year','3rd Year','4th Year','5th Year'][y - 1] ?? `${y}th Year`;
}

export default function Page() {
  const { user, loading, refresh } = useCurrentUser() as { user: any; loading: boolean; refresh?: () => void };
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);
  const [err,    setErr]      = useState('');
  const [editing, setEditing] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('profile_photo');
    return null;
  });

  // GWA request
  const [gwaInput,      setGwaInput]      = useState('');
  const [gwaProof,      setGwaProof]      = useState<File | null>(null);
  const [gwaSubmitting, setGwaSubmitting] = useState(false);
  const [gwaErr,        setGwaErr]        = useState('');
  const [gwaSaved,      setGwaSaved]      = useState(false);
  // Editable profile fields
  const [firstName,      setFirstName]      = useState('');
  const [lastName,       setLastName]       = useState('');
  const [middleName,     setMiddleName]     = useState('');
  const [studentNumber,  setStudentNumber]  = useState('');
  const [college,        setCollege]        = useState('');
  const [program,        setProgram]        = useState('');
  const [yearLevel,      setYearLevel]      = useState('');
  const [street,         setStreet]         = useState('');
  const [city,           setCity]           = useState('');
  const [province,       setProvince]       = useState('');
  const [zip,            setZip]            = useState('');
  const [fatherName,     setFatherName]     = useState('');
  const [fatherOcc,      setFatherOcc]      = useState('');
  const [motherName,     setMotherName]     = useState('');
  const [motherOcc,      setMotherOcc]      = useState('');
  const [incomeSource,   setIncomeSource]   = useState('');
  const [monthlyIncome,  setMonthlyIncome]  = useState('');

  const p = user?.student_profile;
  const isAcademicLocked = user?.account_status === 'pending_verification' || user?.account_status === 'verified';
  const colleges = Object.keys(PUP_COLLEGE_PROGRAMS);
  const programs = college ? (PUP_COLLEGE_PROGRAMS as Record<string, string[]>)[college] ?? [] : [];

  const hasChanges = editing && (
    firstName !== (p?.first_name ?? '') || lastName !== (p?.last_name ?? '') ||
    college !== (p?.college ?? '') || program !== (p?.program ?? '') ||
    yearLevel !== String(p?.year_level ?? '')
  );
  useUnsavedChanges(hasChanges);

  function populate() {
    if (!p) return;
    setFirstName(p.first_name ?? ''); setLastName(p.last_name ?? ''); setMiddleName(p.middle_name ?? '');
    setStudentNumber(p.student_number ?? ''); setCollege(p.college ?? ''); setProgram(p.program ?? '');
    setYearLevel(String(p.year_level ?? '')); setStreet(p.street_barangay ?? ''); setCity(p.city_municipality ?? '');
    setProvince(p.province ?? ''); setZip(p.zip_code ?? ''); setFatherName(p.father_name ?? '');
    setFatherOcc(p.father_occupation ?? ''); setMotherName(p.mother_name ?? ''); setMotherOcc(p.mother_occupation ?? '');
    setIncomeSource(p.income_source ?? ''); setMonthlyIncome(p.monthly_income ?? '');
  }

  useEffect(() => { populate(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    setSaving(true);
    try {
      await apiFetch('/api/users/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: firstName || undefined, last_name: lastName || undefined,
          middle_name: middleName || undefined, student_number: studentNumber || undefined,
          ...(isAcademicLocked ? {} : {
            college: college || undefined, program: program || undefined,
            year_level: yearLevel ? Number(yearLevel) : undefined,
          }),
          street_barangay: street || undefined, city_municipality: city || undefined,
          province: province || undefined, zip_code: zip || undefined,
          father_name: fatherName || undefined, father_occupation: fatherOcc || undefined,
          mother_name: motherName || undefined, mother_occupation: motherOcc || undefined,
          income_source: incomeSource || undefined, monthly_income: monthlyIncome || undefined,
        }),
      });
      setSaved(true); setEditing(false);
      setTimeout(() => setSaved(false), 3000);
      if ((window as any).__refreshCurrentUser) (window as any).__refreshCurrentUser();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  }

  function handleCancel() {
    populate(); setEditing(false); setErr('');
  }

  const initials = p ? `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() : '??';

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ width: 36, height: 36, border: `3px solid #f3f4f6`, borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <style>{`.prof-inp:focus { border-color: ${M} !important; box-shadow: 0 0 0 3px ${M}18 !important; }`}</style>

      {/* Avatar card */}
      <div style={{ background: `linear-gradient(135deg, ${M} 0%, ${MD} 60%, #C9A027 100%)`, borderRadius: 18, padding: '28px 28px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', border: '3px solid rgba(255,255,255,0.35)', overflow: 'hidden' }}>
              {photoPreview
                ? <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <button onClick={() => photoInputRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  const dataUrl = ev.target?.result as string;
                  setPhotoPreview(dataUrl);
                  localStorage.setItem('profile_photo', dataUrl);
                };
                reader.readAsDataURL(file);
              }}
            />
            <p style={{ margin: '6px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center', width: 80 }}>Device only</p>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#fff' }}>
              {p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : 'My Profile'}
            </h2>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{p?.program ?? '—'} · {yearLabel(p?.year_level)}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{user?.email ?? ''}</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)}
              style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave}>
        {isAcademicLocked && editing && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 9, fontSize: 13, color: '#92400e' }}>
            College, program, and year level are locked once verification has started. Contact OSFA to request changes.
          </div>
        )}
        {err && !err.includes('college') && !err.includes('program') && !err.includes('year_level') && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, fontSize: 13, color: '#dc2626' }}>{err}</div>
        )}

        {/* Personal Info */}
        <div style={{ background: '#fff', borderRadius: 16, border: `1.5px solid ${editing ? M + '40' : '#e2e8f0'}`, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'border-color 0.2s' }}>
          <div style={{ background: '#f8fafc', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Personal Information</h3>
            {editing && <span style={{ fontSize: 11, fontWeight: 700, color: M, background: '#fff5f5', padding: '3px 10px', borderRadius: 20 }}>Editing</span>}
          </div>
          <div style={{ padding: '20px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px 20px' }}>
            {[
              { label: 'First Name *', val: firstName, set: setFirstName },
              { label: 'Last Name *',  val: lastName,  set: setLastName  },
              { label: 'Middle Name',  val: middleName, set: setMiddleName },
              { label: 'Student Number', val: studentNumber, set: setStudentNumber },
            ].map(f => (
              <div key={f.label}>
                <label style={lbl}>{f.label}</label>
                {editing
                  ? <input className="prof-inp" style={inp} value={f.val} onChange={e => f.set(e.target.value)} />
                  : <div style={{ ...inp, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>{f.val || '—'}</div>
                }
              </div>
            ))}
            <div>
              <label style={lbl}>College * {isAcademicLocked && <span style={{ fontSize: 10, color: '#d97706', fontWeight: 600 }}>🔒 Locked</span>}</label>
              {editing && !isAcademicLocked
                ? <select className="prof-inp" style={sel} value={college} onChange={e => { setCollege(e.target.value); setProgram(''); }}>
                    <option value="">Select college…</option>
                    {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                : <div style={{ ...inp, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>{college || '—'}</div>
              }
            </div>
            <div>
              <label style={lbl}>Program * {isAcademicLocked && <span style={{ fontSize: 10, color: '#d97706', fontWeight: 600 }}>🔒 Locked</span>}</label>
              {editing && !isAcademicLocked
                ? <select className="prof-inp" style={sel} value={program} onChange={e => setProgram(e.target.value)} disabled={!college}>
                    <option value="">Select program…</option>
                    {programs.map(pr => <option key={pr} value={pr}>{pr}</option>)}
                  </select>
                : <div style={{ ...inp, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>{program || '—'}</div>
              }
            </div>
            <div>
              <label style={lbl}>Year Level * {isAcademicLocked && <span style={{ fontSize: 10, color: '#d97706', fontWeight: 600 }}>🔒 Locked</span>}</label>
              {editing && !isAcademicLocked
                ? <select className="prof-inp" style={sel} value={yearLevel} onChange={e => setYearLevel(e.target.value)}>
                    <option value="">Select year…</option>
                    {['1st Year','2nd Year','3rd Year','4th Year','5th Year'].map((y, i) => <option key={i+1} value={i+1}>{y}</option>)}
                  </select>
                : <div style={{ ...inp, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>{yearLabel(p?.year_level)}</div>
              }
            </div>
          </div>
        </div>

        {/* Address */}
        <div style={{ background: '#fff', borderRadius: 16, border: `1.5px solid ${editing ? M + '40' : '#e2e8f0'}`, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'border-color 0.2s' }}>
          <div style={{ background: '#f8fafc', padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Address</h3>
          </div>
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px 20px' }}>
            {[
              { label: 'Street & Barangay', val: street, set: setStreet, span: true },
              { label: 'City / Municipality', val: city, set: setCity },
              { label: 'Province', val: province, set: setProvince },
              { label: 'Zip Code', val: zip, set: setZip },
            ].map(f => (
              <div key={f.label} style={f.span ? { gridColumn: '1 / -1' } : {}}>
                <label style={lbl}>{f.label}</label>
                {editing
                  ? <input className="prof-inp" style={inp} value={f.val} onChange={e => f.set(e.target.value)} />
                  : <div style={{ ...inp, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>{f.val || '—'}</div>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Parents & Income */}
        <div style={{ background: '#fff', borderRadius: 16, border: `1.5px solid ${editing ? M + '40' : '#e2e8f0'}`, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'border-color 0.2s' }}>
          <div style={{ background: '#f8fafc', padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Parent / Guardian & Family Income</h3>
          </div>
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px 20px' }}>
            {[
              { label: "Father's Name",       val: fatherName, set: setFatherName },
              { label: "Father's Occupation", val: fatherOcc,  set: setFatherOcc  },
              { label: "Mother's Name",       val: motherName, set: setMotherName },
              { label: "Mother's Occupation", val: motherOcc,  set: setMotherOcc  },
              { label: 'Source of Income',    val: incomeSource, set: setIncomeSource },
            ].map(f => (
              <div key={f.label}>
                <label style={lbl}>{f.label}</label>
                {editing
                  ? <input className="prof-inp" style={inp} value={f.val} onChange={e => f.set(e.target.value)} />
                  : <div style={{ ...inp, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>{f.val || '—'}</div>
                }
              </div>
            ))}
            <div>
              <label style={lbl}>Monthly Family Income</label>
              {editing
                ? <select className="prof-inp" style={sel} value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)}>
                    <option value="">Select range…</option>
                    {INCOME_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                : <div style={{ ...inp, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>{monthlyIncome || '—'}</div>
              }
            </div>
          </div>
        </div>

        {/* GWA */}
        {(() => {
          const gwaStatus = p?.gwa_request_status;
          const statusBadge =
            gwaStatus === 'pending'  ? { label: '⏳ Pending Verification', bg: '#fffbeb', color: '#d97706', border: '#fcd34d' } :
            gwaStatus === 'approved' ? { label: '✓ Verified',             bg: '#f0fdf4', color: '#15803d', border: '#86efac' } :
            gwaStatus === 'rejected' ? { label: '✗ Not Approved',         bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' } :
            null;

          async function submitGwaRequest(e: React.FormEvent) {
            e.preventDefault();
            if (!gwaInput.trim() || !gwaProof) { setGwaErr('Please enter your GWA and upload your SIS screenshot.'); return; }
            const val = parseFloat(gwaInput);
            if (isNaN(val) || val < 1.0 || val > 5.0) { setGwaErr('GWA must be between 1.0 and 5.0.'); return; }
            setGwaErr(''); setGwaSubmitting(true);
            try {
              const { userApi } = await import('@/lib/api-client');
              await userApi.submitGwaRequest(gwaInput.trim(), gwaProof);
              setGwaSaved(true); setGwaInput(''); setGwaProof(null);
              setTimeout(() => setGwaSaved(false), 4000);
              if ((window as any).__refreshCurrentUser) (window as any).__refreshCurrentUser();
            } catch (err) { setGwaErr(err instanceof Error ? err.message : 'Failed to submit.'); }
            finally { setGwaSubmitting(false); }
          }

          return (
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', overflow: 'hidden', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ background: '#f8fafc', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>General Weighted Average (GWA)</h3>
              </div>
              <div style={{ padding: '20px' }}>
                {/* Current GWA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Current GWA</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{p?.gwa ?? '—'}</div>
                  </div>
                  {statusBadge && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: statusBadge.bg, color: statusBadge.color, border: `1px solid ${statusBadge.border}` }}>
                      {statusBadge.label}
                    </span>
                  )}
                </div>

                {gwaStatus === 'pending' && (
                  <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 9, fontSize: 13, color: '#92400e', marginBottom: 14 }}>
                    GWA update to <strong>{p?.pending_gwa}</strong> is pending OSFA verification.
                  </div>
                )}
                {gwaStatus === 'rejected' && p?.gwa_rejection_remarks && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 9, fontSize: 13, color: '#dc2626', marginBottom: 14 }}>
                    <strong>Rejected:</strong> {p.gwa_rejection_remarks}
                  </div>
                )}

                {/* Submit new GWA request (hide if pending) */}
                {gwaStatus !== 'pending' && (
                  <form onSubmit={submitGwaRequest}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
                      {gwaStatus === 'rejected' ? 'Resubmit GWA Update' : 'Submit GWA Update'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, marginBottom: 10 }}>
                      <div>
                        <label style={lbl}>New GWA</label>
                        <input type="number" step="0.01" min="1.0" max="5.0"
                          style={inp} value={gwaInput} onChange={e => setGwaInput(e.target.value)} placeholder="e.g. 1.75" />
                      </div>
                      <div>
                        <label style={lbl}>SIS Screenshot <span style={{ color: M }}>*</span></label>
                        <input type="file" accept="image/*,application/pdf"
                          onChange={e => setGwaProof(e.target.files?.[0] ?? null)}
                          style={{ ...inp, padding: '6px 10px', fontSize: 12 }} />
                      </div>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                      Upload a screenshot of your grades from PUP SIS. OSFA will verify before updating your GWA.
                    </p>
                    {gwaErr && <p style={{ margin: '0 0 10px', fontSize: 12, color: '#dc2626' }}>{gwaErr}</p>}
                    {gwaSaved && <p style={{ margin: '0 0 10px', fontSize: 12, color: '#15803d', fontWeight: 600 }}>✓ Submitted! Waiting for OSFA verification.</p>}
                    <button type="submit" disabled={gwaSubmitting}
                      style={{ padding: '9px 20px', background: gwaSubmitting ? '#9ca3af' : M, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: gwaSubmitting ? 'not-allowed' : 'pointer' }}>
                      {gwaSubmitting ? 'Submitting…' : 'Submit for Verification'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })()}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {editing ? (
            <>
              <button type="submit" disabled={saving}
                style={{ padding: '11px 28px', background: saving ? '#9ca3af' : `linear-gradient(135deg, ${M}, ${MD})`, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : `0 3px 12px ${M}40` }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" onClick={handleCancel}
                style={{ padding: '11px 20px', background: '#fff', border: '1.5px solid #e5e7eb', color: '#374151', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="submit" disabled={saving}
                style={{ padding: '11px 28px', background: saving ? '#9ca3af' : `linear-gradient(135deg, ${M}, ${MD})`, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : `0 3px 12px ${M}40` }}>
                {saving ? 'Saving…' : 'Update GWA'}
              </button>
              <button type="button" onClick={() => setEditing(true)}
                style={{ padding: '11px 20px', background: '#fff', border: `1.5px solid ${M}`, color: M, borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Edit Profile
              </button>
            </>
          )}
          {saved && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#15803d', background: '#f0fdf4', padding: '8px 16px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
