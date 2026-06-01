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

function formatFull(d: string) {
  return new Date(d).toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getIcon(n: NotificationResponse, size = 20, color?: string) {
  const t = n.title.toLowerCase();
  const c = color ?? (n.is_read ? '#9ca3af' : MAROON);
  if (n.application_id || t.includes('application') || t.includes('approved') || t.includes('rejected') || t.includes('submitted') || t.includes('screened') || t.includes('verification') || t.includes('interview') || t.includes('compliance') || t.includes('documents')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function getActionRoute(n: NotificationResponse): string | null {
  const t = n.title.toLowerCase();
  // Message/reply notifications go to the dedicated per-application messages page
  if (n.application_id && (t.includes('message') || t.includes('reply'))) {
    return `/student/messages/${n.application_id}`;
  }
  if (n.application_id) return `/student/applications/${n.application_id}`;
  if (n.route && n.route !== '/notifications') return `/student${n.route}`;
  if (t.includes('deadline') || t.includes('scholarship')) return '/student/iskolarships';
  return null;
}

export default function StudentNotificationsPage() {
  const router = useRouter();
  const [notifs,   setNotifs]   = useState<NotificationResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [selected, setSelected] = useState<NotificationResponse | null>(null);
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

  // Refresh when a real-time notification arrives via the layout's WebSocket
  useEffect(() => {
    const handler = () => { setPage(1); fetchNotifs(1); };
    window.addEventListener('iskomo:notification', handler);
    return () => window.removeEventListener('iskomo:notification', handler);
  }, [fetchNotifs]);

  // Close panel on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  async function handleClick(n: NotificationResponse) {
    try { await notificationApi.markRead(n.id); } catch { /* ignore */ }
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));

    // Application-specific → navigate directly; announcements → open detail panel
    if (n.application_id) {
      router.push(`/student/applications/${n.application_id}`);
    } else {
      setSelected({ ...n, is_read: true });
    }
  }

  async function handleDismiss(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try { await notificationApi.dismiss(id); } catch { /* ignore */ }
    setNotifs(prev => prev.filter(n => n.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  async function markAllRead() {
    try { await notificationApi.markAllRead(); } catch { /* ignore */ }
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    if (selected) setSelected(prev => prev ? { ...prev, is_read: true } : null);
  }

  const unread = notifs.filter(n => !n.is_read).length;
  const actionRoute = selected ? getActionRoute(selected) : null;

  return (
    <>
      <div style={{ maxWidth: selected ? 1100 : 640, margin: '0 auto', padding: '28px 16px 100px', display: 'flex', gap: 20, alignItems: 'flex-start', transition: 'max-width 0.25s ease' }}>

        {/* ── Notification List ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827' }}>Notifications</h1>
              {unread > 0 && <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6b7280' }}>{unread} unread</p>}
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
              {notifs.map((n, i) => {
                const isSelected = selected?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: i < notifs.length - 1 ? '1px solid #f3f4f6' : 'none',
                      background: isSelected ? `${MAROON}0a` : n.is_read ? '#fff' : `${MAROON}04`,
                      borderLeft: isSelected ? `3px solid ${MAROON}` : '3px solid transparent',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = n.is_read ? '#fff' : `${MAROON}04`; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: isSelected ? `${MAROON}18` : n.is_read ? '#f3f4f6' : `${MAROON}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {getIcon(n, 16, isSelected ? MAROON : undefined)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: '#111827', lineHeight: 1.4 }}>{n.title}</p>
                      <p style={{ margin: '0 0 5px', fontSize: 12, color: '#6b7280', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</p>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatTime(n.created_at)}</span>
                    </div>
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
                );
              })}

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

        {/* ── Detail Panel (desktop: side; mobile: bottom sheet via fixed overlay) ── */}
        {selected && (
          <>
            {/* Mobile backdrop */}
            <div
              onClick={() => setSelected(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1100, display: 'none' }}
              className="notif-backdrop"
            />

            <div
              className="notif-panel"
              style={{
                width: 340,
                flexShrink: 0,
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 90,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Mobile drag handle */}
              <div className="notif-drag-handle" style={{ display: 'none', justifyContent: 'center', paddingTop: 10, paddingBottom: 4 }}>
                <div style={{ width: 36, height: 4, borderRadius: 99, background: '#e5e7eb' }} />
              </div>

              {/* Panel header */}
              <div className="notif-panel-header" style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${MAROON}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getIcon(selected, 15, MAROON)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Details</span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 16 }}
                >×</button>
              </div>

              {/* Panel body */}
              <div className="notif-panel-body" style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>{selected.title}</p>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatFull(selected.created_at)}</span>
                </div>

                {selected.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.image_url} alt="announcement" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 200, display: 'block' }} />
                )}
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.body}</p>
                </div>

                {actionRoute && (
                  <button
                    onClick={() => router.push(actionRoute)}
                    style={{ width: '100%', padding: '11px', background: `linear-gradient(135deg, ${MAROON}, #5C0000)`, border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    {selected.application_id ? 'View Application' : selected.route === '/profile' ? 'View Profile' : selected.route === '/registrations' ? 'View GWA Request' : 'View Scholarships'}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                )}

                <button
                  onClick={e => { handleDismiss(selected.id, e as unknown as React.MouseEvent); }}
                  style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Dismiss Notification
                </button>
              </div>
            </div>

          </>
        )}
      </div>
    </>
  );
}
