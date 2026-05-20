import OsfaNav from '@/components/shared/OsfaNav';
import NotificationBell from '@/components/shared/NotificationBell';
import SignOutButton from '@/components/shared/SignOutButton';
import PhClock from '@/components/shared/PhClock';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;

const DEPT_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  public:  { label: 'Public Dept.',  bg: '#eff6ff', color: '#1d4ed8' },
  private: { label: 'Private Dept.', bg: '#fdf4ff', color: '#7e22ce' },
};

export default async function OsfaLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const dept        = cookieStore.get('department')?.value ?? '';
  const deptInfo    = DEPT_LABEL[dept] ?? null;

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 12px rgba(0,0,0,0.07)',
      }}>
        {/* Brand accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${TEAL} 0%, #5C0000 50%, #C9A027 100%)` }} />

        {/*
          1fr auto 1fr grid:
          - Left 1fr  → logo (justifySelf:start keeps it left)
          - auto      → nav takes only its natural width, sits exactly center
          - Right 1fr → controls (justifySelf:end keeps them right)
          This guarantees the nav is truly centered regardless of logo/controls widths.
        */}
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 20px',
          minHeight: 62,
        }}>

          {/* Logo */}
          <Link href="/osfa/dashboard" style={{
            textDecoration: 'none', display: 'flex', alignItems: 'center',
            gap: 10, justifySelf: 'start',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${TEAL}, #5C0000)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 10px ${TEAL}45`, flexShrink: 0,
            }}>
              <Image
                src="/assets/Gemini_Generated_Image_jve2a8jve2a8jve2-removebg-preview.png"
                alt="IskoMo" width={20} height={20}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>IskoMo</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', lineHeight: 1, marginTop: 2.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>OSFA Portal</div>
            </div>
          </Link>

          {/* Nav — sits in the auto center column, truly centered on the page */}
          <OsfaNav />

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifySelf: 'end' }}>
            {deptInfo && (
              <div className="hide-tablet" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 20,
                background: deptInfo.bg, border: `1px solid ${deptInfo.color}30`,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: deptInfo.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: deptInfo.color }}>{deptInfo.label}</span>
              </div>
            )}
            <PhClock />
            <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
            <NotificationBell />
            <Link href="/osfa/profile" className="osfa-icon-btn" style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
            <SignOutButton />
          </div>
        </div>
      </header>

      <div style={{ minHeight: 'calc(100vh - 65px)', background: 'linear-gradient(180deg, #f4f7fb 0%, #eef2f7 100%)' }}>
        {children}
      </div>
    </>
  );
}
