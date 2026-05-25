"use client";

import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LandingNavbar from '@/components/shared/LandingNavbar';
import { COLORS } from '@/lib/theme';

/* ── Brand colours ── */
const MAROON   = COLORS.maroon;
const MAROON_D = COLORS.maroonD;
const GOLD     = COLORS.gold;
const GOLD_L   = COLORS.goldL;
const TEAL     = COLORS.maroon;

/* ─────────────────────────────────────────────────────────────
   Scroll-reveal wrapper — fades + slides in when visible
───────────────────────────────────────────────────────────── */
function Reveal({
  children, delay = 0, direction = 'up', style,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
  style?: React.CSSProperties;
}) {
  const ref  = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect(); } },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const hidden: Record<string, string> = {
    up:    'translateY(52px)',
    left:  'translateX(-52px)',
    right: 'translateX(52px)',
    scale: 'scale(0.88) translateY(24px)',
  };

  return (
    <div ref={ref} style={{
      opacity: on ? 1 : 0,
      transform: on ? 'translate(0) scale(1)' : hidden[direction],
      transition: `opacity .72s ease ${delay}ms, transform .72s cubic-bezier(.22,.61,.36,1) ${delay}ms`,
      willChange: 'opacity, transform',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Hover-lift card
───────────────────────────────────────────────────────────── */
function HoverCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...style,
        transform: hov ? 'translateY(-7px)' : 'translateY(0)',
        boxShadow: hov
          ? `0 18px 40px rgba(128,0,0,0.18)`
          : '0 2px 10px rgba(0,0,0,0.06)',
        transition: 'transform .3s cubic-bezier(.22,.61,.36,1), box-shadow .3s ease',
        cursor: 'default',
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Animated counter (counts up when it enters viewport)
───────────────────────────────────────────────────────────── */
function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const ref   = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start: number;
      const tick = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1400, 1);
        setN(Math.round(p * end));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────
   Icon box
───────────────────────────────────────────────────────────── */
function IconBox({ children, bg = MAROON, size = 52 }: {
  children: React.ReactNode; bg?: string; size?: number;
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.27),
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, boxShadow: `0 4px 14px ${bg}55`,
    }}>
      {children}
    </div>
  );
}

