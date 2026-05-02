'use client';
import RouteProgressBar from '@/components/ui/RouteProgressBar';
import PageTransition from '@/components/ui/PageTransition';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteProgressBar />
      <PageTransition>{children}</PageTransition>
    </>
  );
}
