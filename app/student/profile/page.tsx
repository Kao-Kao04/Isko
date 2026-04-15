'use client';

import { useRef, useState } from 'react';

const TEAL = '#1D9E75';

const mockDocs = [
  { name: 'Certificate_of_Enrollment.pdf', date: 'Feb 10, 2025', size: '1.2 MB' },
  { name: 'Transcript_of_Records.pdf',     date: 'Feb 10, 2025', size: '3.4 MB' },
  { name: 'Income_Certificate.pdf',        date: 'Jan 28, 2025', size: '0.8 MB' },
];

const input: React.CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 13,
  color: '#111827',
  background: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export default function Page() {
  const [docs, setDocs] = useState(mockDocs);
  const [saved, setSaved] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newDocs = files.map((f) => ({
      name: f.name,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
    }));
    setDocs((prev) => [...prev, ...newDocs]);
    e.target.value = '';
  };

  const removeDoc = (index: number) => {
    setDocs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>

      {/* ── Avatar + Upload ── */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff', border: '3px solid #d1fae5' }}>
            ME
          </div>
          <button
            onClick={() => photoInputRef.current?.click()}
            title="Upload photo"
            style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '2px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} />
        </div>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#111827' }}>My Profile</h2>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>BS in Information Technology · 3rd Year · PUP Main</p>
          <button
            onClick={() => photoInputRef.current?.click()}
            style={{ padding: '7px 16px', border: `1.5px solid ${TEAL}`, borderRadius: 8, background: '#fff', color: TEAL, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload Photo
          </button>
        </div>
      </div>

      {/* ── Profile Edit Form ── */}
      <form onSubmit={handleSave}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#111827', paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
            Personal Information
          </h3>

          {/* 2-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            <div>
              <label style={label}>First Name</label>
              <input type="text" defaultValue="Juan" style={input} />
            </div>
            <div>
              <label style={label}>Last Name</label>
              <input type="text" defaultValue="Dela Cruz" style={input} />
            </div>
            <div>
              <label style={label}>Student Number</label>
              <input type="text" defaultValue="2021-12345-MN-0" style={input} />
            </div>
            <div>
              <label style={label}>Email Address</label>
              <input type="email" defaultValue="juan.delacruz@iskomo.com" style={input} />
            </div>
            <div>
              <label style={label}>Program / Course</label>
              <select defaultValue="bsit" style={input}>
                <option value="bsit">BS Information Technology</option>
                <option value="bscs">BS Computer Science</option>
                <option value="bsis">BS Information Systems</option>
                <option value="bsee">BS Electrical Engineering</option>
                <option value="bsme">BS Mechanical Engineering</option>
              </select>
            </div>
            <div>
              <label style={label}>Year Level</label>
              <select defaultValue="3" style={input}>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={label}>Contact Number</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select defaultValue="+63" style={{ ...input, width: 90, flexShrink: 0 }}>
                  <option value="+63">🇵🇭 +63</option>
                </select>
                <input type="tel" defaultValue="912 345 6789" style={{ ...input, flex: 1 }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Document Vault ── */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Document Vault</h3>
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              style={{ padding: '7px 14px', background: TEAL, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Upload Document
            </button>
            <input ref={docInputRef} type="file" accept=".pdf,.jpg,.png" multiple style={{ display: 'none' }} onChange={handleDocUpload} />
          </div>

          {docs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ marginBottom: 10 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <p style={{ margin: 0, fontSize: 13 }}>No documents uploaded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {docs.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Uploaded {doc.date} · {doc.size}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDoc(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, display: 'flex', alignItems: 'center' }}
                    title="Remove"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Save Button ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="submit"
            style={{ padding: '11px 32px', background: TEAL, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: `0 2px 8px ${TEAL}55` }}
          >
            Save Changes
          </button>
          {saved && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: TEAL }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
