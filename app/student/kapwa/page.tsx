'use client';

import { useState } from 'react';

const TEAL = '#1D9E75';

const faqs = [
  {
    q: 'When is the deadline for scholarship applications?',
    a: 'The deadline varies per scholarship. Check the Iskolarships page for each grant\'s specific deadline. The university typically announces openings 2 weeks before the semester starts.',
  },
  {
    q: 'Can I apply for multiple scholarships at once?',
    a: 'PUP generally allows only ONE major scholarship at a time to give equal opportunity to all students. Some minor grants may allow stackability — check with OSFA or the specific sponsor.',
  },
  {
    q: 'How will I track the status of my application?',
    a: 'Go to the Status page. It updates in real time as your application moves through Submission → Review → Interview → Document Validation → Approval.',
  },
  {
    q: 'What should I do if my document upload fails?',
    a: 'Ensure the file is PDF, JPG, or PNG and under 5 MB. Use a free compressor if needed. If the problem persists, switch browsers or reach out via the Help Desk below.',
  },
  {
    q: 'What GWA is required for merit-based scholarships?',
    a: 'Most merit-based scholarships require a minimum GWA of 1.75 (on a 1.0–5.0 scale). DOST-SEI may have stricter requirements. Always check the eligibility criteria on each scholarship card.',
  },
  {
    q: 'How long does the evaluation process take?',
    a: 'Evaluation typically takes 4–8 weeks from the submission deadline. You will be notified via email and the Status page as your application progresses.',
  },
];

export default function Page() {
  const [open, setOpen] = useState<number | null>(null);
  const [formSent, setFormSent] = useState(false);

  const sideCard: React.CSSProperties = {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #e5e7eb',
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    marginBottom: 16,
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Page heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>Kapwa</h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Community help, FAQs, and OSFA contact information.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Left sidebar ── */}
        <aside>
          {/* OSFA Hotlines */}
          <div style={sideCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, fontWeight: 700, fontSize: 15, color: '#111827' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              PUP OSFA Hotlines
            </div>

            {[
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Email', lines: ['scholarship@pup.edu.ph', 'osfa@pup.edu.ph'] },
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: 'OSFA Window', lines: ['South Wing, Ground Floor', 'PUP Main Campus, Sta. Mesa'] },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: i === 0 ? 14 : 0, borderBottom: i === 0 ? '1px solid #f3f4f6' : 'none', marginBottom: i === 0 ? 14 : 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 3 }}>{item.label}</div>
                  {item.lines.map((l, li) => <div key={li} style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>{l}</div>)}
                </div>
              </div>
            ))}
          </div>

          {/* Document Guide */}
          <div style={sideCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, fontWeight: 700, fontSize: 15, color: '#111827' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              Document Guide
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#4b5563', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Formats: <strong>PDF, JPG, PNG</strong></li>
              <li>Max size: <strong>5 MB</strong> per file</li>
              <li>Text must be clear and readable</li>
              <li>Check requirements per scholarship</li>
            </ul>
          </div>
        </aside>

        {/* ── Right main area ── */}
        <div>

          {/* FAQ Accordion */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Frequently Asked Questions</h2>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Click any question to expand the answer.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {faqs.map((faq, i) => {
                const isOpen = open === i;
                return (
                  <div key={i} style={{ border: `1px solid ${isOpen ? TEAL : '#e5e7eb'}`, borderRadius: 10, overflow: 'hidden' }}>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 16px', background: isOpen ? '#f0fdf4' : '#fafafa',
                        border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: isOpen ? 700 : 500, color: isOpen ? TEAL : '#374151', lineHeight: 1.4 }}>
                        {faq.q}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke={isOpen ? TEAL : '#9ca3af'} strokeWidth="2.5"
                        style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '13px 16px', fontSize: 14, color: '#4b5563', lineHeight: 1.7, borderTop: '1px solid #d1fae5', background: '#fff' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Help Desk Form */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, marginBottom: 20, borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>OSFA Help Desk</h2>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Can&apos;t find an answer? Send a message to OSFA.</p>
              </div>
            </div>

            {formSent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.5" style={{ marginBottom: 12 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#111827' }}>Ticket submitted!</p>
                <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#6b7280' }}>We&apos;ll respond within 1–2 business days.</p>
                <button onClick={() => setFormSent(false)} style={{ padding: '8px 20px', background: TEAL, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setFormSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Subject Category</label>
                    <select required defaultValue="" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 13, background: '#fff', boxSizing: 'border-box' }}>
                      <option value="" disabled>Select a category</option>
                      <option value="application">Application Status Inquiry</option>
                      <option value="documents">Document Submission Issues</option>
                      <option value="eligibility">Scholarship Eligibility</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Student Number <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input type="text" placeholder="e.g. 2023-12345-MN-0" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Your Message</label>
                  <textarea required rows={4} placeholder="Describe your concern in detail..." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <button type="submit" style={{ alignSelf: 'flex-start', padding: '10px 28px', background: TEAL, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Submit Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
