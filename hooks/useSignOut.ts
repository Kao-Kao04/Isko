'use client';

import { useRouter } from 'next/navigation';

export function useSignOut() {
  const router = useRouter();
  return () => router.push('/login');
}
