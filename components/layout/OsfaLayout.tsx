import OsfaNav from '@/components/shared/OsfaNav';
import SignOutButton from '@/components/shared/SignOutButton';
import { OsfaProvider } from '@/lib/osfa-context';
import Image from 'next/image';
import Link from 'next/link';

const TEAL = '#1D9E75';

interface OsfaLayoutProps {
  children: React.ReactNode;
}

export default function OsfaLayout({ children }: OsfaLayoutProps) {
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
        <div style={{ height: 3, background: `linear-gradient(90deg, ${TEAL} 0%, #178a64 50%, #0f6b4f 100%)` }} />

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
              background: `linear-gradient(135deg, ${TEAL}, #178a64)`,
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
            {/* Notification bell */}
            <Link
              href="/osfa/notifications"
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: '#ef4444', color: '#fff',
                fontSize: 9, fontWeight: 700, lineHeight: 1,
                padding: '2px 5px', borderRadius: 99,
                border: '2px solid #fff',
                minWidth: 16, textAlign: 'center',
              }}>3</span>
            </Link>

            {/* User profile chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '6px 12px 6px 6px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: `linear-gradient(135deg, ${TEAL}, #178a64)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                letterSpacing: '0.02em',
              }}>OS</div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', lineHeight: 1 }}>OSFA Staff</div>
                <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1, marginTop: 2.5 }}>Administrator</div>
              </div>
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      <div style={{ minHeight: 'calc(100vh - 67px)', background: '#f0f4f8' }}>
        <OsfaProvider>{children}</OsfaProvider>
      </div>
    </>
  );
}
