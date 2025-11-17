export default function AuctionLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[2fr_1fr]" style={{ backgroundColor: 'var(--background)' }}>
      <div className="space-y-6">
        {/* Image skeleton */}
        <div className="aspect-video rounded-3xl border animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }} />
        
        {/* Thumbnails skeleton */}
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-lg border animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }} />
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="rounded-3xl border p-6 animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-20 rounded" style={{ backgroundColor: 'var(--background)' }} />
              <div className="h-10 w-3/4 rounded" style={{ backgroundColor: 'var(--background)' }} />
              <div className="h-4 w-full rounded" style={{ backgroundColor: 'var(--background)' }} />
              <div className="h-4 w-5/6 rounded" style={{ backgroundColor: 'var(--background)' }} />
            </div>
            <div className="h-16 w-32 rounded-lg" style={{ backgroundColor: 'var(--background)' }} />
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                <div className="h-3 w-20 rounded mb-2" style={{ backgroundColor: 'var(--surface)' }} />
                <div className="h-8 w-24 rounded" style={{ backgroundColor: 'var(--surface)' }} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Bids section skeleton */}
        <div className="space-y-4">
          <div className="h-7 w-32 rounded" style={{ backgroundColor: 'var(--surface)' }} />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border p-4 animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-48 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                    <div className="h-3 w-32 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                  </div>
                  <div className="h-6 w-24 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <aside className="space-y-6">
        <div className="rounded-lg border p-4 animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="h-6 w-1/2 rounded mb-4" style={{ backgroundColor: 'var(--surface)' }} />
          <div className="space-y-3">
            <div className="h-10 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
            <div className="h-10 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
            <div className="h-12 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
          </div>
        </div>
      </aside>
    </div>
  );
}

