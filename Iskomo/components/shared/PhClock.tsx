'use client';

import { useState, useEffect } from 'react';

export default function PhClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', weekday: 'short', month: 'short', day: 'numeric' }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <>
      {/* Desktop: full clock with date — hidden on mobile */}
      <div className="hide-tablet" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{time}</div>
        <div style={{ fontSize: 10, fontWeight: 500, color: '#94a3b8', letterSpacing: '0.03em' }}>{date} · PH</div>
      </div>
      {/* Mobile: compact time only — shown via student-clock wrapper override */}
      <div className="student-clock-mobile" style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {time}
      </div>
    </>
  );
}