/* ── Data ── */
const STEPS = [
  { n: '01', title: 'Browse Scholarships',       desc: 'Explore curated OSFA-managed scholarships built exclusively for PUP Main students — all in one place.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  { n: '02', title: 'Submit Your Application',   desc: 'Fill out a guided application form, upload required documents, and submit directly through the portal.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> },
  { n: '03', title: 'OSFA Reviews & Evaluates',  desc: 'The Office of Scholarship and Financial Assistance reviews eligibility and processes your application.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { n: '04', title: 'Track & Stay Updated',      desc: 'Monitor your application status in real time — from submission all the way through approval.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 6-6"/></svg> },
];

const CHALLENGES = [
  { title: 'Scattered Information', desc: 'Scholarship opportunities are spread across multiple platforms, making it hard to find and track relevant programs.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  { title: 'Missed Deadlines',      desc: 'Without a centralized system, students often miss critical application deadlines and lose out on financial aid.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
  { title: 'Complex Processes',     desc: 'Each scholarship has different requirements and forms, making the application journey overwhelming.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg> },
];

const TEAM = [
  { name: 'Emmanuel Mutas',             role: 'Leader',     src: '/assets/photo_2025-12-27_02-41-42.jpg' },
  { name: 'Marlo Itang',               role: 'Developer',  src: '/assets/Itang_Marlo.jpg' },
  { name: 'Kit Jasper Palacio',         role: 'Developer',  src: '/assets/Kit Jasper Palacio.jpg' },
  { name: 'Princess Pauline Abellera',  role: 'Researcher', src: '/assets/Abellera_Princess Pauline.jpg' },
  { name: 'Mariel Abreu',              role: 'Researcher', src: '/assets/Abreu_Mariel I..jpg' },
];

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const router = useRouter();

  /* Intercept Supabase auth hash redirects */
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get('type') === 'recovery' && params.get('access_token')) {
      router.replace('/reset-password' + window.location.hash);
    } else if (params.get('error_code') === 'otp_expired' || params.get('error') === 'access_denied') {
      router.replace('/login?error=link_expired');
    }
  }, [router]);

  /* Hero parallax on scroll */
  const [scrollY, setScrollY] = useState(0);
  const onScroll = useCallback(() => setScrollY(window.scrollY), []);
  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return (
    <>
      {/* ── Global keyframes for hero entry ── */}
      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePop {
          from { opacity: 0; transform: scale(.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-18px) rotate(4deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(14px) rotate(-3deg); }
        }

        /* Force white text on all dark sections — overrides global CSS */
        #hero h1, #hero p, #hero span { color: inherit !important; }
        .dark-section h1,
        .dark-section h2,
        .dark-section h3,
        .dark-section p  { color: inherit !important; }

        /* Prevent global h/p color from leaking into inline-styled elements */
        [data-dark] h1,
        [data-dark] h2,
        [data-dark] h3,
        [data-dark] p   { color: inherit !important; }
      `}</style>

<div style={{ background: '#fff', fontFamily: "'Inter', sans-serif" }}>
        <LandingNavbar />

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <section id="hero" data-dark="true" style={{
          minHeight: '100vh',
          background: `linear-gradient(140deg, ${MAROON_D} 0%, ${MAROON} 50%, #2A0000 100%)`,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          textAlign: 'center', padding: '120px 24px 90px',
          position: 'relative', overflow: 'hidden', color: '#fff',
        }}>
          {/* Parallax bg layer */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 70% 40%, rgba(201,160,39,0.07) 0%, transparent 70%)',
            transform: `translateY(${scrollY * 0.25}px)`,
            pointerEvents: 'none',
          }} />

          {/* Floating decorative rings */}
          <div style={{ position:'absolute', top:-100, right:-100, width:480, height:480, borderRadius:'50%', border:`1.5px solid rgba(201,160,39,0.14)`, animation:'floatA 9s ease-in-out infinite', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:  30, right: 30,  width:220, height:220, borderRadius:'50%', border:`1.5px solid rgba(201,160,39,0.10)`, animation:'floatB 7s ease-in-out infinite', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-80, left:-80,  width:380, height:380, borderRadius:'50%', border:`1px solid rgba(255,255,255,0.06)`, animation:'floatA 11s ease-in-out infinite', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom: 60, left: 80,  width:160, height:160, borderRadius:'50%', background:`rgba(128,0,0,0.07)`, animation:'floatB 8s ease-in-out infinite', pointerEvents:'none' }} />

          {/* Content — staggered hero entry animations */}
          <div style={{ position:'relative', zIndex:1, maxWidth:780 }}>

            {/* PUP badge */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:10, marginBottom:32,
              background:'rgba(201,160,39,0.13)', border:`1px solid rgba(201,160,39,0.38)`,
              borderRadius:40, padding:'9px 22px',
              animation:'badgePop .6s cubic-bezier(.22,.61,.36,1) .1s both',
            }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:GOLD_L }} />
              <span style={{ fontSize:11.5, fontWeight:700, color:GOLD_L, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                Capstone Project · PUP Main · OSFA
              </span>
            </div>

            <h1 style={{
              fontSize:'clamp(2.4rem,5.5vw,4rem)', fontWeight:900, color:'#fff',
              lineHeight:1.12, margin:'0 0 28px', letterSpacing:'-0.03em',
              animation:'heroIn .8s cubic-bezier(.22,.61,.36,1) .25s both',
            }}>
              Your Path to Scholarships<br />
              <span style={{ color:GOLD_L }}>Starts Here.</span>
            </h1>

            <p style={{
              fontSize:'clamp(1rem,2vw,1.17rem)', color:'rgba(255,255,255,0.68)',
              lineHeight:1.8, margin:'0 auto 16px', maxWidth:600,
              animation:'heroIn .8s cubic-bezier(.22,.61,.36,1) .45s both',
            }}>
              IskoMo is a scholarship management system developed as a&nbsp;
              <span style={{ color:'rgba(255,255,255,0.9)', fontWeight:600 }}>
                Capstone Project
              </span>{' '}
              in partnership with the Office of Scholarship and Financial Assistance at the Polytechnic University of the Philippines – Main Campus.
            </p>

            <p style={{
              fontSize:13, color:`rgba(201,160,39,0.82)`, fontWeight:700,
              marginBottom:44, letterSpacing:'0.06em',
              animation:'heroIn .8s cubic-bezier(.22,.61,.36,1) .58s both',
            }}>
              Discover · Apply · Get Funded
            </p>

            <div style={{
              display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap',
              animation:'heroIn .8s cubic-bezier(.22,.61,.36,1) .72s both',
            }}>
              <Link href="/login" style={{
                display:'inline-flex', alignItems:'center', gap:8,
                background:GOLD, color:'#fff', fontWeight:700, fontSize:15,
                padding:'14px 34px', borderRadius:10, textDecoration:'none',
                boxShadow:`0 6px 24px rgba(201,160,39,0.5)`,
                transition:'transform .2s ease, box-shadow .2s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 10px 28px rgba(201,160,39,0.6)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='translateY(0)';   (e.currentTarget as HTMLElement).style.boxShadow=`0 6px 24px rgba(201,160,39,0.5)`; }}
              >
                Get Started
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <a href="#how-it-works" style={{
                display:'inline-flex', alignItems:'center', gap:8,
                background:'rgba(255,255,255,0.10)', color:'#fff', fontWeight:600, fontSize:15,
                padding:'14px 32px', borderRadius:10, textDecoration:'none',
                border:'1px solid rgba(255,255,255,0.24)',
                transition:'background .2s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.10)'; }}
              >
                How It Works
              </a>
            </div>
          </div>

          {/* Scroll indicator — clickable */}
          <button
            onClick={() => document.querySelector('#challenges')?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Scroll to content"
            style={{
              position:'absolute', bottom:36, left:'50%',
              transform:'translateX(-50%)',
              animation:'scrollBounce 2s ease-in-out infinite',
              display:'flex', flexDirection:'column', alignItems:'center', gap:5,
              color:'rgba(255,255,255,0.50)',
              background:'none', border:'none', cursor:'pointer',
              transition:'color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.50)'; }}
          >
            <span style={{ fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:600 }}>scroll</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </section>

        {/* ══════════════════════════════════════════════════
            STATS BAR
        ══════════════════════════════════════════════════ */}
        <div style={{ background:'#fff', borderBottom:'1px solid #f0f0f0', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
          <div style={{ maxWidth:960, margin:'0 auto', display:'flex', justifyContent:'space-around', flexWrap:'wrap', padding:'36px 24px', gap:24 }}>
            {[
              { value: 4,    suffix: '+',   label: 'Active Scholarships',       accent: MAROON, isNum: true  },
              { value: 14,   suffix: '',    label: 'PUP Colleges Covered',       accent: MAROON, isNum: true  },
              { value: 100,  suffix: '%',   label: 'PUP Main Students Only',     accent: GOLD,   isNum: true  },
              { value: 0,    suffix: 'OSFA', label: 'Officially Managed',        accent: TEAL,   isNum: false },
            ].map((s) => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:36, fontWeight:900, color:s.accent, lineHeight:1 }}>
                  {s.isNum ? <CountUp end={s.value} suffix={s.suffix} /> : <span>{s.suffix}</span>}
                </div>
                <div style={{ fontSize:13, color:'#6b7280', marginTop:6, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            CHALLENGES
        ══════════════════════════════════════════════════ */}
        <section id="challenges" style={{ background:'#f9fafb', padding:'100px 24px' }}>
          <div style={{ maxWidth:1080, margin:'0 auto' }}>
            <Reveal style={{ textAlign:'center', marginBottom:56 }}>
              <span style={{ fontSize:12, fontWeight:700, color:MAROON, letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:12 }}>The Problem</span>
              <h2 style={{ fontSize:'clamp(1.7rem,3.5vw,2.5rem)', fontWeight:800, color:'#111827', margin:'0 0 14px', letterSpacing:'-0.02em' }}>
                Challenges in Finding Scholarships
              </h2>
              <p style={{ fontSize:16, color:'#6b7280', maxWidth:520, margin:'0 auto', lineHeight:1.75 }}>
                PUP students face real barriers when navigating scholarship opportunities — IskoMo is built to remove them.
              </p>
            </Reveal>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24 }}>
              {CHALLENGES.map((c, i) => (
                <Reveal key={c.title} delay={i * 120} direction="up">
                  <HoverCard style={{
                    background:'#fff', borderRadius:18, padding:'38px 32px',
                    border:'1px solid #e5e7eb', borderTop:`4px solid ${MAROON}`,
                    height:'100%',
                  }}>
                    <div style={{ marginBottom:22 }}>
                      <IconBox bg={MAROON}>{c.icon}</IconBox>
                    </div>
                    <h3 style={{ fontSize:18, fontWeight:700, color:'#111827', margin:'0 0 10px' }}>{c.title}</h3>
                    <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.75, margin:0 }}>{c.desc}</p>
                  </HoverCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════ */}
        <section id="how-it-works" style={{ background:'#fff', padding:'100px 24px' }}>
          <div style={{ maxWidth:1080, margin:'0 auto' }}>
            <Reveal style={{ textAlign:'center', marginBottom:64 }}>
              <span style={{ fontSize:12, fontWeight:700, color:MAROON, letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:12 }}>The Process</span>
              <h2 style={{ fontSize:'clamp(1.7rem,3.5vw,2.5rem)', fontWeight:800, color:'#111827', margin:'0 0 14px', letterSpacing:'-0.02em' }}>
                How IskoMo Works
              </h2>
              <p style={{ fontSize:16, color:'#6b7280', maxWidth:480, margin:'0 auto', lineHeight:1.75 }}>
                From discovery to approval — a transparent process managed entirely by OSFA.
              </p>
            </Reveal>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:20 }}>
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 110} direction="up">
                  <HoverCard style={{
                    background:'#f9fafb', borderRadius:18, padding:'34px 24px',
                    border:'1px solid #efefef', textAlign:'center', height:'100%',
                    position:'relative',
                  }}>
                    {/* step connector dot */}
                    {i < STEPS.length - 1 && (
                      <div style={{ position:'absolute', top:42, right:-12, width:24, height:2, background:`linear-gradient(90deg, ${MAROON}40, transparent)`, display:'none' }} />
                    )}
                    <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
                      <IconBox bg={MAROON} size={54}>{s.icon}</IconBox>
                    </div>
                    <div style={{ fontSize:11, fontWeight:700, color:GOLD, letterSpacing:'0.1em', marginBottom:10 }}>STEP {s.n}</div>
                    <h3 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 10px' }}>{s.title}</h3>
                    <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.75, margin:0 }}>{s.desc}</p>
                  </HoverCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            ABOUT / MISSION / VISION
        ══════════════════════════════════════════════════ */}
        <section id="about" style={{ background:'#f9fafb', padding:'100px 24px' }}>
          <div style={{ maxWidth:1080, margin:'0 auto' }}>
            <Reveal style={{ textAlign:'center', marginBottom:56 }}>
              <span style={{ fontSize:12, fontWeight:700, color:MAROON, letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:12 }}>About</span>
              <h2 style={{ fontSize:'clamp(1.7rem,3.5vw,2.5rem)', fontWeight:800, color:'#111827', margin:'0 0 14px', letterSpacing:'-0.02em' }}>About IskoMo</h2>
              <p style={{ fontSize:16, color:'#6b7280', maxWidth:640, margin:'0 auto', lineHeight:1.8 }}>
                IskoMo is a scholarship management platform built for and by PUP students,
                working directly with OSFA to make financial aid accessible, transparent,
                and stress-free for every PUPian.
              </p>
            </Reveal>

            {/* PUP identity card */}
            <Reveal direction="scale" style={{ marginBottom:28 }}>
              <div style={{
                background:`linear-gradient(135deg, ${MAROON_D}, ${MAROON})`,
                borderRadius:20, padding:'40px 48px',
                display:'flex', alignItems:'center', gap:32, flexWrap:'wrap',
                boxShadow:`0 12px 40px rgba(128,0,0,0.32)`,
              }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(201,160,39,0.18)', border:`2px solid rgba(201,160,39,0.40)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD_L} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <div style={{ flex:1, minWidth:240 }}>
                  <div style={{ fontSize:11, color:`rgba(201,160,39,0.78)`, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Officially Connected To</div>
                  <div style={{ fontSize:20, fontWeight:800, color:'#fff', marginBottom:6 }}>
                    Polytechnic University of the Philippines
                  </div>
                  <div style={{ fontSize:14, color:'rgba(255,255,255,0.60)' }}>
                    Main Campus · Office of Scholarship and Financial Assistance (OSFA)
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Mission & Vision */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24 }}>
              {[
                {
                  label: 'Our Mission',
                  dir: 'left' as const,
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
                  text: 'To empower PUP students by providing a centralized, user-friendly platform that simplifies scholarship discovery, application management, and deadline tracking — reducing barriers so every student can access the financial support they deserve.',
                },
                {
                  label: 'Our Vision',
                  dir: 'right' as const,
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
                  text: 'To become the definitive scholarship platform for PUP students — a future where every iskolar has equal access to educational opportunities and where financial constraints never stand between a student and their academic dreams.',
                },
              ].map((card) => (
                <Reveal key={card.label} direction={card.dir}>
                  <HoverCard style={{
                    background:'#fff', borderRadius:18, padding:'36px 32px',
                    border:'1px solid #e5e7eb', borderLeft:`4px solid ${MAROON}`, height:'100%',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                      <IconBox bg={MAROON} size={44}>{card.icon}</IconBox>
                      <h3 style={{ fontSize:17, fontWeight:700, color:'#111827', margin:0 }}>{card.label}</h3>
                    </div>
                    <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.85, margin:0 }}>{card.text}</p>
                  </HoverCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            TEAM
        ══════════════════════════════════════════════════ */}
        <section style={{ background:'#fff', padding:'100px 24px' }}>
          <div style={{ maxWidth:1080, margin:'0 auto' }}>
            <Reveal style={{ textAlign:'center', marginBottom:56 }}>
              <span style={{ fontSize:12, fontWeight:700, color:MAROON, letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:12 }}>The Team</span>
              <h2 style={{ fontSize:'clamp(1.7rem,3.5vw,2.5rem)', fontWeight:800, color:'#111827', margin:0, letterSpacing:'-0.02em' }}>
                Project Members
              </h2>
            </Reveal>

            <div style={{ display:'flex', justifyContent:'center', gap:32, flexWrap:'wrap' }}>
              {TEAM.map((m, i) => (
                <Reveal key={m.name} delay={i * 90} direction="scale">
                  <div style={{ textAlign:'center', width:148 }}>
                    <div style={{
                      width:96, height:96, borderRadius:'50%', margin:'0 auto 14px',
                      border:`3px solid ${MAROON}`, overflow:'hidden',
                      boxShadow:`0 6px 20px rgba(128,0,0,0.22)`,
                      transition:'transform .3s cubic-bezier(.22,.61,.36,1)',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='scale(1.08)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='scale(1)'; }}
                    >
                      <img src={m.src} alt={m.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#111827', lineHeight:1.3 }}>{m.name}</div>
                    <div style={{ fontSize:12, color:MAROON, fontWeight:600, marginTop:4 }}>{m.role}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            CTA
        ══════════════════════════════════════════════════ */}
        <section data-dark="true" style={{
          background:`linear-gradient(135deg, ${MAROON_D} 0%, ${MAROON} 50%, #2A0000 100%)`,
          padding:'90px 24px', textAlign:'center', position:'relative', overflow:'hidden',
          color:'#fff',
        }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 30% 50%, rgba(201,160,39,0.08) 0%, transparent 65%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280, borderRadius:'50%', border:`1px solid rgba(201,160,39,0.12)`, animation:'floatA 9s ease-in-out infinite', pointerEvents:'none' }} />
          <Reveal direction="scale" style={{ position:'relative', zIndex:1, maxWidth:600, margin:'0 auto', color:'#fff' }}>
            <h2 style={{ fontSize:'clamp(1.7rem,3.5vw,2.5rem)', fontWeight:800, color:'#fff', margin:'0 0 16px', letterSpacing:'-0.02em' }}>
              Ready to Find Your Scholarship?
            </h2>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.68)', margin:'0 0 36px', lineHeight:1.75 }}>
              Join PUP Main students already using IskoMo to discover and apply for scholarship programs managed by OSFA.
            </p>
            <Link href="/login" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:GOLD, color:'#fff', fontWeight:700, fontSize:15,
              padding:'15px 38px', borderRadius:10, textDecoration:'none',
              boxShadow:`0 6px 24px rgba(201,160,39,0.45)`,
              transition:'transform .2s ease, box-shadow .2s ease',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='translateY(0)'; }}
            >
              Create Your Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </Reveal>
        </section>

        {/* ══════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════ */}
        <footer style={{ background:'#0d0d0d', color:'rgba(255,255,255,0.45)', padding:'64px 24px 0' }}>
          <div style={{ maxWidth:1080, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:40, paddingBottom:48 }}>

            {/* Brand column — logo clicks to top */}
            <div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, background:'none', border:'none', cursor:'pointer', padding:0 }}
                aria-label="Back to top"
              >
                <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${MAROON}, ${GOLD})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <img src="/assets/Gemini_Generated_Image_jve2a8jve2a8jve2-removebg-preview.png" alt="IskoMo" style={{ width:20, height:20, filter:'brightness(0) invert(1)' }} />
                </div>
                <span style={{ fontSize:18, fontWeight:800, color:'#fff' }}>IskoMo</span>
              </button>
              <p style={{ fontSize:13, lineHeight:1.75, margin:'0 0 14px', color:'rgba(255,255,255,0.40)' }}>
                A Capstone Project in partnership with OSFA · PUP Main.
              </p>
              <div style={{ fontSize:11, color:GOLD, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                PUP Main · OSFA
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:16 }}>Quick Links</div>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10 }}>
                {[['#hero','Home'],['#about','About'],['#how-it-works','How It Works'],['#challenges','Challenges']].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} onClick={e => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior:'smooth' }); }} style={{ fontSize:14, color:'rgba(255,255,255,0.45)', textDecoration:'none', transition:'color 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GOLD; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}
                    >{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:16 }}>Legal</div>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10 }}>
                {[['/privacy','Privacy Policy'],['/terms','Terms & Conditions']].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} style={{ fontSize:14, color:'rgba(255,255,255,0.45)', textDecoration:'none', transition:'color 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GOLD; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}
                    >{label}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/contact" style={{ fontSize:14, color:'rgba(255,255,255,0.45)', textDecoration:'none', transition:'color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GOLD; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}
                  >Contact Us</Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:16 }}>Contact</div>
              <a href="mailto:contact@iskomo.ph" style={{ fontSize:14, color:'rgba(255,255,255,0.45)', textDecoration:'none', display:'block', marginBottom:10, transition:'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GOLD; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}
              >contact@iskomo.ph</a>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.30)', lineHeight:1.7 }}>
                Polytechnic University<br />of the Philippines<br />Main Campus, Sta. Mesa, Manila
              </div>
            </div>
          </div>

          {/* Institution logos bar */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'28px 0' }}>
            <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <img src="/assets/pup-logo.png" alt="PUP" style={{ height:32, width:'auto', opacity:0.7, filter:'brightness(0) invert(1)' }}
                    onError={e => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:600, letterSpacing:'0.04em' }}>POLYTECHNIC UNIVERSITY<br />OF THE PHILIPPINES</span>
                </div>
                <div style={{ width:1, height:28, background:'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>OSFA</span>
                <div style={{ width:1, height:28, background:'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>ITECH</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.20)', margin:0 }}>
                  &copy; 2025 IskoMo. All rights reserved.
                </p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.20)', margin:0 }}>
                  Made For Students, Made By Students.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
