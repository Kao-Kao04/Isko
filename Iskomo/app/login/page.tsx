'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { login, initiateRegister } from '@/lib/auth';
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

export default function Page() {
  const router = useRouter();
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
  const [emailSent, setEmailSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'super_admin')   router.push('/admin/staff');
      else if (user.role === 'osfa_staff') router.push('/osfa/dashboard');
      else router.push('/student/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupLoading(true);
    try {
      const token = await initiateRegister(signupEmail, signupPassword);
      if (token) {
        // Dev mode — skip email, go straight to profile completion
        router.push(`/register?token=${token}`);
      } else {
        // Production — show "check your email" screen
        setEmailSent(true);
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
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff5f5 0%, #fffbf0 50%, #fef2f2 100%)',
      padding: 24,
    }}>
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
        <div style={{
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
                      onChange={e => setPassword(e.target.value)}
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
                  <a href="#" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
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
              {emailSent ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#111827' }}>Check your email</h2>
                  <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                    We sent a verification link to <strong>{signupEmail}</strong>. Click it to continue your registration.
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
                          onChange={e => setSignupPassword(e.target.value)} required
                        />
                        <button type="button" onClick={() => setShowPass2(!showPass2)}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                          {showPass2 ? 'Hide' : 'Show'}
                        </button>
                      </div>
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
    </div>
  );
}
