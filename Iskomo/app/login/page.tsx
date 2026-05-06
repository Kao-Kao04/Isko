'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from 'react';
import { login, signup } from '@/lib/auth';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;
const TEAL_DARK = COLORS.maroonD;

const inp: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #e5e7eb',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 14,
  color: '#111827',
  background: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
};

function LoginPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [emailVerifiedBanner, setEmailVerifiedBanner] = useState(false);
  const [linkExpiredBanner,   setLinkExpiredBanner]   = useState(false);
  const [showForgot,    setShowForgot]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState('');
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSent,    setForgotSent]    = useState(false);
  const [forgotError,   setForgotError]   = useState('');
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (cooldownTimer.current) clearInterval(cooldownTimer.current); }, []);

  const startCooldown = (secs: number) => {
    setForgotCooldown(secs);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setForgotCooldown(c => {
        if (c <= 1) {
          clearInterval(cooldownTimer.current!);
          cooldownTimer.current = null;
          setForgotError('');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSending(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
      const res = await fetch(`${base}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (res.status === 429) {
        setForgotError('Too many requests. Please try again later.');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg: string = data.message ?? '';
        const match = msg.match(/(\d+)\s*second/i);
        if (match) {
          const secs = parseInt(match[1], 10);
          setForgotError(`Too many attempts. Please wait ${secs}s before trying again.`);
          startCooldown(secs);
        } else {
          setForgotError(msg || 'Something went wrong. Please try again.');
        }
        return;
      }
      setForgotSent(true);
    } catch {
      setForgotError('Something went wrong. Please try again.');
    } finally {
      setForgotSending(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('verified') === 'true') setEmailVerifiedBanner(true);
    if (searchParams.get('error') === 'link_expired') setLinkExpiredBanner(true);
  }, [searchParams]);
  const [isSignup, setIsSignup] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [error, setError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [emailSent,    setEmailSent]    = useState(false);
  const [signupDev,    setSignupDev]    = useState(false); // dev mode: auto-verified

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'super_admin')    { router.push('/admin/staff');    return; }
      if (user.role === 'osfa_staff')     { router.push('/osfa/dashboard'); return; }
      // Students: route based on verification / registration status
      if (user.account_status === 'unregistered' || user.account_status === 'rejected') {
        router.push('/student/registration');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (signupPassword.length < 8)              { setSignupError('Password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(signupPassword))          { setSignupError('Password must contain at least one uppercase letter.'); return; }
    if (!/[^a-zA-Z0-9]/.test(signupPassword))  { setSignupError('Password must contain at least one special character.'); return; }
    setSignupLoading(true);
    try {
      const result = await signup(signupEmail, signupPassword);
      if (result.dev) {
        setSignupDev(true);   // dev: show "account created, log in now"
      } else {
        setEmailSent(true);   // prod: show "check your email"
      }
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff5f5 0%, #fffbf0 50%, #fef2f2 100%)',
      padding: 24,
    }}>
      {emailVerifiedBanner && (
        <div style={{ width: '100%', maxWidth: 820, marginBottom: 14, padding: '12px 20px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>Email verified! You can now log in.</span>
        </div>
      )}
      {linkExpiredBanner && (
        <div style={{ width: '100%', maxWidth: 820, marginBottom: 14, padding: '12px 20px', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>Reset link has expired. Please request a new one below.</span>
        </div>
      )}
      {/* Card */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: 820,
        minHeight: 480,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
        background: '#fff',
      }}>

        {/* ── Left branding panel ── */}
        <div className="login-card-left" style={{
          width: 300,
          flexShrink: 0,
          background: `linear-gradient(160deg, ${TEAL} 0%, ${TEAL_DARK} 60%, #C9A027 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid rgba(255,255,255,0.3)' }}>
              <Image
                src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
                alt="IskoMo"
                width={44}
                height={44}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <h1 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              Welcome to<br />IskoMo
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              {isSignup
                ? 'Join thousands of students finding their scholarship opportunities.'
                : 'Sign in or create your account to get started.'}
            </p>
          </div>
        </div>

        {/* ── Right sliding panel ── */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            display: 'flex',
            width: '200%',
            height: '100%',
            transform: isSignup ? 'translateX(-50%)' : 'translateX(0)',
            transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>

            {/* ── Login panel ── */}
            <div style={{ width: '50%', padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#111827' }}>Sign In</h2>
              <p style={{ margin: '0 0 28px', fontSize: 13, color: '#6b7280' }}>Enter your credentials to continue.</p>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    style={inp}
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      style={{ ...inp, paddingRight: 56 }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value.replace(/\s/g, ''))}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {error && (
                  <p style={{ margin: 0, fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px' }}>
                    {error}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                    <input type="checkbox" defaultChecked={false} style={{ accentColor: TEAL }} /> Remember me
                  </label>
                  <button type="button" onClick={() => { setShowForgot(true); setForgotSent(false); setForgotEmail(''); setForgotError(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEAL, fontWeight: 600, padding: 0, fontSize: 13 }}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '12px',
                  background: loading ? '#9ca3af' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : `0 3px 12px ${TEAL}40`,
                }}>
                  {loading ? 'Signing in...' : 'Login'}
                </button>

                <button type="button" onClick={() => setIsSignup(true)}
                  style={{
                    width: '100%', padding: '11px',
                    background: '#fff', border: `1.5px solid ${TEAL}`,
                    color: TEAL, borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  }}>
                  Sign Up →
                </button>
              </form>
            </div>

            {/* ── Sign Up panel (slides in from right) ── */}
            <div style={{ width: '50%', padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {signupDev ? (
                /* DEV mode: auto-verified, just log in */
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#111827' }}>Account created!</h2>
                  <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                    Your account for <strong>{signupEmail}</strong> is ready. Log in to complete your registration.
                  </p>
                  <button type="button" onClick={() => { setSignupDev(false); setIsSignup(false); setEmail(signupEmail); }}
                    style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Log In Now →
                  </button>
                </div>
              ) : emailSent ? (
                /* PROD mode: email sent */
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#111827' }}>Check your email</h2>
                  <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                    We sent a verification link to <strong>{signupEmail}</strong>. Click it, then come back to log in.
                  </p>
                  <button type="button" onClick={() => { setEmailSent(false); setIsSignup(false); }}
                    style={{ width: '100%', padding: '11px', background: '#fff', border: `1.5px solid #e5e7eb`, color: '#374151', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    ← Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#111827' }}>Create Account</h2>
                  <p style={{ margin: '0 0 28px', fontSize: 13, color: '#6b7280' }}>Enter your email to get started.</p>

                  <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                        Email Address
                      </label>
                      <input
                        type="email" style={inp} placeholder="Enter your email address"
                        autoComplete="email" value={signupEmail}
                        onChange={e => setSignupEmail(e.target.value)} required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                        Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPass2 ? 'text' : 'password'}
                          style={{ ...inp, paddingRight: 56 }}
                          placeholder="Min. 8 characters"
                          minLength={8} autoComplete="new-password"
                          value={signupPassword}
                          onChange={e => setSignupPassword(e.target.value.replace(/\s/g, ''))} required
                        />
                        <button type="button" onClick={() => setShowPass2(!showPass2)}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                          {showPass2 ? 'Hide' : 'Show'}
                        </button>
                      </div>

                      {/* ── Password strength ── */}
                      {signupPassword.length > 0 && (() => {
                        const hasLen     = signupPassword.length >= 8;
                        const hasUpper   = /[A-Z]/.test(signupPassword);
                        const hasSpecial = /[^a-zA-Z0-9]/.test(signupPassword);
                        const score      = [hasLen, hasUpper, hasSpecial].filter(Boolean).length;
                        const strength   = score <= 1
                          ? { label: 'Weak',   color: '#ef4444' }
                          : score === 2
                          ? { label: 'Fair',   color: '#f59e0b' }
                          : { label: 'Strong', color: '#16a34a' };
                        return (
                          <div style={{ marginTop: 10 }}>
                            {/* Bar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                              {[1, 2, 3].map(i => (
                                <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: score >= i ? strength.color : '#e5e7eb', transition: 'background 0.2s' }} />
                              ))}
                              <span style={{ fontSize: 11, fontWeight: 700, color: strength.color, minWidth: 38, textAlign: 'right' }}>{strength.label}</span>
                            </div>
                            {/* Requirements */}
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
                        );
                      })()}
                    </div>

                    {signupError && (
                      <p style={{ margin: 0, fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px' }}>
                        {signupError}
                      </p>
                    )}

                    <button type="submit" disabled={signupLoading} style={{
                      width: '100%', padding: '12px', marginTop: 4,
                      background: signupLoading ? '#9ca3af' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                      color: '#fff', border: 'none', borderRadius: 10,
                      fontWeight: 700, fontSize: 15, cursor: signupLoading ? 'not-allowed' : 'pointer',
                      boxShadow: signupLoading ? 'none' : `0 3px 12px ${TEAL}40`,
                    }}>
                      {signupLoading ? 'Sending...' : 'Send Verification Email →'}
                    </button>

                    <button type="button" onClick={() => setIsSignup(false)}
                      style={{ width: '100%', padding: '11px', background: '#fff', border: `1.5px solid #e5e7eb`, color: '#374151', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                      ← Back to Login
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      <ForgotPasswordModal
        show={showForgot} onClose={() => setShowForgot(false)}
        email={forgotEmail} setEmail={setForgotEmail}
        onSubmit={handleForgotPassword} sending={forgotSending}
        sent={forgotSent} error={forgotError} teal={TEAL}
        cooldown={forgotCooldown}
      />
    </div>
  );
}

function ForgotPasswordModal({ show, onClose, email, setEmail, onSubmit, sending, sent, error, teal, cooldown }: {
  show: boolean; onClose: () => void; email: string; setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void; sending: boolean; sent: boolean; error: string; teal: string;
  cooldown: number;
}) {
  if (!show) return null;
  return (
    <div role="dialog" aria-modal="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Reset link sent</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
              If <strong>{email}</strong> is registered, you&apos;ll receive a password reset link. Check your inbox.
            </p>
            <button onClick={onClose} style={{ width: '100%', padding: '11px', background: teal, color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Forgot password?</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>Enter your email and we&apos;ll send a reset link.</p>
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
              {error && <p style={{ margin: 0, fontSize: 13, color: '#dc2626' }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={onClose}
                  style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                  Cancel
                </button>
                <button type="submit" disabled={sending || cooldown > 0}
                  style={{ flex: 1, padding: '10px', background: (sending || cooldown > 0) ? '#9ca3af' : teal, border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: (sending || cooldown > 0) ? 'not-allowed' : 'pointer', color: '#fff' }}>
                  {cooldown > 0 ? `Please wait ${cooldown}s…` : sending ? 'Sending…' : 'Send Link'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
