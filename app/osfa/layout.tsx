import type { Metadata } from 'next';
import OsfaLayout from '@/components/layout/OsfaLayout';

export const metadata: Metadata = {
  title: 'OSFA Dashboard | IskoMo',
};

export default function OsfaRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/css/osfa/global-dashboard.css" />
      <link rel="stylesheet" href="/css/osfa/dashboard-styles.css" />
      <link rel="stylesheet" href="/css/osfa/responsive.css" />
      <OsfaLayout>{children}</OsfaLayout>
    </>
  );
}
