import type { Metadata } from 'next';
import OsfaLayout from '@/components/layout/OsfaLayout';

export const metadata: Metadata = {
  title: 'OSFA Dashboard | IskoMo',
};

export default function OsfaRootLayout({ children }: { children: React.ReactNode }) {
  return <OsfaLayout>{children}</OsfaLayout>;
}
