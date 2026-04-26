'use client';

import { usePathname } from 'next/navigation';

const STYLES = `
@keyframes _pageIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
._page-enter {
  animation: _pageIn 0.18s ease both;
  will-change: opacity;
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
