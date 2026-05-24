'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

interface AppConversation {
  kind: 'application';
  application_id: number;
  student_name: string;
  student_email: string;
  scholarship_name: string;
  last_message_at: string | null;
  message_count: number;
  unread_count: number;
}

interface ContactConversation {
  kind: 'contact';
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  osfa_reply: string | null;
  replied_at: string | null;
}

type Conversation = AppConversation | ContactConversation;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export default function StudentMessagesPage() {
  const router = useRouter();
  const [convos,   setConvos]   = useState<Conversation[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<ContactConversation | null>(null);

  const load = useCallback(async () => {
    const [appRes, contactRes] = await Promise.allSettled([
      apiFetch<{ items: Omit<AppConversation, 'kind'>[] }>('/api/applications/inbox'),
      apiFetch<{ items: Omit<ContactConversation, 'kind'>[] }>('/api/student/contacts'),
    ]);

    const apps: AppConversation[] = appRes.status === 'fulfilled'
      ? (appRes.value.items ?? []).map(x => ({ ...x, kind: 'application' as const }))
      : [];

    const contacts: ContactConversation[] = contactRes.status === 'fulfilled'
      ? (contactRes.value.items ?? []).map(x => ({ ...x, kind: 'contact' as const }))
      : [];

    const merged: Conversation[] = [...apps, ...contacts].sort((a, b) => {
      const ta = a.kind === 'application' ? a.last_message_at : a.created_at;
      const tb = b.kind === 'application' ? b.last_message_at : b.created_at;
      return new Date(tb ?? 0).getTime() - new Date(ta ?? 0).getTime();
    });

    setConvos(merged);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalUnread = convos.reduce((s, c) => {
    if (c.kind === 'application') return s + c.unread_count;
    if (c.kind === 'contact') return s + (c.osfa_reply && !c.is_read ? 1 : 0);
    return s;
  }, 0);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Messages</h1>
          {totalUnread > 0 && <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 9px', borderRadius: 20, background: M, color: '#fff' }}>{totalUnread} new</span>}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Your conversations with OSFA</p>
      </div>

      <div className="msg-split-grid" style={{ gridTemplateColumns: selected ? '300px 1fr' : '1fr' }}>

        {/* List — hidden on mobile when contact detail is open */}
        <div className={selected ? 'msg-list-hidden' : undefined} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
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
              <div style={{ fontSize: 13, color: '#9ca3af' }}>Message OSFA through your application or via Contact OSFA.</div>
            </div>
          ) : convos.map((c, i) => {
            const hasReply  = c.kind === 'contact' && !!c.osfa_reply;
            const isUnread  = c.kind === 'application' ? c.unread_count > 0 : (hasReply && !c.is_read);
            const isSelected = c.kind === 'contact' && selected?.id === c.id;
            const name      = 'OSFA Staff';
            const subtitle  = c.kind === 'application' ? c.scholarship_name : (c.subject ?? 'General Inquiry');
            const time      = c.kind === 'application' ? c.last_message_at : c.created_at;
            const tag       = c.kind === 'contact' ? 'General' : null;

            return (
              <button key={c.kind === 'application' ? `app-${c.application_id}` : `contact-${c.id}`}
                onClick={() => {
                  if (c.kind === 'application') router.push(`/student/messages/${c.application_id}`);
                  else setSelected(c);
                }}
                style={{
                  width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                  padding: '14px 18px',
                  background: isSelected ? '#fff5f5' : isUnread ? '#fafbff' : '#fff',
                  borderBottom: i < convos.length - 1 ? '1px solid #f3f4f6' : 'none',
                  borderLeft: isSelected ? `3px solid ${M}` : isUnread ? `3px solid ${M}` : '3px solid transparent',
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.12s',
                }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${M}, ${COLORS.maroonD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: isUnread ? 700 : 600, color: '#111827' }}>{name}</span>
                    <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>{time ? timeAgo(time) : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {tag && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 9, background: '#f1f5f9', color: '#64748b', flexShrink: 0 }}>{tag}</span>}
                    <span style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Re: {subtitle}</span>
                  </div>
                  {c.kind === 'contact' && c.osfa_reply && (
                    <div style={{ fontSize: 10, color: '#15803d', fontWeight: 600, marginTop: 2 }}>OSFA replied ✓</div>
                  )}
                  {c.kind === 'application' && c.unread_count > 0 && (
                    <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 20, background: M, color: '#fff', display: 'inline-block', marginTop: 2 }}>{c.unread_count} new</span>
                  )}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            );
          })}
        </div>

        {/* Contact thread detail */}
        {selected && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{selected.subject ?? 'General Inquiry'}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{timeAgo(selected.created_at)}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '18px 20px' }}>
              {/* Student message */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, justifyContent: 'flex-end' }}>
                <div style={{ background: '#f8fafc', borderRadius: '12px 0 12px 12px', padding: '11px 15px', fontSize: 13, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '85%' }}>
                  {selected.message}
                </div>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#475569', flexShrink: 0 }}>
                  You
                </div>
              </div>

              {/* OSFA reply */}
              {selected.osfa_reply ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg, ${M}, ${COLORS.maroonD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <div style={{ background: M, borderRadius: '0 12px 12px 12px', padding: '11px 15px', fontSize: 13, color: '#fff', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {selected.osfa_reply}
                    </div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                      OSFA · {selected.replied_at ? timeAgo(selected.replied_at) : ''}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Waiting for OSFA response. They usually reply within 3–5 business days.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
