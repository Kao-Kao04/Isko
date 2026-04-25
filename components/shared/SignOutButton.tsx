'use client';

import { useState } from 'react';
import { useSignOut } from '@/hooks/useSignOut';

export default function SignOutButton() {
  const signOut  = useSignOut();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="btn btn-secondary"
      style={{ fontSize: 13, padding: '7px 14px', whiteSpace: 'nowrap', minWidth: 90 }}
    >
      {loading ? (
        <>
          <span style={{ width: 12, height: 12, border: '2px solid #d1d5db', borderTopColor: '#6b7280', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
          Signing out…
        </>
      ) : 'Sign Out'}
    </button>
  );
}
