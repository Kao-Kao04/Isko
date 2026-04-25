'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export function useSignOut() {
  const router = useRouter();
  return async () => {
    await logout();
    router.push('/login');
  };
}
