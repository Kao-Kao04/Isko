'use client';

import { useState } from 'react';
import Link from 'next/link';
import { COLORS } from '@/lib/theme';

const MAROON = COLORS.maroon;
const GOLD   = COLORS.gold;

const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8,
  padding: '10px 14px', fontSize: 14, color: '#111827',
  background: '#fff', boxSizing: 'border-box', outline: 'none',
};

export default function ContactPage() {
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
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #5C0000, ${MAROON})`, padding: '64px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', border: '1px solid rgba(201,160,39,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28, fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Home
          </Link>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
            Get In Touch
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
            Contact Us
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.60)', margin: '0 auto', maxWidth: 480, lineHeight: 1.75 }}>
            Have questions about IskoMo or scholarship applications? We&apos;re here to help.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
        {/* Contact cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: 40, marginBottom: 48 }}>
          {[
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
              title: 'Email Us',
              value: 'contact@iskomo.ph',
              note: 'For general inquiries and support',
              href: 'mailto:contact@iskomo.ph',
            },
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
              title: 'Visit Us',
              value: 'PUP Main Campus',
              note: 'Sta. Mesa, Manila · OSFA Office',
              href: 'https://maps.google.com/?q=Polytechnic+University+of+the+Philippines',
            },
            {
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
              title: 'Office Hours',
              value: 'Mon – Fri, 8AM–5PM',
              note: 'Response within 3–5 business days',
              href: null,
            },
          ].map(card => (
            <div key={card.title} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${MAROON}, #5C0000)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {card.icon}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{card.title}</div>
              {card.href ? (
                <a href={card.href} style={{ fontSize: 15, fontWeight: 700, color: MAROON, textDecoration: 'none', display: 'block', marginBottom: 4 }}>{card.value}</a>
              ) : (
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{card.value}</div>
              )}
              <div style={{ fontSize: 13, color: '#9ca3af' }}>{card.note}</div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '36px 40px', marginBottom: 48, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Send us a message</h2>
          <p style={{ margin: '0 0 28px', fontSize: 13, color: '#6b7280' }}>Fill in the form below and we&apos;ll get back to you within 3–5 business days.</p>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Message sent!</div>
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Thanks for reaching out. We&apos;ll respond to <strong>{email}</strong> within 3–5 business days.</div>
              <button onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
                style={{ padding: '10px 24px', background: MAROON, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Full Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Juan dela Cruz" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Email Address <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input type="email" style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@example.com" required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Subject
                  </label>
                  <input style={inp} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Scholarship application question" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Message <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea rows={5} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message here…" required />
                </div>
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={sending}
                  style={{ padding: '11px 28px', background: sending ? '#9ca3af' : MAROON, border: 'none', borderRadius: 9, color: '#fff', fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {sending ? (
                    <>
                      <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Sending…
                    </>
                  ) : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* About OSFA */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '36px 40px', marginBottom: 48, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>About OSFA</h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, margin: '0 0 20px' }}>
            The Office of Scholarship and Financial Assistance (OSFA) at the Polytechnic University of the Philippines – Main Campus
            is the official office that manages all scholarship programs for PUP Main students. IskoMo is the official digital
            portal of OSFA for scholarship management, application processing, and student communication.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ padding: '9px 18px', border: `1.5px solid ${MAROON}`, borderRadius: 8, color: MAROON, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ padding: '9px 18px', border: `1.5px solid ${MAROON}`, borderRadius: 8, color: MAROON, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              Terms & Conditions
            </Link>
            <Link href="/" style={{ padding: '9px 18px', background: MAROON, borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ background: '#0d0d0d', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          &copy; 2025 IskoMo — Polytechnic University of the Philippines · OSFA
        </p>
      </div>
    </div>
  );
}
