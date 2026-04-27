'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error === 'invalid_token') {
      setStatus('error');
      return;
    }

    if (token) {
      setStatus('success');
      setTimeout(() => {
        router.push(`/register?token=${token}`);
      }, 2000);
    } else {
      setStatus('error');
    }
  }, [searchParams, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', padding: '48px 32px', background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', maxWidth: 440, width: '100%' }}>

        {status === 'loading' && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid #f3f4f6`, borderTop: `3px solid ${TEAL}`, margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#111827' }}>Verifying your email...</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Please wait a moment.</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#111827' }}>Email Verified!</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Redirecting you to complete your registration...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#111827' }}>Invalid or Expired Link</h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              This verification link is no longer valid. Please sign up again to get a new link.
            </p>
            <Link href="/login" style={{ display: 'inline-block', padding: '12px 32px', background: `linear-gradient(135deg, ${TEAL}, #5C0000)`, color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
              Back to Login
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
