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

export default function OsfaMessagesPage() {
  const router = useRouter();
  const [convos,   setConvos]   = useState<Conversation[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<ContactConversation | null>(null);
  const [reply,    setReply]    = useState('');
  const [sending,  setSending]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    const [appRes, contactRes] = await Promise.allSettled([
      apiFetch<{ items: Omit<AppConversation, 'kind'>[] }>('/api/applications/inbox'),
      apiFetch<{ items: Omit<ContactConversation, 'kind'>[] }>('/api/osfa/contacts?page=1&page_size=100'),
    ]);

    const apps: AppConversation[] = appRes.status === 'fulfilled'
      ? (appRes.value.items ?? []).map(x => ({ ...x, kind: 'application' as const }))
      : [];

    const contacts: ContactConversation[] = contactRes.status === 'fulfilled'
      ? (contactRes.value.items ?? []).map(x => ({ ...x, kind: 'contact' as const }))
      : [];

    if (appRes.status === 'rejected' || contactRes.status === 'rejected') {
      const errs: string[] = [];
      if (appRes.status === 'rejected')     errs.push('application messages');
      if (contactRes.status === 'rejected') errs.push('contact inquiries');
      setApiError(`Failed to load: ${errs.join(', ')}. Check backend logs or try refreshing.`);
    }

    // Merge and sort by most recent
    const merged: Conversation[] = [
      ...apps,
      ...contacts,
    ].sort((a, b) => {
      const ta = a.kind === 'application' ? a.last_message_at : a.created_at;
      const tb = b.kind === 'application' ? b.last_message_at : b.created_at;
      return new Date(tb ?? 0).getTime() - new Date(ta ?? 0).getTime();
    });

    setConvos(merged);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markContactRead(c: ContactConversation) {
    if (!c.is_read) {
      await apiFetch(`/api/osfa/contacts/${c.id}/read`, { method: 'PATCH' }).catch(() => {});
      setConvos(prev => prev.map(x => x.kind === 'contact' && x.id === c.id ? { ...x, is_read: true } : x));
    }
    setSelected({ ...c, is_read: true });
    setReply('');
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      const updated = await apiFetch<ContactConversation>(`/api/osfa/contacts/${selected.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply: reply.trim() }),
      });
      setSelected({ ...updated, kind: 'contact' });
      setConvos(prev => prev.map(x => x.kind === 'contact' && x.id === selected.id ? { ...updated, kind: 'contact' } : x));
      setReply('');
    } catch { /* silent */ }
    finally { setSending(false); }
  }

  const filtered = convos.filter(c => {
    const q = search.toLowerCase();
    if (c.kind === 'application') {
      return c.student_name.toLowerCase().includes(q) || c.student_email.toLowerCase().includes(q) || c.scholarship_name.toLowerCase().includes(q);
    }
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.subject ?? '').toLowerCase().includes(q);
  });

  const totalUnread = convos.reduce((s, c) => {
    if (c.kind === 'application') return s + c.unread_count;
    if (c.kind === 'contact') return s + (c.is_read ? 0 : 1);
    return s;
  }, 0);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Messages</h1>
          {totalUnread > 0 && <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 9px', borderRadius: 20, background: M, color: '#fff' }}>{totalUnread} unread</span>}
          <button onClick={load} disabled={loading} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 12, color: '#6b7280' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh
          </button>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Application conversations + general inquiries from students</p>
      </div>

      {/* API error banner */}
      {apiError && (
        <div style={{ marginBottom: 16, padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {apiError}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Search by name, email, or scholarship..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#111827', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '360px 1fr' : '1fr', gap: 16, alignItems: 'start' }}>

        {/* Conversation list */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {loading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 28, height: 28, border: `3px solid #f3f4f6`, borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                {apiError ? 'Could not load messages' : search ? 'No results found' : 'No messages yet'}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>
                {apiError
                  ? 'An error occurred. Try refreshing.'
                  : search
                    ? 'Try a different search term.'
                    : 'Student messages and contact inquiries will appear here.'}
              </div>
            </div>
          ) : filtered.map((c, i) => {
            const isUnread = c.kind === 'application' ? c.unread_count > 0 : !c.is_read;
            const isSelected = c.kind === 'contact' && selected?.id === c.id;
            const name     = c.kind === 'application' ? c.student_name : c.name;
            const subtitle = c.kind === 'application' ? c.scholarship_name : (c.subject ?? 'General Inquiry');
            const time     = c.kind === 'application' ? c.last_message_at : c.created_at;
            const badge    = c.kind === 'application' ? c.unread_count : (c.is_read ? 0 : 1);
            const tag      = c.kind === 'contact' ? 'Contact Form' : null;

            return (
              <button key={c.kind === 'application' ? `app-${c.application_id}` : `contact-${c.id}`}
                onClick={() => {
                  if (c.kind === 'application') router.push(`/osfa/applicants/${c.application_id}?tab=messages`);
                  else markContactRead(c);
                }}
                style={{
                  width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                  padding: '14px 18px',
                  background: isSelected ? '#fff5f5' : isUnread ? '#fafbff' : '#fff',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                  borderLeft: isSelected ? `3px solid ${M}` : isUnread ? '3px solid #3b82f6' : '3px solid transparent',
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.12s',
                }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: c.kind === 'contact' ? '#eff6ff' : `linear-gradient(135deg, ${M}, ${COLORS.maroonD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.kind === 'contact' ? '#2563eb' : '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {c.kind === 'contact'
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    : (name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??')
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: isUnread ? 700 : 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                    <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>{time ? timeAgo(time) : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {tag && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 9, background: '#eff6ff', color: '#2563eb', flexShrink: 0 }}>{tag}</span>}
                    <span style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</span>
                  </div>
                  {c.kind === 'contact' && c.osfa_reply && (
                    <div style={{ fontSize: 10, color: '#15803d', fontWeight: 600, marginTop: 2 }}>✓ Replied</div>
                  )}
                </div>
                {badge > 0 && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 20, background: M, color: '#fff', flexShrink: 0 }}>{badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Contact inquiry detail + reply panel */}
        {selected && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {/* Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{selected.subject ?? 'General Inquiry'}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{selected.name}</span>
                  <a href={`mailto:${selected.email}`} style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none' }}>{selected.email}</a>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{timeAgo(selected.created_at)}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Message bubble */}
            <div style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#374151' }}>
                  {selected.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '0 12px 12px 12px', padding: '12px 16px', fontSize: 13, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1 }}>
                  {selected.message}
                </div>
              </div>

              {/* OSFA reply bubble */}
              {selected.osfa_reply && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, justifyContent: 'flex-end' }}>
                  <div style={{ background: M, borderRadius: '12px 0 12px 12px', padding: '12px 16px', fontSize: 13, color: '#fff', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '80%' }}>
                    {selected.osfa_reply}
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: M, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  </div>
                </div>
              )}

              {/* Reply box */}
              {!selected.osfa_reply && (
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                  <textarea
                    value={reply} onChange={e => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#111827', resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>Reply will also be sent to {selected.email}</span>
                    <button onClick={sendReply} disabled={sending || !reply.trim()} style={{ padding: '8px 20px', background: reply.trim() && !sending ? M : '#d1d5db', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', cursor: reply.trim() && !sending ? 'pointer' : 'not-allowed' }}>
                      {sending ? 'Sending…' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}

              {selected.osfa_reply && (
                <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                  ✓ You replied on {selected.replied_at ? new Date(selected.replied_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}. An email was sent to {selected.email}.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
