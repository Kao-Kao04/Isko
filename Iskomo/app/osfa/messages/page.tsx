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
  if (m < 1)  return 'just now';
  if (m < 60)  return `${m}m ago`;
  if (h < 24)  return `${h}h ago`;
  if (d < 7)   return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export default function OsfaMessagesPage() {
  const router = useRouter();
  const [convos, setConvos]   = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ items: Conversation[] }>('/api/applications/inbox');
      setConvos(data.items ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = convos.filter(c =>
    c.student_name.toLowerCase().includes(search.toLowerCase()) ||
    c.student_email.toLowerCase().includes(search.toLowerCase()) ||
    c.scholarship_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = convos.reduce((s, c) => s + c.unread_count, 0);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Messages</h1>
          {totalUnread > 0 && (
            <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 9px', borderRadius: 20, background: M, color: '#fff' }}>{totalUnread} unread</span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>All student–OSFA conversations across your scholarships</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text" placeholder="Search by student name, email, or scholarship..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#111827', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
        />
      </div>

      {/* List */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, border: `3px solid #f3f4f6`, borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto 14px', display: 'block' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              {search ? 'No conversations match your search' : 'No messages yet'}
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              {search ? 'Try a different search term.' : 'Student messages will appear here once they send a message through their application.'}
            </div>
          </div>
        ) : (
          filtered.map((c, i) => (
            <button
              key={c.application_id}
              onClick={() => router.push(`/osfa/applicants/${c.application_id}?tab=messages`)}
              style={{
                width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                padding: '16px 20px',
                background: c.unread_count > 0 ? '#fafbff' : '#fff',
                borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                borderLeft: c.unread_count > 0 ? `3px solid ${M}` : '3px solid transparent',
                transition: 'background 0.12s',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
              {/* Avatar */}
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${M}, ${COLORS.maroonD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {c.student_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: c.unread_count > 0 ? 700 : 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.student_name || c.student_email}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {c.last_message_at ? timeAgo(c.last_message_at) : ''}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                  {c.scholarship_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    Application #{c.application_id} · {c.message_count} message{c.message_count !== 1 ? 's' : ''}
                  </span>
                  {c.unread_count > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 20, background: M, color: '#fff' }}>
                      {c.unread_count} new
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
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
