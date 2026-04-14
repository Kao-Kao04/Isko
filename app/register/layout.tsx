import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | IskoMo',
  description: 'Register for IskoMo Scholarships & Opportunities',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/css/front/style.css" />
      <link rel="stylesheet" href="/css/front/responsive.css" />
      {children}
    </>
  );
}
