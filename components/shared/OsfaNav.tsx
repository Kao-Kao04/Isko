'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const TEAL = '#1D9E75';
const TEAL_LIGHT = '#e8faf4';

const navBadges: Record<string, number> = {
  '/osfa/notifications': 3,
  '/osfa/applicants': 12,
  '/osfa/evaluation': 5,
};

const osfaNavLinks = [
  {
    href: '/osfa/home',
    label: 'Home',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/osfa/scholarships',
    label: 'Scholarships',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    href: '/osfa/applicants',
    label: 'Applicants',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/osfa/evaluation',
    label: 'Evaluation',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    href: '/osfa/reports',
    label: 'Reports',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/>
        <path d="M7 12l4-4 4 4 6-6"/>
      </svg>
    ),
  },
  {
    href: '/osfa/notifications',
    label: 'Notifications',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    href: '/osfa/profile',
    label: 'Profile',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function OsfaNav() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 1 }} role="navigation" aria-label="OSFA navigation">
      {osfaNavLinks.map((link) => {
        const isActive = pathname === link.href;
        const isHov = hovered === link.href;
        const badge = navBadges[link.href];

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            onMouseEnter={() => setHovered(link.href)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '6px 11px',
              borderRadius: 9,
              textDecoration: 'none',
              color: isActive ? TEAL : isHov ? '#374151' : '#6b7280',
              background: isActive ? TEAL_LIGHT : isHov ? '#f3f4f6' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              fontSize: 10.5,
              minWidth: 52,
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span style={{
                position: 'absolute',
                bottom: -1,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 18,
                height: 2.5,
                borderRadius: 99,
                background: TEAL,
              }} />
            )}

            <span style={{
              color: isActive ? TEAL : isHov ? '#374151' : '#9ca3af',
              display: 'flex',
              position: 'relative',
              transition: 'color 0.15s ease',
            }}>
              {link.icon}
              {badge && !isActive && (
                <span style={{
                  position: 'absolute', top: -5, right: -7,
                  background: '#ef4444', color: '#fff',
                  fontSize: 8, fontWeight: 700, lineHeight: 1,
                  padding: '2px 4px', borderRadius: 99,
                  border: '1.5px solid #fff',
                  minWidth: 14, textAlign: 'center',
                }}>{badge}</span>
              )}
            </span>

            <span style={{ letterSpacing: '0.01em' }}>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
