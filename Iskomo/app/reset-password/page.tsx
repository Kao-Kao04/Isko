'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/theme';

const TEAL     = COLORS.maroon;
const TEAL_DARK = COLORS.maroonD;
const API      = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [accessToken, setAccessToken] = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConf,    setShowConf]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [done,        setDone]        = useState(false);
  const [ready,       setReady]       = useState(false);

  // Password strength checks (same rules as signup)
  const hasLen     = password.length >= 8;
  const hasUpper   = /[A-Z]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const score      = [hasLen, hasUpper, hasSpecial].filter(Boolean).length;
  const strength   = score <= 1
    ? { label: 'Weak',   color: '#ef4444' }
    : score === 2
    ? { label: 'Fair',   color: '#f59e0b' }
    : { label: 'Strong', color: '#16a34a' };

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token  = params.get('access_token') ?? '';
    const type   = params.get('type');

    if (!token || type !== 'recovery') {
      router.replace('/login?error=invalid_token');
      return;
    }

    setAccessToken(token);
    window.history.replaceState(null, '', window.location.pathname);
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.push('/login?verified=true'), 3000);
    return () => clearTimeout(t);
  }, [done, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!hasLen)     { setError('Password must be at least 8 characters.'); return; }
    if (!hasUpper)   { setError('Password must contain at least one uppercase letter.'); return; }
    if (!hasSpecial) { setError('Password must contain at least one special character.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password-token`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ access_token: accessToken, new_password: password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Reset link has expired or is invalid. Please request a new one.');
      }
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8,
    padding: '10px 14px', fontSize: 14, color: '#111827',
    background: '#fff', boxSizing: 'border-box', outline: 'none',
  };

  if (!ready && !done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, #fff5f5 0%, #fffbf0 50%, #fef2f2 100%)` }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${TEAL}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, #fff5f5 0%, #fffbf0 50%, #fef2f2 100%)`, padding: 24 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 440, width: '100%', boxShadow: '0 12px 48px rgba(0,0,0,0.12)' }}>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#111827' }}>Password reset!</h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              Your password has been updated. Redirecting you to login&hellip;
            </p>
            <button onClick={() => router.push('/login?verified=true')}
              style={{ width: '100%', padding: '13px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#111827' }}>Set new password</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Enter a strong password below.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* New password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value.replace(/\s/g, ''))}
                    placeholder="Min. 8 characters"
                    required
                    style={{ ...inp, paddingRight: 56 }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>

                {/* Strength indicator */}
                {password.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: score >= i ? strength.color : '#e5e7eb', transition: 'background 0.2s' }} />
                      ))}
                      <span style={{ fontSize: 11, fontWeight: 700, color: strength.color, minWidth: 38, textAlign: 'right' }}>{strength.label}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[
                        { met: hasLen,     label: 'At least 8 characters' },
                        { met: hasUpper,   label: 'One uppercase letter (A–Z)' },
                        { met: hasSpecial, label: 'One special character (!@#$…)' },
                      ].map(({ met, label }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: met ? '#16a34a' : '#9ca3af' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            {met
                              ? <polyline points="20 6 9 17 4 12"/>
                              : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}
                          </svg>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConf ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value.replace(/\s/g, ''))}
                    placeholder="Repeat your new password"
                    required
                    style={{
                      ...inp,
                      paddingRight: 56,
                      borderColor: confirm.length > 0
                        ? confirm === password ? '#16a34a' : '#ef4444'
                        : undefined,
                    }}
                  />
                  <button type="button" onClick={() => setShowConf(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                    {showConf ? 'Hide' : 'Show'}
                  </button>
                </div>
                {confirm.length > 0 && confirm !== password && (
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444' }}>Passwords do not match.</p>
                )}
              </div>

              {error && (
                <p style={{ margin: 0, fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || score < 3 || password !== confirm}
                style={{
                  width: '100%', padding: '13px', marginTop: 4,
                  background: loading || score < 3 || password !== confirm
                    ? '#9ca3af'
                    : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontWeight: 700, fontSize: 15,
                  cursor: loading || score < 3 || password !== confirm ? 'not-allowed' : 'pointer',
                  boxShadow: score === 3 && password === confirm ? `0 3px 12px ${TEAL}40` : 'none',
                }}>
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>

              <button type="button" onClick={() => router.push('/login')}
                style={{ width: '100%', padding: '11px', background: '#fff', border: '1.5px solid #e5e7eb', color: '#374151', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                ← Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
