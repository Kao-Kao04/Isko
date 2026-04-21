'use client';
import { OsfaProvider } from '@/lib/osfa-context';
import RouteProgressBar from '@/components/ui/RouteProgressBar';
import PageTransition from '@/components/ui/PageTransition';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OsfaProvider>
      <RouteProgressBar />
      <PageTransition>{children}</PageTransition>
    </OsfaProvider>
  );
}
