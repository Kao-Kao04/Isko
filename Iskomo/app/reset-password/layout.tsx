import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | IskoMo',
  description: 'Set a new password for your IskoMo account',
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
