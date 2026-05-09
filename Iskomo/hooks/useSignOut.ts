'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { clearUserCache } from '@/hooks/useCurrentUser';

export function useSignOut() {
  const router = useRouter();
  return async () => {
    clearUserCache();
    await logout();
    router.push('/login');
  };
}
