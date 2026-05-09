import OsfaNav from '@/components/shared/OsfaNav';
import NotificationBell from '@/components/shared/NotificationBell';
import SignOutButton from '@/components/shared/SignOutButton';
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

        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          minHeight: 62,
          gap: 12,
        }}>
          {/* Logo */}
          <Link href="/osfa/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${TEAL}, #5C0000)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 10px ${TEAL}45`, flexShrink: 0,
            }}>
              <Image
                src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
                alt="IskoMo" width={20} height={20}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>IskoMo</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', lineHeight: 1, marginTop: 2.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>OSFA Portal</div>
            </div>
          </Link>

          {/* Center: main nav (desktop) + hamburger (mobile) — OsfaNav handles both */}
          <OsfaNav />

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Dept chip — hidden on very small screens */}
            {deptInfo && (
              <div
                className="hide-tablet"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 20,
                  background: deptInfo.bg, border: `1px solid ${deptInfo.color}30`,
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: deptInfo.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: deptInfo.color }}>{deptInfo.label}</span>
              </div>
            )}

            <NotificationBell />
            <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
            <SignOutButton />
          </div>
        </div>
      </header>

      <div style={{ minHeight: 'calc(100vh - 65px)', background: '#f0f4f8' }}>
        {children}
      </div>
    </>
  );
}
