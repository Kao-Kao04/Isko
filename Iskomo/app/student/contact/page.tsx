'use client';

import { useState } from 'react';
import Link from 'next/link';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8,
  padding: '10px 14px', fontSize: 14, color: '#111827',
  background: '#fff', boxSizing: 'border-box', outline: 'none',
};

export default function StudentContactPage() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields.'); return;
    }
    setSending(true); setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim() || undefined, message: message.trim() }),
      });
      if (!res.ok) throw new Error('Server error');
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/student/applications" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none', fontWeight: 500, marginBottom: 16 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Applications
        </Link>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Contact OSFA</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Send a general inquiry to the Office of Scholarship and Financial Assistance.</p>
      </div>

      {/* Contact info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          {
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
            label: 'Email', value: 'osfa@pup.edu.ph',
            href: 'mailto:osfa@pup.edu.ph',
            hint: 'Tap to email',
          },
          {
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 0 1 8-8z"/></svg>,
            label: 'Location', value: 'OSFA Office, PUP Main',
            href: 'https://maps.google.com/?q=Polytechnic+University+of+the+Philippines+Manila',
            hint: 'Open in Maps',
          },
          {
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            label: 'Hours', value: 'Mon–Fri, 8AM–5PM',
            href: null, hint: null,
          },
        ].map(c => (
          c.href ? (
            <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
              style={{ background: '#fff', borderRadius: 12, border: `1px solid #e5e7eb`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = `${M}50`; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 2px 8px rgba(0,0,0,0.07)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginTop: 2 }}>{c.value}</div>
                {c.hint && <div style={{ fontSize: 10, color: M, fontWeight: 600, marginTop: 2 }}>{c.hint} ↗</div>}
              </div>
            </a>
          ) : (
            <div key={c.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginTop: 2 }}>{c.value}</div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Also have an application? */}
      <div style={{ background: '#fef2f2', border: `1px solid #fecaca`, borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
          <strong>Have an existing application?</strong> You can message OSFA directly through your{' '}
          <Link href="/student/applications" style={{ color: M, fontWeight: 700, textDecoration: 'none' }}>application page</Link>{' '}
          for faster, application-specific responses.
        </div>
      </div>

      {/* Form */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '28px 32px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Send a Message</h2>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Message sent!</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>We'll respond to <strong>{email}</strong> within 3–5 business days.</div>
            <button onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
              style={{ padding: '10px 24px', background: M, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="email" style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Subject</label>
                <input style={inp} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Question about scholarship requirements" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message <span style={{ color: '#dc2626' }}>*</span></label>
                <textarea rows={5} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message here…" required />
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>{error}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={sending}
                style={{ padding: '11px 28px', background: sending ? '#9ca3af' : M, border: 'none', borderRadius: 9, color: '#fff', fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                {sending ? (
                  <>
                    <div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Sending…
                  </>
                ) : 'Send Message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
