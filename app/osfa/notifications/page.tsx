'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';

const TEAL = '#800000';
const TEAL_DARK = '#5C0000';
const TEAL_LIGHT = '#fff5f5';

type NotifType = 'application' | 'evaluation' | 'deadline' | 'system' | 'approval';
type NotifFilter = 'All' | 'Unread' | 'Applications' | 'System';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  group: 'Today' | 'Yesterday' | 'Earlier';
  isRead: boolean;
  actionLabel?: string;
  actionHref?: string;
}

const initialNotifications: Notification[] = [
  {
    id: '1', type: 'application', title: 'New Application Received',
    message: 'Juan dela Cruz submitted an application for the Academic Excellence Grant.',
    time: '2 hours ago', group: 'Today', isRead: false,
    actionLabel: 'Review Application', actionHref: '/osfa/applicants',
  },
  {
    id: '2', type: 'evaluation', title: 'Evaluation Completed',
    message: 'Maria Santos\'s application for STEM Innovation Award has been evaluated and approved.',
    time: '5 hours ago', group: 'Today', isRead: false,
    actionLabel: 'View Evaluation', actionHref: '/osfa/applicants',
  },
  {
    id: '3', type: 'deadline', title: 'Deadline Approaching',
    message: 'Academic Excellence Grant applications close in 2 days (Apr 20, 2026). 5 applications are still pending review.',
    time: '8 hours ago', group: 'Today', isRead: false,
    actionLabel: 'Review Pending', actionHref: '/osfa/applicants',
  },
  {
    id: '4', type: 'application', title: 'New Application Received',
    message: 'Liza Garcia submitted an application for the Academic Excellence Grant.',
    time: '1 day ago', group: 'Yesterday', isRead: false,
    actionLabel: 'Review Application', actionHref: '/osfa/applicants',
  },
  {
    id: '5', type: 'approval', title: 'Application Approved',
    message: 'Ana Santos\'s application for STEM Innovation Award was approved. Student has been notified.',
    time: '1 day ago', group: 'Yesterday', isRead: true,
    actionLabel: 'View Record', actionHref: '/osfa/applicants',
  },
  {
    id: '6', type: 'system', title: 'Scholarship Published',
    message: 'Community Service Scholarship is now live and accepting applications.',
    time: '2 days ago', group: 'Earlier', isRead: true,
    actionLabel: 'View Scholarship', actionHref: '/osfa/scholarships',
  },
  {
    id: '7', type: 'system', title: 'System Maintenance Notice',
    message: 'IskoMo will undergo scheduled maintenance on Apr 20, 2026 from 2:00 AM to 4:00 AM. The system will be temporarily unavailable.',
    time: '3 days ago', group: 'Earlier', isRead: true,
  },
];

const typeStyle: Record<NotifType, { bg: string; color: string; icon: ReactNode }> = {
  application: {
    bg: '#eff6ff', color: '#2563eb',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  },
  evaluation: {
    bg: '#f5f3ff', color: '#7c3aed',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  },
  deadline: {
    bg: '#fef2f2', color: '#dc2626',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  system: {
    bg: '#f8fafc', color: '#475569',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  },
  approval: {
    bg: '#fff5f5', color: '#059669',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  },
};

export default function Page() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<NotifFilter>('All');

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'Unread') return !n.isRead;
    if (activeFilter === 'Applications') return n.type === 'application' || n.type === 'approval' || n.type === 'evaluation';
    if (activeFilter === 'System') return n.type === 'system' || n.type === 'deadline';
    return true;
  });

  const groups: Array<'Today' | 'Yesterday' | 'Earlier'> = ['Today', 'Yesterday', 'Earlier'];

  return (
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
            {unreadCount > 0 && (
              <span style={{ background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 9px', borderRadius: 99 }}>
                {unreadCount} unread
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Stay updated on application activity and system events</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Mark All as Read
            </button>
          )}
          <Link href="/osfa/profile" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
            Preferences
          </Link>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>

        {/* Main content */}
        <div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #e5e7eb', width: 'fit-content' }}>
            {(['All', 'Unread', 'Applications', 'System'] as NotifFilter[]).map((f) => {
              const active = activeFilter === f;
              return (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: '7px 16px', borderRadius: 7, border: 'none',
                  background: active ? TEAL_LIGHT : 'transparent',
                  color: active ? TEAL : '#6b7280',
                  fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer',
                }}>
                  {f}
                  {f === 'Unread' && unreadCount > 0 && (
                    <span style={{ marginLeft: 6, background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 99 }}>{unreadCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Grouped notifications */}
          {filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '48px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No notifications</div>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>You are all caught up.</div>
            </div>
          ) : (
            groups.map((group) => {
              const groupItems = filtered.filter((n) => n.group === group);
              if (groupItems.length === 0) return null;
              return (
                <div key={group} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{group}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {groupItems.map((n) => {
                      const ts = typeStyle[n.type];
                      return (
                        <div key={n.id} style={{
                          background: n.isRead ? '#fff' : '#fafffe',
                          borderRadius: 12,
                          border: n.isRead ? '1px solid #e5e7eb' : `1px solid ${TEAL}30`,
                          padding: '16px 20px',
                          display: 'flex', gap: 14, alignItems: 'flex-start',
                          boxShadow: n.isRead ? '0 1px 3px rgba(0,0,0,0.03)' : `0 1px 6px ${TEAL}15`,
                          position: 'relative',
                        }}>
                          {!n.isRead && (
                            <div style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: TEAL }} />
                          )}
                          <div style={{ width: 38, height: 38, borderRadius: 9, background: ts.bg, color: ts.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {ts.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                              <h4 style={{ margin: 0, fontSize: 14, fontWeight: n.isRead ? 600 : 700, color: '#111827' }}>{n.title}</h4>
                              <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', marginTop: 1, flexShrink: 0 }}>{n.time}</span>
                            </div>
                            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{n.message}</p>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              {n.actionLabel && n.actionHref && (
                                <Link href={n.actionHref} onClick={() => markAsRead(n.id)} style={{
                                  fontSize: 12, fontWeight: 700, color: TEAL,
                                  textDecoration: 'none', padding: '5px 12px',
                                  background: TEAL_LIGHT, borderRadius: 7,
                                  border: `1px solid #fca5a5`,
                                }}>{n.actionLabel}</Link>
                              )}
                              {!n.isRead && (
                                <button onClick={() => markAsRead(n.id)} style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0', fontWeight: 500 }}>
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Summary</h3>
            </div>
            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Total', value: notifications.length, color: '#374151' },
                { label: 'Unread', value: notifications.filter((n) => !n.isRead).length, color: '#dc2626' },
                { label: 'Applications', value: notifications.filter((n) => n.type === 'application' || n.type === 'approval').length, color: '#2563eb' },
                { label: 'Evaluations', value: notifications.filter((n) => n.type === 'evaluation').length, color: '#7c3aed' },
                { label: 'Deadlines', value: notifications.filter((n) => n.type === 'deadline').length, color: '#d97706' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Quick Links</h3>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'Review Pending Applications', href: '/osfa/applicants' },
                { label: 'View All Applicants', href: '/osfa/applicants' },
                { label: 'Manage Scholarships', href: '/osfa/scholarships' },
              ].map((link) => (
                <Link key={link.label} href={link.href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
                  color: '#374151', fontSize: 13, fontWeight: 500,
                  background: '#fafafa', border: '1px solid #f3f4f6',
                }}>
                  {link.label}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
