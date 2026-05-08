'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken = params.get('access_token');
    const type = params.get('type');

    if (!accessToken || type !== 'signup') {
      setStatus('error');
      return;
    }

    apiFetch('/api/auth/confirm-email-token', {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    })
      .then(() => {
        setStatus('success');
        setTimeout(() => router.replace('/login?verified=true'), 1500);
      })
      .catch(() => setStatus('error'));
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>

        {status === 'loading' && (
          <>
            <div style={{ width: 48, height: 48, border: `4px solid #f3f4f6`, borderTop: `4px solid ${TEAL}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Verifying your email…</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Email Verified!</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Redirecting you to login…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Verification Failed</h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280' }}>The link may have expired. Please sign up again.</p>
            <button onClick={() => router.replace('/login')} style={{ padding: '10px 28px', background: TEAL, color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Back to Login
            </button>
          </>
        )}

      </div>
    </div>
  );
}
