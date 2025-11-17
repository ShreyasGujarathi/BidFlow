export default function WatchlistLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-10 w-48 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
        <div className="h-5 w-96 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
      </div>
      
      {/* Watchlist items skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border p-5 animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
            <div className="flex gap-4">
              <div className="h-24 w-24 flex-shrink-0 rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-3/4 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                    <div className="h-4 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
                    <div className="h-4 w-2/3 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                  </div>
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: 'var(--surface)' }} />
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <div className="h-5 w-32 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                  <div className="h-5 w-32 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                  <div className="h-5 w-24 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

