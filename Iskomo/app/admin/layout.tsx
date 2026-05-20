'use client';

import Image from 'next/image';
import Link from 'next/link';
import SignOutButton from '@/components/shared/SignOutButton';
import AdminNav from '@/components/shared/AdminNav';
import PhClock from '@/components/shared/PhClock';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: '#ffffff', borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 12px rgba(0,0,0,0.07)',
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${M} 0%, #5C0000 50%, #C9A027 100%)` }} />
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', minHeight: 62, gap: 12 }}>

          {/* Logo */}
          <Link href="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${M}, #5C0000)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 10px ${M}45`, flexShrink: 0 }}>
              <Image src="/assets/Gemini_Generated_Image_jve2a8jve2a8jve2-removebg-preview.png" alt="IskoMo" width={20} height={20} style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>IskoMo</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: M, lineHeight: 1, marginTop: 2.5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Super Admin</div>
            </div>
          </Link>

          {/* Center nav */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <AdminNav />
          </div>

          {/* Right — clock + identity + sign out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <PhClock />
            <div className="hide-tablet" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px', borderRadius: 9, border: '1px solid #fecaca', background: '#fff5f5' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${M}, #5C0000)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>SA</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>Super Admin</div>
                <div style={{ fontSize: 10, color: M, lineHeight: 1, marginTop: 2, fontWeight: 600 }}>Full Access</div>
              </div>
            </div>
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
