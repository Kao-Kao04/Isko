'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Applicant, type AppStatus } from '@/lib/osfa-data';
import { useOsfaContext } from '@/lib/osfa-context';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';

const TEAL = '#1D9E75';
const TEAL_DARK = '#178a64';
const TEAL_LIGHT = '#e8faf4';
const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)';

const statusStyle: Record<AppStatus, { bg: string; color: string; dot: string }> = {
  Pending:        { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  'Under Review': { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  Approved:       { bg: '#ecfdf5', color: '#059669', dot: '#10b981' },
  Rejected:       { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
  Incomplete:     { bg: '#fff7ed', color: '#ea580c', dot: '#f97316' },
  Duplicate:      { bg: '#faf5ff', color: '#7c3aed', dot: '#a78bfa' },
};

const TERMINAL_STATUSES: AppStatus[] = ['Approved', 'Rejected', 'Duplicate'];
const scholarships = ['All Scholarships', 'Academic Excellence Grant', 'STEM Innovation Award', 'Community Service Scholarship', 'Financial Assistance Program'];
const statusFilters: Array<'All' | AppStatus> = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected', 'Incomplete', 'Duplicate'];
const perPageOptions = [5, 10, 20, 50];
type SortKey = 'name' | 'school' | 'scholarship' | 'status' | 'applied' | 'gwa';
type SortDir = 'asc' | 'desc';

function StatusBadge({ status }: { status: AppStatus }) {
  const s = statusStyle[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: active ? 1 : 0.35, marginLeft: 3, flexShrink: 0 }}>
      {dir === 'asc' || !active ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

function ApplicantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();
  const { applicants, setApplicants } = useOsfaContext();
  const [searchQuery, setSearchQuery]   = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<'All' | AppStatus>((searchParams.get('status') as AppStatus) || 'All');
  const [scholarshipFilter, setScholarshipFilter] = useState(searchParams.get('scholarship') || 'All Scholarships');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage]   = useState(1);
  const [perPage, setPerPage]           = useState(10);
  const [sortKey, setSortKey]           = useState<SortKey>('applied');
  const [sortDir, setSortDir]           = useState<SortDir>('desc');
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; ids: string[] } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote]     = useState('');
  const [openMenuId, setOpenMenuId]     = useState<string | null>(null);
  const [hoveredTile, setHoveredTile]   = useState<string | null>(null);
  const [hoveredRow, setHoveredRow]     = useState<string | null>(null);

  // Sync URL search params → state on mount
  useEffect(() => {
    const s = searchParams.get('status');
    const sc = searchParams.get('scholarship');
    if (s && statusFilters.includes(s as AppStatus)) setStatusFilter(s as AppStatus);
    if (sc) setScholarshipFilter(sc);
  }, [searchParams]);

  const filtered = applicants.filter(a => {
    const q = searchQuery.toLowerCase();
    const matchSearch = a.name.toLowerCase().includes(q) ||
      a.school.toLowerCase().includes(q) ||
      a.program.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchScholarship = scholarshipFilter === 'All Scholarships' || a.scholarship === scholarshipFilter;
    return matchSearch && matchStatus && matchScholarship;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name')        cmp = a.name.localeCompare(b.name);
    else if (sortKey === 'school') cmp = a.school.localeCompare(b.school);
    else if (sortKey === 'scholarship') cmp = a.scholarship.localeCompare(b.scholarship);
    else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
    else if (sortKey === 'gwa')    cmp = parseFloat(a.gwa) - parseFloat(b.gwa);
    else /* applied */ {
      const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
      const parse = (d: string) => { const [m, day, y] = d.split(/[\s,]+/); return new Date(+y, months[m] ?? 0, +day).getTime(); };
      cmp = parse(a.applied) - parse(b.applied);
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated  = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setCurrentPage(1);
  }

  const statusCounts = {
    All: applicants.length,
    Pending: applicants.filter(a => a.status === 'Pending').length,
    'Under Review': applicants.filter(a => a.status === 'Under Review').length,
    Approved: applicants.filter(a => a.status === 'Approved').length,
    Rejected: applicants.filter(a => a.status === 'Rejected').length,
    Incomplete: applicants.filter(a => a.status === 'Incomplete').length,
    Duplicate: applicants.filter(a => a.status === 'Duplicate').length,
  };

  const toggleRow = (id: string) => setSelectedRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => selectedRows.size === paginated.length ? setSelectedRows(new Set()) : setSelectedRows(new Set(paginated.map(a => a.id)));
  const clearSelection = () => setSelectedRows(new Set());

  function handleApprove(ids: string[]) {
    // Check for terminal statuses
    const alreadyDecided = ids.filter(id => {
      const a = applicants.find(x => x.id === id);
      return a && TERMINAL_STATUSES.includes(a.status);
    });
    if (alreadyDecided.length > 0 && alreadyDecided.length === ids.length) {
      addToast('warning', 'All selected applicants are already in a terminal status (Approved/Rejected/Duplicate).');
      setConfirmAction(null);
      return;
    }
    const eligibleIds = ids.filter(id => {
      const a = applicants.find(x => x.id === id);
      return a && !TERMINAL_STATUSES.includes(a.status);
    });
    setApplicants(prev => prev.map(a => eligibleIds.includes(a.id) ? { ...a, status: 'Approved' as AppStatus } : a));
    addToast('success', `${eligibleIds.length} applicant${eligibleIds.length > 1 ? 's' : ''} approved successfully.`);
    setConfirmAction(null);
    setSelectedRows(new Set());
  }

  function handleReject(ids: string[]) {
    const eligibleIds = ids.filter(id => {
      const a = applicants.find(x => x.id === id);
      return a && !TERMINAL_STATUSES.includes(a.status);
    });
    setApplicants(prev => prev.map(a => eligibleIds.includes(a.id) ? { ...a, status: 'Rejected' as AppStatus } : a));
    addToast('error', `${eligibleIds.length} applicant${eligibleIds.length > 1 ? 's' : ''} rejected.`);
    setConfirmAction(null);
    setRejectReason('');
    setRejectNote('');
    setSelectedRows(new Set());
  }

  function handleFlagDuplicate(id: string) {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'Duplicate' as AppStatus } : a));
    addToast('warning', 'Application flagged as duplicate.');
    setOpenMenuId(null);
  }

  function handleExportCSV() {
    const rows = [
      ['Name', 'Email', 'School', 'Program', 'Year Level', 'Scholarship', 'GWA', 'Status', 'Applied'],
      ...sorted.map(a => [a.name, a.email, a.school, a.program, a.yearLevel, a.scholarship, a.gwa, a.status, a.applied]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'applicants.csv'; link.click();
    URL.revokeObjectURL(url);
    addToast('success', `Exported ${sorted.length} applicant${sorted.length !== 1 ? 's' : ''} to CSV.`);
  }

  const alreadyDecidedInSelection = confirmAction?.ids.filter(id => {
    const a = applicants.find(x => x.id === id);
    return a && TERMINAL_STATUSES.includes(a.status);
  }) ?? [];

  const thStyle = (key: SortKey): React.CSSProperties => ({
    padding: '12px 14px',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
    fontSize: 11.5,
    fontWeight: 600,
    color: sortKey === key ? TEAL : '#64748b',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    background: '#f8fafc',
  });

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/osfa/home" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Applicants</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Applicant Management</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Review and manage all scholarship applications</p>
        </div>
        <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      {/* Status tiles — quick filter */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 18 }}>
        {(Object.entries(statusCounts) as [string, number][]).map(([label, count]) => {
          const isAll = label === 'All';
          const s = isAll ? null : statusStyle[label as AppStatus];
          const active = statusFilter === label;
          const isHov = hoveredTile === label;
          return (
            <div
              key={label}
              onClick={() => { setStatusFilter(label as 'All' | AppStatus); setCurrentPage(1); }}
              onMouseEnter={() => setHoveredTile(label)}
              onMouseLeave={() => setHoveredTile(null)}
              style={{
                background: active ? (s ? s.bg : '#f3f4f6') : '#fff',
                border: `1px solid ${active ? (s ? s.dot + '80' : '#9ca3af80') : isHov ? '#d1d5db' : '#e2e8f0'}`,
                borderRadius: 11,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: active ? CARD_SHADOW : isHov ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
                transform: isHov && !active ? 'translateY(-1px)' : 'none',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: s ? s.color : '#374151', letterSpacing: '-0.02em' }}>{count}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3, fontWeight: 500 }}>{label}</div>
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
          <input type="text" placeholder="Search by name, school, email, or program..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={scholarshipFilter} onChange={e => { setScholarshipFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none', cursor: 'pointer' }}>
          {scholarships.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(searchQuery || statusFilter !== 'All' || scholarshipFilter !== 'All Scholarships') && (
          <button onClick={() => { setSearchQuery(''); setStatusFilter('All'); setScholarshipFilter('All Scholarships'); setCurrentPage(1); }} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#6b7280', background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Clear filters
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{sorted.length} result{sorted.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Bulk action bar */}
      {selectedRows.size > 0 && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '12px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{selectedRows.size} selected</span>
          <div style={{ width: 1, height: 18, background: '#334155' }} />
          <button onClick={() => setConfirmAction({ type: 'approve', ids: Array.from(selectedRows) })} style={{ padding: '6px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Approve Selected</button>
          <button onClick={() => setConfirmAction({ type: 'reject', ids: Array.from(selectedRows) })} style={{ padding: '6px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Reject Selected</button>
          <button onClick={clearSelection} style={{ marginLeft: 'auto', padding: '6px 12px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: CARD_SHADOW }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: 40, background: '#f8fafc' }}>
                  <input type="checkbox" checked={paginated.length > 0 && selectedRows.size === paginated.length} onChange={toggleAll} style={{ cursor: 'pointer', width: 15, height: 15, accentColor: TEAL }} />
                </th>
                {([['name', 'Applicant'], ['school', 'School'], ['scholarship', 'Scholarship'], ['status', 'Status'], ['applied', 'Applied'], ['gwa', 'GWA']] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key} style={thStyle(key)} onClick={() => toggleSort(key)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {label}
                      <SortIcon active={sortKey === key} dir={sortDir} />
                    </span>
                  </th>
                ))}
                <th style={{ padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: '0.03em', textTransform: 'uppercase', background: '#f8fafc' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>No applicants found</div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>Try adjusting your search or filter criteria.</div>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((a, i) => (
                <tr
                  key={a.id}
                  onMouseEnter={() => setHoveredRow(a.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: selectedRows.has(a.id) ? '#f0fdf4' : hoveredRow === a.id ? '#f8fafc' : i % 2 === 0 ? '#fff' : '#fafafa',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.12s ease',
                  }}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <input type="checkbox" checked={selectedRows.has(a.id)} onChange={() => toggleRow(a.id)} style={{ cursor: 'pointer', width: 15, height: 15, accentColor: TEAL }} />
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{a.initials}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#374151' }}>{a.school}</td>
                  <td style={{ padding: '12px 14px', color: '#374151', maxWidth: 200 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.scholarship}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}><StatusBadge status={a.status} /></td>
                  <td style={{ padding: '12px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{a.applied}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: parseFloat(a.gwa) <= 1.75 ? '#059669' : parseFloat(a.gwa) <= 2.0 ? '#d97706' : '#dc2626' }}>{a.gwa}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                      <Link href={`/osfa/applicants/${a.id}`} style={{ padding: '5px 10px', background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>View</Link>
                      <Link href={`/osfa/evaluation?autoOpen=${a.id}`} style={{ padding: '5px 10px', background: TEAL_LIGHT, color: TEAL, border: `1px solid #bbf7d0`, borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Evaluate</Link>
                      <div style={{ position: 'relative' }}>
                        <button onClick={() => setOpenMenuId(openMenuId === a.id ? null : a.id)} style={{ padding: '5px 8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                        </button>
                        {openMenuId === a.id && (
                          <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 170, overflow: 'hidden' }}>
                            {[
                              { label: 'Approve', color: '#059669', show: !TERMINAL_STATUSES.includes(a.status), action: () => { setConfirmAction({ type: 'approve', ids: [a.id] }); setOpenMenuId(null); } },
                              { label: 'Reject', color: '#dc2626', show: !TERMINAL_STATUSES.includes(a.status), action: () => { setConfirmAction({ type: 'reject', ids: [a.id] }); setOpenMenuId(null); } },
                              { label: 'Flag as Duplicate', color: '#7c3aed', show: a.status !== 'Duplicate', action: () => handleFlagDuplicate(a.id) },
                            ].filter(item => item.show).map(item => (
                              <button key={item.label} onClick={item.action} style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 500, color: item.color, cursor: 'pointer' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                              >{item.label}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Showing {sorted.length === 0 ? 0 : (currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, sorted.length)} of {sorted.length}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: currentPage === 1 ? '#d1d5db' : '#374151', fontSize: 13, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const page = i + 1;
              return (
                <button key={page} onClick={() => setCurrentPage(page)} style={{ width: 32, height: 32, borderRadius: 7, border: currentPage === page ? `1.5px solid ${TEAL}` : '1px solid #e5e7eb', background: currentPage === page ? TEAL_LIGHT : '#fff', color: currentPage === page ? TEAL : '#374151', fontSize: 13, fontWeight: currentPage === page ? 700 : 400, cursor: 'pointer' }}>
                  {page}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: currentPage === totalPages ? '#d1d5db' : '#374151', fontSize: 13, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, color: '#374151', background: '#f9fafb', outline: 'none', cursor: 'pointer' }}>
              {perPageOptions.map(n => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Approve confirmation dialog */}
      {confirmAction?.type === 'approve' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmAction(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Confirm Approval</h2>
            {alreadyDecidedInSelection.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#92400e' }}>
                <strong>{alreadyDecidedInSelection.length}</strong> of the selected applicants are already in a terminal status and will be skipped.
              </div>
            )}
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              You are approving <strong>{confirmAction.ids.length - alreadyDecidedInSelection.length}</strong> eligible applicant{(confirmAction.ids.length - alreadyDecidedInSelection.length) !== 1 ? 's' : ''}. They will be notified via email. This action is recorded in the audit log.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmAction(null)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={() => handleApprove(confirmAction.ids)} style={{ flex: 1, padding: 10, background: '#059669', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      {confirmAction?.type === 'reject' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setConfirmAction(null); setRejectReason(''); setRejectNote(''); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Reject Application</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              Provide a reason for rejecting {confirmAction.ids.length === 1 ? 'this application' : `these ${confirmAction.ids.length} applications`}. This will be included in the notification sent to the student.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Reason <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none' }}>
                <option value="">Select a reason...</option>
                <option value="missing_docs">Missing required documents</option>
                <option value="criteria">Does not meet eligibility criteria</option>
                <option value="gwa">GWA does not meet the minimum requirement</option>
                <option value="duplicate">Duplicate application</option>
                <option value="incomplete">Incomplete application form</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Additional Note <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Provide specific details for the applicant..." rows={3} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setConfirmAction(null); setRejectReason(''); setRejectNote(''); }} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button disabled={!rejectReason} onClick={() => rejectReason && handleReject(confirmAction.ids)} style={{ flex: 1, padding: 10, background: rejectReason ? '#dc2626' : '#fca5a5', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: rejectReason ? 'pointer' : 'not-allowed', color: '#fff' }}>Confirm Rejection</button>
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
