'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const MAROON   = '#800000';
const MAROON_D = '#5C0000';
const GOLD     = '#C9A027';

export default function LandingNavbar() {
  const [scrollY,  setScrollY]  = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.pageYOffset);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrolled = scrollY > 60;
  const opacity  = 1;
  const translateY = '0%';

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position:   'fixed',
        top:        0, left: 0, right: 0,
        zIndex:     1000,
        transform:  translateY,
        opacity:    opacity,
        visibility: 'visible',
        transition: 'background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(0,0,0,0.15)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? `1px solid rgba(128,0,0,0.10)` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.10)' : 'none',
      }}
    >
      {/* Top maroon accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${MAROON_D}, ${MAROON}, ${GOLD})` }} />

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', height: 64,
      }}>
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => handleAnchor(e, '#hero')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${MAROON}, ${MAROON_D})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 2px 10px rgba(128,0,0,0.35)`,
            flexShrink: 0,
          }}>
            <img
              src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
              alt="IskoMo"
              style={{ width: 20, height: 20, filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: scrolled ? '#111827' : '#fff', lineHeight: 1, letterSpacing: '-0.02em', transition: 'color 0.3s' }}>IskoMo</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: scrolled ? MAROON : GOLD, lineHeight: 1, marginTop: 2.5, letterSpacing: '0.07em', textTransform: 'uppercase', transition: 'color 0.3s' }}>PUP Main · OSFA</div>
          </div>
        </a>

        {/* Desktop links */}
        <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
          {[
            { label: 'About',        href: '#about' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Challenges',   href: '#challenges' },
          ].map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => handleAnchor(e, item.href)}
                style={{ display: 'block', padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: scrolled ? '#374151' : 'rgba(255,255,255,0.85)', textDecoration: 'none', transition: 'color .2s, background .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = scrolled ? MAROON : '#fff'; (e.currentTarget as HTMLElement).style.background = scrolled ? 'rgba(128,0,0,0.06)' : 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = scrolled ? '#374151' : 'rgba(255,255,255,0.85)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {item.label}
              </a>
            </li>
          ))}
          <li style={{ marginLeft: 8 }}>
            <Link
              href="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 22px', borderRadius: 9,
                background: `linear-gradient(135deg, ${MAROON}, ${MAROON_D})`,
                color: '#fff', fontWeight: 700, fontSize: 14,
                textDecoration: 'none',
                boxShadow: `0 3px 12px rgba(128,0,0,0.35)`,
                transition: 'transform .2s, box-shadow .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 18px rgba(128,0,0,0.45)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 3px 12px rgba(128,0,0,0.35)`; }}
            >
              Get Started
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          style={{
            display: 'none',
            background: 'none', border: `1.5px solid ${MAROON}30`,
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
            color: MAROON,
          }}
          className="navbar-mobile-toggle"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 28px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { label: 'About',        href: '#about' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Challenges',   href: '#challenges' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleAnchor(e, item.href)}
              style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#374151', textDecoration: 'none' }}
            >
              {item.label}
            </a>
          ))}
          <Link href="/login" style={{ marginTop: 8, padding: '11px 16px', borderRadius: 9, background: `linear-gradient(135deg, ${MAROON}, ${MAROON_D})`, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>
            Get Started
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 680px) {
          .navbar-mobile-toggle { display: flex !important; }
          nav ul { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
