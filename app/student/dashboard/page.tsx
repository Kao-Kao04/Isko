'use client';

import Link from 'next/link';

const TEAL = '#1D9E75';
const GOLD = '#F0C040';

const scholarships = [
  { initials: 'C', color: TEAL,      name: 'CHED Merit Scholarship',    amount: '₱25,000', type: 'Merit-Based',  typeBg: '#e0f2fe', typeColor: '#0369a1' },
  { initials: 'D', color: '#0369a1', name: 'DOST-SEI Scholarship',      amount: '₱40,000', type: 'STEM Only',    typeBg: '#ede9fe', typeColor: '#5b21b6' },
  { initials: 'S', color: '#dc2626', name: 'SM Foundation Scholarship',  amount: '₱35,000', type: 'Need-Based',   typeBg: '#fef3c7', typeColor: '#92400e' },
];

const announcements = [
  {
    title: 'OSFA Scholarship Announcement',
    body: 'The Office of Scholarship and Financial Assistance is now accepting applications for the City Scholarship Program.',
    tag: 'Featured',
    tagBg: '#f0fdf4',
    tagColor: TEAL,
    border: TEAL,
    time: 'Today',
  },
  {
    title: 'Deadline Extension',
    body: 'Submissions for CHED Merit extended until the end of the month.',
    tag: 'Update',
    tagBg: '#fffbeb',
    tagColor: '#92400e',
    border: GOLD,
    time: '2 days ago',
  },
];

export default function Page() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* ── Welcome + student info ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 16px', fontSize: 26, fontWeight: 800, color: '#111827' }}>
          Welcome back, <span style={{ color: TEAL }}>Iskolar</span>!
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Student Number', value: '----', id: 'displayStudentNo' },
            { label: 'Program / Course', value: '----', id: 'displayProgram' },
            { label: 'Year Level', value: '----', id: 'displayYearLevel' },
          ].map((item) => (
            <div key={item.label} style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 10, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }} id={item.id}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Available Scholarships */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>Available Scholarships</h2>
              <Link href="/student/iskolarships" style={{ fontSize: 13, fontWeight: 600, color: TEAL, textDecoration: 'none', padding: '5px 12px', background: '#f0fdf4', borderRadius: 20 }}>
                View All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {scholarships.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fafafa', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                  {/* Avatar */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                    {s.initials}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{s.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: TEAL }}>{s.amount}/semester</span>
                      <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 20, background: s.typeBg, color: s.typeColor, fontSize: 11, fontWeight: 600 }}>
                        {s.type}
                      </span>
                    </div>
                  </div>
                  {/* Apply button */}
                  <Link
                    href="/student/apply-scholarship"
                    style={{ flexShrink: 0, padding: '7px 16px', background: TEAL, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}
                  >
                    Apply
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Application Status */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Application Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 16px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #d1d5db', marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: 15, marginBottom: 3 }}>No Application Yet</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Explore available scholarships to apply.</div>
              </div>
            </div>
            <Link href="/student/status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', background: '#fff', border: `1.5px solid ${TEAL}`, color: TEAL, borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              View Full Status Tracking
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          {/* Announcements */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Announcements</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {announcements.map((a, i) => (
                <div key={i} style={{ padding: '14px 14px 14px 16px', background: '#fafafa', borderRadius: 10, borderLeft: `3px solid ${a.border}` }}>
                  <h4 style={{ margin: '0 0 5px', fontSize: 14, fontWeight: 700, color: '#111827' }}>{a.title}</h4>
                  <p style={{ margin: '0 0 10px', fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{a.body}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: a.tagBg, color: a.tagColor }}>
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
