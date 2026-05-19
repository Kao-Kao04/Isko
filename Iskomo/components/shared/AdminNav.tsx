'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { COLORS } from '@/lib/theme';
import { apiFetch } from '@/lib/api';

const M  = COLORS.maroon;
const ML = COLORS.maroonL;

const NAV_LINKS = [
  { href: '/admin/dashboard',      label: 'Dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/admin/staff',          label: 'Staff',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: '/admin/students',       label: 'Students',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg> },
  { href: '/admin/registrations',  label: 'Registrations',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { href: '/admin/applications',   label: 'Applications',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { href: '/admin/scholars',       label: 'Scholars',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  { href: '/admin/audit',          label: 'Audit',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { href: '/admin/broadcast',      label: 'Broadcast',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg> },
  { href: '/admin/reports',        label: 'Reports',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { href: '/admin/contacts',       label: 'Contacts',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [hovered,      setHovered]      = useState<string | null>(null);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [unreadContacts, setUnreadContacts] = useState(0);

  useEffect(() => {
    apiFetch<{ items: Array<{ is_read: boolean }> }>('/api/admin/contacts?page=1&page_size=100')
      .then(d => setUnreadContacts((d.items ?? []).filter(i => !i.is_read).length))
      .catch(() => {});
  }, [pathname]);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const NavItem = ({ link, drawer = false }: { link: typeof NAV_LINKS[0]; drawer?: boolean }) => {
    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
    const isHov    = !drawer && hovered === link.href;
    const badge    = link.href === '/admin/contacts' && unreadContacts > 0 ? unreadContacts : 0;

    if (drawer) {
      return (
        <Link href={link.href} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px',
          textDecoration: 'none', borderRadius: 10,
          background: isActive ? ML : 'transparent',
          color: isActive ? M : '#374151', fontWeight: isActive ? 700 : 500, fontSize: 14,
          borderLeft: isActive ? `3px solid ${M}` : '3px solid transparent',
        }}>
          <span style={{ color: isActive ? M : '#6b7280', display: 'flex', flexShrink: 0 }}>{link.icon}</span>
          <span style={{ flex: 1 }}>{link.label}</span>
          {badge > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: M, color: '#fff', flexShrink: 0 }}>{badge}</span>}
        </Link>
      );
    }

    return (
      <Link href={link.href} aria-current={isActive ? 'page' : undefined}
        onMouseEnter={() => setHovered(link.href)}
        onMouseLeave={() => setHovered(null)}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          padding: '6px 8px', borderRadius: 9, textDecoration: 'none',
          color: isActive ? M : isHov ? '#374151' : '#6b7280',
          background: isActive ? ML : isHov ? '#f3f4f6' : 'transparent',
          fontWeight: isActive ? 700 : 500, fontSize: 10.5, minWidth: 52,
          position: 'relative', transition: 'all 0.15s ease',
        }}>
        {isActive && <span style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 18, height: 2.5, borderRadius: 9999, background: M }} />}
        <span style={{ color: isActive ? M : isHov ? '#374151' : '#9ca3af', display: 'flex', transition: 'color 0.15s ease', position: 'relative' }}>
          {link.icon}
          {badge > 0 && <span style={{ position: 'absolute', top: -5, right: -7, fontSize: 9, fontWeight: 800, padding: '1px 4px', borderRadius: 20, background: M, color: '#fff', lineHeight: 1.4, minWidth: 14, textAlign: 'center' }}>{badge}</span>}
        </span>
        <span style={{ letterSpacing: '0.01em' }}>{link.label}</span>
      </Link>
    );
  };

  return (
    <>
      <nav className="osfa-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 1 }} role="navigation" aria-label="Admin navigation">
        {NAV_LINKS.map(link => <NavItem key={link.href} link={link} />)}
      </nav>

      <button className="osfa-hamburger" onClick={() => setDrawerOpen(o => !o)}
        aria-label={drawerOpen ? 'Close menu' : 'Open menu'} aria-expanded={drawerOpen}
        style={{ background: drawerOpen ? ML : 'none', border: `1.5px solid ${drawerOpen ? '#fca5a5' : '#e5e7eb'}`, borderRadius: 8, cursor: 'pointer', padding: '7px 10px', display: 'flex', alignItems: 'center', color: drawerOpen ? M : '#374151', transition: 'all 0.15s' }}>
        {drawerOpen
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>}
      </button>

      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)', zIndex: 1100 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 280, background: '#fff', zIndex: 1200, boxShadow: '-8px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.22s ease' }} role="dialog" aria-label="Navigation menu">
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>IskoMo</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: M, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Super Admin</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px', cursor: 'pointer', display: 'flex', color: '#374151' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV_LINKS.map(link => <NavItem key={link.href} link={link} drawer />)}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
