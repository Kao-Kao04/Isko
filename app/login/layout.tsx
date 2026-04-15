import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | IskoMo',
  description: 'Sign in or create your IskoMo account',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
