'use client';

import { useState } from 'react';
import Link from 'next/link';
import { COLORS } from '@/lib/theme';

const MAROON = COLORS.maroon;
const GOLD   = COLORS.gold;

const PRINT_CSS = `
@media print {
  .no-print { display: none !important; }
  body { background: #fff !important; }
  .privacy-header {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    padding-bottom: 24px !important;
  }
  .privacy-body {
    margin-top: 0 !important;
    padding-top: 16px !important;
    display: block !important;
  }
  .privacy-body > * { margin-bottom: 16px; }
}
`;

const SECTIONS = [
  { id: 'introduction',   label: 'Introduction' },
  { id: 'info-collected', label: 'Information We Collect' },
  { id: 'how-we-use',     label: 'How We Use Information' },
  { id: 'data-protection',label: 'Data Protection' },
  { id: 'third-party',    label: 'Third-Party Services' },
  { id: 'your-rights',    label: 'Your Rights' },
  { id: 'changes',        label: 'Changes to Policy' },
  { id: 'contact',        label: 'Contact Us' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function NumIcon({ n }: { n: string }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${MAROON}, #5C0000)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', flexShrink: 0 }}>
      {n}
    </div>
  );
}

export default function PrivacyPage() {
  const [activeId, setActiveId] = useState('introduction');

  function handleNav(id: string) {
    scrollTo(id);
    setActiveId(id);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* ── Header ── */}
        <div className="privacy-header" style={{ background: `linear-gradient(135deg, #5C0000, ${MAROON})`, padding: '64px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', border: '1px solid rgba(201,160,39,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link href="/" className="no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28, fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 500 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back to Home
            </Link>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Legal Document
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.60)', margin: '0 auto', maxWidth: 520, lineHeight: 1.75 }}>
              How IskoMo collects, uses, and protects your personal information.
            </p>
            <div style={{ marginTop: 20, display: 'inline-flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', fontWeight: 500 }}>Last updated: January 2025</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>·</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', fontWeight: 500 }}>Effective: January 2025</span>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="privacy-body" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px', display: 'flex', gap: 32, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>

          {/* ── Sidebar ── */}
          <aside className="no-print" style={{ width: 240, flexShrink: 0, position: 'sticky', top: 24 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contents</div>
              </div>
              <nav style={{ padding: '8px 0' }}>
                {SECTIONS.map((s, i) => (
                  <button key={s.id} onClick={() => handleNav(s.id)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderLeft: activeId === s.id ? `3px solid ${MAROON}` : '3px solid transparent', padding: '9px 18px', fontSize: 13, color: activeId === s.id ? MAROON : '#374151', fontWeight: activeId === s.id ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: '#d1d5db', fontWeight: 700, flexShrink: 0, minWidth: 18 }}>{String(i + 1).padStart(2, '0')}</span>
                    {s.label}
                  </button>
                ))}
              </nav>
              <div style={{ padding: '12px 18px', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={() => window.print()} style={{ width: '100%', padding: '9px 0', background: MAROON, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print / Save PDF
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 01 Introduction */}
            <div id="introduction" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <NumIcon n="01" />
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#111827' }}>Introduction</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>Scope and purpose of this policy</p>
                </div>
              </div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.85 }}>
                <p style={{ margin: '0 0 14px' }}>Welcome to IskoMo. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our scholarship platform.</p>
                <p style={{ margin: 0 }}>By using IskoMo, you agree to the collection and use of information in accordance with this policy. We are dedicated to ensuring transparency and protecting the privacy of all PUP students using our platform.</p>
              </div>
            </div>

            {/* 02 Information We Collect */}
            <div id="info-collected" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <NumIcon n="02" />
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#111827' }}>Information We Collect</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>What data is gathered and why</p>
                </div>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151', lineHeight: 1.85 }}>We collect information to provide and improve our services. The types of information we may collect include:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  {
                    title: 'Personal Information',
                    items: ['Name and contact details', 'Email address', 'PUP student information', 'Academic background'],
                  },
                  {
                    title: 'Platform Usage Data',
                    items: ['Scholarship applications submitted', 'Saved scholarships', 'Application status tracking', 'Messages or inquiries submitted'],
                  },
                  {
                    title: 'Technical Information',
                    items: ['IP address and browser type', 'Device information', 'Usage patterns and preferences', 'Cookies and session data'],
                  },
                ].map(card => (
                  <div key={card.title} style={{ background: '#f8fafc', borderRadius: 10, padding: '16px 18px', border: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: MAROON, marginBottom: 10 }}>{card.title}</div>
                    <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {card.items.map(item => (
                        <li key={item} style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* 03 How We Use Information */}
            <div id="how-we-use" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <NumIcon n="03" />
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#111827' }}>How We Use Your Information</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>Purposes for which your data is processed</p>
                </div>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151', lineHeight: 1.85 }}>Your information is used exclusively to enhance your scholarship experience:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { title: 'Service Provision',    desc: 'To provide, maintain, and improve IskoMo\'s scholarship platform and features.' },
                  { title: 'Security & Protection', desc: 'To ensure platform security, prevent fraud, and protect against unauthorized access.' },
                  { title: 'Platform Improvement', desc: 'To analyze usage patterns and enhance user experience and system performance.' },
                  { title: 'Communication',         desc: 'To send important updates about scholarships, deadlines, and platform changes.' },
                ].map((item, i) => (
                  <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f3f4f6' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${MAROON}22, ${MAROON}11)`, border: `1px solid ${MAROON}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: MAROON }}>{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 04 Data Protection */}
            <div id="data-protection" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <NumIcon n="04" />
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#111827' }}>Data Protection</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>Security measures and data retention</p>
                </div>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151', lineHeight: 1.85 }}>We implement reasonable security measures to protect your personal information:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
                {[
                  {
                    title: 'Security Measures',
                    items: ['Secure data encryption in transit and at rest', 'Regular security assessments', 'Access controls and authentication'],
                  },
                  {
                    title: 'Data Retention',
                    items: ['We retain data only as long as necessary', 'You can request data deletion at any time', 'Automatic deletion after account closure'],
                  },
                ].map(card => (
                  <div key={card.title} style={{ background: '#f8fafc', borderRadius: 10, padding: '16px 18px', border: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: MAROON, marginBottom: 10 }}>{card.title}</div>
                    <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {card.items.map(item => (
                        <li key={item} style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff9f9', border: `1px solid ${MAROON}22`, borderLeft: `4px solid ${MAROON}`, borderRadius: 8, padding: '14px 18px' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                  <strong style={{ color: MAROON }}>Disclaimer:</strong> While we implement industry-standard security measures, no online platform can guarantee 100% security. We encourage users to protect their login credentials and report any suspicious activity.
                </p>
              </div>
            </div>

            {/* 05 Third-Party Services */}
            <div id="third-party" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <NumIcon n="05" />
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#111827' }}>Third-Party Services</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>External services and data sharing</p>
                </div>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151', lineHeight: 1.85 }}>IskoMo may use third-party services to enhance platform functionality:</p>
              <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Service Type', 'Purpose', 'Data Shared'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Hosting Services', 'Platform infrastructure', 'Technical data only'],
                      ['Analytics Tools',  'Usage analysis',          'Anonymous usage data'],
                      ['Email Services',   'Communication',           'Contact information'],
                    ].map(([type, purpose, data], i) => (
                      <tr key={type} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '10px 16px', color: '#111827', fontWeight: 600, borderBottom: '1px solid #f3f4f6' }}>{type}</td>
                        <td style={{ padding: '10px 16px', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{purpose}</td>
                        <td style={{ padding: '10px 16px', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
                <strong style={{ color: '#374151' }}>Note:</strong> Third-party services have their own privacy policies. We only work with reputable providers who comply with data protection standards.
              </p>
            </div>

            {/* 06 Your Rights */}
            <div id="your-rights" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <NumIcon n="06" />
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#111827' }}>Your Rights</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>Control over your personal data</p>
                </div>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151', lineHeight: 1.85 }}>As a user of IskoMo, you have the following rights regarding your personal data:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 20 }}>
                {[
                  { title: 'Right to Access',     desc: 'Request a copy of your personal data stored in our system.' },
                  { title: 'Right to Correction', desc: 'Request updates or corrections to inaccurate information.' },
                  { title: 'Right to Deletion',   desc: 'Request deletion of your personal data from our systems.' },
                  { title: 'Right to Withdraw',   desc: 'Stop using the service or withdraw consent at any time.' },
                ].map(r => (
                  <div key={r.title} style={{ background: '#f8fafc', borderRadius: 10, padding: '16px 18px', border: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: MAROON, marginBottom: 8 }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #16a34a', borderRadius: 8, padding: '14px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>How to Exercise Your Rights</div>
                <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                  To exercise any of these rights, please contact us through the platform&apos;s contact form or email privacy@iskomo.ph. We will respond to all legitimate requests within 30 days.
                </p>
              </div>
            </div>

            {/* 07 Changes to Policy */}
            <div id="changes" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <NumIcon n="07" />
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#111827' }}>Changes to This Policy</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>How policy updates are communicated</p>
                </div>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: '#374151', lineHeight: 1.85 }}>We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements:</p>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'We will notify users of significant changes via email or platform notification.',
                  'The "Last updated" date at the top of this page will be revised.',
                  'Continued use of IskoMo after changes constitutes acceptance.',
                  'Previous versions of the policy will be archived.',
                ].map(item => (
                  <li key={item} style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{item}</li>
                ))}
              </ul>
              <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>We encourage you to review this policy periodically to stay informed about how we protect your information.</p>
            </div>

            {/* 08 Contact Us */}
            <div id="contact" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <NumIcon n="08" />
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#111827' }}>Contact Us</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>Reach our privacy team</p>
                </div>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151', lineHeight: 1.85 }}>If you have questions, concerns, or requests regarding this Privacy Policy or your personal data:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
                {[
                  { title: 'Platform Contact',  desc: 'Use the contact form within the IskoMo platform.', href: '/contact' },
                  { title: 'Email',              desc: 'privacy@iskomo.ph — for privacy-specific inquiries.', href: 'mailto:privacy@iskomo.ph' },
                  { title: 'Response Time',      desc: 'We aim to respond to all inquiries within 3–5 business days.', href: null },
                ].map(c => (
                  <div key={c.title} style={{ background: '#f8fafc', borderRadius: 10, padding: '16px 18px', border: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: MAROON, marginBottom: 8 }}>{c.title}</div>
                    {c.href ? (
                      <a href={c.href} style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, textDecoration: 'underline', textUnderlineOffset: 3 }}>{c.desc}</a>
                    ) : (
                      <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{c.desc}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Action Bar ── */}
            <div className="no-print" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>IskoMo Privacy Policy</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Polytechnic University of the Philippines · OSFA</div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => window.print()} style={{ padding: '9px 18px', border: `1.5px solid ${MAROON}`, borderRadius: 8, color: MAROON, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print / Save PDF
                </button>
                <Link href="/terms" style={{ padding: '9px 18px', border: '1.5px solid #e5e7eb', borderRadius: 8, color: '#374151', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                  Terms &amp; Conditions
                </Link>
                <Link href="/" style={{ padding: '9px 18px', background: MAROON, borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                  Back to Home
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ background: '#0d0d0d', padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>IskoMo</div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms & Conditions', href: '/terms' },
                { label: 'Contact', href: '/contact' },
                { label: 'Home', href: '/' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 500 }}>{l.label}</Link>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', margin: 0 }}>
              &copy; 2025 IskoMo — Polytechnic University of the Philippines · OSFA
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
