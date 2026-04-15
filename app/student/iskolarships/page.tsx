'use client';

import Link from 'next/link';
import { useState } from 'react';

const TEAL = '#1D9E75';
const GOLD = '#F0C040';

const typeConfig: Record<string, { label: string; bg: string; color: string }> = {
  merit:    { label: 'Merit-Based',  bg: '#e0f2fe', color: '#0369a1' },
  need:     { label: 'Need-Based',   bg: '#fef3c7', color: '#92400e' },
  stem:     { label: 'STEM Only',    bg: '#ede9fe', color: '#5b21b6' },
  sports:   { label: 'Sports',       bg: '#dcfce7', color: '#15803d' },
  arts:     { label: 'Arts',         bg: '#fce7f3', color: '#9d174d' },
};

const scholarships = [
  {
    id: 'ched-merit',
    initials: 'C',
    avatarBg: '#1D9E75',
    name: 'CHED Merit Scholarship Program',
    type: 'merit',
    amount: '₱25,000',
    slots: 400,
    sponsor: 'Commission on Higher Education',
    deadline: 'Sep 21, 2025',
    college: 'CCIS',
  },
  {
    id: 'dost-sei',
    initials: 'D',
    avatarBg: '#0369a1',
    name: 'DOST-SEI Undergraduate Scholarship',
    type: 'stem',
    amount: '₱40,000',
    slots: 500,
    sponsor: 'Department of Science and Technology',
    deadline: 'Mar 15, 2025',
    college: 'all',
  },
  {
    id: 'pup-excellence',
    initials: 'P',
    avatarBg: '#7c3aed',
    name: 'PUP Academic Excellence Grant',
    type: 'need',
    amount: '₱30,000',
    slots: 200,
    sponsor: 'PUP Scholarship Office',
    deadline: 'Feb 20, 2025',
    college: 'all',
  },
  {
    id: 'sm-scholars',
    initials: 'S',
    avatarBg: '#dc2626',
    name: 'SM Foundation College Scholarship',
    type: 'need',
    amount: '₱20,000',
    slots: 150,
    sponsor: 'SM Foundation Inc.',
    deadline: 'Apr 30, 2025',
    college: 'all',
  },
  {
    id: 'ayala-stem',
    initials: 'A',
    avatarBg: '#0891b2',
    name: 'Ayala Foundation STEM Scholarship',
    type: 'stem',
    amount: '₱35,000',
    slots: 100,
    sponsor: 'Ayala Foundation',
    deadline: 'May 15, 2025',
    college: 'CE',
  },
  {
    id: 'jollibee-scholars',
    initials: 'J',
    avatarBg: '#d97706',
    name: 'Jollibee Group Foundation Scholarship',
    type: 'need',
    amount: '₱18,000',
    slots: 300,
    sponsor: 'Jollibee Group Foundation',
    deadline: 'Jun 01, 2025',
    college: 'CBA',
  },
];

export default function Page() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCollege, setFilterCollege] = useState('all');

  const filtered = scholarships.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.sponsor.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || s.type === filterType;
    const matchCollege = filterCollege === 'all' || s.college === filterCollege || s.college === 'all';
    return matchSearch && matchType && matchCollege;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', display: 'flex', gap: 24 }}>

      {/* Left Sidebar — Filters */}
      <aside style={{ width: 220, flexShrink: 0 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: `2px solid ${TEAL}`, paddingBottom: 12, marginBottom: 20 }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={TEAL} strokeWidth="2">
              <path d="M3 4h14M5 8h10M7 12h6M9 16h2"/>
            </svg>
            <span style={{ fontWeight: 700, color: TEAL, fontSize: 15 }}>Filters</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Scholarship name..."
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              College
            </label>
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff' }}
            >
              <option value="all">All Colleges</option>
              <option value="CCIS">CCIS</option>
              <option value="CBA">CBA</option>
              <option value="CAFA">CAFA</option>
              <option value="CE">CE</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff' }}
            >
              <option value="all">All Types</option>
              <option value="merit">Merit-Based</option>
              <option value="need">Need-Based</option>
              <option value="stem">STEM Only</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>
            Available Scholarships
            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 500, color: '#6b7280' }}>
              ({filtered.length} found)
            </span>
          </h2>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ marginBottom: 12 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <p style={{ margin: 0, fontWeight: 500 }}>No scholarships match your filters.</p>
          </div>
        )}

        {/* 2-column card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map((s) => {
            const badge = typeConfig[s.type] || typeConfig.merit;
            return (
              <div key={s.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Card top accent bar */}
                <div style={{ height: 4, background: s.avatarBg }} />

                <div style={{ padding: '20px 20px 0' }}>
                  {/* Header row: avatar + name + badge */}
                  <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: s.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 22, fontWeight: 800 }}>
                      {s.initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{s.name}</h3>
                      <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Sponsor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: '#6b7280', fontSize: 13 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sponsor}</span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', margin: '0 -20px', padding: '12px 20px' }}>
                    <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: TEAL }}>{s.amount}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>per semester</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#374151' }}>{s.slots}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>slots available</div>
                    </div>
                  </div>

                  {/* Deadline badge */}
                  <div style={{ padding: '12px 0 0' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: 20, border: '1px solid #fecaca' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                      Deadline: {s.deadline}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ padding: 20, marginTop: 'auto', display: 'flex', gap: 10 }}>
                  <button style={{ flex: 1, padding: '9px 0', border: `1.5px solid ${TEAL}`, borderRadius: 8, background: '#fff', color: TEAL, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    View Details
                  </button>
                  <Link href={`/student/apply-scholarship`} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, background: TEAL, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Apply Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
