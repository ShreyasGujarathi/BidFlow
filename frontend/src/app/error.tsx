'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
      <div
        className="w-full max-w-md rounded-2xl border p-8 text-center"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-soft)' }}
      >
        <h1 className="mb-4 text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Something went wrong!
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:opacity-90"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)'
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

