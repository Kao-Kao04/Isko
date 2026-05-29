'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { academicPeriodApi, type AcademicPeriodResponse } from '@/lib/api-client';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
  borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};

const SEMESTER_LABELS: Record<string, string> = {
  first: '1st Semester',
  second: '2nd Semester',
  summer: 'Summer',
};

function PeriodStatus({ p }: { p: AcademicPeriodResponse }) {
  if (p.is_active) return <span style={{ padding: '2px 10px', borderRadius: 20, background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700 }}>Active</span>;
  if (p.is_ended)  return <span style={{ padding: '2px 10px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280',  fontSize: 11, fontWeight: 700 }}>Ended</span>;
  return <span style={{ padding: '2px 10px', borderRadius: 20, background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 700 }}>Upcoming</span>;
}

export default function AcademicPeriodsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [periods,  setPeriods]  = useState<AcademicPeriodResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [form, setForm] = useState({
    academic_year: '2025-2026',
    semester: 'first' as 'first' | 'second' | 'summer',
    start_date: '',
    end_date: '',
    counts_toward_max: true,
  });
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPeriods(await academicPeriodApi.list());
    } catch {
      addToast('error', 'Failed to load academic periods.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.start_date || !form.end_date) { setFormError('Start and end date are required.'); return; }
    setSaving(true); setFormError('');
    try {
      const created = await academicPeriodApi.create(form);
      setPeriods(prev => [created, ...prev].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()));
      setShowForm(false);
      setForm({ academic_year: '2025-2026', semester: 'first', start_date: '', end_date: '', counts_toward_max: true });
      addToast('success', `${created.label} created.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create period.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, label: string) {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await academicPeriodApi.delete(id);
      setPeriods(prev => prev.filter(p => p.id !== id));
      addToast('success', `${label} deleted.`);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete period.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/admin/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Academic Periods</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Academic Periods</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Define PUP semester periods. Students can only submit GWA after a period ends.
          </p>
        </div>
        <button onClick={() => { setShowForm(f => !f); setFormError(''); }}
          style={{ padding: '9px 18px', border: 'none', borderRadius: 9, background: M, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Add Period'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${M}44`, padding: '20px 24px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827' }}>New Academic Period</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Academic Year</label>
              <input type="text" required placeholder="2025-2026" value={form.academic_year}
                onChange={e => setForm(p => ({ ...p, academic_year: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Semester</label>
              <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value as typeof form.semester }))} style={inp}>
                <option value="first">1st Semester</option>
                <option value="second">2nd Semester</option>
                <option value="summer">Summer</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Start Date</label>
              <input type="date" required value={form.start_date}
                onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>End Date</label>
              <input type="date" required value={form.end_date}
                onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} style={inp} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 14, fontSize: 13, color: '#374151' }}>
            <input type="checkbox" checked={form.counts_toward_max}
              onChange={e => setForm(p => ({ ...p, counts_toward_max: e.target.checked }))}
              style={{ accentColor: M }} />
            Counts toward maximum scholarship semesters
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>(uncheck for summer)</span>
          </label>
          {formError && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 12 }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ flex: 1, padding: '9px 0', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 2, padding: '9px 0', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : M, color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Creating…' : 'Create Period'}
            </button>
          </div>
        </form>
      )}

      {/* Periods list */}
      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading…</div>
      ) : periods.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No academic periods defined</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Add a period above. Students can only submit GWA for ended periods.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {periods.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${p.is_active ? '#86efac' : '#e5e7eb'}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{p.label}</span>
                  <PeriodStatus p={p} />
                  {!p.counts_toward_max && (
                    <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}>Not counted</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {new Date(p.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' — '}
                  {new Date(p.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <button
                onClick={() => handleDelete(p.id, p.label)}
                disabled={deleting === p.id}
                style={{ padding: '6px 14px', border: '1px solid #fecaca', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: deleting === p.id ? 'not-allowed' : 'pointer', opacity: deleting === p.id ? 0.6 : 1 }}>
                {deleting === p.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
