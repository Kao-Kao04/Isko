'use client';

import { COLORS } from '@/lib/theme';

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  console.error('[AdminError]', error);
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ color: '#1f2937' }}>Something went wrong</h2>
      <p style={{ color: '#6b7280', margin: '8px 0 20px' }}>An unexpected error occurred. Please try again.</p>
      <button onClick={reset} style={{ padding: '10px 24px', background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
        Try again
      </button>
    </div>
  );
}
