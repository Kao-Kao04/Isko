'use client';

import { useState, useEffect, useCallback } from 'react';
import { COLORS } from '@/lib/theme';
import ScholarshipCard from '@/components/scholarship/ScholarshipCard';
import EmptyState from '@/components/ui/EmptyState';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { scholarshipApi } from '@/lib/api-client';
import { mapScholarship } from '@/lib/adapters';
import type { Scholarship } from '@/lib/osfa-data';

const PUP_COLLEGES = [
  'CAF', 'CADBE', 'CAL', 'CBA', 'COC', 'CCIS', 'COED',
  'CE', 'CHK', 'ITECH', 'CL', 'CPSPA', 'CS', 'CSSD', 'CTHTM',
];
const TYPES = ['Merit-Based', 'Need-Based', 'STEM Only', 'Service-Based', 'Sports', 'Arts'];

function isEligible(s: Scholarship, userCollege: string | null, userProgram: string | null): boolean {
  const colleges = s.colleges ?? [];
  const programs = s.programs ?? [];
  if (colleges.length === 0 && programs.length === 0) return true;
  const collegeOk = colleges.length === 0 || (userCollege ? colleges.includes(userCollege) : false);
  const programOk = programs.length === 0 || (userProgram ? programs.some(p => userProgram.toLowerCase().includes(p.toLowerCase())) : false);
  return collegeOk && programOk;
}

export default function IskolarshipsPage() {
  const { user } = useCurrentUser();
  const isPending = user?.account_status === 'pending';
  const userCollege = user?.student_profile?.college ?? null;
  const userProgram = user?.student_profile?.program ?? null;

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search,        setSearch]        = useState('');
  const [filterType,    setFilterType]    = useState('all');
  const [filterCollege, setFilterCollege] = useState('all');
  const [bookmarked,    setBookmarked]    = useState<Set<string>>(new Set());

  const fetchScholarships = useCallback(async () => {
    try {
      const res = await scholarshipApi.list(1, 100);
      setScholarships(res.items.map(mapScholarship));
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchScholarships(); }, [fetchScholarships]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('iskomo_bookmarks');
      if (raw) setBookmarked(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, []);

  function toggleBookmark(id: string) {
    setBookmarked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem('iskomo_bookmarks', JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }

  const active = scholarships.filter(s => s.status === 'Active');
  const filtered = active.filter(s => {
    const matchSearch  = s.title.toLowerCase().includes(search.toLowerCase());
    const matchType    = filterType === 'all' || s.type === filterType;
    const colleges     = s.colleges ?? [];
    const matchCollege = filterCollege === 'all' || colleges.length === 0 || colleges.includes(filterCollege);
    return matchSearch && matchType && matchCollege;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', display: 'flex', gap: 24 }}>

      {/* Sidebar filters */}
      <aside style={{ width: 220, flexShrink: 0 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'sticky', top: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: `2px solid ${COLORS.maroon}`, paddingBottom: 12, marginBottom: 20 }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={COLORS.maroon} strokeWidth="2"><path d="M3 4h14M5 8h10M7 12h6M9 16h2"/></svg>
            <span style={{ fontWeight: 700, color: COLORS.maroon, fontSize: 15 }}>Filters</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</label>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Scholarship name..." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>College</label>
            <select value={filterCollege} onChange={e => setFilterCollege(e.target.value)} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff' }}>
              <option value="all">All Colleges</option>
              {PUP_COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff' }}>
              <option value="all">All Types</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {(search || filterType !== 'all' || filterCollege !== 'all') && (
            <button onClick={() => { setSearch(''); setFilterType('all'); setFilterCollege('all'); }} style={{ marginTop: 16, width: '100%', padding: '8px 0', border: `1px solid ${COLORS.maroon}40`, borderRadius: 8, background: '#fff5f5', color: COLORS.maroon, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Clear Filters
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {isPending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
              <strong>Account pending OSFA approval.</strong> You can browse scholarships but cannot apply until your account is approved.
            </p>
          </div>
        )}

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>
            Available Iskolarships
            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 500, color: '#6b7280' }}>
              {loading ? '(loading...)' : `(${filtered.length} found)`}
            </span>
          </h2>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading scholarships...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
            <EmptyState
              icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>}
              title="No iskolarships match your filters"
              subtitle="Try adjusting your search or clearing the filters."
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(s => (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                variant="grid"
                bookmarked={bookmarked.has(s.id)}
                onBookmark={toggleBookmark}
                eligible={isEligible(s, userCollege, userProgram)}
                applyDisabled={isPending}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
