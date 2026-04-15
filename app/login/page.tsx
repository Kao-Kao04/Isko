'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const TEAL = '#1D9E75';
const TEAL_DARK = '#178a64';

const inp: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10,
  padding: '11px 14px',
  fontSize: 14,
  color: '#111827',
  background: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
};

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export default function Page() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #e8faf4 30%, #d1fae5 60%, #a7f3d0 100%)',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: `${TEAL}18` }} />
      <div style={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: `${TEAL}12` }} />
      <div style={{ position: 'absolute', top: '30%', right: '10%', width: 160, height: 160, borderRadius: '50%', background: `${TEAL}0a` }} />

      {/* Card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 8px 48px rgba(29,158,117,0.12), 0 2px 12px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {/* Top teal accent */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})` }} />

        <div style={{ padding: '36px 36px 32px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
              boxShadow: `0 4px 16px ${TEAL}40`,
            }}>
              <Image
                src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
                alt="IskoMo"
                width={34}
                height={34}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>IskoMo</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, fontWeight: 500 }}>Scholarship Platform</div>
          </div>

          {/* ── Sliding form area ── */}
          <div style={{ overflow: 'hidden' }}>

            {/* Tab heading */}
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#111827' }}>
                {isSignup ? 'Create Account' : 'Welcome back'}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                {isSignup ? 'Fill in your credentials to get started.' : 'Sign in to your IskoMo account.'}
              </p>
            </div>

            {/* ── LOGIN fields ── */}
            <div style={{
              transform: isSignup ? 'translateY(-16px)' : 'translateY(0)',
              opacity: isSignup ? 0 : 1,
              maxHeight: isSignup ? 0 : 400,
              overflow: 'hidden',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: isSignup ? 'none' : 'auto',
            }}>
              <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={lbl}>Email or Username</label>
                  <input type="text" style={inp} placeholder="Enter your email or username" autoComplete="username" />
                </div>
                <div>
                  <label style={lbl}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      style={{ ...inp, paddingRight: 56 }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6b7280' }}
                    >
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                    <input type="checkbox" style={{ accentColor: TEAL }} />
                    Remember me
                  </label>
                  <a href="#" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%', padding: '12px', marginTop: 4,
                    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                    color: '#fff', border: 'none', borderRadius: 10,
                    fontWeight: 700, fontSize: 15, cursor: 'pointer',
                    boxShadow: `0 3px 12px ${TEAL}40`,
                  }}
                >
                  Login
                </button>
              </form>
            </div>

            {/* ── SIGNUP fields ── slide up from below */}
            <div style={{
              transform: isSignup ? 'translateY(0)' : 'translateY(20px)',
              opacity: isSignup ? 1 : 0,
              maxHeight: isSignup ? 600 : 0,
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: isSignup ? 'auto' : 'none',
            }}>
              <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={lbl}>Email Address</label>
                  <input type="email" style={inp} placeholder="Enter your email address" autoComplete="email" />
                </div>
                <div>
                  <label style={lbl}>Username</label>
                  <input type="text" style={inp} placeholder="Choose a username" autoComplete="username" />
                </div>
                <div>
                  <label style={lbl}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass2 ? 'text' : 'password'}
                      style={{ ...inp, paddingRight: 56 }}
                      placeholder="Min. 8 characters"
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass2(!showPass2)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6b7280' }}
                    >
                      {showPass2 ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Confirm Password</label>
                  <input type="password" style={inp} placeholder="Re-enter password" autoComplete="new-password" />
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                  <input type="checkbox" style={{ accentColor: TEAL, marginTop: 2, flexShrink: 0 }} />
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>.
                  </span>
                </label>
                <button
                  type="submit"
                  style={{
                    width: '100%', padding: '12px', marginTop: 4,
                    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                    color: '#fff', border: 'none', borderRadius: 10,
                    fontWeight: 700, fontSize: 15, cursor: 'pointer',
                    boxShadow: `0 3px 12px ${TEAL}40`,
                  }}
                >
                  Create Account
                </button>
              </form>
            </div>

            {/* ── Toggle between Login / Sign Up ── */}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <div style={{ height: 1, background: '#f3f4f6', marginBottom: 16 }} />
              {isSignup ? (
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignup(false)}
                    style={{ background: 'none', border: 'none', color: TEAL, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignup(true)}
                    style={{ background: 'none', border: 'none', color: TEAL, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}
                  >
                    Sign up
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
