'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, applicationApi, scholarshipApi, type StaffResponse, type ApplicationResponse, type ScholarshipResponse } from '@/lib/api-client';

const MAROON = '#800000';

const DEPT_CONFIG = {
  public:  { label: 'Public',  bg: '#eff6ff', color: '#1d4ed8', desc: "Gov't / State-funded" },
  private: { label: 'Private', bg: '#fdf4ff', color: '#7e22ce', desc: 'Corporate / Foundation' },
};

const APP_STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  approved:   { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
  rejected:   { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  incomplete: { bg: '#fef9c3', color: '#713f12', label: 'Incomplete' },
  withdrawn:  { bg: '#f3f4f6', color: '#374151', label: 'Withdrawn' },
};

type Section = 'all-staff' | 'active-staff' | 'public-staff' | 'private-staff' | 'applications' | 'scholarships';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function getInitials(email: string) {
  return email.split('@')[0].slice(0, 2).toUpperCase();
}

export default function StaffPage() {
  const [staff,        setStaff]        = useState<StaffResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [scholarships, setScholarships] = useState<ScholarshipResponse[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('all-staff');

  // Create form
  const [showForm,  setShowForm]  = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPass,  setFormPass]  = useState('');
  const [formDept,  setFormDept]  = useState<'public' | 'private'>('public');
  const [showPass,  setShowPass]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState('');

  // Edit / deactivate
  const [editingStaff,  setEditingStaff]  = useState<StaffResponse | null>(null);
  const [editDept,      setEditDept]      = useState<'public' | 'private'>('public');
  const [editSaving,    setEditSaving]    = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<StaffResponse | null>(null);
  const [toggling,      setToggling]      = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [staffData, appsRes, scholRes] = await Promise.allSettled([
        adminApi.listStaff(),
        applicationApi.list(1, 200),
        scholarshipApi.list(1, 200),
      ]);
      if (staffData.status === 'fulfilled') setStaff(staffData.value);
      if (appsRes.status === 'fulfilled')   setApplications(appsRes.value.items);
      if (scholRes.status === 'fulfilled')  setScholarships(scholRes.value.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (formPass.length < 8) { setFormError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      const created = await adminApi.createStaff({ email: formEmail.trim(), password: formPass, department: formDept });
      setStaff(prev => [created, ...prev]);
      setShowForm(false);
      setFormEmail(''); setFormPass(''); setFormDept('public');
      showToast('success', `Staff account created for ${created.email}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create account.');
    } finally {
      setSaving(false);
    }
  }

  async function handleEditDept() {
    if (!editingStaff) return;
    setEditSaving(true);
    try {
      const updated = await adminApi.updateStaff(editingStaff.id, { department: editDept });
      setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast('success', `Department updated to ${editDept}.`);
      setEditingStaff(null);
    } catch {
      showToast('error', 'Failed to update department.');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!confirmToggle) return;
    setToggling(true);
    try {
      const updated = await adminApi.updateStaff(confirmToggle.id, { is_active: !confirmToggle.is_active });
      setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast('success', `Account ${updated.is_active ? 'reactivated' : 'deactivated'}.`);
      setConfirmToggle(null);
    } catch {
      showToast('error', 'Failed to update status.');
    } finally {
      setToggling(false);
    }
  }

  // Derived counts
  const activeStaff    = staff.filter(s => s.is_active);
  const publicStaff    = staff.filter(s => s.department === 'public');
  const privateStaff   = staff.filter(s => s.department === 'private');
  const pendingApps    = applications.filter(a => a.status === 'pending');
  const activeSchols   = scholarships.filter(s => s.status === 'active');

  // Displayed staff based on section
  const displayedStaff = activeSection === 'active-staff'  ? activeStaff
                       : activeSection === 'public-staff'  ? publicStaff
                       : activeSection === 'private-staff' ? privateStaff
                       : staff;

  const STATS: { key: Section; label: string; value: number; sub: string; color: string; bg: string; border: string }[] = [
    { key: 'all-staff',    label: 'Total Staff',       value: staff.length,        sub: `${activeStaff.length} active`,           color: '#374151', bg: '#f8fafc', border: '#e2e8f0' },
    { key: 'active-staff', label: 'Active Staff',      value: activeStaff.length,  sub: `${staff.length - activeStaff.length} inactive`, color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
    { key: 'public-staff', label: 'Public Dept',       value: publicStaff.length,  sub: "Gov't / State-funded",                  color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
    { key: 'private-staff',label: 'Private Dept',      value: privateStaff.length, sub: 'Corporate / Foundation',                color: '#7e22ce', bg: '#fdf4ff', border: '#e9d5ff' },
    { key: 'applications', label: 'Applications',      value: applications.length,  sub: `${pendingApps.length} pending review`,  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    { key: 'scholarships', label: 'Scholarships',      value: scholarships.length,  sub: `${activeSchols.length} active`,         color: MAROON,    bg: '#fff5f5', border: '#fecaca' },
  ];

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: 13, color: '#111827', background: '#f9fafb',
    outline: 'none', boxSizing: 'border-box',
  };

  const sectionTitle = activeSection === 'applications' ? 'All Applications'
                     : activeSection === 'scholarships' ? 'All Scholarships'
                     : activeSection === 'active-staff' ? 'Active Staff'
                     : activeSection === 'public-staff' ? 'Public Dept Staff'
                     : activeSection === 'private-staff'? 'Private Dept Staff'
                     : 'All Staff';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 10, background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`, color: toast.type === 'success' ? '#15803d' : '#dc2626', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          {toast.type === 'success' ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>Admin Overview</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Click any card to view the details below</p>
        </div>
        <button onClick={() => { setShowForm(true); setFormError(''); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: `linear-gradient(135deg, ${MAROON}, #5C0000)`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: `0 2px 8px ${MAROON}40` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Staff
        </button>
      </div>

      {/* Stats grid — clickable */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {STATS.map(stat => {
          const isActive = activeSection === stat.key;
          return (
            <button key={stat.key} onClick={() => setActiveSection(stat.key)} style={{
              background: isActive ? stat.bg : '#fff',
              border: `${isActive ? 2 : 1}px solid ${isActive ? stat.color : stat.border}`,
              borderRadius: 12, padding: '18px 20px', cursor: 'pointer', textAlign: 'left',
              boxShadow: isActive ? `0 4px 16px ${stat.color}20` : '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
            }}>
              {isActive && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: stat.color }} />}
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {loading ? '—' : stat.value}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 6 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{stat.sub}</div>
              {isActive && (
                <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: stat.color }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#374151' }}>{sectionTitle}</h2>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          {activeSection === 'applications' ? `${applications.length} total` :
           activeSection === 'scholarships' ? `${scholarships.length} total` :
           `${displayedStaff.length} staff`}
        </span>
      </div>

      {/* ── STAFF LIST ── */}
      {['all-staff', 'active-staff', 'public-staff', 'private-staff'].includes(activeSection) && (
        loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 36, height: 36, border: `3px solid #f3f4f6`, borderTop: `3px solid ${MAROON}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : displayedStaff.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No staff accounts yet</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Create the first OSFA staff account.</div>
            <button onClick={() => setShowForm(true)} style={{ padding: '9px 20px', background: MAROON, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add Staff</button>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 110px 100px 150px', padding: '10px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Staff Account', 'Department', 'Status', 'Joined', 'Actions'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>
            {displayedStaff.map((s, i) => {
              const dept = s.department ? DEPT_CONFIG[s.department] : null;
              return (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 110px 100px 150px', padding: '16px 24px', borderBottom: i < displayedStaff.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'center', opacity: s.is_active ? 1 : 0.55 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: s.is_active ? `linear-gradient(135deg, ${MAROON}, #5C0000)` : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.is_active ? '#fff' : '#9ca3af', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                      {getInitials(s.email)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.email}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>OSFA Staff</div>
                    </div>
                  </div>
                  <div>
                    {dept ? (
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: dept.bg, color: dept.color, fontSize: 12, fontWeight: 700 }}>{dept.label}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>Unassigned</span>
                    )}
                  </div>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: s.is_active ? '#f0fdf4' : '#f3f4f6', color: s.is_active ? '#059669' : '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.is_active ? '#10b981' : '#d1d5db' }} />
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(s.created_at)}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditingStaff(s); setEditDept(s.department ?? 'public'); }} style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => setConfirmToggle(s)} style={{ padding: '6px 12px', border: `1px solid ${s.is_active ? '#fecaca' : '#bbf7d0'}`, borderRadius: 7, background: s.is_active ? '#fef2f2' : '#f0fdf4', color: s.is_active ? '#dc2626' : '#059669', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {s.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── APPLICATIONS LIST ── */}
      {activeSection === 'applications' && (
        loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 36, height: 36, border: `3px solid #f3f4f6`, borderTop: `3px solid ${MAROON}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : applications.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>No applications yet</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px 120px 100px', padding: '10px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Student', 'Scholarship', 'Category', 'Status', 'Applied'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>
            {applications.map((a, i) => {
              const badge = APP_STATUS_BADGE[a.status] ?? APP_STATUS_BADGE.pending;
              const studentName = a.student ? `${a.student.first_name ?? ''} ${a.student.last_name ?? ''}`.trim() : `Student #${a.student_id}`;
              const schCat = (a.scholarship as unknown as { category?: string })?.category;
              const catInfo = schCat ? DEPT_CONFIG[schCat as 'public' | 'private'] : null;
              return (
                <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px 120px 100px', padding: '14px 24px', borderBottom: i < applications.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{studentName}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{a.student?.email ?? '—'}</div>
                  </div>
                  <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{a.scholarship?.name ?? `Scholarship #${a.scholarship_id}`}</div>
                  <div>
                    {catInfo ? (
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: catInfo.bg, color: catInfo.color, fontSize: 11, fontWeight: 700 }}>{catInfo.label}</span>
                    ) : <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>}
                  </div>
                  <div>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 600 }}>{badge.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(a.submitted_at)}</div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── SCHOLARSHIPS LIST ── */}
      {activeSection === 'scholarships' && (
        loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 36, height: 36, border: `3px solid #f3f4f6`, borderTop: `3px solid ${MAROON}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : scholarships.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>No scholarships yet</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 110px 80px 100px', padding: '10px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Scholarship', 'Category', 'Status', 'Slots', 'Applicants'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>
            {scholarships.map((s, i) => {
              const catInfo = s.category ? DEPT_CONFIG[s.category] : null;
              const statusColors: Record<string, { bg: string; color: string }> = {
                active:   { bg: '#f0fdf4', color: '#059669' },
                draft:    { bg: '#f8fafc', color: '#64748b' },
                closed:   { bg: '#fff7ed', color: '#ea580c' },
                archived: { bg: '#f3f4f6', color: '#9ca3af' },
              };
              const sc = statusColors[s.status] ?? statusColors.draft;
              return (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 110px 80px 100px', padding: '14px 24px', borderBottom: i < scholarships.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.scholarship_type ?? '—'}</div>
                  </div>
                  <div>
                    {catInfo ? (
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: catInfo.bg, color: catInfo.color, fontSize: 11, fontWeight: 700 }}>{catInfo.label}</span>
                    ) : <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>}
                  </div>
                  <div>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, fontSize: 12, fontWeight: 600 }}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{s.slots ?? '—'}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: s.applicants_count > 0 ? MAROON : '#9ca3af' }}>{s.applicants_count}</div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── MODALS ── */}

      {/* Create Staff */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Add OSFA Staff</h2>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>Create a new OSFA staff account and assign their department.</p>
            {formError && <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>{formError}</div>}
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="osfa.staff@pup.edu.ph" style={inp} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password <span style={{ color: '#dc2626' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={formPass} onChange={e => setFormPass(e.target.value)} placeholder="Min. 8 characters" style={{ ...inp, paddingRight: 40 }} required minLength={8} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{showPass ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Department <span style={{ color: '#dc2626' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(['public', 'private'] as const).map(dept => {
                    const cfg = DEPT_CONFIG[dept];
                    const sel = formDept === dept;
                    return (
                      <label key={dept} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 16px', borderRadius: 10, border: `2px solid ${sel ? cfg.color : '#e5e7eb'}`, background: sel ? cfg.bg : '#f9fafb', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <input type="radio" name="dept" value={dept} checked={sel} onChange={() => setFormDept(dept)} style={{ display: 'none' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: sel ? cfg.color : '#374151' }}>{cfg.label} Scholarships</span>
                        <span style={{ fontSize: 11, color: sel ? cfg.color : '#9ca3af' }}>{cfg.desc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: 11, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: 11, border: 'none', borderRadius: 9, background: saving ? '#9ca3af' : `linear-gradient(135deg, ${MAROON}, #5C0000)`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Creating…' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dept */}
      {editingStaff && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setEditingStaff(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Change Department</h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>Updating for <strong>{editingStaff.email}</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {(['public', 'private'] as const).map(dept => {
                const cfg = DEPT_CONFIG[dept];
                const sel = editDept === dept;
                return (
                  <label key={dept} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 16px', borderRadius: 10, border: `2px solid ${sel ? cfg.color : '#e5e7eb'}`, background: sel ? cfg.bg : '#f9fafb', cursor: 'pointer' }}>
                    <input type="radio" name="editDept" value={dept} checked={sel} onChange={() => setEditDept(dept)} style={{ display: 'none' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: sel ? cfg.color : '#374151' }}>{cfg.label}</span>
                    <span style={{ fontSize: 11, color: sel ? cfg.color : '#9ca3af' }}>{cfg.desc}</span>
                  </label>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditingStaff(null)} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleEditDept} disabled={editSaving} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: editSaving ? '#9ca3af' : MAROON, color: '#fff', fontSize: 14, fontWeight: 600, cursor: editSaving ? 'not-allowed' : 'pointer' }}>
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Active */}
      {confirmToggle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setConfirmToggle(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: confirmToggle.is_active ? '#fef2f2' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={confirmToggle.is_active ? '#dc2626' : '#059669'} strokeWidth="2.5">
                {confirmToggle.is_active ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <polyline points="20 6 9 17 4 12"/>}
              </svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{confirmToggle.is_active ? 'Deactivate' : 'Reactivate'} Account</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              {confirmToggle.is_active
                ? <>Deactivate <strong>{confirmToggle.email}</strong>? They will lose access immediately.</>
                : <>Reactivate <strong>{confirmToggle.email}</strong>? They will regain full access.</>}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmToggle(null)} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleToggleActive} disabled={toggling} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: confirmToggle.is_active ? '#dc2626' : '#059669', color: '#fff', fontSize: 14, fontWeight: 600, cursor: toggling ? 'not-allowed' : 'pointer' }}>
                {toggling ? 'Processing…' : confirmToggle.is_active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
