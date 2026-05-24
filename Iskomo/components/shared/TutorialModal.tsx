'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/theme';

const M = COLORS.maroon;

const STEPS = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    title: 'Maligayang pagdating sa IskoMo!',
    body: 'Ito ang iyong scholarship portal. Dito ka makakahanap ng scholarships, makakapagsumite ng applications, at makakasubaybay ng status ng iyong mga aplikasyon.',
    cta: null,
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    title: 'I-browse ang mga Iskolarship',
    body: 'Sa Iskolarships page, makikita mo lahat ng available scholarships. Pwede kang mag-filter ayon sa college, year level, at category para madaling mahanap ang para sa iyo.',
    cta: '/student/iskolarships',
    ctaLabel: 'Tingnan ang Iskolarships',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Mag-apply ng Scholarship',
    body: 'I-click ang scholarship na gusto mo, basahin ang requirements, at pindutin ang "Apply". I-upload lang ang mga kinakailangang dokumento at isumite.',
    cta: null,
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Subaybayan ang iyong Application',
    body: 'Sa Applications page, makikita mo ang status ng iyong mga aplikasyon — kung pending, under review, approved, o kailangan pang baguhin.',
    cta: '/student/applications',
    ctaLabel: 'Tingnan ang Applications',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Makipag-usap sa OSFA',
    body: 'May katanungan? Sa Messages page, pwede kang direktang makipag-communicate sa OSFA. Sumasagot sila sa loob ng 3–5 business days.',
    cta: '/student/messages',
    ctaLabel: 'Pumunta sa Messages',
  },
];

const KEY = 'iskomo_tutorial_done';

export default function TutorialModal({ ready = true }: { ready?: boolean }) {
  const router = useRouter();
  const [step,    setStep]    = useState(0);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (ready && typeof window !== 'undefined' && !localStorage.getItem(KEY)) {
      setVisible(true);
    }
  }, [ready]);

  function close() {
    localStorage.setItem(KEY, '1');
    setVisible(false);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      close();
    }
  }

  if (!visible || !mounted) return null;

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 9000, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400,
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          pointerEvents: 'all',
          animation: 'tutorialFadeIn 0.25s ease',
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
        }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 0' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Step {step + 1} of {STEPS.length}
            </span>
            <button
              onClick={close}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#9ca3af', padding: '4px 8px', borderRadius: 6 }}
            >
              Skip
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px 28px 20px', textAlign: 'center' }}>
            {/* Icon */}
            <div className="tutorial-icon" style={{
              width: 72, height: 72, borderRadius: 20, background: `${M}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              {current.icon}
            </div>

            <h2 className="tutorial-title" style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 800, color: '#111827', lineHeight: 1.3 }}>
              {current.title}
            </h2>
            <p className="tutorial-body" style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
              {current.body}
            </p>
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 4 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 18 : 6, height: 6, borderRadius: 99,
                  background: i === step ? M : '#e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={next}
              style={{
                width: '100%', padding: '12px', borderRadius: 12,
                background: `linear-gradient(135deg, ${M}, #5C0000)`,
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 700,
              }}
            >
              {isLast ? 'Sige, magsimula na!' : 'Susunod →'}
            </button>

            {current.cta && (
              <button
                onClick={() => { close(); router.push(current.cta!); }}
                style={{
                  width: '100%', padding: '11px', borderRadius: 12,
                  background: `${M}0f`, color: M,
                  border: `1px solid ${M}30`, cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                }}
              >
                {current.ctaLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tutorialFadeIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>,
    document.body
  );
}
