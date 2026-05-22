'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { applicationApi, userApi } from '@/lib/api-client';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const M  = COLORS.maroon;
const ML = COLORS.maroonL;

// ── Primary nav — always visible ──────────────────────────────────────────────
const PRIMARY = [
  {
    href: '/osfa/dashboard',
    label: 'Dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    href: '/osfa/applicants',
    label: 'Applicants',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    href: '/osfa/scholars',
    label: 'Scholars',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  },
  {
    href: '/osfa/messages',
    label: 'Messages',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    href: '/osfa/registrations',
    label: 'Registrations',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
];

// ── Secondary nav — inside "More" dropdown ────────────────────────────────────
const SECONDARY = [
  {
    href: '/osfa/scholarships',
    label: 'Scholarships',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  },
  {
    href: '/osfa/notifications',
    label: 'Notifications',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
  {
    href: '/osfa/reports',
    label: 'Reports',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 12l4-4 4 4 6-6"/></svg>,
  },
  {
    href: '/osfa/calendar',
    label: 'Calendar',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
];

const ALL_LINKS = [...PRIMARY, ...SECONDARY];

export default function OsfaNav() {
  const pathname = usePathname();
  const [hovered,         setHovered]         = useState<string | null>(null);
  const [pendingCount,    setPendingCount]    = useState(0);
  const [pendingRegCount, setPendingRegCount] = useState(0);
  const [unreadMessages,  setUnreadMessages]  = useState(0);
  const [drawerOpen,      setDrawerOpen]      = useState(false);
  const [moreOpen,        setMoreOpen]        = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDrawerOpen(false); setMoreOpen(false); }, [pathname]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { setDrawerOpen(false); setMoreOpen(false); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close More dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

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

  const secondaryActive = SECONDARY.some(l => pathname === l.href || pathname.startsWith(l.href + '/'));

  const NavItem = ({ link, drawer = false }: { link: typeof ALL_LINKS[0]; drawer?: boolean }) => {
    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
    const isHov    = !drawer && hovered === link.href;
    const b        = badge(link.href);

    if (drawer) {
      return (
        <Link href={link.href} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px',
          textDecoration: 'none', borderRadius: 10,
          background: isActive ? ML : 'transparent',
          color: isActive ? M : '#374151',
          fontWeight: isActive ? 700 : 500, fontSize: 14,
          borderLeft: isActive ? `3px solid ${M}` : '3px solid transparent',
        }}>
          <span style={{ color: isActive ? M : '#6b7280', display: 'flex', flexShrink: 0 }}>{link.icon}</span>
          <span style={{ flex: 1 }}>{link.label}</span>
          {b !== null && (
            <span style={{ minWidth: 20, height: 20, borderRadius: 9999, background: M, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
              {b > 99 ? '99+' : b}
            </span>
          )}
        </Link>
      );
    }

    return (
      <Link href={link.href} aria-current={isActive ? 'page' : undefined}
        onMouseEnter={() => setHovered(link.href)} onMouseLeave={() => setHovered(null)}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '8px 14px', borderRadius: 10, textDecoration: 'none',
          color: isActive ? M : isHov ? '#374151' : '#6b7280',
          background: isActive ? ML : isHov ? '#f3f4f6' : 'transparent',
          fontWeight: isActive ? 700 : 500, fontSize: 11.5, minWidth: 62,
          position: 'relative', transition: 'all 0.15s ease',
        }}>
        {isActive && <span style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 18, height: 2.5, borderRadius: 9999, background: M }} />}
        <span style={{ color: isActive ? M : isHov ? '#374151' : '#9ca3af', display: 'flex', position: 'relative', transition: 'color 0.15s ease' }}>
          {link.icon}
          {b !== null && (
            <span style={{ position: 'absolute', top: -5, right: -7, minWidth: 15, height: 15, borderRadius: 9999, background: M, color: '#fff', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', padding: '0 3px', lineHeight: 1 }}>
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
      {/* Desktop nav */}
      <nav className="osfa-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 2 }} role="navigation" aria-label="OSFA navigation">
        {PRIMARY.map(link => <NavItem key={link.href} link={link} />)}

        {/* More dropdown */}
        <div ref={moreRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMoreOpen(o => !o)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: moreOpen || secondaryActive ? ML : 'transparent',
              color: moreOpen || secondaryActive ? M : '#6b7280',
              fontWeight: secondaryActive ? 700 : 500, fontSize: 11.5, minWidth: 62,
              position: 'relative', transition: 'all 0.15s ease',
            }}>
            {secondaryActive && <span style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 18, height: 2.5, borderRadius: 9999, background: M }} />}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
            <span>More</span>
          </button>

          {moreOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 500,
              minWidth: 180, overflow: 'hidden', padding: '6px',
            }}>
              {SECONDARY.map(link => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link key={link.href} href={link.href} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 8, textDecoration: 'none',
                    background: isActive ? ML : 'transparent',
                    color: isActive ? M : '#374151',
                    fontWeight: isActive ? 700 : 500, fontSize: 13,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = '#f9fafb'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
                    <span style={{ color: isActive ? M : '#6b7280', display: 'flex', flexShrink: 0 }}>{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Hamburger — mobile */}
      <button className="osfa-hamburger" onClick={() => setDrawerOpen(o => !o)}
        aria-label={drawerOpen ? 'Close menu' : 'Open menu'} aria-expanded={drawerOpen}
        style={{ background: drawerOpen ? ML : 'none', border: `1.5px solid ${drawerOpen ? '#fca5a5' : '#e5e7eb'}`, borderRadius: 8, cursor: 'pointer', padding: '7px 10px', display: 'flex', alignItems: 'center', color: drawerOpen ? M : '#374151', transition: 'all 0.15s' }}>
        {drawerOpen
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>}
      </button>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)', zIndex: 1100 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 280, background: '#fff', zIndex: 1200, boxShadow: '-8px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.22s ease' }} role="dialog" aria-label="Navigation menu">
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Menu</div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px', cursor: 'pointer', display: 'flex', color: '#374151' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ALL_LINKS.map(link => <NavItem key={link.href} link={link} drawer />)}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
