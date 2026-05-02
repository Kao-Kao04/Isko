'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function AccountStatusGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCurrentUser();
  const router            = useRouter();
  const pathname          = usePathname();

  useEffect(() => {
    if (loading || !user) return;

    const needsRegistration =
      user.account_status === 'unregistered' ||
      user.account_status === 'rejected';

    const isOnRegistrationPage = pathname === '/student/registration';

    if (needsRegistration && !isOnRegistrationPage) {
      router.replace('/student/registration');
    }

    if (!needsRegistration && isOnRegistrationPage) {
      router.replace('/student/dashboard');
    }
  }, [user, loading, pathname, router]);

  // While redirecting, render children (no flash — the guard acts silently)
  return <>{children}</>;
}
