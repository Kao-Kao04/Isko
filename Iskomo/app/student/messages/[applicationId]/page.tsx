'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

interface Message {
  id: number;
  sender_id: number;
  sender_email: string;
  sender_role: string;
  body: string;
  created_at: string;
}

interface InboxItem {
  application_id: number;
  scholarship_name: string;
  student_name: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function ApplicationChatPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const [messages,     setMessages]     = useState<Message[]>([]);
  const [scholarshipName, setScholarshipName] = useState('');
  const [loading,      setLoading]      = useState(true);
  const [body,         setBody]         = useState('');
  const [sending,      setSending]      = useState(false);
  const [error,        setError]        = useState('');

  const appId = Number(applicationId);

  const loadMessages = useCallback(async () => {
    const res = await apiFetch<{ items: Message[] }>(`/api/applications/${appId}/messages`);
    setMessages(res.items);
  }, [appId]);

  useEffect(() => {
    Promise.allSettled([
      apiFetch<{ items: Message[] }>(`/api/applications/${appId}/messages`),
      apiFetch<{ items: InboxItem[] }>('/api/applications/inbox'),
    ]).then(([msgRes, inboxRes]) => {
      if (msgRes.status === 'fulfilled') setMessages(msgRes.value.items);
      if (inboxRes.status === 'fulfilled') {
        const match = inboxRes.value.items.find(x => x.application_id === appId);
        if (match) setScholarshipName(match.scholarship_name);
      }
    }).finally(() => setLoading(false));
  }, [appId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-refresh via WebSocket notification events
  useEffect(() => {
    const onNotif = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.application_id === appId) loadMessages();
    };
    window.addEventListener('iskomo:notification', onNotif);
    return () => window.removeEventListener('iskomo:notification', onNotif);
  }, [appId, loadMessages]);

  async function send() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError('');
    try {
      const sent = await apiFetch<Message>(`/api/applications/${appId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: trimmed }),
      });
      setMessages(prev => [...prev, sent]);
      setBody('');
      inputRef.current?.focus();
    } catch {
      setError('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 63px)',
      background: '#f8fafc',
    }}>

      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <button
          onClick={() => router.push('/student/messages')}
          style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6b7280', flexShrink: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${M}, ${COLORS.maroonD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            OSFA Staff
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {scholarshipName || `Application #${appId}`}
          </div>
        </div>
      </div>

      {/* Messages thread */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, border: `3px solid #f3f4f6`, borderTop: `3px solid ${M}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No messages yet</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Send a question to OSFA about this scholarship.</div>
          </div>
        ) : (
          messages.map(m => {
            const isMe = m.sender_role === 'student';
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '78%',
                  background: isMe ? M : '#fff',
                  color: isMe ? '#fff' : '#111827',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '10px 14px',
                  fontSize: 14,
                  lineHeight: 1.55,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {m.body}
                </div>
                <span style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                  {isMe ? 'You' : 'OSFA'} · {formatTime(m.created_at)}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        background: '#fff',
        borderTop: '1px solid #e5e7eb',
        padding: '12px 16px',
        flexShrink: 0,
      }}>
        {error && <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message…"
            rows={1}
            style={{
              flex: 1,
              border: '1.5px solid #e5e7eb',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 14,
              outline: 'none',
              color: '#111827',
              resize: 'none',
              maxHeight: 120,
              overflowY: 'auto',
              lineHeight: 1.5,
              fontFamily: 'inherit',
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={!body.trim() || sending}
            style={{
              width: 42, height: 42,
              borderRadius: '50%',
              background: body.trim() ? M : '#e5e7eb',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: body.trim() ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            {sending ? (
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={body.trim() ? '#fff' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
