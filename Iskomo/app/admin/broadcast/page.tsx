'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' };

export default function AdminBroadcastPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [title,   setTitle]   = useState('');
  const [body,    setBody]    = useState('');
  const [target,  setTarget]  = useState<'all' | 'students' | 'osfa_staff'>('all');
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const RECIPIENT_LABEL: Record<string, string> = {
    all: 'all active users (students + OSFA staff)',
    students: 'all active students',
    osfa_staff: 'all active OSFA staff',
  };

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    if (!showConfirm) { setShowConfirm(true); return; }
    setShowConfirm(false);
    setSending(true);
    try {
      const data = await apiFetch<{ message: string }>('/api/admin/broadcast', {
        method: 'POST', body: JSON.stringify({ title: title.trim(), body: body.trim(), target }),
      });
      addToast('success', data.message ?? 'Broadcast sent successfully.');
      setTitle(''); setBody('');
    } catch (err) { addToast('error', err instanceof Error ? err.message : 'Failed to send.'); }
    finally { setSending(false); }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Broadcast</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Send a system-wide notification to users</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Target Audience</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[{ value: 'all', label: 'All Users', icon: '🌐' }, { value: 'students', label: 'Students Only', icon: '🎓' }, { value: 'osfa_staff', label: 'OSFA Staff Only', icon: '👥' }].map(opt => (
                <label key={opt.value} style={{ flex: 1, minWidth: 130, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: `2px solid ${target === opt.value ? M : '#e5e7eb'}`, borderRadius: 10, background: target === opt.value ? '#fff5f5' : '#f9fafb', cursor: 'pointer', fontSize: 13, fontWeight: target === opt.value ? 700 : 500, color: target === opt.value ? M : '#374151' }}>
                  <input type="radio" name="target" value={opt.value} checked={target === opt.value} onChange={() => setTarget(opt.value as typeof target)} style={{ display: 'none' }} />
                  <span style={{ fontSize: 18 }}>{opt.icon}</span>
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Title <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Application Deadline Reminder" style={inp} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message <span style={{ color: '#dc2626' }}>*</span></label>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Type your announcement here..." rows={6} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} required />
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{body.length} / 2000 characters</div>
          </div>

          {showConfirm && (
            <div style={{ padding: '14px 16px', background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 10, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 6 }}>⚠️ Confirm Broadcast</div>
              <div style={{ color: '#b45309', lineHeight: 1.6 }}>
                This will send <strong>"{title}"</strong> to <strong>{RECIPIENT_LABEL[target]}</strong>. This cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="submit" disabled={sending}
                  style={{ flex: 1, padding: '10px', background: sending ? '#9ca3af' : `linear-gradient(135deg, ${M}, #5C0000)`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer' }}>
                  {sending ? 'Sending…' : '📣 Yes, Send Now'}
                </button>
                <button type="button" onClick={() => setShowConfirm(false)}
                  style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          {!showConfirm && (
            <button type="submit" disabled={sending || !title.trim() || !body.trim()}
              style={{ width: '100%', padding: '13px', background: (sending || !title.trim() || !body.trim()) ? '#9ca3af' : `linear-gradient(135deg, ${M}, #5C0000)`, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: (sending || !title.trim() || !body.trim()) ? 'not-allowed' : 'pointer' }}>
              {sending ? 'Sending…' : '📣 Send Broadcast'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
