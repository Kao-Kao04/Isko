import OsfaNav from '@/components/shared/OsfaNav';
import SignOutButton from '@/components/shared/SignOutButton';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;

const DEPT_LABEL: Record<string, { label: string; sublabel: string; bg: string; color: string }> = {
  public:  { label: 'Public Scholarships', sublabel: 'Gov\'t / State-funded', bg: '#eff6ff', color: '#1d4ed8' },
  private: { label: 'Private Scholarships', sublabel: 'Corporate / Foundation', bg: '#fdf4ff', color: '#7e22ce' },
};

interface OsfaLayoutProps {
  children: React.ReactNode;
}

export default async function OsfaLayout({ children }: OsfaLayoutProps) {
  const cookieStore = await cookies();
  const dept     = cookieStore.get('department')?.value ?? '';
  const deptInfo = DEPT_LABEL[dept] ?? null;

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 12px rgba(0,0,0,0.08)',
      }}>
        {/* Brand accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${TEAL} 0%, #5C0000 50%, #C9A027 100%)` }} />

        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          height: 64,
          gap: 16,
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${TEAL}, #5C0000)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 10px ${TEAL}45`,
              flexShrink: 0,
            }}>
              <Image
                src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
                alt="IskoMo"
                width={20}
                height={20}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>IskoMo</div>
              <div style={{ fontSize: 9.5, fontWeight: 600, color: '#94a3b8', lineHeight: 1, marginTop: 2.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>OSFA Portal</div>
            </div>
          </Link>

          <OsfaNav />

          {/* Right side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* User profile chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '6px 12px 6px 6px',
              borderRadius: 10,
              border: `1px solid ${deptInfo ? deptInfo.bg : '#e2e8f0'}`,
              background: deptInfo ? deptInfo.bg : '#f8fafc',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: `linear-gradient(135deg, ${TEAL}, #5C0000)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                letterSpacing: '0.02em',
              }}>OS</div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', lineHeight: 1 }}>OSFA Staff</div>
                <div style={{ fontSize: 10, color: deptInfo ? deptInfo.color : '#94a3b8', lineHeight: 1, marginTop: 2.5, fontWeight: deptInfo ? 700 : 400 }}>
                  {deptInfo ? deptInfo.label : 'Administrator'}
                </div>
              </div>
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      <div style={{ minHeight: 'calc(100vh - 67px)', background: '#f0f4f8' }}>
        {children}
      </div>
    </>
  );
}
