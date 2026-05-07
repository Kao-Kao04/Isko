'use client';

import { useState, useEffect, useCallback } from 'react';
import { COLORS } from '@/lib/theme';
import ScholarshipCard from '@/components/scholarship/ScholarshipCard';
import EmptyState from '@/components/ui/EmptyState';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { scholarshipApi, applicationApi } from '@/lib/api-client';
import { mapScholarship } from '@/lib/adapters';
import type { Scholarship } from '@/lib/osfa-data';

const PUP_COLLEGES = [
  'CAF', 'CADBE', 'CAL', 'CBA', 'COC', 'CCIS', 'COED',
  'CE', 'CHK', 'ITECH', 'CL', 'CPSPA', 'CS', 'CSSD', 'CTHTM',
];
const TYPES = ['Merit-Based', 'Need-Based', 'STEM Only', 'Service-Based', 'Sports', 'Arts'];

function checkEligibility(
  s: Scholarship,
  userCollege: string | null,
  userProgram: string | null,
  userYearLevel: number | null,
  userGwa: string | null,
): { eligible: boolean; reason?: string } {
  const colleges   = s.colleges   ?? [];
  const programs   = s.programs   ?? [];
  const yearLevels = s.yearLevels ?? [];

  if (colleges.length > 0) {
    if (!userCollege || !colleges.includes(userCollege)) {
      const label = colleges.length <= 3 ? colleges.join(', ') : `${colleges.slice(0, 2).join(', ')} +${colleges.length - 2}`;
      return { eligible: false, reason: `${label} only` };
    }
  }

  if (programs.length > 0) {
    const match = programs.some(p => userProgram?.toLowerCase().includes(p.toLowerCase()));
    if (!match) {
      return { eligible: false, reason: programs.length === 1 ? `${programs[0]} program only` : 'Specific programs only' };
    }
  }

  if (yearLevels.length > 0) {
    if (!userYearLevel || !yearLevels.includes(userYearLevel)) {
      const label = yearLevels.map(y => `Year ${y}`).join(', ');
      return { eligible: false, reason: `${label} only` };
    }
  }

  if (s.minGwa && userGwa) {
    const reqGwa  = parseFloat(s.minGwa);
    const stuGwa  = parseFloat(userGwa);
    if (!isNaN(reqGwa) && !isNaN(stuGwa) && stuGwa > reqGwa) {
      return { eligible: false, reason: `GWA ${s.minGwa} or better required` };
    }
  }

  return { eligible: true };
}

export default function IskolarshipsPage() {
  const { user } = useCurrentUser();
  const isPending    = user?.account_status === 'pending_verification';
  const userCollege  = user?.student_profile?.college    ?? null;
  const userProgram  = user?.student_profile?.program    ?? null;
  const userYearLevel = user?.student_profile?.year_level ?? null;
  const userGwa      = user?.student_profile?.gwa        ?? null;

  const [scholarships,  setScholarships]  = useState<Scholarship[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [appliedIds,    setAppliedIds]    = useState<Set<number>>(new Set());
  const [search,        setSearch]        = useState('');
  const [filterType,    setFilterType]    = useState('all');
  const [filterCollege, setFilterCollege] = useState('all');
  const [eligibleOnly,  setEligibleOnly]  = useState(false);
  const [bookmarked,    setBookmarked]    = useState<Set<string>>(new Set());

  const fetchScholarships = useCallback(async () => {
    try {
      const [schRes, appRes] = await Promise.all([
        scholarshipApi.list(1, 100),
        applicationApi.list(1, 50).catch(() => ({ items: [] })),
      ]);
      setScholarships(schRes.items.map(mapScholarship));
      setAppliedIds(new Set(appRes.items.map((a: { scholarship_id: number }) => a.scholarship_id)));
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
  const withEligibility = active.map(s => {
    const slotsFull    = s.slots > 0 && s.applicants >= s.slots;
    const deadlinePast = s.daysLeft === 0;
    const alreadyAppl  = appliedIds.has(Number(s.id));
    if (slotsFull)    return { s, eligible: false, reason: 'Slots full' };
    if (deadlinePast) return { s, eligible: false, reason: 'Application closed' };
    if (alreadyAppl)  return { s, eligible: false, reason: 'Already applied' };
    return { s, ...checkEligibility(s, userCollege, userProgram, userYearLevel, userGwa) };
  });
  const filtered = withEligibility.filter(({ s, eligible }) => {
    const matchSearch   = s.title.toLowerCase().includes(search.toLowerCase());
    const matchType     = filterType === 'all' || s.type === filterType;
    const colleges      = s.colleges ?? [];
    const matchCollege  = filterCollege === 'all' || colleges.length === 0 || colleges.includes(filterCollege);
    const matchEligible = !eligibleOnly || eligible;
    return matchSearch && matchType && matchCollege && matchEligible;
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
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff' }}>
              <option value="all">All Types</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
            <button
              onClick={() => setEligibleOnly(v => !v)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                border: eligibleOnly ? `1.5px solid ${COLORS.maroon}` : '1.5px solid #e5e7eb',
                background: eligibleOnly ? COLORS.maroon : '#fff',
                color: eligibleOnly ? '#fff' : '#374151',
                transition: 'all 0.15s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              {eligibleOnly ? 'Eligible Only' : 'Show All'}
            </button>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>
              {eligibleOnly ? 'Showing scholarships you qualify for.' : 'Showing all scholarships including ineligible ones.'}
            </p>
          </div>
          {(search || filterType !== 'all' || filterCollege !== 'all' || eligibleOnly) && (
            <button onClick={() => { setSearch(''); setFilterType('all'); setFilterCollege('all'); setEligibleOnly(false); }} style={{ marginTop: 14, width: '100%', padding: '8px 0', border: `1px solid ${COLORS.maroon}40`, borderRadius: 8, background: '#fff5f5', color: COLORS.maroon, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
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

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>
            Available Iskolarships
            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 500, color: '#6b7280' }}>
              {loading ? '(loading...)' : `(${filtered.length} found)`}
            </span>
          </h2>
          {!loading && !eligibleOnly && (
            <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
              {withEligibility.filter(e => !e.eligible).length > 0
                ? `${withEligibility.filter(e => e.eligible).length} eligible · ${withEligibility.filter(e => !e.eligible).length} not eligible`
                : 'All scholarships are open to you'}
            </span>
          )}
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
            {filtered.map(({ s, eligible, reason }) => (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                variant="grid"
                bookmarked={bookmarked.has(s.id)}
                onBookmark={toggleBookmark}
                eligible={eligible}
                ineligibleReason={reason}
                applyDisabled={isPending}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
