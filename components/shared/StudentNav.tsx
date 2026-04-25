'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { applicationApi } from '@/lib/api-client';

const MAROON = '#800000';

const studentNavLinks = [
  {
    href: '/student/dashboard',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/student/iskolarships',
    label: 'Iskolarships',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    href: '/student/applications',
    label: 'Applications',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    href: '/student/profile',
    label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function StudentNav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    applicationApi.list(1, 100)
      .then(res => setPendingCount(res.items.filter(a => ['pending', 'incomplete'].includes(a.status)).length))
      .catch(() => {});
  }, []);

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} role="navigation" aria-label="Student navigation">
      {studentNavLinks.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '8px 16px',
              borderRadius: 10,
              textDecoration: 'none',
              color: isActive ? MAROON : '#6b7280',
              background: isActive ? '#fff5f5' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              fontSize: 11,
              minWidth: 64,
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
          >
            {isActive && (
              <span style={{
                position: 'absolute',
                bottom: -1,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 24,
                height: 3,
                borderRadius: 99,
                background: MAROON,
              }} />
            )}
            <span style={{ color: isActive ? MAROON : '#9ca3af', display: 'flex' }}>
              {link.icon}
            </span>
            <span style={{ letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: 4 }}>
              {link.label}
              {link.href === '/student/applications' && pendingCount > 0 && (
                <span style={{
                  fontSize: 9, fontWeight: 800, lineHeight: 1,
                  padding: '2px 5px', borderRadius: 99,
                  background: MAROON, color: '#fff',
                }}>
                  {pendingCount}
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
