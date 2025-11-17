export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-10 w-64 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
        <div className="h-5 w-96 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
      </div>
      
      {/* Content skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border p-5 animate-pulse"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}
          >
            <div className="aspect-[4/3] rounded-xl mb-4" style={{ backgroundColor: 'var(--surface)' }} />
            <div className="space-y-2">
              <div className="h-5 w-3/4 rounded" style={{ backgroundColor: 'var(--surface)' }} />
              <div className="h-4 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
              <div className="h-4 w-5/6 rounded" style={{ backgroundColor: 'var(--surface)' }} />
            </div>
            <div className="mt-4 flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="h-6 w-20 rounded" style={{ backgroundColor: 'var(--surface)' }} />
              <div className="h-6 w-24 rounded" style={{ backgroundColor: 'var(--surface)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

