'use client';

import Link from 'next/link';
import { useState } from 'react';

const MAROON = '#800000';
const MAROON_D = '#5C0000';
const GOLD = '#C9A027';

const SECTIONS = [
  { id: 'acceptance',           label: '1. Acceptance of Terms' },
  { id: 'eligibility',          label: '2. Eligibility' },
  { id: 'user-accounts',        label: '3. User Accounts' },
  { id: 'acceptable-use',       label: '4. Acceptable Use' },
  { id: 'intellectual-property',label: '5. Intellectual Property' },
  { id: 'disclaimer',           label: '6. Disclaimer of Warranties' },
  { id: 'limitation-liability', label: '7. Limitation of Liability' },
  { id: 'termination',          label: '8. Termination' },
  { id: 'governing-law',        label: '9. Governing Law' },
  { id: 'changes-terms',        label: '10. Changes to Terms' },
  { id: 'contact-terms',        label: '11. Contact Us' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function TermsPage() {
  const [activeId, setActiveId] = useState('acceptance');

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-content { max-width: 100% !important; margin: 0 !important; }
          body { background: white !important; }
        }
        .nav-link:hover { color: #800000 !important; background: #fff5f5 !important; }
        .section-card { scroll-margin-top: 88px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

        {/* Header */}
        <div className="no-print" style={{ background: `linear-gradient(135deg, ${MAROON_D} 0%, ${MAROON} 60%, #2A0000 100%)`, padding: '48px 24px 60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(201,160,39,0.12)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: '40%', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.60)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.60)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Back to Home
              </Link>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', textDecoration: 'none', padding: '5px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, fontWeight: 500 }}>Privacy Policy</Link>
                <Link href="/contact" style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', textDecoration: 'none', padding: '5px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, fontWeight: 500 }}>Contact Us</Link>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(201,160,39,0.18)', border: `1px solid rgba(201,160,39,0.35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Legal Document</div>
                <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Terms &amp; Conditions</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', margin: 0, fontWeight: 500 }}>Last updated: January 2025 · IskoMo Platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28, alignItems: 'start', marginTop: -24 }}>

          {/* Sidebar */}
          <aside className="no-print" style={{ position: 'sticky', top: 24, background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Navigation</div>
            </div>
            <nav style={{ padding: '8px 0' }}>
              {SECTIONS.map(s => (
                <button key={s.id}
                  className="nav-link"
                  onClick={() => { scrollTo(s.id); setActiveId(s.id); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '9px 20px',
                    background: activeId === s.id ? '#fff5f5' : 'transparent',
                    color: activeId === s.id ? MAROON : '#6b7280',
                    border: 'none', cursor: 'pointer', fontSize: 13,
                    fontWeight: activeId === s.id ? 600 : 400,
                    borderLeft: activeId === s.id ? `3px solid ${MAROON}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >{s.label}</button>
              ))}
            </nav>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
              <button onClick={() => window.print()} style={{ width: '100%', padding: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print / Save PDF
              </button>
            </div>
          </aside>

          {/* Content */}
          <main className="print-content" style={{ paddingBottom: 64, animation: 'fadeUp 0.4s ease both' }}>

            {[
              {
                id: 'acceptance', n: '01',
                title: 'Acceptance of Terms',
                content: (
                  <>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: '0 0 14px' }}>By accessing and using IskoMo, you agree to be bound by these Terms &amp; Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.</p>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: 0 }}>These terms constitute a legally binding agreement between you and IskoMo. Your use of the platform indicates your acceptance of these terms in their entirety.</p>
                  </>
                ),
              },
              {
                id: 'eligibility', n: '02',
                title: 'Eligibility',
                content: (
                  <>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: '0 0 18px' }}>IskoMo is designed exclusively for PUP students seeking scholarship opportunities. To use this platform, you must:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                      {[
                        { title: 'Be a PUP Student', desc: 'Currently enrolled or recently graduated from the Polytechnic University of the Philippines' },
                        { title: 'Provide Accurate Information', desc: 'Submit truthful and accurate information in your profile and scholarship applications' },
                        { title: 'Be of Legal Age', desc: 'Be at least 18 years old or have parental/guardian consent if under 18' },
                      ].map(item => (
                        <div key={item.title} style={{ background: '#fff5f5', border: `1px solid rgba(128,0,0,0.12)`, borderRadius: 10, padding: '16px 18px' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: MAROON, marginBottom: 6 }}>{item.title}</div>
                          <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ),
              },
              {
                id: 'user-accounts', n: '03',
                title: 'User Accounts',
                content: (
                  <>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: '0 0 18px' }}>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {[
                        { title: 'Account Security', items: ['Keep your password secure and confidential', 'Notify us immediately of any unauthorized access', 'Do not share your account with others'] },
                        { title: 'Account Responsibility', items: ['You are responsible for all actions under your account', 'Ensure all information provided is accurate and current', 'Maintain one account per individual'] },
                      ].map(col => (
                        <div key={col.title} style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 18px' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{col.title}</div>
                          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {col.items.map(i => <li key={i} style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{i}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </>
                ),
              },
              {
                id: 'acceptable-use', n: '04',
                title: 'Acceptable Use',
                content: (
                  <>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: '0 0 16px' }}>You agree to use IskoMo only for lawful purposes. The following activities are strictly prohibited:</p>
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '18px 20px', marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 10 }}>Prohibited Activities</div>
                      <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
                        {['Submitting false or fraudulent information', 'Attempting to hack or disrupt the platform', 'Violating other users\' privacy or rights', 'Using the platform for unauthorized commercial purposes', 'Spamming, phishing, or deceptive practices', 'Uploading malicious software or viruses', 'Impersonating other users or entities', 'Collecting user data without authorization'].map(i => (
                          <li key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{i}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Consequences: </span>
                      <span style={{ fontSize: 13, color: '#92400e' }}>Violation may result in immediate account suspension or termination, and may lead to legal action if applicable.</span>
                    </div>
                  </>
                ),
              },
              {
                id: 'intellectual-property', n: '05',
                title: 'Intellectual Property',
                content: (
                  <>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: '0 0 18px' }}>The IskoMo platform, including its design, logo, content, and functionality, is protected by copyright, trademark, and other intellectual property laws.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                      {[
                        { title: 'Platform Ownership', desc: 'All content, features, and functionality of IskoMo are owned by IskoMo and are protected by international copyright laws.' },
                        { title: 'User Content', desc: 'You retain ownership of content you submit but grant IskoMo a license to use, display, and distribute it on the platform.' },
                        { title: 'Restrictions', desc: 'You may not reproduce, modify, distribute, or create derivative works from IskoMo content without written permission.' },
                      ].map(item => (
                        <div key={item.title} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{item.title}</div>
                          <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ),
              },
              {
                id: 'disclaimer', n: '06',
                title: 'Disclaimer of Warranties',
                content: (
                  <>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: '0 0 18px' }}>IskoMo is provided "as is" and "as available" without warranties of any kind, either express or implied.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { title: 'No Guarantees', desc: 'We do not guarantee that the platform will be uninterrupted, error-free, or completely secure. Technical issues may occur.' },
                        { title: 'Scholarship Information', desc: 'We do not guarantee the accuracy, completeness, or availability of scholarship listings. Users should verify all information independently.' },
                        { title: 'Application Outcomes', desc: 'IskoMo does not guarantee scholarship approval or funding. Application decisions are made by scholarship providers through OSFA.' },
                      ].map(item => (
                        <div key={item.title} style={{ display: 'flex', gap: 14, padding: '14px 18px', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6', alignItems: 'flex-start' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: MAROON, marginTop: 6, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{item.title}</div>
                            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ),
              },
              {
                id: 'limitation-liability', n: '07',
                title: 'Limitation of Liability',
                content: (
                  <>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: '0 0 16px' }}>To the fullest extent permitted by law, IskoMo shall not be liable for any indirect, incidental, special, consequential, or punitive damages including:</p>
                    <ul style={{ paddingLeft: 20, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {['Loss of data or information', 'Loss of profits or business opportunities', 'Damages resulting from platform downtime or errors', 'Damages from unauthorized access or data breaches', 'Damages from reliance on platform information'].map(i => (
                        <li key={i} style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>{i}</li>
                      ))}
                    </ul>
                    <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.75, margin: 0 }}>Our total liability for any claims arising from your use of IskoMo shall not exceed the amount you paid to use the platform (if any) in the 12 months preceding the claim.</p>
                  </>
                ),
              },
              {
                id: 'termination', n: '08',
                title: 'Termination',
                content: (
                  <>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: '0 0 18px' }}>We reserve the right to suspend or terminate your access to IskoMo at any time, with or without cause or notice.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {[
                        { title: 'Termination by IskoMo', items: ['Violation of these Terms & Conditions', 'Fraudulent or illegal activity', 'Abuse of platform features', 'Extended period of inactivity'] },
                        { title: 'Termination by User', items: ['You may close your account at any time', 'Contact us to request account deletion', 'Data will be deleted per our Privacy Policy', 'Outstanding applications may be cancelled'] },
                      ].map(col => (
                        <div key={col.title} style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 10, padding: '16px 18px' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{col.title}</div>
                          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {col.items.map(i => <li key={i} style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{i}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </>
                ),
              },
              {
                id: 'governing-law', n: '09',
                title: 'Governing Law',
                content: (
                  <>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: '0 0 18px' }}>These Terms &amp; Conditions are governed by and construed in accordance with the laws of the Republic of the Philippines.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {[
                        { title: 'Jurisdiction', desc: 'Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of the Philippines.' },
                        { title: 'Compliance', desc: 'IskoMo operates in compliance with Philippine data protection laws, including the Data Privacy Act of 2012 (RA 10173).' },
                      ].map(item => (
                        <div key={item.title} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{item.title}</div>
                          <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ),
              },
              {
                id: 'changes-terms', n: '10',
                title: 'Changes to Terms',
                content: (
                  <>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, margin: '0 0 16px' }}>We may modify these Terms &amp; Conditions at any time. We will notify users of significant changes:</p>
                    <ul style={{ paddingLeft: 20, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {['Notification via email or platform announcement', 'Updated "Last updated" date at the top of this page', 'Continued use after changes constitutes acceptance', 'Previous versions will be archived for reference'].map(i => (
                        <li key={i} style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>{i}</li>
                      ))}
                    </ul>
                    <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.75, margin: 0 }}>We encourage you to review these terms periodically. If you do not agree with any changes, you should discontinue use of the platform.</p>
                  </>
                ),
              },
              {
                id: 'contact-terms', n: '11',
                title: 'Contact Us',
                content: (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                    {[
                      { title: 'Platform Contact', desc: 'Use the contact form within the IskoMo platform', href: '/contact', label: 'Go to Contact' },
                      { title: 'Email', desc: 'legal@iskomo.ph — for terms-related inquiries', href: 'mailto:legal@iskomo.ph', label: 'Send Email' },
                      { title: 'Response Time', desc: 'We aim to respond to all inquiries within 3–5 business days', href: null, label: null },
                    ].map(item => (
                      <div key={item.title} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '18px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: item.href ? 12 : 0 }}>{item.desc}</div>
                        {item.href && <a href={item.href} style={{ fontSize: 13, fontWeight: 600, color: MAROON, textDecoration: 'none' }}>{item.label} →</a>}
                      </div>
                    ))}
                  </div>
                ),
              },
            ].map((section, i) => (
              <section key={section.id} id={section.id} className="section-card"
                style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '28px 32px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', animation: `fadeUp 0.4s ease ${i * 40}ms both` }}
                onMouseEnter={() => setActiveId(section.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${MAROON}, ${MAROON_D})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{section.n}</span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>{section.title}</h2>
                </div>
                {section.content}
              </section>
            ))}

            {/* Actions */}
            <div className="no-print" style={{ background: `linear-gradient(135deg, ${MAROON_D}, ${MAROON})`, borderRadius: 14, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Need this document?</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)' }}>Print or save this page as PDF using your browser.</div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => window.print()} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print / Download PDF
                </button>
                <Link href="/privacy" style={{ padding: '10px 20px', background: GOLD, border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  View Privacy Policy →
                </Link>
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <div className="no-print" style={{ background: '#0d0d0d', padding: '20px 24px', marginTop: 32 }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', margin: 0 }}>© 2025 IskoMo — Polytechnic University of the Philippines · OSFA</p>
            <div style={{ display: 'flex', gap: 20 }}>
              {[['/', 'Home'], ['/privacy', 'Privacy Policy'], ['/contact', 'Contact']].map(([href, label]) => (
                <Link key={href} href={href} style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
