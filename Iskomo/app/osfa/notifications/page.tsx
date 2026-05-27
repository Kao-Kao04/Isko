'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notificationApi, type NotificationResponse } from '@/lib/api-client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;
const TEAL_LIGHT = COLORS.maroonL;

type NotifFilter = 'All' | 'Unread' | 'New Applications' | 'Messages' | 'System';
type NotifGroup  = 'Today' | 'Yesterday' | 'Earlier';

interface DisplayNotif {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  fullDate: string;
  group: NotifGroup;
  isRead: boolean;
  applicationId: number | null;
  imageUrl?: string;
  actionLabel?: string;
  actionHref?: string;
}

const typeStyle: Record<string, { bg: string; color: string; icon: ReactNode }> = {
  submission:  { bg: '#f0fdf4', color: '#059669', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  message:     { bg: '#eff6ff', color: '#2563eb', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  application: { bg: '#eff6ff', color: '#2563eb', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  status:      { bg: '#eff6ff', color: '#2563eb', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  approved:    { bg: '#fff5f5', color: '#059669', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
  rejected:    { bg: '#fef2f2', color: '#dc2626', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
  incomplete:  { bg: '#fff7ed', color: '#ea580c', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  resubmit:    { bg: '#f5f3ff', color: '#7c3aed', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  deadline:    { bg: '#fef2f2', color: '#dc2626', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  info:        { bg: '#f8fafc', color: '#475569', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
};


function formatTime(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getGroup(createdAt: string): NotifGroup {
  const diff = Date.now() - new Date(createdAt).getTime();
  if (diff < 86400000)  return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return 'Earlier';
}

function classifyOsfaType(n: NotificationResponse): string {
  const t = n.title.toLowerCase();
  if (t.includes('message') || t.includes('reply')) return 'message';
  if (n.application_id) {
    if (t.includes('submit') || t.includes('resubmit')) return 'submission';
    return 'application';
  }
  return 'info';
}

function formatFullDate(d: string) {
  return new Date(d).toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function mapNotif(n: NotificationResponse): DisplayNotif {
  // Normalise the route: strip any /osfa prefix already in the stored route,
  // then convert student /applications/{id} path to OSFA /applicants/{id}.
  const route = n.route
    ?.replace(/^\/osfa/, '')
    .replace(/^\/applications\//, '/applicants/')
    ?? null;
  const href = route ? `/osfa${route}` : (n.application_id ? `/osfa/applicants/${n.application_id}` : undefined);
  return {
    id:            n.id,
    type:          classifyOsfaType(n),
    title:         n.title,
    message:       n.body,
    time:          formatTime(n.created_at),
    fullDate:      formatFullDate(n.created_at),
    group:         getGroup(n.created_at),
    isRead:        n.is_read,
    applicationId: n.application_id,
    imageUrl:      n.image_url ?? undefined,
    actionLabel:   'View Details',
    actionHref:    href,
  };
}

export default function Page() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const isSuperAdmin = user?.role === 'super_admin';
  const canAnnounce  = user?.role === 'super_admin' || user?.role === 'osfa_staff';
  const [announceTarget, setAnnounceTarget] = useState<'all' | 'by_scholarship' | 'by_status'>('all');
  const [announceScholarshipId, setAnnounceScholarshipId] = useState('');
  const [notifications, setNotifications] = useState<DisplayNotif[]>([]);
  const [loading, setLoading]             = useState(true);
  const [activeFilter, setActiveFilter]   = useState<NotifFilter>('All');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastTitle,    setBroadcastTitle]    = useState('');
  const [broadcastBody,     setBroadcastBody]     = useState('');
  const [broadcastLink,     setBroadcastLink]     = useState('');
  const [broadcastImage,    setBroadcastImage]    = useState<string | null>(null);
  const [broadcasting,      setBroadcasting]      = useState(false);
  const [broadcastOk,       setBroadcastOk]       = useState('');
  const [broadcastErr,      setBroadcastErr]      = useState('');
  const [selectedNotif,     setSelectedNotif]     = useState<DisplayNotif | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.list(1, 50);
      setNotifications(res.items.map(mapNotif));
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  function handleNotifAction(n: DisplayNotif) {
    markAsRead(n.id);
    if (n.applicationId && n.actionHref) {
      router.push(n.actionHref);
    } else {
      setSelectedNotif({ ...n, isRead: true });
    }
  }

  function handleBroadcastImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new window.Image();
      img.onload = () => {
        const MAX = 800;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = img.width  * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        setBroadcastImage(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function sendBroadcast() {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    setBroadcasting(true);
    setBroadcastErr('');
    setBroadcastOk('');
    try {
      const { notificationApi } = await import('@/lib/api-client');
      const payload: Parameters<typeof notificationApi.announce>[0] = {
        title: broadcastTitle.trim(),
        body:  broadcastBody.trim(),
        target: announceTarget,
        ...(announceTarget === 'by_scholarship' && announceScholarshipId
          ? { scholarship_id: Number(announceScholarshipId) }
          : {}),
        ...(broadcastLink.trim()  ? { link:      broadcastLink.trim() }  : {}),
        ...(broadcastImage        ? { image_url: broadcastImage }        : {}),
      };
      const data = await notificationApi.announce(payload);
      setBroadcastOk(data.message);
      setBroadcastTitle('');
      setBroadcastBody('');
      setBroadcastLink('');
      setBroadcastImage(null);
      setAnnounceTarget('all');
      setTimeout(() => { setShowBroadcast(false); setBroadcastOk(''); }, 2000);
    } catch (err) {
      setBroadcastErr(err instanceof Error ? err.message : 'Failed to send.');
    } finally {
      setBroadcasting(false);
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const newAppCount  = notifications.filter(n => n.type === 'submission').length;
  const messageCount = notifications.filter(n => n.type === 'message').length;
  const systemCount  = notifications.filter(n => n.type === 'info').length;

  const filtered = notifications.filter(n => {
    if (activeFilter === 'Unread')           return !n.isRead;
    if (activeFilter === 'New Applications') return n.type === 'submission';
    if (activeFilter === 'Messages')         return n.type === 'message';
    if (activeFilter === 'System')           return n.type === 'info';
    return true;
  });

  const groups: NotifGroup[] = ['Today', 'Yesterday', 'Earlier'];

  if (loading) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: `3px solid #f3f4f6`, borderTop: `3px solid ${TEAL}`, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <>
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Notifications</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Notifications</h1>
            {unreadCount > 0 && <span style={{ background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 9px', borderRadius: 99 }}>{unreadCount} unread</span>}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Stay updated on application activity and system events</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {canAnnounce && (
            <button onClick={() => setShowBroadcast(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: `linear-gradient(135deg, ${TEAL}, #5C0000)`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h20a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3zm-8 4H10"/></svg>
              Send Announcement
            </button>
          )}
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Mark All as Read
            </button>
          )}
          <Link href="/osfa/profile" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            Preferences
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
            {([
              { label: 'All',              count: null },
              { label: 'Unread',           count: unreadCount },
              { label: 'New Applications', count: newAppCount },
              { label: 'Messages',         count: messageCount },
              { label: 'System',           count: systemCount },
            ] as { label: NotifFilter; count: number | null }[]).map(({ label, count }) => (
              <button key={label} onClick={() => setActiveFilter(label)} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: activeFilter === label ? TEAL_LIGHT : 'transparent', color: activeFilter === label ? TEAL : '#6b7280', fontSize: 13, fontWeight: activeFilter === label ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {label}
                {count !== null && count > 0 && (
                  <span style={{ marginLeft: 5, background: label === 'Unread' ? '#dc2626' : TEAL, color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 99 }}>{count}</span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No notifications</div>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>You are all caught up.</div>
            </div>
          ) : groups.map(group => {
            const items = filtered.filter(n => n.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{group}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(n => {
                    const ts = typeStyle[n.type] ?? typeStyle.info;
                    return (
                      <div key={n.id}
                        onClick={() => handleNotifAction(n)}
                        style={{ background: n.isRead ? '#fff' : '#fafffe', borderRadius: 12, border: n.isRead ? '1px solid #e5e7eb' : `1px solid ${TEAL}30`, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative', cursor: 'pointer', transition: 'background 0.12s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.isRead ? '#fff' : '#fafffe'; }}
                      >
                        {!n.isRead && <div style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: TEAL }} />}
                        <div style={{ width: 38, height: 38, borderRadius: 9, background: ts.bg, color: ts.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{ts.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', flex: 1 }}>
                              <h4 style={{ margin: 0, fontSize: 14, fontWeight: n.isRead ? 600 : 700, color: '#111827' }}>{n.title}</h4>
                              {n.type === 'submission' && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: '#f0fdf4', color: '#059669', whiteSpace: 'nowrap', flexShrink: 0 }}>NEW APPLICATION</span>}
                              {n.type === 'message'    && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: '#eff6ff', color: '#2563eb', whiteSpace: 'nowrap', flexShrink: 0 }}>MESSAGE</span>}
                            </div>
                            <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', marginTop: 1, flexShrink: 0 }}>{n.time}</span>
                          </div>
                          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{n.message}</p>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleNotifAction(n)}
                              style={{ fontSize: 12, fontWeight: 700, color: TEAL, background: TEAL_LIGHT, border: `1px solid ${TEAL}40`, borderRadius: 7, padding: '5px 12px', cursor: 'pointer' }}
                            >
                              {n.applicationId ? 'View Details' : 'View Announcement'}
                            </button>
                            {!n.isRead && (
                              <button onClick={() => markAsRead(n.id)} style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0', fontWeight: 500 }}>Mark as read</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Summary</h3>
            </div>
            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Total',            value: notifications.length, color: '#374151' },
                { label: 'Unread',           value: unreadCount,          color: '#dc2626' },
                { label: 'New Applications', value: newAppCount,           color: '#059669' },
                { label: 'Messages',         value: messageCount,          color: '#2563eb' },
                { label: 'System',           value: systemCount,           color: '#d97706' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Quick Links</h3>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'Review Pending Applications', href: '/osfa/applicants?status=pending' },
                { label: 'View All Applicants',         href: '/osfa/applicants' },
                { label: 'Manage Scholarships',         href: '/osfa/scholarships' },
              ].map(link => (
                <Link key={link.label} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: 13, fontWeight: 500, background: '#fafafa', border: '1px solid #f3f4f6' }}>
                  {link.label}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Notification Detail Modal */}
    {selectedNotif && !selectedNotif.applicationId && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setSelectedNotif(null)}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 0, maxWidth: 520, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
          {/* Modal header */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${TEAL}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h20a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3zm-8 4H10"/></svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Announcement</span>
            </div>
            <button onClick={() => setSelectedNotif(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 16 }}>×</button>
          </div>
          {/* Modal body */}
          <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>{selectedNotif.title}</p>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{selectedNotif.fullDate}</span>
            </div>
            {selectedNotif.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedNotif.imageUrl} alt="announcement" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 220, display: 'block' }} />
            )}
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
              <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedNotif.message}</p>
            </div>
            <button onClick={() => setSelectedNotif(null)} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      </div>
    )}

    {/* Send Announcement Modal */}
    {showBroadcast && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowBroadcast(false)}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 500, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
          <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Send Announcement</h2>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>Send a notification to students based on your target selection.</p>

          {broadcastErr && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 14 }}>{broadcastErr}</div>}
          {broadcastOk  && <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#15803d', marginBottom: 14 }}>{broadcastOk}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Target</label>
              <select value={announceTarget} onChange={e => setAnnounceTarget(e.target.value as typeof announceTarget)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                <option value="all">All Students</option>
                <option value="by_scholarship">By Scholarship</option>
                <option value="by_status">By Application Status</option>
              </select>
            </div>
            {announceTarget === 'by_scholarship' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Scholarship ID</label>
                <input type="number" value={announceScholarshipId} onChange={e => setAnnounceScholarshipId(e.target.value)}
                  placeholder="Enter scholarship ID" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Title <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="text" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder="e.g. OSFA Scholarship Announcement" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)} rows={4} placeholder="Type your announcement message here..." style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Link <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <input type="url" value={broadcastLink} onChange={e => setBroadcastLink(e.target.value)} placeholder="https://... students will be taken here when they tap the notification" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>Leave blank to link to the Notifications page.</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Image <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              {broadcastImage ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={broadcastImage} alt="preview" style={{ height: 80, borderRadius: 8, border: '1px solid #e5e7eb', objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={() => setBroadcastImage(null)}
                    style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: '1.5px dashed #d1d5db', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#6b7280', background: '#f9fafb' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleBroadcastImage}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={() => setShowBroadcast(false)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
            <button onClick={sendBroadcast} disabled={broadcasting || !broadcastTitle.trim() || !broadcastBody.trim()} style={{ flex: 1, padding: 10, background: (broadcasting || !broadcastTitle.trim() || !broadcastBody.trim()) ? '#9ca3af' : `linear-gradient(135deg, ${TEAL}, #5C0000)`, border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: (broadcasting || !broadcastTitle.trim() || !broadcastBody.trim()) ? 'not-allowed' : 'pointer', color: '#fff' }}>
              {broadcasting ? 'Sending…' : 'Send Announcement'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
