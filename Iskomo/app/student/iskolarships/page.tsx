'use client';

import { useState, useEffect, useCallback } from 'react';
import { COLORS } from '@/lib/theme';
import ScholarshipCard from '@/components/scholarship/ScholarshipCard';
import EmptyState from '@/components/ui/EmptyState';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { scholarshipApi, applicationApi } from '@/lib/api-client';
import { mapScholarship } from '@/lib/adapters';
import type { Scholarship } from '@/lib/osfa-data';
import { Skel } from '@/components/shared/Skeleton';

const M = COLORS.maroon;

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
    const reqGwa = parseFloat(s.minGwa);
    const stuGwa = parseFloat(userGwa);
    if (!isNaN(reqGwa) && !isNaN(stuGwa) && stuGwa > reqGwa) {
      return { eligible: false, reason: `GWA ${s.minGwa} or better required` };
    }
  }

  return { eligible: true };
}

const selectStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8,
  padding: '9px 10px', fontSize: 13, background: '#fff', color: '#374151',
  outline: 'none', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  paddingRight: 32,
};

export default function IskolarshipsPage() {
  const { user } = useCurrentUser();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isPending     = user?.account_status === 'pending_verification';
  const userCollege   = user?.student_profile?.college    ?? null;
  const userProgram   = user?.student_profile?.program    ?? null;
  const userYearLevel = user?.student_profile?.year_level ?? null;
  const userGwa       = user?.student_profile?.gwa        ?? null;

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
    const deadlinePast = s.daysLeft === 0;
    const alreadyAppl  = appliedIds.has(Number(s.id));
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

  const eligibleCount = withEligibility.filter(e => e.eligible).length;
  const hasFilters    = search || filterType !== 'all' || filterCollege !== 'all' || eligibleOnly;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <style>{`
        .filter-select:focus { border-color: ${M} !important; outline: none; }
        .filter-input:focus  { border-color: ${M} !important; outline: none; box-shadow: 0 0 0 3px ${M}18 !important; }
        .iskol-filter-toggle { display: none; }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${M}, #5C0000)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>Iskolarships</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Browse and apply for OSFA-managed scholarships.</p>
          </div>
        </div>
        {/* Stat pills — only when loaded */}
        {!loading && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 99, fontSize: 12, fontWeight: 600, color: '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              {active.length} active scholarship{active.length !== 1 ? 's' : ''}
            </div>
            {eligibleCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 99, fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {eligibleCount} eligible for you
              </div>
            )}
            {appliedIds.size > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 99, fontSize: 12, fontWeight: 600, color: '#1d4ed8' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {appliedIds.size} already applied
              </div>
            )}
          </div>
        )}
      </div>

      <div className="iskol-layout" style={{ display: 'flex', gap: 24 }}>

        {/* Sidebar filters */}
        <aside className="iskol-sidebar" style={{ width: 224, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: `2px solid ${M}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2.5"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
              </div>
              <span style={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>Filters</span>
              {hasFilters && (
                <button onClick={() => { setSearch(''); setFilterType('all'); setFilterCollege('all'); setEligibleOnly(false); }} style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: M, background: '#fff5f5', border: `1px solid ${M}30`, borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>
                  Clear
                </button>
              )}
              {/* Mobile toggle — shown via global CSS on ≤768px */}
              <button
                className="iskol-filter-toggle"
                onClick={() => setFiltersOpen(v => !v)}
                aria-expanded={filtersOpen}
                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: M, background: '#fff5f5', border: `1px solid ${M}30`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
              >
                {filtersOpen ? 'Hide' : `Show${hasFilters ? ` (${[search, filterType !== 'all', filterCollege !== 'all', eligibleOnly].filter(Boolean).length})` : ''}`}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>

            <div className={`iskol-sidebar-body${filtersOpen ? ' iskol-filters-open' : ''}`}>
            <div className="iskol-sidebar-inner">
              {/* Search */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Search</label>
                <div style={{ position: 'relative' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Scholarship name..."
                    className="filter-input"
                    style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '9px 10px 9px 28px', fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  />
                </div>
              </div>

              {/* College */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>College</label>
                <select
                  value={filterCollege}
                  onChange={e => setFilterCollege(e.target.value)}
                  className="filter-select"
                  style={selectStyle}
                >
                  <option value="all">All Colleges</option>
                  {PUP_COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Type */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</label>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="filter-select"
                  style={selectStyle}
                >
                  <option value="all">All Types</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Eligible only toggle */}
              <div className="iskol-filter-full" style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
                <button
                  onClick={() => setEligibleOnly(v => !v)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    border: eligibleOnly ? `1.5px solid ${M}` : '1.5px solid #e5e7eb',
                    background: eligibleOnly ? M : '#fff',
                    color: eligibleOnly ? '#fff' : '#374151',
                    transition: 'all 0.15s',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    {eligibleOnly ? <polyline points="20 6 9 17 4 12"/> : <><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></>}
                  </svg>
                  {eligibleOnly ? 'Eligible Only ✓' : 'Show All'}
                </button>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>
                  {eligibleOnly
                    ? `${eligibleCount} scholarship${eligibleCount !== 1 ? 's' : ''} you qualify for.`
                    : 'Toggle to see only scholarships you qualify for.'}
                </p>
              </div>
            </div>
            </div>{/* iskol-sidebar-body */}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {isPending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
                <strong>Account pending OSFA approval.</strong> You can browse scholarships but cannot apply until your account is approved.
              </p>
            </div>
          )}

          {/* Results count */}
          {!loading && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                <span style={{ fontWeight: 700, color: '#111827' }}>{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''}
                {hasFilters && <span style={{ color: M, fontWeight: 600, marginLeft: 6 }}>· filtered</span>}
              </p>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <Skel h={140} r={0} />
                  <div style={{ padding: '14px 16px' }}>
                    <Skel h={16} w="75%" r={6} mb={8} />
                    <Skel h={12} w="90%" r={5} mb={4} />
                    <Skel h={12} w="60%" r={5} mb={14} />
                    <Skel h={34} r={8} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <EmptyState
                icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>}
                title="No iskolarships match your filters"
                subtitle="Try adjusting your search or clearing the filters."
                action={hasFilters
                  ? <button onClick={() => { setSearch(''); setFilterType('all'); setFilterCollege('all'); setEligibleOnly(false); }} style={{ padding: '8px 20px', background: M, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Clear Filters</button>
                  : undefined}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
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
    </div>
  );
}
