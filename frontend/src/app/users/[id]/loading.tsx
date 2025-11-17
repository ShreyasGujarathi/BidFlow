import { Card, CardContent } from "../../../components/ui/card";

export default function UserProfileLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" style={{ backgroundColor: 'var(--background)' }}>
      {/* Profile Header Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Avatar Skeleton */}
            <div className="h-24 w-24 animate-pulse rounded-full" style={{ backgroundColor: 'var(--surface)' }} />
            
            {/* User Info Skeleton */}
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 animate-pulse rounded" style={{ backgroundColor: 'var(--surface)' }} />
              <div className="h-4 w-64 animate-pulse rounded" style={{ backgroundColor: 'var(--surface)' }} />
              <div className="h-4 w-32 animate-pulse rounded" style={{ backgroundColor: 'var(--surface)' }} />
            </div>
            
            {/* Reputation Badge Skeleton */}
            <div className="h-20 w-24 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
          </div>
          
          {/* Stats Grid Skeleton */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg"
                style={{ backgroundColor: 'var(--surface)' }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Section Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="h-6 w-32 animate-pulse rounded mb-4" style={{ backgroundColor: 'var(--surface)' }} />
          <div className="space-y-4">
            <div className="h-20 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
            <div className="h-20 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Auctions Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="h-6 w-48 animate-pulse rounded mb-4" style={{ backgroundColor: 'var(--surface)' }} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="space-y-3"
              >
                <div className="aspect-video animate-pulse rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
                <div className="h-4 w-3/4 animate-pulse rounded" style={{ backgroundColor: 'var(--surface)' }} />
                <div className="h-4 w-1/2 animate-pulse rounded" style={{ backgroundColor: 'var(--surface)' }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

