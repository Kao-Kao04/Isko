'use client';

import { usePathname } from 'next/navigation';

const STYLES = `
@keyframes _pageIn {
  from { opacity: 0; transform: translateY(16px) scale(0.995); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
._page-enter {
  animation: _pageIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
  will-change: opacity, transform;
}
`;

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div key={pathname} className="_page-enter">
        {children}
      </div>
    </>
  );
}
