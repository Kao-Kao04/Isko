'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Supabase now redirects directly to /api/auth/verify-email (backend),
// which then redirects to /login?verified=true.
// This page only exists as a safety fallback.
export default function VerifyEmailRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/login'); }, [router]);
  return null;
}
