'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function RouteProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress]   = useState(0);
  const [opacity,  setOpacity]    = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setProgress(0);
    setOpacity(1);

    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timers.current.push(t);
    };

    schedule(() => setProgress(30),  30);
    schedule(() => setProgress(60),  150);
    schedule(() => setProgress(80),  300);
    schedule(() => setProgress(95),  500);
    schedule(() => setProgress(100), 700);
    schedule(() => setOpacity(0),    900);
    schedule(() => setProgress(0),   1100);

    return () => timers.current.forEach(clearTimeout);
  }, [pathname]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
      height: 3, pointerEvents: 'none',
      opacity, transition: 'opacity 0.3s ease',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #800000, #a00000, #C9A027)',
        transition: progress === 0 ? 'none' : 'width 0.25s ease',
        boxShadow: '0 0 10px #80000060, 0 0 4px #C9A02760',
        borderRadius: '0 2px 2px 0',
      }} />
    </div>
  );
}
