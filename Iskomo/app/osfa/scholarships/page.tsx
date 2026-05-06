'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { scholarshipApi, type ScholarshipResponse, type ScholarshipStatus } from '@/lib/api-client';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;
const TEAL_DARK = COLORS.maroonD;
const TEAL_LIGHT = COLORS.maroonL;

const statusStyle: Record<string, { bg: string; color: string; dot: string }> = {
  active:   { bg: '#f0fdf4', color: '#059669', dot: '#10b981' },
  draft:    { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
  closed:   { bg: '#fff7ed', color: '#ea580c', dot: '#f97316' },
  archived: { bg: '#f8fafc', color: '#9ca3af', dot: '#d1d5db' },
};

const urgencyStyle: Record<string, { color: string; bg: string }> = {
  critical: { color: '#dc2626', bg: '#fef2f2' },
  warning:  { color: '#d97706', bg: '#fffbeb' },
  normal:   { color: '#6b7280', bg: '#f8fafc' },
};

const SCHOLARSHIP_TYPES = ['Merit-Based', 'Need-Based', 'STEM Only', 'Service-Based', 'Government-Funded', 'Other'];

const PUP_COLLEGES = [
  { code: 'CAF',   label: 'College of Accountancy and Finance' },
  { code: 'CADBE', label: 'College of Architecture, Design and the Built Environment' },
  { code: 'CAL',   label: 'College of Arts and Letters' },
  { code: 'CBA',   label: 'College of Business Administration' },
  { code: 'COC',   label: 'College of Communication' },
  { code: 'CCIS',  label: 'College of Computer and Information Sciences' },
  { code: 'COED',  label: 'College of Education' },
  { code: 'CE',    label: 'College of Engineering' },
  { code: 'CHK',   label: 'College of Human Kinetics' },
  { code: 'ITECH', label: 'Institute of Technology' },
  { code: 'CL',    label: 'College of Law' },
  { code: 'CPSPA', label: 'College of Political Science and Public Administration' },
  { code: 'CS',    label: 'College of Science' },
  { code: 'CSSD',  label: 'College of Social Sciences and Development' },
  { code: 'CTHTM', label: 'College of Tourism, Hospitality and Transportation Management' },
];

const COMMON_REQS = [
  'Copy of Grades / Transcript of Records',
  'Certificate of Registration / Proof of Enrollment',
  'Valid Government ID',
  'Barangay Certificate of Indigency / Eligibility',
  "Parents'/Guardian's ITR or Certificate of Non-payment",
  'Personal Data Sheet or Application Form',
  'Student Application Form (from OSFA)',
  'Certificate of Good Moral Character',
  'CFWP Profile Form / Beneficiary Agreement',
  'Parental Consent (Age 15–17)',
  '2×2 Picture (white background)',
  'Community Service Documentation',
  'Letter of Endorsement',
  'Proof of Graduation',
];

type FormReq = { tempId: string; name: string; description?: string; is_required: boolean };

const EMPTY_FORM = {
  name: '', description: '', amount_raw: '', period: 'per semester',
  deadline: '', slots: '', scholarship_type: 'Merit-Based', eligibility_text: '',
  eligible_colleges: [] as string[],
  eligible_programs: [] as string[],
  cover_image_url: '',
  programInput: '',
  requirements: [] as FormReq[],
  reqInput: '',
};

function getDaysLeft(deadline: string | null): number {
  if (!deadline) return 999;
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}

function getUrgency(daysLeft: number): 'critical' | 'warning' | 'normal' {
  if (daysLeft <= 3) return 'critical';
  if (daysLeft <= 10) return 'warning';
  return 'normal';
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Not set';
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Page() {
  const { toasts, addToast, removeToast } = useToast();
  const [scholarships, setScholarships]   = useState<ScholarshipResponse[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filterStatus, setFilterStatus]   = useState<'All' | ScholarshipStatus>('All');
  const [searchQuery, setSearchQuery]     = useState('');
  const [openMenuId, setOpenMenuId]       = useState<number | null>(null);
  const [formLoading, setFormLoading]     = useState(false);

  // Modals
  const [showForm, setShowForm]                       = useState(false);
  const [editingId, setEditingId]                     = useState<number | null>(null);
  const [form, setForm]                               = useState(EMPTY_FORM);
  const [confirmArchive, setConfirmArchive]           = useState<ScholarshipResponse | null>(null);
  const [confirmClose, setConfirmClose]               = useState<ScholarshipResponse | null>(null);
  const [confirmPublish, setConfirmPublish]           = useState<ScholarshipResponse | null>(null);
  const [confirmDelete, setConfirmDelete]             = useState<ScholarshipResponse | null>(null);
  const [archiveConfirmText, setArchiveConfirmText]   = useState('');

  const fetchScholarships = useCallback(async () => {
    try {
      setLoading(true);
      const res = await scholarshipApi.list(1, 100);
      setScholarships(res.items);
    } catch {
      addToast('error', 'Failed to load scholarships.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchScholarships(); }, [fetchScholarships]);

  const filtered = scholarships.filter(s => {
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.scholarship_type ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    All:      scholarships.length,
    active:   scholarships.filter(s => s.status === 'active').length,
    draft:    scholarships.filter(s => s.status === 'draft').length,
    closed:   scholarships.filter(s => s.status === 'closed').length,
    archived: scholarships.filter(s => s.status === 'archived').length,
  };

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(s: ScholarshipResponse) {
    setEditingId(s.id);
    setForm({
      name:               s.name,
      description:        s.description ?? '',
      amount_raw:         s.amount_raw?.toString() ?? '',
      period:             s.period ?? 'per semester',
      deadline:           s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : '',
      slots:              s.slots?.toString() ?? '',
      scholarship_type:   s.scholarship_type ?? 'Merit-Based',
      eligibility_text:   s.eligibility_text ?? '',
      eligible_colleges:  s.eligible_colleges ?? [],
      eligible_programs:  s.eligible_programs ?? [],
      cover_image_url:    s.cover_image_url ?? '',
      programInput:       '',
      requirements:       s.requirements.map(r => ({ tempId: String(r.id), name: r.name, description: r.description ?? undefined, is_required: r.is_required })),
      reqInput:           '',
    });
    setShowForm(true);
    setOpenMenuId(null);
  }

  async function handleSaveForm(publishNow = false) {
    if (!form.name.trim() || !form.slots) {
      addToast('error', 'Title and number of slots are required.');
      return;
    }
    setFormLoading(true);
    try {
      const data = {
        name:               form.name,
        description:        form.description || undefined,
        slots:              parseInt(form.slots) || undefined,
        deadline:           form.deadline ? new Date(form.deadline).toISOString() : undefined,
        eligible_colleges:  form.eligible_colleges.length > 0 ? form.eligible_colleges : undefined,
        eligible_programs:  form.eligible_programs.length > 0 ? form.eligible_programs : undefined,
        amount_raw:         form.amount_raw ? parseInt(form.amount_raw) : undefined,
        period:             form.period || undefined,
        scholarship_type:   form.scholarship_type || undefined,
        eligibility_text:   form.eligibility_text || undefined,
        cover_image_url:    form.cover_image_url || undefined,
        requirements:       form.requirements.map(r => ({ name: r.name, description: r.description, is_required: r.is_required })),
      };

      if (editingId) {
        const updated = await scholarshipApi.update(editingId, data);
        setScholarships(prev => prev.map(s => s.id === editingId ? updated : s));
        addToast('success', `"${form.name}" updated successfully.`);
      } else {
        const created = await scholarshipApi.create(data);
        if (publishNow) {
          const published = await scholarshipApi.updateStatus(created.id, 'active');
          setScholarships(prev => [published, ...prev]);
          addToast('success', `"${form.name}" published and now visible to students.`);
        } else {
          setScholarships(prev => [created, ...prev]);
          addToast('success', `"${form.name}" saved as Draft.`);
        }
      }
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to save scholarship.');
    } finally {
      setFormLoading(false);
    }
  }

  async function duplicateScholarship(s: ScholarshipResponse) {
    setOpenMenuId(null);
    try {
      const copy = await scholarshipApi.duplicate(s.id);
      setScholarships(prev => [copy, ...prev]);
      addToast('info', `"${s.name}" duplicated as a Draft.`);
    } catch {
      addToast('error', 'Failed to duplicate scholarship.');
    }
  }

  async function publishScholarship(id: number) {
    try {
      const updated = await scholarshipApi.updateStatus(id, 'active');
      setScholarships(prev => prev.map(s => s.id === id ? updated : s));
      addToast('success', 'Scholarship published and now visible to students.');
    } catch {
      addToast('error', 'Failed to publish scholarship.');
    }
    setConfirmPublish(null);
  }

  async function closeScholarship(id: number) {
    try {
      const updated = await scholarshipApi.updateStatus(id, 'closed');
      setScholarships(prev => prev.map(s => s.id === id ? updated : s));
      addToast('warning', 'Applications closed. Existing applications are unaffected.');
    } catch {
      addToast('error', 'Failed to close scholarship.');
    }
    setConfirmClose(null);
  }

  async function archiveScholarship(id: number) {
    try {
      const updated = await scholarshipApi.updateStatus(id, 'archived');
      setScholarships(prev => prev.map(s => s.id === id ? updated : s));
      addToast('info', 'Scholarship archived.');
    } catch {
      addToast('error', 'Failed to archive scholarship.');
    }
    setConfirmArchive(null);
    setArchiveConfirmText('');
  }

  async function deleteScholarship(id: number) {
    try {
      await scholarshipApi.delete(id);
      setScholarships(prev => prev.filter(s => s.id !== id));
      addToast('error', 'Scholarship permanently deleted.');
    } catch {
      addToast('error', 'Failed to delete scholarship.');
    }
    setConfirmDelete(null);
  }

  function setField(key: keyof typeof EMPTY_FORM, value: string | string[]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleCollege(code: string) {
    setForm(prev => ({
      ...prev,
      eligible_colleges: prev.eligible_colleges.includes(code)
        ? prev.eligible_colleges.filter(c => c !== code)
        : [...prev.eligible_colleges, code],
    }));
  }

  function addProgram() {
    const val = form.programInput.trim();
    if (!val || form.eligible_programs.includes(val)) return;
    setForm(prev => ({ ...prev, eligible_programs: [...prev.eligible_programs, val], programInput: '' }));
  }

  function removeProgram(p: string) {
    setForm(prev => ({ ...prev, eligible_programs: prev.eligible_programs.filter(x => x !== p) }));
  }

  function addRequirement(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (form.requirements.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) return;
    const req: FormReq = { tempId: `req_${Date.now()}`, name: trimmed, is_required: true };
    setForm(prev => ({ ...prev, requirements: [...prev.requirements, req], reqInput: '' }));
  }

  function removeRequirement(tempId: string) {
    setForm(prev => ({ ...prev, requirements: prev.requirements.filter(r => r.tempId !== tempId) }));
  }

  function toggleReqRequired(tempId: string) {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.map(r => r.tempId === tempId ? { ...r, is_required: !r.is_required } : r),
    }));
  }

  function moveReq(index: number, dir: -1 | 1) {
    setForm(prev => {
      const arr = [...prev.requirements];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return { ...prev, requirements: arr };
    });
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const canvas = document.createElement('canvas');
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      canvas.width  = img.width  * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', 0.75);
      setForm(prev => ({ ...prev, cover_image_url: compressed }));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
    fontSize: 13, color: '#111827', background: '#f9fafb', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: `3px solid #f3f4f6`, borderTop: `3px solid ${TEAL}`, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading scholarships...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
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
        {(['All', 'active', 'draft', 'closed', 'archived'] as const).map(label => {
          const active = filterStatus === label;
          return (
            <button key={label} onClick={() => setFilterStatus(label as 'All' | ScholarshipStatus)} style={{ padding: '8px 18px', borderRadius: 8, border: active ? `1.5px solid ${TEAL}` : '1px solid #e5e7eb', background: active ? TEAL_LIGHT : '#fff', color: active ? TEAL : '#374151', fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
              {capitalize(label)} <span style={{ marginLeft: 4, fontSize: 12, fontWeight: 700, opacity: 0.7 }}>({counts[label as keyof typeof counts] ?? 0})</span>
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
            const st = statusStyle[s.status] ?? statusStyle.draft;
            const daysLeft = getDaysLeft(s.deadline);
            const urgency  = getUrgency(daysLeft);
            const ur = urgencyStyle[urgency];
            const slotsFilled = (s.slots ?? 0) > 0 ? (s.applicants_count / (s.slots ?? 1)) * 100 : 0;
            const isArchived  = s.status === 'archived';
            const amount = s.amount_raw ? `₱${s.amount_raw.toLocaleString()}` : '—';

            return (
              // overflow must be visible so the absolute dropdown isn't clipped
              <div key={s.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', opacity: isArchived ? 0.72 : 1 }}>

                {/* Cover image — own overflow:hidden so border-radius clips correctly */}
                {s.cover_image_url ? (
                  <div style={{ borderRadius: '14px 14px 0 0', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.cover_image_url} alt={s.name} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ height: 5, borderRadius: '14px 14px 0 0', background: s.status === 'active' ? `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})` : s.status === 'draft' ? '#94a3b8' : s.status === 'closed' ? '#f97316' : '#d1d5db' }} />
                )}

                <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

                  {/* Status row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, fontSize: 11, fontWeight: 700 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} />
                        {capitalize(s.status)}
                      </span>
                      {s.category && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                          background: s.category === 'public' ? '#eff6ff' : '#fdf4ff',
                          color: s.category === 'public' ? '#1d4ed8' : '#7e22ce',
                        }}>
                          {s.category === 'public' ? 'Public' : 'Private'}
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                        style={{ padding: '4px 7px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7, cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                      </button>
                      {openMenuId === s.id && (
                        <>
                          {/* Invisible backdrop — catches clicks outside the menu */}
                          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpenMenuId(null)} />
                          <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 180, overflow: 'hidden' }}>
                            {[
                              { label: 'Edit',                color: '#374151', show: !isArchived,           action: () => openEdit(s) },
                              { label: 'Duplicate',           color: '#374151', show: true,                  action: () => duplicateScholarship(s) },
                              { label: 'Publish',             color: TEAL,      show: s.status === 'draft',  action: () => { setConfirmPublish(s); setOpenMenuId(null); } },
                              { label: 'Reopen Applications', color: '#2563eb', show: s.status === 'closed', action: () => { publishScholarship(s.id); setOpenMenuId(null); } },
                              { label: 'Close Applications',  color: '#ea580c', show: s.status === 'active', action: () => { setConfirmClose(s); setOpenMenuId(null); } },
                              { label: 'Archive',             color: '#dc2626', show: !isArchived,           action: () => { setConfirmArchive(s); setArchiveConfirmText(''); setOpenMenuId(null); } },
                              { label: 'Delete',              color: '#dc2626', show: true,                  action: () => { setConfirmDelete(s); setOpenMenuId(null); } },
                            ].filter(item => item.show).map(item => (
                              // onMouseDown fires before the trigger button's blur, so the menu
                              // is still mounted when the action runs.
                              <button key={item.label}
                                onMouseDown={e => { e.preventDefault(); item.action(); }}
                                style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 500, color: item.color, cursor: 'pointer', display: 'block' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                              >{item.label}</button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title + type */}
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.35 }}>{s.name}</h3>
                    <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{s.scholarship_type ?? '—'}</span>
                  </div>

                  {/* Amount */}
                  <div style={{ fontSize: 20, fontWeight: 800, color: TEAL, lineHeight: 1 }}>
                    {amount}
                    {s.period && <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', marginLeft: 6 }}>{s.period}</span>}
                  </div>

                  {/* Description — clamped to 3 lines */}
                  {s.description && (
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.55,
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {s.description}
                    </p>
                  )}

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Deadline</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: daysLeft <= 3 ? ur.color : '#374151' }}>
                        {formatDeadline(s.deadline)}
                        {daysLeft < 999 && daysLeft <= 10 && <span style={{ marginLeft: 4, fontSize: 10, color: ur.color }}>({daysLeft}d)</span>}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Slots</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: slotsFilled >= 90 ? '#dc2626' : '#374151' }}>
                        {s.applicants_count} / {s.slots ?? '∞'}
                      </div>
                    </div>
                  </div>

                  {/* Slot fill bar */}
                  {(s.slots ?? 0) > 0 && (
                    <div style={{ height: 4, background: '#f3f4f6', borderRadius: 99, marginTop: -4 }}>
                      <div style={{ height: '100%', width: `${Math.min(slotsFilled, 100)}%`, background: slotsFilled >= 90 ? '#dc2626' : slotsFilled >= 70 ? '#d97706' : TEAL, borderRadius: 99, transition: 'width 0.3s' }} />
                    </div>
                  )}

                  {/* College tags — max 5 then "+N" */}
                  {(s.eligible_colleges ?? []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(s.eligible_colleges ?? []).slice(0, 6).map(c => (
                        <span key={c} style={{ fontSize: 10, fontWeight: 600, color: TEAL_DARK, background: TEAL_LIGHT, padding: '2px 7px', borderRadius: 20, border: `1px solid #f3d080` }}>{c}</span>
                      ))}
                      {(s.eligible_colleges ?? []).length > 6 && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', background: '#f3f4f6', padding: '2px 7px', borderRadius: 20 }}>+{(s.eligible_colleges ?? []).length - 6} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div style={{ padding: '12px 18px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
                  <Link
                    href={`/osfa/applicants?scholarship=${s.id}`}
                    style={{ flex: 1, padding: '8px 0', border: `1.5px solid ${TEAL}`, color: TEAL, borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, textAlign: 'center', background: TEAL_LIGHT }}>
                    View Applicants ({s.applicants_count})
                  </Link>
                  {!isArchived && (
                    <button onClick={() => openEdit(s)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create / Edit Modal ─────────────────────────────────────── */}
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
                <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g., Academic Excellence Grant" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Briefly describe the scholarship program..." rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Grant Amount (₱)</label>
                  <input type="number" value={form.amount_raw} onChange={e => setField('amount_raw', e.target.value)} placeholder="e.g., 50000" style={inputStyle} min={0} />
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
                <select value={form.scholarship_type} onChange={e => setField('scholarship_type', e.target.value)} style={inputStyle}>
                  {SCHOLARSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Eligibility Description</label>
                <input type="text" value={form.eligibility_text} onChange={e => setField('eligibility_text', e.target.value)} placeholder="e.g., GWA of 1.75 or better, full-time enrollment" style={inputStyle} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Eligible Colleges / Departments</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button"
                      onClick={() => setForm(prev => ({ ...prev, eligible_colleges: PUP_COLLEGES.map(c => c.code) }))}
                      style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', color: '#374151', cursor: 'pointer' }}>
                      Select All
                    </button>
                    <button type="button"
                      onClick={() => setForm(prev => ({ ...prev, eligible_colleges: [] }))}
                      style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', color: '#374151', cursor: 'pointer' }}>
                      Clear All
                    </button>
                  </div>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: '#94a3b8' }}>Leave all unchecked to allow all colleges.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {PUP_COLLEGES.map(col => {
                    const checked = form.eligible_colleges.includes(col.code);
                    return (
                      <label key={col.code} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, border: `1px solid ${checked ? '#86efac' : '#e5e7eb'}`, background: checked ? '#f0fdf4' : '#f9fafb', cursor: 'pointer', fontSize: 12, color: checked ? '#065f46' : '#374151', fontWeight: checked ? 600 : 400 }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleCollege(col.code)} style={{ accentColor: TEAL, width: 13, height: 13, flexShrink: 0 }} />
                        <span><strong>{col.code}</strong> — {col.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Specific Programs <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input type="text" value={form.programInput} onChange={e => setField('programInput', e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addProgram())} placeholder="e.g., BS Computer Science — press Enter to add" style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={addProgram} style={{ padding: '9px 14px', background: TEAL, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>Add</button>
                </div>
                {form.eligible_programs.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {form.eligible_programs.map(p => (
                      <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: TEAL_LIGHT, border: `1px solid #F5D060`, fontSize: 12, color: TEAL_DARK, fontWeight: 600 }}>
                        {p}
                        <button onClick={() => removeProgram(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEAL_DARK, padding: 0, display: 'flex', alignItems: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Required Documents Checklist <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400, marginLeft: 6 }}>(students upload these when applying)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {COMMON_REQS.filter(r => !form.requirements.some(req => req.name === r)).map(r => (
                    <button key={r} type="button" onClick={() => addRequirement(r)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px dashed #d1d5db', background: '#f9fafb', color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                      + {r}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input type="text" value={form.reqInput} onChange={e => setForm(prev => ({ ...prev, reqInput: e.target.value }))} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRequirement(form.reqInput))} placeholder="Type a custom requirement and press Enter..." style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => addRequirement(form.reqInput)} style={{ padding: '9px 14px', background: TEAL, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>Add</button>
                </div>
                {form.requirements.length === 0 ? (
                  <div style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 8, border: '1px dashed #e5e7eb', fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>No requirements added yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {form.requirements.map((req, i) => (
                      <div key={req.tempId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 9, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                        <span style={{ fontSize: 13, color: '#374151', flex: 1, lineHeight: 1.4 }}>{i + 1}. {req.name}</span>
                        <button type="button" onClick={() => toggleReqRequired(req.tempId)} style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: 'none', cursor: 'pointer', background: req.is_required ? '#fee2e2' : '#f3f4f6', color: req.is_required ? '#dc2626' : '#9ca3af' }}>
                          {req.is_required ? 'REQUIRED' : 'OPTIONAL'}
                        </button>
                        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                          <button type="button" onClick={() => moveReq(i, -1)} disabled={i === 0} style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid #e5e7eb', background: '#fff', cursor: i === 0 ? 'not-allowed' : 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                          </button>
                          <button type="button" onClick={() => moveReq(i, 1)} disabled={i === form.requirements.length - 1} style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid #e5e7eb', background: '#fff', cursor: i === form.requirements.length - 1 ? 'not-allowed' : 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                          </button>
                        </div>
                        <button type="button" onClick={() => removeRequirement(req.tempId)} style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 5, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Scholarship Poster / Cover Image <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: '1.5px dashed #d1d5db', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#6b7280', background: '#f9fafb', flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    {form.cover_image_url ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                  {form.cover_image_url && (
                    <div style={{ position: 'relative' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.cover_image_url} alt="Cover preview" style={{ height: 64, borderRadius: 8, border: '1px solid #e5e7eb', objectFit: 'cover' }} />
                      <button onClick={() => setField('cover_image_url', '')} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: '18px 28px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafafa', flexWrap: 'wrap' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 22px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              {!editingId && (
                <button onClick={() => handleSaveForm(false)} disabled={formLoading} style={{ padding: '10px 22px', background: '#fff', border: `1.5px solid #e5e7eb`, borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer', color: '#374151' }}>
                  {formLoading ? 'Saving...' : 'Save as Draft'}
                </button>
              )}
              <button onClick={() => handleSaveForm(editingId ? false : true)} disabled={formLoading} style={{ padding: '10px 28px', background: formLoading ? '#9ca3af' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer', color: '#fff' }}>
                {formLoading ? 'Saving...' : editingId ? 'Save Changes' : 'Create & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish confirmation */}
      {confirmPublish && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmPublish(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: TEAL_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9z"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Publish Scholarship</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              <strong>{confirmPublish.name}</strong> will be published and immediately visible to students.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmPublish(null)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={() => publishScholarship(confirmPublish.id)} style={{ flex: 1, padding: 10, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Publish Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Close Applications confirmation */}
      {confirmClose && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmClose(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Close Applications</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              Applications for <strong>{confirmClose.name}</strong> will be closed. No new applications will be accepted.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmClose(null)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={() => closeScholarship(confirmClose.id)} style={{ flex: 1, padding: 10, background: '#ea580c', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Close Applications</button>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirmation */}
      {confirmArchive && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setConfirmArchive(null); setArchiveConfirmText(''); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 460, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Archive Scholarship</h2>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              <strong>{confirmArchive.name}</strong> will be archived and no longer visible to students.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Type the scholarship name to confirm: <span style={{ color: '#dc2626', fontStyle: 'italic' }}>{confirmArchive.name}</span>
              </label>
              <input type="text" value={archiveConfirmText} onChange={e => setArchiveConfirmText(e.target.value)} placeholder="Type the scholarship name exactly..." style={{ width: '100%', padding: '9px 12px', border: `1px solid ${archiveConfirmText === confirmArchive.name ? '#6ee7b7' : '#e5e7eb'}`, borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setConfirmArchive(null); setArchiveConfirmText(''); }} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button disabled={archiveConfirmText !== confirmArchive.name} onClick={() => archiveScholarship(confirmArchive.id)} style={{ flex: 1, padding: 10, background: archiveConfirmText === confirmArchive.name ? '#dc2626' : '#fca5a5', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: archiveConfirmText === confirmArchive.name ? 'pointer' : 'not-allowed', color: '#fff' }}>
                Archive Scholarship
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Delete Scholarship</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              <strong>{confirmDelete.name}</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={() => deleteScholarship(confirmDelete.id)} style={{ flex: 1, padding: 10, background: '#dc2626', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {openMenuId && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpenMenuId(null)} />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
