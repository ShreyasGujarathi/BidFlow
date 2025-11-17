import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
      <div
        className="w-full max-w-md rounded-2xl border p-8 text-center"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-soft)' }}
      >
        <h1 className="mb-4 text-6xl font-bold" style={{ color: 'var(--foreground)' }}>
          404
        </h1>
        <h2 className="mb-4 text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Page Not Found
        </h2>
        <p className="mb-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:opacity-90"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)'
          }}
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

