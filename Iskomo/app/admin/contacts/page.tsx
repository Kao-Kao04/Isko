'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 60)  return `${m}m ago`;
  if (h < 24)  return `${h}h ago`;
  if (d < 30)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ContactsPage() {
  const [items,    setItems]    = useState<ContactInquiry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<ContactInquiry | null>(null);
  const [filter,   setFilter]   = useState<'all' | 'unread'>('all');

  const fetchContacts = useCallback(async () => {
    try {
      const data = await apiFetch<{ items: ContactInquiry[]; total: number }>('/api/admin/contacts?page=1&page_size=100');
      setItems(data.items ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  async function openInquiry(item: ContactInquiry) {
    setSelected(item);
    if (!item.is_read) {
      try {
        await apiFetch(`/api/admin/contacts/${item.id}/read`, { method: 'PATCH' });
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_read: true } : i));
        setSelected(s => s?.id === item.id ? { ...s, is_read: true } : s);
      } catch { /* silent */ }
    }
  }

  const displayed  = filter === 'unread' ? items.filter(i => !i.is_read) : items;
  const unreadCount = items.filter(i => !i.is_read).length;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Contact Inquiries</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            Messages submitted via the Contact form.
            {unreadCount > 0 && <span style={{ marginLeft: 8, fontWeight: 700, color: M }}>{unreadCount} unread</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${filter === f ? M : '#e5e7eb'}`,
              background: filter === f ? M : '#fff', color: filter === f ? '#fff' : '#374151',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
            }}>
              {f}{f === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '360px 1fr' : '1fr', gap: 16, alignItems: 'start' }}>

        {/* List */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {loading ? (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 28, height: 28, border: `3px solid #f3f4f6`, borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No inquiries</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{filter === 'unread' ? 'All caught up!' : 'No contact form submissions yet.'}</div>
            </div>
          ) : (
            displayed.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => openInquiry(item)}
                style={{
                  width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', padding: '16px 20px',
                  background: selected?.id === item.id ? '#fff5f5' : item.is_read ? '#fff' : '#fafbff',
                  borderBottom: idx < displayed.length - 1 ? '1px solid #f3f4f6' : 'none',
                  borderLeft: selected?.id === item.id ? `3px solid ${M}` : !item.is_read ? '3px solid #3b82f6' : '3px solid transparent',
                  transition: 'background 0.12s',
                  display: 'block',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {!item.is_read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, display: 'inline-block' }} />}
                    <span style={{ fontSize: 13, fontWeight: item.is_read ? 600 : 700, color: '#111827' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(item.created_at)}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 3, paddingLeft: item.is_read ? 0 : 15 }}>
                  {item.subject ?? 'General Inquiry'}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: item.is_read ? 0 : 15 }}>
                  {item.message}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            {/* Panel header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  {selected.subject ?? 'General Inquiry'}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{selected.name}</span>
                  <a href={`mailto:${selected.email}`} style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                    {selected.email}
                  </a>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(selected.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', color: '#374151', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Message body */}
            <div style={{ padding: '24px', minHeight: 200 }}>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {selected.message}
              </div>
            </div>

            {/* Reply action */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', background: '#f8fafc' }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
                Reply directly to <strong>{selected.name}</strong> via email:
              </div>
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject ?? 'General Inquiry')}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 18px', background: M, color: '#fff', borderRadius: 8,
                  textDecoration: 'none', fontSize: 13, fontWeight: 700,
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
