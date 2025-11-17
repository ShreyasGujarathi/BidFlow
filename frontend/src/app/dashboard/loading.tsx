export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-10 w-64 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
        <div className="h-5 w-96 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
      </div>
      
      {/* Dashboard cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border p-8 animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-48 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                <div className="h-4 w-32 rounded" style={{ backgroundColor: 'var(--surface)' }} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
              <div className="h-4 w-3/4 rounded" style={{ backgroundColor: 'var(--surface)' }} />
            </div>
            <div className="mt-6 h-12 w-full rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
          </div>
        ))}
      </div>
      
      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border p-4 animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
            <div className="h-4 w-24 rounded mb-2" style={{ backgroundColor: 'var(--surface)' }} />
            <div className="h-8 w-32 rounded" style={{ backgroundColor: 'var(--surface)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

