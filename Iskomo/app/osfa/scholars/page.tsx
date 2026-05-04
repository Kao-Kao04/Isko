'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { scholarApi, type ScholarResponse, type ScholarStatus } from '@/lib/api-client';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;
const TEAL_DARK = COLORS.maroonD;

const STATUS_CFG: Record<ScholarStatus, { bg: string; color: string; dot: string; label: string }> = {
  active:       { bg: '#f0fdf4', color: '#059669', dot: '#10b981', label: 'Scholar' },
  probationary: { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b', label: 'Probationary' },
  terminated:   { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626', label: 'Terminated' },
  graduated:    { bg: '#f5f3ff', color: '#7c3aed', dot: '#8b5cf6', label: 'Graduated' },
};

const TAB_KEYS: ScholarStatus[] = ['active', 'probationary', 'terminated', 'graduated'];

export default function Page() {
  const { toasts, addToast, removeToast } = useToast();
  const [scholars, setScholars]     = useState<ScholarResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<ScholarStatus>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Status update modal
  const [statusModal, setStatusModal] = useState<ScholarResponse | null>(null);
  const [newStatus, setNewStatus]     = useState<ScholarStatus>('active');
  const [statusSaving, setStatusSaving] = useState(false);

  // Semester record modal
  const [semModal, setSemModal]       = useState<ScholarResponse | null>(null);
  const [semForm, setSemForm]         = useState({ semester: '1st Semester', academic_year: '2025-2026', gwa: '', notes: '' });
  const [semSaving, setSemSaving]     = useState(false);

  const fetchScholars = useCallback(async () => {
    setLoading(true);
    try {
      const first = await scholarApi.list(1, 100);
      const items = [...first.items];
      if (first.total > 100) {
        const pages = Math.min(Math.ceil(first.total / 100), 5);
        const rest = await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) => scholarApi.list(i + 2, 100))
        );
        rest.forEach(r => items.push(...r.items));
      }
      setScholars(items);
    } catch {
      addToast('error', 'Failed to load scholars.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchScholars(); }, [fetchScholars]);

  const counts = TAB_KEYS.reduce((acc, k) => {
    acc[k] = scholars.filter(s => (s.status as ScholarStatus) === k).length;
    return acc;
  }, {} as Record<ScholarStatus, number>);

  const filtered = scholars.filter(s => (s.status as ScholarStatus) === activeTab);

  async function handleStatusUpdate() {
    if (!statusModal) return;
    setStatusSaving(true);
    try {
      const updated = await scholarApi.updateStatus(statusModal.id, newStatus);
      setScholars(prev => prev.map(s => s.id === updated.id ? updated : s));
      addToast('success', `Scholar status updated to ${STATUS_CFG[newStatus].label}.`);
      setStatusModal(null);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleAddSemRecord() {
    if (!semModal) return;
    setSemSaving(true);
    try {
      const record = await scholarApi.addSemesterRecord(semModal.id, {
        semester:      semForm.semester,
        academic_year: semForm.academic_year,
        gwa:           semForm.gwa || undefined,
        notes:         semForm.notes || undefined,
        is_enrolled:   true,
      });
      setScholars(prev => prev.map(s => s.id === semModal.id
        ? { ...s, semester_records: [...s.semester_records, record] }
        : s
      ));
      addToast('success', 'Semester record added.');
      setSemModal(null);
      setSemForm({ semester: '1st Semester', academic_year: '2025-2026', gwa: '', notes: '' });
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to add record.');
    } finally {
      setSemSaving(false);
    }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 };

  if (loading) return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: `3px solid #f3f4f6`, borderTop: `3px solid ${TEAL}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Scholars</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Scholar Management</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Track, update status, and manage semester records of scholarship recipients</p>
        </div>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {TAB_KEYS.map(key => {
          const cfg = STATUS_CFG[key];
          const active = activeTab === key;
          return (
            <div key={key} onClick={() => setActiveTab(key)} style={{ background: active ? cfg.bg : '#fff', border: `1px solid ${active ? cfg.dot + '66' : '#e5e7eb'}`, borderRadius: 12, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: active ? cfg.color : '#111827' }}>{counts[key]}</div>
              <div style={{ fontSize: 12, color: active ? cfg.color : '#6b7280', fontWeight: 600, marginTop: 2 }}>{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search scholars..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#111827', background: 'transparent' }} />
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.filter(s => !searchQuery || s.scholarship_id.toString().includes(searchQuery) || s.student_id.toString().includes(searchQuery)).length} scholars</span>
      </div>

      {/* Scholar list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No {STATUS_CFG[activeTab].label} scholars</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              {activeTab === 'active' ? 'Scholars appear here when OSFA marks approved students as scholars.' : `No scholars currently in ${STATUS_CFG[activeTab].label} status.`}
            </div>
          </div>
        ) : filtered.map(scholar => {
          const cfg = STATUS_CFG[scholar.status as ScholarStatus];
          const latestRecord = scholar.semester_records.at(-1);
          return (
            <div key={scholar.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

                {/* Avatar */}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {scholar.student_id.toString().slice(-2)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Scholar #{scholar.id} · Student #{scholar.student_id}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot }} />
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Scholarship #{scholar.scholarship_id}</span>
                    {latestRecord && (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Latest: {latestRecord.semester} {latestRecord.academic_year} · GWA: {latestRecord.gwa ?? '—'}</span>
                    )}
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{scholar.semester_records.length} semester record{scholar.semester_records.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setSemModal(scholar); }}
                    style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    + Sem Record
                  </button>
                  <button
                    onClick={() => { setStatusModal(scholar); setNewStatus(scholar.status as ScholarStatus); }}
                    style={{ padding: '7px 14px', border: `1px solid ${TEAL}33`, borderRadius: 8, background: '#fff5f5', color: TEAL, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Update Status
                  </button>
                  <Link href={`/osfa/applicants/${scholar.application_id}`} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    View Application
                  </Link>
                </div>
              </div>

              {/* Semester records mini-table */}
              {scholar.semester_records.length > 0 && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '10px 20px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
                    {scholar.semester_records.map((r, i) => (
                      <div key={r.id} style={{ padding: '6px 16px', borderRight: i < scholar.semester_records.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{r.semester} {r.academic_year}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: r.gwa ? (parseFloat(r.gwa) <= 2.0 ? '#059669' : parseFloat(r.gwa) <= 2.75 ? '#d97706' : '#dc2626') : '#111827' }}>
                          GWA: {r.gwa ?? '—'}
                        </div>
                        {r.notes && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{r.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Status Update Modal ── */}
      {statusModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setStatusModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Update Scholar Status</h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>Scholar #{statusModal.id} · Student #{statusModal.student_id}</p>

            <label style={labelStyle}>New Status</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {TAB_KEYS.map(key => {
                const cfg = STATUS_CFG[key];
                return (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, border: `1.5px solid ${newStatus === key ? cfg.dot : '#e5e7eb'}`, background: newStatus === key ? cfg.bg : '#fff', cursor: 'pointer' }}>
                    <input type="radio" name="status" value={key} checked={newStatus === key} onChange={() => setNewStatus(key)} style={{ accentColor: cfg.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                  </label>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStatusModal(null)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleStatusUpdate} disabled={statusSaving} style={{ flex: 1, padding: 10, background: statusSaving ? '#9ca3af' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: statusSaving ? 'not-allowed' : 'pointer', color: '#fff' }}>
                {statusSaving ? 'Saving…' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Semester Record Modal ── */}
      {semModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setSemModal(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Add Semester Record</h2>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: '#6b7280' }}>Scholar #{semModal.id} · Student #{semModal.student_id}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Semester</label>
                  <select value={semForm.semester} onChange={e => setSemForm(p => ({ ...p, semester: e.target.value }))} style={inp}>
                    <option>1st Semester</option>
                    <option>2nd Semester</option>
                    <option>Summer</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Academic Year</label>
                  <input type="text" value={semForm.academic_year} onChange={e => setSemForm(p => ({ ...p, academic_year: e.target.value }))} placeholder="2025-2026" style={inp} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>GWA <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                <input type="number" step="0.01" min="1" max="5" value={semForm.gwa} onChange={e => setSemForm(p => ({ ...p, gwa: e.target.value }))} placeholder="e.g. 1.75" style={inp} />
              </div>
              <div>
                <label style={labelStyle}>Notes <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                <textarea value={semForm.notes} onChange={e => setSemForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Any remarks for this semester..." style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setSemModal(null)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleAddSemRecord} disabled={semSaving} style={{ flex: 1, padding: 10, background: semSaving ? '#9ca3af' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: semSaving ? 'not-allowed' : 'pointer', color: '#fff' }}>
                {semSaving ? 'Saving…' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
