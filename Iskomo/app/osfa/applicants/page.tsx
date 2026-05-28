'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { applicationApi, type ApplicationResponse, type ApplicationStatus } from '@/lib/api-client';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';
import { Skel } from '@/components/shared/Skeleton';

const TEAL = COLORS.maroon;
const TEAL_DARK = COLORS.maroonD;
const TEAL_LIGHT = COLORS.maroonL;
const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)';

const statusStyle: Record<string, { bg: string; color: string; dot: string }> = {
  pending:    { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  approved:   { bg: '#f0fdf4', color: '#059669', dot: '#10b981' },
  rejected:   { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626' },
  incomplete: { bg: '#fff7ed', color: '#ea580c', dot: '#f97316' },
  withdrawn:  { bg: '#f8fafc', color: '#9ca3af', dot: '#d1d5db' },
};

const TERMINAL: ApplicationStatus[] = ['approved', 'rejected', 'withdrawn'];
const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected', 'incomplete', 'withdrawn'] as const;
const perPageOptions = [5, 10, 20, 50];
type SortKey = 'name' | 'scholarship' | 'status' | 'submitted';

function getFullName(app: ApplicationResponse): string {
  if (!app.student) return `Student #${app.student_id}`;
  const { first_name, last_name } = app.student;
  return `${first_name ?? ''} ${last_name ?? ''}`.trim() || `Student #${app.student_id}`;
}

function getInitials(app: ApplicationResponse): string {
  if (!app.student?.first_name) return '??';
  return `${app.student.first_name[0]}${app.student.last_name?.[0] ?? ''}`.toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  const s = statusStyle[status] ?? statusStyle.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: active ? 1 : 0.35, marginLeft: 3, flexShrink: 0 }}>
      {dir === 'asc' || !active ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

function ApplicantsContent() {
  const searchParams = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();

  const [applications, setApplications]   = useState<ApplicationResponse[]>([]);
  const [loading, setLoading]             = useState(true);
  const [serverTotal, setServerTotal]     = useState(0);
  const [statusCounts, setStatusCounts]   = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery]     = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter]   = useState<typeof STATUS_FILTERS[number]>(
    (searchParams.get('status') as typeof STATUS_FILTERS[number]) || 'all'
  );
  const scholarshipIdParam = searchParams.get('scholarship');
  const scholarshipIdFilter = scholarshipIdParam ? Number(scholarshipIdParam) : undefined;
  const [selectedRows, setSelectedRows]   = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage]     = useState(1);
  const [perPage, setPerPage]             = useState(10);
  const [sortKey, setSortKey]             = useState<SortKey>('submitted');
  const [sortDir, setSortDir]             = useState<'asc' | 'desc'>('desc');
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; ids: number[] } | null>(null);
  const [rejectReason, setRejectReason]   = useState('');
  const [rejectNote, setRejectNote]       = useState('');
  const [openMenuId, setOpenMenuId]       = useState<number | null>(null);
  const [hoveredTile, setHoveredTile]     = useState<string | null>(null);
  const [hoveredRow, setHoveredRow]       = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch status counts independently so tiles always show totals across all pages
  const fetchCounts = useCallback(async () => {
    const statuses = ['pending', 'approved', 'rejected', 'incomplete', 'withdrawn'] as const;
    const [totalRes, ...statusRes] = await Promise.allSettled([
      applicationApi.count(),
      ...statuses.map(s => applicationApi.count(s)),
    ]);
    const counts: Record<string, number> = {};
    counts['all'] = totalRes.status === 'fulfilled' ? (totalRes.value as { count: number }).count : 0;
    statuses.forEach((s, i) => {
      counts[s] = statusRes[i].status === 'fulfilled' ? (statusRes[i] as PromiseFulfilledResult<{ count: number }>).value.count : 0;
    });
    setStatusCounts(counts);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchApplications = useCallback(async (
    page: number, size: number, status: string, search: string,
  ) => {
    try {
      setLoading(true);
      const result = await applicationApi.list(
        page, size,
        status !== 'all' ? status : undefined,
        search || undefined,
        scholarshipIdFilter,
      );
      setApplications(result.items ?? []);
      setServerTotal(result.total ?? 0);
    } catch {
      addToast('error', 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial counts load
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  // Re-fetch page whenever filter, search (debounced), page, or perPage changes
  useEffect(() => {
    const t = setTimeout(
      () => fetchApplications(currentPage, perPage, statusFilter, searchQuery),
      searchQuery ? 400 : 0,
    );
    return () => clearTimeout(t);
  }, [currentPage, perPage, statusFilter, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sort current page client-side
  const sorted = [...applications].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name')             cmp = getFullName(a).localeCompare(getFullName(b));
    else if (sortKey === 'scholarship') cmp = (a.scholarship?.name ?? '').localeCompare(b.scholarship?.name ?? '');
    else if (sortKey === 'status')      cmp = a.status.localeCompare(b.status);
    else cmp = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(serverTotal / perPage));
  const paginated  = sorted;

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const toggleRow = (id: number) => setSelectedRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => selectedRows.size === sorted.length ? setSelectedRows(new Set()) : setSelectedRows(new Set(sorted.map(a => a.id)));

  async function handleApprove(ids: number[]) {
    const eligible = ids.filter(id => {
      const a = applications.find(x => x.id === id);
      return a && !TERMINAL.includes(a.status);
    });
    if (eligible.length === 0) {
      addToast('warning', 'All selected applicants are already in a terminal status.');
      setConfirmAction(null);
      return;
    }
    setActionLoading(true);
    try {
      await Promise.all(eligible.map(id => applicationApi.updateStatus(id, 'approved')));
      addToast('success', `${eligible.length} applicant${eligible.length > 1 ? 's' : ''} approved.`);
      await Promise.all([
        fetchApplications(currentPage, perPage, statusFilter, searchQuery),
        fetchCounts(),
      ]);
    } catch {
      addToast('error', 'Failed to approve some applications.');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setSelectedRows(new Set());
    }
  }

  async function handleReject(ids: number[]) {
    const eligible = ids.filter(id => {
      const a = applications.find(x => x.id === id);
      return a && !TERMINAL.includes(a.status);
    });
    setActionLoading(true);
    try {
      const remarks = `${rejectReason}${rejectNote ? ` — ${rejectNote}` : ''}`;
      await Promise.all(eligible.map(id => applicationApi.updateStatus(id, 'rejected', remarks)));
      addToast('error', `${eligible.length} applicant${eligible.length > 1 ? 's' : ''} rejected.`);
      await Promise.all([
        fetchApplications(currentPage, perPage, statusFilter, searchQuery),
        fetchCounts(),
      ]);
    } catch {
      addToast('error', 'Failed to reject some applications.');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setRejectReason('');
      setRejectNote('');
      setSelectedRows(new Set());
    }
  }

  async function handleExportCSV() {
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `applicants-${statusFilter}-${dateStr}.csv`;

    function triggerDownload(blob: Blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    }

    try {
      // Try backend export endpoint first
      const blob = await applicationApi.export(
        statusFilter !== 'all' ? statusFilter : undefined,
        searchQuery || undefined,
      );
      triggerDownload(blob);
      addToast('success', `Exported to ${filename}`);
    } catch {
      // Fallback: generate CSV client-side from currently loaded data
      const rows = [
        ['Name', 'Email', 'College', 'Program', 'Year Level', 'Scholarship', 'Status', 'Submitted'],
        ...sorted.map(a => [
          getFullName(a),
          a.student?.email ?? '',
          a.student?.college ?? '',
          a.student?.program ?? '',
          String(a.student?.year_level ?? ''),
          a.scholarship?.name ?? '',
          a.status,
          new Date(a.submitted_at).toLocaleDateString(),
        ]),
      ];
      const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
      triggerDownload(new Blob([csv], { type: 'text/csv' }));
      addToast('success', `Exported ${sorted.length} applicant${sorted.length !== 1 ? 's' : ''} to CSV.`);
    }
  }

  const thStyle = (key: SortKey): React.CSSProperties => ({
    padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0',
    fontSize: 11.5, fontWeight: 600, color: sortKey === key ? TEAL : '#64748b',
    letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    cursor: 'pointer', userSelect: 'none', background: '#f8fafc',
  });

  if (loading) return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <Skel h={28} w={200} r={8} mb={8} />
      <Skel h={14} w={300} r={6} mb={24} />
      {/* filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[...Array(5)].map((_, i) => <Skel key={i} h={34} w={90} r={8} />)}
      </div>
      {/* list items */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Skel w={40} h={40} r={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skel h={14} w="40%" r={6} mb={6} />
            <Skel h={11} w="60%" r={5} />
          </div>
          <Skel h={24} w={80} r={20} />
          <Skel h={30} w={90} r={8} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Applicants</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Applicant Management</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Review and manage all scholarship applications</p>
        </div>
        <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      {/* Status tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 18 }}>
        {STATUS_FILTERS.map(label => {
          const s = label === 'all' ? null : statusStyle[label];
          const active = statusFilter === label;
          const isHov = hoveredTile === label;
          return (
            <div key={label}
              onClick={() => { setStatusFilter(label); setCurrentPage(1); setSelectedRows(new Set()); }}
              onMouseEnter={() => setHoveredTile(label)}
              onMouseLeave={() => setHoveredTile(null)}
              style={{ background: active ? (s ? s.bg : '#f3f4f6') : '#fff', border: `1px solid ${active ? (s ? s.dot + '80' : '#9ca3af80') : isHov ? '#d1d5db' : '#e2e8f0'}`, borderRadius: 11, padding: '12px 14px', cursor: 'pointer', boxShadow: active ? CARD_SHADOW : isHov ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)', transform: isHov && !active ? 'translateY(-1px)' : 'none', transition: 'all 0.15s ease' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s ? s.color : '#374151', letterSpacing: '-0.02em' }}>{statusCounts[label] ?? '—'}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3, fontWeight: 500, textTransform: 'capitalize' }}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* Filter toolbar */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', boxShadow: CARD_SHADOW }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search by name, email, or scholarship..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); setSelectedRows(new Set()); }} style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        {(searchQuery || statusFilter !== 'all') && (
          <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCurrentPage(1); }} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#6b7280', background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Clear filters
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{serverTotal} result{serverTotal !== 1 ? 's' : ''}</span>
      </div>

      {/* Bulk action bar */}
      {selectedRows.size > 0 && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '12px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{selectedRows.size} selected</span>
          <div style={{ width: 1, height: 18, background: '#334155' }} />
          <button onClick={() => setConfirmAction({ type: 'approve', ids: Array.from(selectedRows) })} style={{ padding: '6px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Approve Selected</button>
          <button onClick={() => setConfirmAction({ type: 'reject', ids: Array.from(selectedRows) })} style={{ padding: '6px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Reject Selected</button>
          <button onClick={() => setSelectedRows(new Set())} style={{ marginLeft: 'auto', padding: '6px 12px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: CARD_SHADOW }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: 40, background: '#f8fafc' }}>
                  <input type="checkbox" checked={paginated.length > 0 && selectedRows.size === paginated.length} onChange={toggleAll} style={{ cursor: 'pointer', width: 15, height: 15, accentColor: TEAL }} />
                </th>
                {([['name', 'Applicant'], ['scholarship', 'Scholarship'], ['status', 'Status'], ['submitted', 'Submitted']] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key} style={thStyle(key)} onClick={() => toggleSort(key)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {label}<SortIcon active={sortKey === key} dir={sortDir} />
                    </span>
                  </th>
                ))}
                <th style={{ padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: '0.03em', textTransform: 'uppercase', background: '#f8fafc' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No applicants found</div>
                    <div style={{ fontSize: 13, color: '#9ca3af' }}>Try adjusting your search or filter.</div>
                  </td>
                </tr>
              ) : paginated.map((a, i) => {
                const name = getFullName(a);
                const initials = getInitials(a);
                return (
                  <tr key={a.id}
                    onMouseEnter={() => setHoveredRow(a.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ background: selectedRows.has(a.id) ? '#f0fdf4' : hoveredRow === a.id ? '#f8fafc' : i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f1f5f9', transition: 'background 0.12s ease' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <input type="checkbox" checked={selectedRows.has(a.id)} onChange={() => toggleRow(a.id)} style={{ cursor: 'pointer', width: 15, height: 15, accentColor: TEAL }} />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{name}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{a.student?.email ?? ''}</div>
                          {a.essay_text ? (
                            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                              "{a.essay_text}"
                            </div>
                          ) : (
                            <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 3 }}>No essay submitted</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#374151', maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.scholarship?.name ?? `#${a.scholarship_id}`}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <StatusBadge status={a.status} />
                    </td>
                    <td style={{ padding: '12px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {new Date(a.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                        <Link href={`/osfa/applicants/${a.id}`} style={{ padding: '5px 10px', background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>View</Link>
                        {!TERMINAL.includes(a.status) && (
                          <div style={{ position: 'relative' }}>
                            <button onClick={() => setOpenMenuId(openMenuId === a.id ? null : a.id)} style={{ padding: '5px 8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                            </button>
                            {openMenuId === a.id && (
                              <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 150, overflow: 'hidden' }}>
                                <button onClick={() => { setConfirmAction({ type: 'approve', ids: [a.id] }); setOpenMenuId(null); }} style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 500, color: '#059669', cursor: 'pointer' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>Approve</button>
                                <button onClick={() => { setConfirmAction({ type: 'reject', ids: [a.id] }); setOpenMenuId(null); }} style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 500, color: '#dc2626', cursor: 'pointer' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>Reject</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Showing {serverTotal === 0 ? 0 : (currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, serverTotal)} of {serverTotal}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: currentPage === 1 ? '#d1d5db' : '#374151', fontSize: 12, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>«</button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: currentPage === 1 ? '#d1d5db' : '#374151', fontSize: 13, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
            {(() => {
              const pages: number[] = [];
              const delta = 2;
              for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) pages.push(i);
              return pages.map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} style={{ width: 32, height: 32, borderRadius: 7, border: currentPage === p ? `1.5px solid ${TEAL}` : '1px solid #e5e7eb', background: currentPage === p ? TEAL_LIGHT : '#fff', color: currentPage === p ? TEAL : '#374151', fontSize: 13, fontWeight: currentPage === p ? 700 : 400, cursor: 'pointer' }}>{p}</button>
              ));
            })()}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: currentPage === totalPages ? '#d1d5db' : '#374151', fontSize: 13, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: currentPage === totalPages ? '#d1d5db' : '#374151', fontSize: 12, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>»</button>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); setSelectedRows(new Set()); }} style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, color: '#374151', background: '#f9fafb', outline: 'none', cursor: 'pointer' }}>
              {perPageOptions.map(n => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Approve confirmation */}
      {confirmAction?.type === 'approve' && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmAction(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Confirm Approval</h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              You are approving <strong>{confirmAction.ids.length}</strong> application{confirmAction.ids.length > 1 ? 's' : ''}. This action is recorded in the audit log.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmAction(null)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button disabled={actionLoading} onClick={() => handleApprove(confirmAction.ids)} style={{ flex: 1, padding: 10, background: '#059669', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', color: '#fff' }}>
                {actionLoading ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      {confirmAction?.type === 'reject' && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setConfirmAction(null); setRejectReason(''); setRejectNote(''); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Reject Application</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              Provide a reason for rejecting {confirmAction.ids.length === 1 ? 'this application' : `these ${confirmAction.ids.length} applications`}.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Reason <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none' }}>
                <option value="">Select a reason...</option>
                <option value="Missing Required Documents">Missing Required Documents</option>
                <option value="Does Not Meet Eligibility Criteria">Does Not Meet Eligibility Criteria</option>
                <option value="GWA Does Not Meet The Minimum Requirement">GWA Does Not Meet The Minimum Requirement</option>
                <option value="Duplicate Application">Duplicate Application</option>
                <option value="Incomplete Application Form">Incomplete Application Form</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Additional Note <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Provide specific details..." rows={3} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setConfirmAction(null); setRejectReason(''); setRejectNote(''); }} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button disabled={!rejectReason || actionLoading} onClick={() => rejectReason && handleReject(confirmAction.ids)} style={{ flex: 1, padding: 10, background: rejectReason && !actionLoading ? '#dc2626' : '#fca5a5', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: rejectReason && !actionLoading ? 'pointer' : 'not-allowed', color: '#fff' }}>
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {openMenuId && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpenMenuId(null)} />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: '#6b7280', fontSize: 14 }}>Loading applicants...</div>}>
      <ApplicantsContent />
    </Suspense>
  );
}
