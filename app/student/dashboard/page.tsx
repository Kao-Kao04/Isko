'use client';

import Link from 'next/link';

const TEAL = '#1D9E75';
const TEAL_DARK = '#178a64';
const TEAL_LIGHT = '#e8faf4';

const scholarships = [
  {
    initials: 'C',
    color: TEAL,
    gradient: 'linear-gradient(135deg, #1D9E75, #178a64)',
    name: 'CHED Merit Scholarship',
    amount: '₱25,000',
    type: 'Merit-Based',
    typeBg: '#e0f2fe',
    typeColor: '#0369a1',
    deadline: 'Sep 21, 2025',
    slots: 400,
  },
  {
    initials: 'D',
    color: '#0369a1',
    gradient: 'linear-gradient(135deg, #0369a1, #0284c7)',
    name: 'DOST-SEI Scholarship',
    amount: '₱40,000',
    type: 'STEM Only',
    typeBg: '#ede9fe',
    typeColor: '#5b21b6',
    deadline: 'Mar 15, 2025',
    slots: 500,
  },
  {
    initials: 'S',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    name: 'SM Foundation Scholarship',
    amount: '₱35,000',
    type: 'Need-Based',
    typeBg: '#fef3c7',
    typeColor: '#92400e',
    deadline: 'Apr 30, 2025',
    slots: 150,
  },
];


const announcements = [
  {
    title: 'OSFA Scholarship Announcement',
    body: 'The Office of Scholarship and Financial Assistance is now accepting applications for the City Scholarship Program.',
    tag: 'Featured',
    tagBg: TEAL_LIGHT,
    tagColor: TEAL,
    border: TEAL,
    time: 'Today',
    icon: '📢',
  },
  {
    title: 'Deadline Extension',
    body: 'Submissions for CHED Merit extended until the end of the month.',
    tag: 'Update',
    tagBg: '#fffbeb',
    tagColor: '#92400e',
    border: '#F0C040',
    time: '2 days ago',
    icon: '📅',
  },
];

export default function Page() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* ── Hero Banner ── */}
      <div style={{
        background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 60%, #0f6b4f 100%)`,
        borderRadius: 18,
        padding: '32px 36px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 20, right: 160, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Student Dashboard
              </p>
              <h1 style={{ margin: '0 0 20px', fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Welcome back, <span style={{ color: '#a7f3d0' }}>Iskolar</span>! 👋
              </h1>
              {/* Student info pills */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'Student No.', value: '----', id: 'displayStudentNo' },
                  { label: 'Program', value: '----', id: 'displayProgram' },
                  { label: 'Year Level', value: '----', id: 'displayYearLevel' },
                ].map((item) => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', borderRadius: 30, padding: '6px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginRight: 6 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }} id={item.id}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Completion hint */}
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.18)', minWidth: 160 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile Strength</div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 99, marginBottom: 6 }}>
                <div style={{ height: '100%', width: '40%', background: '#a7f3d0', borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 12, color: '#a7f3d0', fontWeight: 700 }}>40% — Complete your profile</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* Left column — Available Scholarships */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Available Scholarships</h2>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Opportunities matching your profile</p>
            </div>
            <Link href="/student/iskolarships" style={{ fontSize: 12, fontWeight: 700, color: TEAL, textDecoration: 'none', padding: '6px 14px', background: TEAL_LIGHT, borderRadius: 20, border: `1px solid #bbf7d0` }}>
              View All →
            </Link>
          </div>

          {/* Scholarship rows */}
          <div style={{ padding: '8px 16px 16px' }}>
            {scholarships.map((s, i) => (
              <div key={s.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 12px',
                borderRadius: 12,
                borderLeft: `4px solid ${s.color}`,
                background: i % 2 === 0 ? '#fafafa' : '#fff',
                marginTop: 10,
                border: `1px solid #f0f0f0`,
                borderLeftColor: s.color,
                borderLeftWidth: 4,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: s.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 20, fontWeight: 800,
                  boxShadow: `0 4px 12px ${s.color}40`,
                }}>
                  {s.initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 5 }}>{s.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: TEAL }}>{s.amount}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>/sem</span>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, background: s.typeBg, color: s.typeColor, fontSize: 11, fontWeight: 600 }}>
                      {s.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>⏰ {s.deadline}</span>
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{s.slots} slots</span>
                  </div>
                </div>

                {/* Apply */}
                <Link
                  href="/student/apply-scholarship"
                  style={{
                    flexShrink: 0,
                    padding: '9px 20px',
                    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                    color: '#fff',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    boxShadow: `0 3px 10px ${TEAL}50`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Apply Now
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Application Status */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Application Status</h3>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                padding: '24px 16px',
                background: 'linear-gradient(135deg, #f8fafc, #f0fdf4)',
                borderRadius: 12,
                border: '1.5px dashed #bbf7d0',
                marginBottom: 14,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e8faf4, #d1fae5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(29,158,117,0.15)',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: 14, marginBottom: 4 }}>No Application Yet</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>Start your scholarship journey<br/>by applying below.</div>
                </div>
                <Link href="/student/iskolarships" style={{
                  padding: '8px 20px',
                  background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                  color: '#fff', borderRadius: 8,
                  textDecoration: 'none', fontSize: 12, fontWeight: 700,
                  boxShadow: `0 2px 8px ${TEAL}40`,
                }}>
                  Find Scholarships
                </Link>
              </div>
              <Link href="/student/status" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 16px',
                background: '#fff', border: `1.5px solid ${TEAL}`,
                color: TEAL, borderRadius: 8, textDecoration: 'none',
                fontSize: 12, fontWeight: 700,
              }}>
                View Full Status Tracking
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Announcements */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: TEAL_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Announcements</h3>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: TEAL, color: '#fff', borderRadius: 20, padding: '1px 7px' }}>
                {announcements.length}
              </span>
            </div>

            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.map((a, i) => (
                <div key={i} style={{
                  padding: '14px 14px 14px 16px',
                  background: '#fafafa',
                  borderRadius: 10,
                  borderLeft: `3px solid ${a.border}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 18, opacity: 0.15 }}>{a.icon}</div>
                  <h4 style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{a.title}</h4>
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>{a.body}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: a.tagBg, color: a.tagColor }}>
                      {a.tag}
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
