'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import SignOutButton from '@/components/shared/SignOutButton';
import { COLORS } from '@/lib/theme';

const MAROON = COLORS.maroon;

const NAV_ITEMS = [
  {
    tab: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    tab: 'staff',
    label: 'Staff',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    tab: 'students',
    label: 'Students',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
      </svg>
    ),
  },
  {
    tab: 'audit',
    label: 'Audit Logs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    tab: 'broadcast',
    label: 'Broadcast',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="2"/>
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
      </svg>
    ),
  },
  {
    tab: 'reports',
    label: 'Reports',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
];

function AdminNav() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'dashboard';

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {NAV_ITEMS.map(item => {
        const isActive = activeTab === item.tab;
        return (
          <Link
            key={item.tab}
            href={`/admin/staff?tab=${item.tab}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
              fontSize: 13, fontWeight: isActive ? 700 : 500,
              color: isActive ? MAROON : '#6b7280',
              background: isActive ? `${MAROON}12` : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ color: isActive ? MAROON : '#9ca3af', display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${MAROON}, #5C0000, #C9A027)` }} />
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          {/* Logo */}
          <Link href="/admin/staff?tab=dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: `linear-gradient(135deg, ${MAROON}, #5C0000)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Image
                src="/assets/Gemini_Generated_Image_jve2a8jve2a8jve2-removebg-preview.png"
                alt="IskoMo" width={18} height={18}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>IskoMo</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: MAROON, lineHeight: 1, marginTop: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Super Admin</div>
            </div>
          </Link>

          {/* Nav — hidden on narrow screens */}
          <div className="admin-desktop-nav" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Suspense fallback={<div />}>
              <AdminNav />
            </Suspense>
          </div>

          {/* Right — identity badge + sign out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px', borderRadius: 9, border: '1px solid #fecaca', background: '#fff5f5' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${MAROON}, #5C0000)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>SA</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>Super Admin</div>
                <div style={{ fontSize: 10, color: MAROON, lineHeight: 1, marginTop: 2, fontWeight: 600 }}>Full Access</div>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div style={{ minHeight: 'calc(100vh - 61px)', background: '#f0f4f8' }}>
        {children}
      </div>
    </>
  );
}
