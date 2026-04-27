'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notificationApi, type NotificationResponse } from '@/lib/api-client';
import { COLORS } from '@/lib/theme';

const MAROON = COLORS.maroon;

const TYPE_ICON: Record<string, string> = {
  status:     '📋',
  deadline:   '⏰',
  info:       '🔔',
  approved:   '✅',
  rejected:   '❌',
  incomplete: '⚠️',
  resubmit:   '📤',
};

function formatTime(createdAt: string): string {
  const diff  = Date.now() - new Date(createdAt).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function getNotifRoute(n: NotificationResponse): string {
  switch (n.type) {
    case 'approved':
    case 'rejected':
    case 'incomplete':
    case 'resubmit':
    case 'status':   return '/student/applications';
    case 'deadline': return '/student/iskolarships';
    default:         return '/student/notifications';
  }
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifs, setNotifs]   = useState<NotificationResponse[]>([]);
  const [open, setOpen]       = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await notificationApi.list(1, 20);
      setNotifs(res.items);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const unread = notifs.filter(n => !n.read).length;

  async function handleItemClick(n: NotificationResponse) {
    try {
      await notificationApi.markRead(n.id);
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    } catch { /* ignore */ }
    setOpen(false);
    router.push(getNotifRoute(n));
  }

  async function markAllRead() {
    try {
      await notificationApi.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* ignore */ }
  }

  async function dismiss(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await notificationApi.dismiss(id);
      setNotifs(prev => prev.filter(n => n.id !== id));
    } catch { /* ignore */ }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: 8, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 99, background: MAROON, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', padding: '0 3px' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 360, background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.14)', zIndex: 999, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                Notifications
                {unread > 0 && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 800, background: MAROON, color: '#fff', padding: '1px 6px', borderRadius: 99 }}>{unread}</span>}
              </span>
              {unread > 0 && (
                <button onClick={markAllRead} style={{ fontSize: 12, color: MAROON, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>
              )}
            </div>

            {notifs.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No notifications</div>
            ) : (
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifs.map(n => (
                  <div key={n.id} onClick={() => handleItemClick(n)} title="Click to view" style={{ padding: '12px 16px', borderBottom: '1px solid #f9fafb', background: n.read ? '#fff' : '#fff5f5', display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = n.read ? '#f9fafb' : '#fff0f0'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.read ? '#fff' : '#fff5f5'; }}
                  >
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{TYPE_ICON[n.type] ?? '🔔'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 4px', fontSize: 13, color: '#111827', lineHeight: 1.45 }}>{n.message}</p>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatTime(n.created_at)}</span>
                    </div>
                    {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: MAROON, flexShrink: 0, marginTop: 5 }} />}
                    <button onClick={e => dismiss(n.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 0, flexShrink: 0, fontSize: 16, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{notifs.length} notification{notifs.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
