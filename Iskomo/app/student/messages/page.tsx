'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

interface Conversation {
  application_id: number;
  student_name: string;
  student_email: string;
  scholarship_name: string;
  last_message_at: string | null;
  message_count: number;
  unread_count: number;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  if (h < 24)  return `${h}h ago`;
  if (d < 7)   return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export default function StudentMessagesPage() {
  const router = useRouter();
  const [convos, setConvos]   = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ items: Conversation[] }>('/api/applications/inbox');
      setConvos(data.items ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalUnread = convos.reduce((s, c) => s + c.unread_count, 0);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Messages</h1>
          {totalUnread > 0 && (
            <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 9px', borderRadius: 20, background: M, color: '#fff' }}>{totalUnread} unread</span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Your conversations with OSFA</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, border: `3px solid #f3f4f6`, borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : convos.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto 14px', display: 'block' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No messages yet</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>You can message OSFA through your application page.</div>
          </div>
        ) : (
          convos.map((c, i) => (
            <button
              key={c.application_id}
              onClick={() => router.push(`/student/applications/${c.application_id}?tab=messages`)}
              style={{
                width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                padding: '16px 20px',
                background: c.unread_count > 0 ? '#fafbff' : '#fff',
                borderBottom: i < convos.length - 1 ? '1px solid #f3f4f6' : 'none',
                borderLeft: c.unread_count > 0 ? `3px solid ${M}` : '3px solid transparent',
                transition: 'background 0.12s',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
              {/* OSFA Avatar */}
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${M}, ${COLORS.maroonD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: c.unread_count > 0 ? 700 : 600, color: '#111827' }}>OSFA Staff</span>
                  <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {c.last_message_at ? timeAgo(c.last_message_at) : ''}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                  Re: {c.scholarship_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {c.message_count} message{c.message_count !== 1 ? 's' : ''}
                  </span>
                  {c.unread_count > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 20, background: M, color: '#fff' }}>
                      {c.unread_count} new
                    </span>
                  )}
                </div>
              </div>

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
