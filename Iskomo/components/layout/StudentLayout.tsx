'use client';

import { usePathname } from 'next/navigation';
import StudentNav from '@/components/shared/StudentNav';
import StudentBottomNav from '@/components/shared/StudentBottomNav';
import SignOutButton from '@/components/shared/SignOutButton';
import NotificationBell from '@/components/shared/NotificationBell';
import AccountStatusGuard from '@/components/shared/AccountStatusGuard';
import Image from 'next/image';
import Link from 'next/link';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === '/student/registration';

  if (hideNav) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f4f7fb 0%, #eef2f7 100%)' }}>
        {children}
      </div>
    );
  }

  return (
    <>
      {/* ── Top Navigation Bar ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Brand accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${TEAL}, #5C0000, #C9A027)` }} />

        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          minHeight: 60,
          gap: 12,
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${TEAL}, #5C0000)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 8px ${TEAL}40`, flexShrink: 0,
            }}>
              <Image
                src="/assets/Gemini_Generated_Image_jve2a8jve2a8jve2-removebg-preview.png"
                alt="IskoMo"
                width={22} height={22}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em' }}>IskoMo</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', lineHeight: 1, marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Student Portal</div>
            </div>
          </Link>

          {/* Desktop nav — hidden on mobile via CSS class */}
          <div className="student-top-nav">
            <StudentNav />
          </div>

          {/* Right: Bell + Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <NotificationBell />
            <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Page Content */}
      <AccountStatusGuard>
        <div className="student-page-content" style={{ minHeight: 'calc(100vh - 63px)', background: 'linear-gradient(180deg, #f4f7fb 0%, #eef2f7 100%)' }}>
          {children}
        </div>
      </AccountStatusGuard>

      {/* Mobile bottom tab bar — shown only on mobile via CSS */}
      <StudentBottomNav />
    </>
  );
}
