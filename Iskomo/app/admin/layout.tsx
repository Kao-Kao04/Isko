import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SignOutButton from '@/components/shared/SignOutButton';
import { COLORS } from '@/lib/theme';

export const metadata: Metadata = { title: 'Admin | IskoMo' };

const MAROON = COLORS.maroon;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${MAROON}, #5C0000, #C9A027)` }} />
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 28px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          {/* Logo */}
          <Link href="/admin/staff" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
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

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

      <div style={{ minHeight: 'calc(100vh - 63px)', background: '#f0f4f8' }}>
        {children}
      </div>
    </>
  );
}
