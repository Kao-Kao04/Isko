'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type Scholarship, type ScholarshipStatus } from '@/lib/osfa-data';
import { useOsfaContext } from '@/lib/osfa-context';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';

const TEAL = '#1D9E75';
const TEAL_DARK = '#178a64';
const TEAL_LIGHT = '#e8faf4';

const statusStyle: Record<ScholarshipStatus, { bg: string; color: string; dot: string }> = {
  Active:   { bg: '#ecfdf5', color: '#059669', dot: '#10b981' },
  Draft:    { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
  Closed:   { bg: '#fff7ed', color: '#ea580c', dot: '#f97316' },
  Archived: { bg: '#f8fafc', color: '#9ca3af', dot: '#d1d5db' },
};

const urgencyStyle: Record<string, { color: string; bg: string }> = {
  critical: { color: '#dc2626', bg: '#fef2f2' },
  warning:  { color: '#d97706', bg: '#fffbeb' },
  normal:   { color: '#6b7280', bg: '#f8fafc' },
};

const SCHOLARSHIP_TYPES = ['Merit-Based', 'Need-Based', 'STEM Only', 'Service-Based', 'Government-Funded', 'Other'];
const EMPTY_FORM = {
  title: '', description: '', amount: '', period: 'per semester',
  deadline: '', slots: '', type: 'Merit-Based', eligibility: '', status: 'Draft' as ScholarshipStatus,
};

export default function Page() {
  const { toasts, addToast, removeToast } = useToast();
  const { scholarships, setScholarships } = useOsfaContext();
  const [filterStatus, setFilterStatus] = useState<'All' | ScholarshipStatus>('All');
  const [searchQuery, setSearchQuery]   = useState('');
  const [openMenuId, setOpenMenuId]     = useState<string | null>(null);

  // Modals
  const [showForm, setShowForm]               = useState(false);
  const [editingId, setEditingId]             = useState<string | null>(null);
  const [form, setForm]                       = useState(EMPTY_FORM);
  const [confirmArchive, setConfirmArchive]   = useState<Scholarship | null>(null);
  const [confirmClose, setConfirmClose]       = useState<Scholarship | null>(null);
  const [confirmPublish, setConfirmPublish]   = useState<Scholarship | null>(null);
  const [archiveConfirmText, setArchiveConfirmText] = useState('');

  const filtered = scholarships.filter(s => {
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    All:      scholarships.length,
    Active:   scholarships.filter(s => s.status === 'Active').length,
    Draft:    scholarships.filter(s => s.status === 'Draft').length,
    Closed:   scholarships.filter(s => s.status === 'Closed').length,
    Archived: scholarships.filter(s => s.status === 'Archived').length,
  };

  // ── Scholarship actions ──────────────────────────────────────
  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(s: Scholarship) {
    setEditingId(s.id);
    setForm({
      title: s.title,
      description: s.description,
      amount: s.amountRaw.toString(),
      period: s.period,
      deadline: s.deadline === 'Not set' ? '' : s.deadline,
      slots: s.slots.toString(),
      type: s.type,
      eligibility: s.eligibility,
      status: s.status,
    });
    setShowForm(true);
    setOpenMenuId(null);
  }

  function handleSaveForm() {
    if (!form.title.trim() || !form.amount || !form.slots) {
      addToast('error', 'Title, amount, and number of slots are required.');
      return;
    }
    const amountRaw = parseInt(form.amount.replace(/[^\d]/g, '')) || 0;
    const deadline  = form.deadline || 'Not set';
    const daysLeft  = form.deadline ? Math.max(0, Math.ceil((new Date(form.deadline).getTime() - Date.now()) / 86400000)) : 999;
    const urgency   = daysLeft <= 3 ? 'critical' : daysLeft <= 10 ? 'warning' : 'normal';

    if (editingId) {
      setScholarships(prev => prev.map(s => s.id === editingId
        ? { ...s, title: form.title, description: form.description, amount: `₱${amountRaw.toLocaleString()}`, amountRaw, period: form.period, deadline, daysLeft, urgency, slots: parseInt(form.slots) || s.slots, type: form.type, eligibility: form.eligibility }
        : s
      ));
      addToast('success', `"${form.title}" updated successfully.`);
    } else {
      const newScholarship: Scholarship = {
        id: Date.now().toString(),
        title: form.title,
        description: form.description,
        amount: `₱${amountRaw.toLocaleString()}`,
        amountRaw,
        period: form.period,
        deadline,
        daysLeft,
        urgency,
        applicants: 0,
        slots: parseInt(form.slots) || 0,
        status: 'Draft',
        type: form.type,
        eligibility: form.eligibility,
      };
      setScholarships(prev => [newScholarship, ...prev]);
      addToast('success', `"${form.title}" created as a Draft.`);
    }
    setShowForm(false);
    setEditingId(null);
  }

  function duplicateScholarship(s: Scholarship) {
    const copy: Scholarship = {
      ...s,
      id: Date.now().toString(),
      title: `${s.title} (Copy)`,
      status: 'Draft',
      applicants: 0,
      deadline: 'Not set',
      daysLeft: 999,
      urgency: 'normal',
    };
    setScholarships(prev => [copy, ...prev]);
    addToast('info', `"${s.title}" duplicated as a Draft.`);
    setOpenMenuId(null);
  }

  function publishScholarship(id: string) {
    setScholarships(prev => prev.map(s => s.id === id ? { ...s, status: 'Active' } : s));
    addToast('success', `Scholarship published and now visible to students.`);
    setConfirmPublish(null);
  }

  function closeScholarship(id: string) {
    setScholarships(prev => prev.map(s => s.id === id ? { ...s, status: 'Closed' } : s));
    addToast('warning', 'Applications closed. Existing applications are unaffected.');
    setConfirmClose(null);
  }

  function archiveScholarship(id: string) {
    setScholarships(prev => prev.map(s => s.id === id ? { ...s, status: 'Archived' } : s));
    addToast('info', 'Scholarship archived. All data and history are preserved.');
    setConfirmArchive(null);
    setArchiveConfirmText('');
  }

  function setField(key: keyof typeof EMPTY_FORM, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
    fontSize: 13, color: '#111827', background: '#f9fafb', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/osfa/home" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Scholarships</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Scholarship Management</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Create and manage scholarship programs</p>
        </div>
        <button
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: `0 2px 8px ${TEAL}40` }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Scholarship
        </button>
      </div>

      {/* Filter tabs + search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['All', 'Active', 'Draft', 'Closed', 'Archived'] as const).map(label => {
          const active = filterStatus === label;
          return (
            <button key={label} onClick={() => setFilterStatus(label)} style={{ padding: '8px 18px', borderRadius: 8, border: active ? `1.5px solid ${TEAL}` : '1px solid #e5e7eb', background: active ? TEAL_LIGHT : '#fff', color: active ? TEAL : '#374151', fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
              {label} <span style={{ marginLeft: 4, fontSize: 12, fontWeight: 700, opacity: 0.7 }}>({counts[label]})</span>
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search scholarships..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', outline: 'none', background: '#f9fafb', width: 220 }} />
        </div>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No scholarships found</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Try adjusting your filter or create a new scholarship.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
          {filtered.map(s => {
            const st = statusStyle[s.status];
            const ur = urgencyStyle[s.urgency];
            const slotsFilled = s.slots > 0 ? (s.applicants / s.slots) * 100 : 0;
            const isArchived  = s.status === 'Archived';
            return (
              <div key={s.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', opacity: isArchived ? 0.72 : 1 }}>
                <div style={{ height: 4, background: s.status === 'Active' ? `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})` : s.status === 'Draft' ? '#94a3b8' : s.status === 'Closed' ? '#f97316' : '#d1d5db' }} />

                <div style={{ padding: '18px 20px', flex: 1 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, fontSize: 12, fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} />
                      {s.status}
                    </span>
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)} style={{ padding: '4px 7px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7, cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                      </button>
                      {openMenuId === s.id && (
                        <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 180, overflow: 'hidden' }}>
                          {[
                            { label: 'Edit',               color: '#374151', show: !isArchived,                    action: () => openEdit(s) },
                            { label: 'Duplicate',          color: '#374151', show: true,                            action: () => duplicateScholarship(s) },
                            { label: 'Publish',            color: TEAL,      show: s.status === 'Draft',             action: () => { setConfirmPublish(s); setOpenMenuId(null); } },
                            { label: 'Reopen Applications',color: '#2563eb', show: s.status === 'Closed',            action: () => { publishScholarship(s.id); setOpenMenuId(null); } },
                            { label: 'Close Applications', color: '#ea580c', show: s.status === 'Active',            action: () => { setConfirmClose(s); setOpenMenuId(null); } },
                            { label: 'Archive',            color: '#dc2626', show: !isArchived,                     action: () => { setConfirmArchive(s); setArchiveConfirmText(''); setOpenMenuId(null); } },
                          ].filter(item => item.show).map(item => (
                            <button key={item.label} onClick={item.action} style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 500, color: item.color, cursor: 'pointer', display: 'block' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                            >{item.label}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{s.title}</h3>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, fontWeight: 500 }}>{s.type}</div>
                  <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{s.description}</p>

                  <div style={{ fontSize: 22, fontWeight: 800, color: TEAL, marginBottom: 14 }}>
                    {s.amount} <span style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af' }}>{s.period}</span>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>Deadline</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: s.daysLeft <= 3 ? ur.color : '#374151' }}>
                        {s.deadline}
                        {s.daysLeft < 999 && <span style={{ marginLeft: 6, padding: '1px 7px', borderRadius: 20, background: ur.bg, color: ur.color, fontSize: 11 }}>{s.daysLeft}d left</span>}
                      </span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                          <span style={{ fontSize: 12, color: '#6b7280' }}>Applicants / Slots</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: slotsFilled >= 90 ? '#dc2626' : '#374151' }}>{s.applicants} / {s.slots}</span>
                      </div>
                      <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${Math.min(slotsFilled, 100)}%`, background: slotsFilled >= 90 ? '#dc2626' : slotsFilled >= 70 ? '#d97706' : TEAL, borderRadius: 99, transition: 'width 0.3s' }} />
                      </div>
                      {slotsFilled >= 90 && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3, fontWeight: 600 }}>Slots nearly full</div>}
                    </div>

                    {s.eligibility && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        <span style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{s.eligibility}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10 }}>
                  <Link
                    href={`/osfa/applicants?scholarship=${encodeURIComponent(s.title)}`}
                    style={{ flex: 1, padding: 8, border: `1.5px solid ${TEAL}`, color: TEAL, borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, textAlign: 'center', background: TEAL_LIGHT }}>
                    View Applicants ({s.applicants})
                  </Link>
                  {!isArchived && (
                    <button onClick={() => openEdit(s)} style={{ padding: '8px 18px', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create / Edit Modal ───────────────────────────────────── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 18, maxWidth: 660, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 28px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>{editingId ? 'Edit Scholarship' : 'Create New Scholarship'}</h2>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#9ca3af' }}>{editingId ? 'Update the scholarship details below.' : 'New scholarships are saved as Draft until published.'}</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '70vh', overflowY: 'auto' }}>
              <div>
                <label style={labelStyle}>Scholarship Title <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g., Academic Excellence Grant" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Briefly describe the scholarship program..." rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Grant Amount (₱) <span style={{ color: '#dc2626' }}>*</span></label>
                  <input type="number" value={form.amount} onChange={e => setField('amount', e.target.value)} placeholder="e.g., 50000" style={inputStyle} min={0} />
                </div>
                <div>
                  <label style={labelStyle}>Grant Period</label>
                  <select value={form.period} onChange={e => setField('period', e.target.value)} style={inputStyle}>
                    <option value="per semester">Per Semester</option>
                    <option value="per year">Per Year</option>
                    <option value="one-time">One-Time</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Number of Slots <span style={{ color: '#dc2626' }}>*</span></label>
                  <input type="number" value={form.slots} onChange={e => setField('slots', e.target.value)} placeholder="e.g., 50" style={inputStyle} min={1} />
                </div>
                <div>
                  <label style={labelStyle}>Application Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setField('deadline', e.target.value)} style={inputStyle} />
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Leave blank for no set deadline</div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Scholarship Type</label>
                <select value={form.type} onChange={e => setField('type', e.target.value)} style={inputStyle}>
                  {SCHOLARSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Eligibility Requirements</label>
                <input type="text" value={form.eligibility} onChange={e => setField('eligibility', e.target.value)} placeholder="e.g., GWA of 1.75 or better, full-time enrollment" style={inputStyle} />
              </div>
            </div>

            <div style={{ padding: '18px 28px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafafa' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 22px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleSaveForm} style={{ padding: '10px 28px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff', boxShadow: `0 2px 8px ${TEAL}40` }}>
                {editingId ? 'Save Changes' : 'Create Scholarship'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Publish confirmation ──────────────────────────────────── */}
      {confirmPublish && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmPublish(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: TEAL_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9z"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Publish Scholarship</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              <strong>{confirmPublish.title}</strong> will be published and immediately visible to students. Applications will open right away.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmPublish(null)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={() => publishScholarship(confirmPublish.id)} style={{ flex: 1, padding: 10, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Publish Now</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Close Applications confirmation ──────────────────────── */}
      {confirmClose && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmClose(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Close Applications</h2>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              Applications for <strong>{confirmClose.title}</strong> will be closed immediately. No new applications will be accepted.
            </p>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', marginBottom: 22, fontSize: 13, color: '#475569' }}>
              <strong>{confirmClose.applicants}</strong> existing application{confirmClose.applicants !== 1 ? 's' : ''} will not be affected and can still be evaluated.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmClose(null)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={() => closeScholarship(confirmClose.id)} style={{ flex: 1, padding: 10, background: '#ea580c', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Close Applications</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Archive confirmation — destructive, requires name confirmation ── */}
      {confirmArchive && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setConfirmArchive(null); setArchiveConfirmText(''); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 460, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Archive Scholarship</h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#9ca3af' }}>This action removes it from the active list</p>
              </div>
            </div>

            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              <strong>{confirmArchive.title}</strong> will be archived. All data, application history, and evaluations are preserved but the scholarship will no longer be visible to students.
            </p>

            {confirmArchive.applicants > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991b1b' }}>
                <strong>Warning:</strong> This scholarship currently has <strong>{confirmArchive.applicants}</strong> applicant{confirmArchive.applicants !== 1 ? 's' : ''}. Archiving will not delete their applications but the scholarship will no longer be manageable.
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Type the scholarship name to confirm: <span style={{ color: '#dc2626', fontStyle: 'italic' }}>{confirmArchive.title}</span>
              </label>
              <input
                type="text"
                value={archiveConfirmText}
                onChange={e => setArchiveConfirmText(e.target.value)}
                placeholder="Type the scholarship name exactly..."
                style={{ width: '100%', padding: '9px 12px', border: `1px solid ${archiveConfirmText === confirmArchive.title ? '#6ee7b7' : '#e5e7eb'}`, borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setConfirmArchive(null); setArchiveConfirmText(''); }} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button
                disabled={archiveConfirmText !== confirmArchive.title}
                onClick={() => archiveScholarship(confirmArchive.id)}
                style={{ flex: 1, padding: 10, background: archiveConfirmText === confirmArchive.title ? '#dc2626' : '#fca5a5', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: archiveConfirmText === confirmArchive.title ? 'pointer' : 'not-allowed', color: '#fff' }}>
                Archive Scholarship
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
