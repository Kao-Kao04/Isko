'use client';

import { useSignOut } from '@/hooks/useSignOut';

export default function SignOutButton() {
  const signOut = useSignOut();

  return (
    <button
      onClick={signOut}
      className="btn btn-secondary"
      style={{ fontSize: '0.875rem', padding: '0.4rem 1rem', whiteSpace: 'nowrap' }}
    >
      Sign Out
    </button>
  );
}
