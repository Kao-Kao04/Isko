'use client';

export default function StudentError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="dashboard-container" style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--text-dark)' }}>Something went wrong</h2>
      <p style={{ color: 'var(--text-medium)' }}>{error.message}</p>
      <button className="btn btn-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
