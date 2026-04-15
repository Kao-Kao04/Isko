'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TEAL = '#1D9E75';
const TEAL_DARK = '#178a64';

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
  const [role, setRole] = useState<'student' | 'osfa'>('student');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'osfa') {
      router.push('/osfa/home');
    } else {
      router.push('/student/dashboard');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/register');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fffde7 0%, #e8faf4 50%, #b2dfdb 100%)',
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
          background: `linear-gradient(160deg, ${TEAL} 0%, ${TEAL_DARK} 60%, #0f6b4f 100%)`,
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
                    Email or Username
                  </label>
                  <input type="text" style={inp} placeholder="Enter your email or username" autoComplete="username" />
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
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Role toggle for demo routing */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Login as
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['student', 'osfa'] as const).map((r) => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        style={{
                          flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          border: `1.5px solid ${role === r ? TEAL : '#e5e7eb'}`,
                          background: role === r ? '#e8faf4' : '#fff',
                          color: role === r ? TEAL : '#6b7280',
                        }}>
                        {r === 'student' ? 'Student' : 'OSFA Staff'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                    <input type="checkbox" style={{ accentColor: TEAL }} /> Remember me
                  </label>
                  <a href="#" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
                </div>

                <button type="submit" style={{
                  width: '100%', padding: '12px',
                  background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  boxShadow: `0 3px 12px ${TEAL}40`,
                }}>
                  Login
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
              <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#111827' }}>Create Account</h2>
              <p style={{ margin: '0 0 28px', fontSize: 13, color: '#6b7280' }}>Fill in your details to get started.</p>

              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Email Address
                  </label>
                  <input type="email" style={inp} placeholder="Enter your email address" autoComplete="email" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Username
                  </label>
                  <input type="text" style={inp} placeholder="Choose a username" autoComplete="username" />
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
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPass2(!showPass2)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                      {showPass2 ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Confirm Password
                  </label>
                  <input type="password" style={inp} placeholder="Re-enter password" autoComplete="new-password" />
                </div>

                <button type="submit" style={{
                  width: '100%', padding: '12px', marginTop: 4,
                  background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  boxShadow: `0 3px 12px ${TEAL}40`,
                }}>
                  Continue to Register →
                </button>

                <button type="button" onClick={() => setIsSignup(false)}
                  style={{
                    width: '100%', padding: '11px',
                    background: '#fff', border: `1.5px solid #e5e7eb`,
                    color: '#374151', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  }}>
                  ← Back to Login
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
