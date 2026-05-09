'use client';

import { useState, useEffect } from 'react';

const HEALTH_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/health`;
const POLL_INTERVAL = 60_000; // 1 minute

export default function HealthBanner() {
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    let dead = false;

    async function check() {
      try {
        const res  = await fetch(HEALTH_URL, { cache: 'no-store' });
        const data = await res.json().catch(() => ({ status: 'unknown' }));
        if (!dead) setDegraded(!res.ok || data.status !== 'ok');
      } catch {
        // Network error — assume degraded
        if (!dead) setDegraded(true);
      }
    }

    check();
    const t = setInterval(check, POLL_INTERVAL);
    return () => { dead = true; clearInterval(t); };
  }, []);

  if (!degraded) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '10px 20px',
        background: '#fffbeb',
        borderBottom: '1.5px solid #fcd34d',
        fontSize: 13,
        fontWeight: 600,
        color: '#92400e',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      System maintenance in progress. Some features may be temporarily unavailable.
      <button
        onClick={() => setDegraded(false)}
        aria-label="Dismiss banner"
        style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', opacity: 0.6, fontSize: 18, lineHeight: 1, padding: 0 }}
      >
        ×
      </button>
    </div>
  );
}
