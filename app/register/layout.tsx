import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | IskoMo',
  description: 'Register for IskoMo Scholarships & Opportunities',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
