'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { notificationApi, type NotificationResponse } from '@/lib/api-client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getAccessToken } from '@/lib/api';
import { COLORS } from '@/lib/theme';

// Derive WS URL from the same env var the rest of the app uses
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const WS_BASE  = API_BASE.replace(/^http/, 'ws') + '/ws/notifications';

const MAROON = COLORS.maroon;

const TYPE_CFG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  approved:   { color: '#059669', bg: '#f0fdf4', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
  rejected:   { color: '#dc2626', bg: '#fef2f2', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
  incomplete: { color: '#ea580c', bg: '#fff7ed', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  deadline:   { color: '#d97706', bg: '#fffbeb', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  resubmit:   { color: '#7c3aed', bg: '#f5f3ff', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg> },
  status:     { color: '#2563eb', bg: '#eff6ff', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  info:       { color: '#2563eb', bg: '#eff6ff', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> },
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

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const roleBase = (user?.role === 'osfa_staff' || user?.role === 'super_admin') ? '/osfa' : '/student';
  const [notifs,   setNotifs]   = useState<NotificationResponse[]>([]);
  const [open,     setOpen]     = useState(false);
  const [wsAlert,  setWsAlert]  = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

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

  // WebSocket for real-time notifications
  useEffect(() => {
    let dead = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let consecutiveFails = 0;
    let connectTime = 0;

    const MAX_CONSECUTIVE_FAILS = 5;
    // Immediate close (<500ms after connecting) = server rejection (403/401) — stop retrying
    const IMMEDIATE_CLOSE_MS = 500;

    function connect() {
      // Always grab the freshest token on each attempt
      const token = getAccessToken();
      if (!token || dead) return;

      connectTime = Date.now();
      const ws = new WebSocket(`${WS_BASE}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        consecutiveFails = 0; // reset backoff counter on success
      };

      ws.onmessage = (e) => {
        try {
          const notif = JSON.parse(e.data) as NotificationResponse;
          setNotifs(prev => [notif, ...prev.filter(n => n.id !== notif.id)]);
          setWsAlert(notif.title);
          setTimeout(() => setWsAlert(null), 4000);
        } catch { /* ignore malformed frames */ }
      };

      ws.onclose = () => {
        if (dead) return;

        const elapsed = Date.now() - connectTime;
        consecutiveFails++;

        // Stop retrying on permanent rejection (immediate close = 403/401/blacklisted)
        // or after too many consecutive failures
        if (elapsed < IMMEDIATE_CLOSE_MS || consecutiveFails >= MAX_CONSECUTIVE_FAILS) return;

        // Exponential backoff: 5s → 10s → 20s → 40s → 40s
        const delay = Math.min(5000 * Math.pow(2, consecutiveFails - 1), 40_000);
        retryTimer = setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      dead = true;
      if (retryTimer) clearTimeout(retryTimer);
      wsRef.current?.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const unread = notifs.filter(n => !n.is_read).length;

  async function handleItemClick(n: NotificationResponse) {
    try {
      await notificationApi.markRead(n.id);
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    } catch { /* ignore */ }
    setOpen(false);
    if (n.route) router.push(roleBase + n.route);
  }

  async function markAllRead() {
    try {
      await notificationApi.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
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

      {/* Real-time alert pill */}
      {wsAlert && !open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: MAROON, color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', zIndex: 999, pointerEvents: 'none' }}>
          🔔 {wsAlert}
        </div>
      )}

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
              <div style={{ padding: '36px 16px', textAlign: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px' }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>No notifications</p>
              </div>
            ) : (
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifs.map(n => {
                  const c = TYPE_CFG[n.application_id ? 'status' : 'info'];
                  return (
                    <div key={n.id} onClick={() => handleItemClick(n)} style={{ padding: '11px 16px', borderBottom: '1px solid #f3f4f6', background: n.is_read ? '#fff' : '#fafffe', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.is_read ? '#fff' : '#fafffe'; }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        {c.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 3px', fontSize: 12, color: '#111827', lineHeight: 1.45, fontWeight: n.is_read ? 400 : 600 }}>{n.title}</p>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatTime(n.created_at)}</span>
                      </div>
                      {!n.is_read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: MAROON, flexShrink: 0, marginTop: 6 }} />}
                      <button onClick={e => dismiss(n.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '0 0 0 4px', flexShrink: 0, fontSize: 15, lineHeight: 1 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9ca3af'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d1d5db'; }}>×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
