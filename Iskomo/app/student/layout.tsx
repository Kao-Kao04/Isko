import type { Metadata } from 'next';
import StudentLayout from '@/components/layout/StudentLayout';

export const metadata: Metadata = {
  title: 'Student Portal | IskoMo',
};

export default function StudentRootLayout({ children }: { children: React.ReactNode }) {
  return <StudentLayout>{children}</StudentLayout>;
}
