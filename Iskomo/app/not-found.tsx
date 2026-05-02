import Link from 'next/link';
import { COLORS } from '@/lib/theme';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f9fafb', padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #800000, #5C0000)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(128,0,0,0.25)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>

        <div style={{ fontSize: 72, fontWeight: 900, color: COLORS.maroon, lineHeight: 1, marginBottom: 8, letterSpacing: '-0.04em' }}>
          404
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>
          Page not found
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 32px', lineHeight: 1.7 }}>
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            padding: '11px 28px', borderRadius: 9, textDecoration: 'none',
            background: 'linear-gradient(135deg, #800000, #5C0000)',
            color: '#fff', fontSize: 14, fontWeight: 700,
            boxShadow: '0 4px 14px rgba(128,0,0,0.35)',
          }}>
            Go to Home
          </Link>
          <Link href="/login" style={{
            padding: '11px 28px', borderRadius: 9, textDecoration: 'none',
            background: '#fff', color: '#374151',
            border: '1px solid #d1d5db', fontSize: 14, fontWeight: 600,
          }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}