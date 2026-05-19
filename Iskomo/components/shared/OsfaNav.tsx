'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { applicationApi, userApi } from '@/lib/api-client';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const MAROON       = COLORS.maroon;
const MAROON_LIGHT = COLORS.maroonL;

const osfaNavLinks = [
  {
    href:  '/osfa/dashboard',
    label: 'Dashboard',
    icon:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    href:  '/osfa/scholarships',
    label: 'Scholarships',
    icon:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  },
  {
    href:  '/osfa/registrations',
    label: 'Registrations',
    icon:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    href:  '/osfa/applicants',
    label: 'Applicants',
    icon:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    href:  '/osfa/scholars',
    label: 'Scholars',
    icon:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  },
  {
    href:  '/osfa/reports',
    label: 'Reports',
    icon:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 12l4-4 4 4 6-6"/></svg>,
  },
  {
    href:  '/osfa/calendar',
    label: 'Calendar',
    icon:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    href:  '/osfa/messages',
    label: 'Messages',
    icon:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    href:  '/osfa/notifications',
    label: 'Notifications',
    icon:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
  {
    href:  '/osfa/profile',
    label: 'Profile',
    icon:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
];

export default function OsfaNav() {
  const pathname = usePathname();
  const [hovered,         setHovered]         = useState<string | null>(null);
  const [pendingCount,    setPendingCount]    = useState(0);
  const [pendingRegCount, setPendingRegCount] = useState(0);
  const [unreadMessages,  setUnreadMessages]  = useState(0);
  const [drawerOpen,      setDrawerOpen]      = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    const load = () => {
      applicationApi.count('pending').then(r => setPendingCount(r.count)).catch(() => {});
      userApi.list(1, 1, 'pending_verification').then(r => setPendingRegCount(r.total)).catch(() => {});
    };
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    apiFetch<{ items: Array<{ unread_count: number }> }>('/api/applications/inbox')
      .then(d => setUnreadMessages((d.items ?? []).reduce((s, c) => s + c.unread_count, 0)))
      .catch(() => {});
  }, [pathname]);

  const badge = (href: string) =>
    href === '/osfa/applicants'    && pendingCount    > 0 ? pendingCount    :
    href === '/osfa/registrations' && pendingRegCount > 0 ? pendingRegCount :
    href === '/osfa/messages'      && unreadMessages  > 0 ? unreadMessages  :
    null;

  // Shared nav item renderer
  const NavItem = ({ link, drawer = false }: { link: typeof osfaNavLinks[0]; drawer?: boolean }) => {
    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
    const isHov    = !drawer && hovered === link.href;
    const b        = badge(link.href);

    if (drawer) {
      return (
        <Link
          href={link.href}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 20px',
            textDecoration: 'none',
            borderRadius: 10,
            background: isActive ? MAROON_LIGHT : 'transparent',
            color: isActive ? MAROON : '#374151',
            fontWeight: isActive ? 700 : 500,
            fontSize: 14,
            position: 'relative',
            borderLeft: isActive ? `3px solid ${MAROON}` : '3px solid transparent',
          }}
        >
          <span style={{ color: isActive ? MAROON : '#6b7280', display: 'flex', flexShrink: 0 }}>{link.icon}</span>
          <span style={{ flex: 1 }}>{link.label}</span>
          {b !== null && (
            <span style={{ minWidth: 20, height: 20, borderRadius: 9999, background: MAROON, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
              {b > 99 ? '99+' : b}
            </span>
          )}
        </Link>
      );
    }

    return (
      <Link
        href={link.href}
        aria-current={isActive ? 'page' : undefined}
        onMouseEnter={() => setHovered(link.href)}
        onMouseLeave={() => setHovered(null)}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          padding: '6px 8px', borderRadius: 9, textDecoration: 'none',
          color: isActive ? MAROON : isHov ? '#374151' : '#6b7280',
          background: isActive ? MAROON_LIGHT : isHov ? '#f3f4f6' : 'transparent',
          fontWeight: isActive ? 700 : 500, fontSize: 10.5, minWidth: 48,
          position: 'relative', transition: 'all 0.15s ease',
        }}
      >
        {isActive && (
          <span style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 18, height: 2.5, borderRadius: 9999, background: MAROON }} />
        )}
        <span style={{ color: isActive ? MAROON : isHov ? '#374151' : '#9ca3af', display: 'flex', transition: 'color 0.15s ease', position: 'relative' }}>
          {link.icon}
          {b !== null && (
            <span style={{ position: 'absolute', top: -5, right: -7, minWidth: 15, height: 15, borderRadius: 9999, background: MAROON, color: '#fff', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', padding: '0 3px', lineHeight: 1 }}>
              {b > 99 ? '99+' : b}
            </span>
          )}
        </span>
        <span style={{ letterSpacing: '0.01em' }}>{link.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop nav — hidden on mobile via CSS class */}
      <nav className="osfa-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 1 }} role="navigation" aria-label="OSFA navigation">
        {osfaNavLinks.map(link => <NavItem key={link.href} link={link} />)}
      </nav>

      {/* Hamburger button — shown only on mobile */}
      <button
        className="osfa-hamburger"
        onClick={() => setDrawerOpen(o => !o)}
        aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={drawerOpen}
        style={{
          background: drawerOpen ? MAROON_LIGHT : 'none',
          border: `1.5px solid ${drawerOpen ? '#fca5a5' : '#e5e7eb'}`,
          borderRadius: 8, cursor: 'pointer', padding: '7px 10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: drawerOpen ? MAROON : '#374151',
          transition: 'all 0.15s',
        }}
      >
        {drawerOpen
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>}
      </button>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)', zIndex: 1100 }}
          />
          {/* Drawer */}
          <div
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 280,
              background: '#fff', zIndex: 1200, boxShadow: '-8px 0 32px rgba(0,0,0,0.14)',
              display: 'flex', flexDirection: 'column',
              animation: 'slideInRight 0.22s ease',
            }}
            role="dialog"
            aria-label="Navigation menu"
          >
            {/* Drawer header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Menu</div>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px', cursor: 'pointer', display: 'flex', color: '#374151' }}
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {osfaNavLinks.map(link => <NavItem key={link.href} link={link} drawer />)}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
