import type { Metadata } from 'next';
import StudentLayout from '@/components/layout/StudentLayout';

export const metadata: Metadata = {
  title: 'Student Portal | IskoMo',
};

export default function StudentRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/css/student/global-dashboard.css" />
      <link rel="stylesheet" href="/css/student/dashboard-styles.css" />
      <link rel="stylesheet" href="/css/student/responsive.css" />
      <StudentLayout>{children}</StudentLayout>
    </>
  );
}
