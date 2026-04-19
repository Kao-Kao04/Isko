'use client';
import { OsfaProvider } from '@/lib/osfa-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <OsfaProvider>{children}</OsfaProvider>;
}
