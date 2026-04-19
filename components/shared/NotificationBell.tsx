'use client';

import { useState } from 'react';

const MAROON = '#800000';

interface Notification {
  id: string;
  type: 'status' | 'deadline' | 'info';
  message: string;
  time: string;
  read: boolean;
}

const INITIAL: Notification[] = [
  { id: '1', type: 'status',   message: 'Your application for Academic Excellence Grant is now Under Review.', time: '2h ago',  read: false },
  { id: '2', type: 'deadline', message: 'Academic Excellence Grant deadline is in 2 days. Ensure all documents are submitted.', time: '1d ago',  read: false },
  { id: '3', type: 'info',     message: 'New scholarship available: STEM Innovation Award. Apply before Apr 25, 2026.', time: '3d ago',  read: true  },
];

const TYPE_ICON: Record<Notification['type'], string> = {
  status:   '📋',
  deadline: '⏰',
  info:     '🔔',
};

export default function NotificationBell() {
  const [open, setOpen]   = useState(false);
  const [notes, setNotes] = useState<Notification[]>(INITIAL);

  const unread = notes.filter(n => !n.read).length;

  function markAllRead() {
    setNotes(prev => prev.map(n => ({ ...n, read: true })));
  }

  function dismiss(id: string) {
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
          padding: '8px', borderRadius: 8, color: '#6b7280',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 16, height: 16, borderRadius: '50%',
            background: MAROON, color: '#fff',
            fontSize: 9, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff',
          }}>
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 340, background: '#fff', borderRadius: 14,
            border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            zIndex: 999, overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                Notifications
                {unread > 0 && (
                  <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 800, background: MAROON, color: '#fff', padding: '1px 6px', borderRadius: 99 }}>{unread}</span>
                )}
              </span>
              {unread > 0 && (
                <button onClick={markAllRead} style={{ fontSize: 12, color: MAROON, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all read
                </button>
              )}
            </div>

            {notes.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                No notifications
              </div>
            ) : (
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notes.map(n => (
                  <div key={n.id} style={{
                    padding: '12px 16px', borderBottom: '1px solid #f9fafb',
                    background: n.read ? '#fff' : '#fff5f5',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{TYPE_ICON[n.type]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 4px', fontSize: 13, color: '#111827', lineHeight: 1.45 }}>{n.message}</p>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{n.time}</span>
                    </div>
                    <button onClick={() => dismiss(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 0, flexShrink: 0, fontSize: 16, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Real-time notifications coming soon</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
