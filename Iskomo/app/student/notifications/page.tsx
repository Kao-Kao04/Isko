'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notificationApi, type NotificationResponse } from '@/lib/api-client';
import { COLORS } from '@/lib/theme';

const MAROON = COLORS.maroon;

function formatTime(d: string) {
  const date = new Date(d);
  const now   = new Date();
  const diff  = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function StudentNotificationsPage() {
  const router = useRouter();
  const [notifs,  setNotifs]  = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const PAGE_SIZE = 20;

  const fetchNotifs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await notificationApi.list(p, PAGE_SIZE);
      if (p === 1) setNotifs(res.items);
      else setNotifs(prev => [...prev, ...res.items]);
      setTotal(res.total);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(1); }, [fetchNotifs]);

  async function handleClick(n: NotificationResponse) {
    try { await notificationApi.markRead(n.id); } catch { /* ignore */ }
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    if (n.route) router.push('/student' + n.route);
  }

  async function handleDismiss(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try { await notificationApi.dismiss(id); } catch { /* ignore */ }
    setNotifs(prev => prev.filter(n => n.id !== id));
  }

  async function markAllRead() {
    try { await notificationApi.markAllRead(); } catch { /* ignore */ }
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px 100px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827' }}>Notifications</h1>
          {unread > 0 && (
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6b7280' }}>{unread} unread</p>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ padding: '7px 14px', border: `1px solid ${MAROON}30`, borderRadius: 8, background: `${MAROON}08`, color: MAROON, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      {loading && notifs.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: `3px solid #f3f4f6`, borderTop: `3px solid ${MAROON}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : notifs.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center', background: '#fff', borderRadius: 16, border: '1px solid #f3f4f6' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px' }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p style={{ margin: 0, fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>No notifications yet</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {notifs.map((n, i) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                padding: '14px 16px',
                borderBottom: i < notifs.length - 1 ? '1px solid #f3f4f6' : 'none',
                background: n.is_read ? '#fff' : `${MAROON}04`,
                display: 'flex', gap: 12, alignItems: 'flex-start',
                cursor: n.route ? 'pointer' : 'default',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { if (n.route) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.is_read ? '#fff' : `${MAROON}04`; }}
            >
              {/* Icon */}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: n.is_read ? '#f3f4f6' : `${MAROON}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={n.is_read ? '#9ca3af' : MAROON} strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: '#111827', lineHeight: 1.4 }}>{n.title}</p>
                <p style={{ margin: '0 0 5px', fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{n.body}</p>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatTime(n.created_at)}</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {!n.is_read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: MAROON }} />}
                <button
                  onClick={e => handleDismiss(n.id, e)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 18, lineHeight: 1, padding: '0 2px' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9ca3af'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d1d5db'; }}
                  aria-label="Dismiss"
                >×</button>
              </div>
            </div>
          ))}

          {/* Load more */}
          {notifs.length < total && (
            <div style={{ padding: '14px', textAlign: 'center', borderTop: '1px solid #f3f4f6' }}>
              <button
                onClick={() => { const next = page + 1; setPage(next); fetchNotifs(next); }}
                disabled={loading}
                style={{ padding: '8px 20px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
