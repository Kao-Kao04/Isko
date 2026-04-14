import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login / Sign Up | IskoMo',
  description: 'Login or Sign Up for IskoMo Scholarships & Opportunities',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/css/front/style.css" />
      <link rel="stylesheet" href="/css/front/responsive.css" />
      {children}
    </>
  );
}
