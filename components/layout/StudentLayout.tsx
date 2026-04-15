import StudentNav from '@/components/shared/StudentNav';
import SignOutButton from '@/components/shared/SignOutButton';
import Image from 'next/image';
import Link from 'next/link';

const TEAL = '#1D9E75';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
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
        {/* Teal accent line at top */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${TEAL}, #178a64, #0f6b4f)` }} />

        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 60,
          gap: 16,
        }}>

          {/* Left: Logo + Wordmark */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${TEAL}, #178a64)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 2px 8px ${TEAL}40`,
            }}>
              <Image
                src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
                alt="IskoMo"
                width={22}
                height={22}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em' }}>IskoMo</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', lineHeight: 1, marginTop: 2, letterSpacing: '0.04em' }}>STUDENT PORTAL</div>
            </div>
          </Link>

          {/* Center: Nav Links */}
          <StudentNav />

          {/* Right: Search + Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Search */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f3f4f6',
              borderRadius: 10,
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
            }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="9" cy="9" r="6"/><path d="m17 17-4-4"/>
              </svg>
              <input
                type="text"
                placeholder="Search..."
                id="searchInput"
                autoComplete="off"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 13,
                  color: '#374151',
                  width: 120,
                }}
              />
            </div>

            {/* Sign Out */}
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div style={{ minHeight: 'calc(100vh - 63px)', background: '#f8fafc' }}>
        {children}
      </div>
    </>
  );
}
