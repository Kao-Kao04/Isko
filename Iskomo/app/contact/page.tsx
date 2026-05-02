import Link from 'next/link';
import { COLORS } from '@/lib/theme';

const MAROON = COLORS.maroon;
const GOLD   = COLORS.gold;

export default function ContactPage() {
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: -36, marginBottom: 48 }}>
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
      <div style={{ background: '#0d0d0d', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          &copy; 2025 IskoMo — Polytechnic University of the Philippines · OSFA
        </p>
      </div>
    </div>
  );
}
