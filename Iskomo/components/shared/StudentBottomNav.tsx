'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { COLORS } from '@/lib/theme';

const NAV = [
  {
    href:  '/student/dashboard',
    label: 'Home',
    icon:  (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? COLORS.maroon : 'none'} stroke={active ? COLORS.maroon : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href:  '/student/iskolarships',
    label: 'Iskolarships',
    icon:  (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? COLORS.maroon : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    href:  '/student/messages',
    label: 'Messages',
    icon:  (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? COLORS.maroon : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href:  '/student/contact',
    label: 'Contact',
    icon:  (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? COLORS.maroon : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    href:  '/student/profile',
    label: 'Profile',
    icon:  (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? COLORS.maroon : 'none'} stroke={active ? COLORS.maroon : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fillOpacity={active ? 0.15 : 0}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function StudentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="student-bottom-nav" role="navigation" aria-label="Mobile navigation">
      {NAV.map(link => {
        const active = pathname === link.href || pathname.startsWith(link.href + '/');
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={active ? 'active' : ''}
          >
            {link.icon(active)}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
