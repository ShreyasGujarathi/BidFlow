'use client';

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UserProfile, createRating } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { getAuctionUrl } from "../../../utils/slug";
import { format } from "date-fns";
import { useUserProfile } from "../../../lib/swr";
import { mutate } from 'swr';

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const userId = params?.id || '';
  const { token, user } = useAuth();
  const { data: profile, error, isLoading } = useUserProfile(userId);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user || !userId) {
      setRatingError("You must be signed in to rate users");
      return;
    }

    if (userId === user.id) {
      setRatingError("You cannot rate yourself");
      return;
    }

    setSubmittingRating(true);
    setRatingError(null);

    try {
      await createRating(userId, { rating, comment: comment || undefined }, token);
      // Reload profile to get updated ratings
      await mutate(`/api/users/${userId}`);
      setComment("");
      setRating(5);
    } catch (err) {
      setRatingError(err instanceof Error ? err.message : "Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading profile…</p>;
  }

  if (error || !profile) {
    return (
      <p className="text-sm" role="alert" style={{ color: 'var(--error)' }}>
        {error instanceof Error ? error.message : "Profile not found"}
      </p>
    );
  }

  const isOwnProfile = user && user.id === profile.user._id;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" style={{ backgroundColor: 'var(--background)' }}>
      {/* Profile Header */}
      <div 
        className="rounded-2xl border p-6"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-soft)'
        }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.user.avatarUrl ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2" style={{ borderColor: 'var(--primary)' }}>
                <Image
                  src={profile.user.avatarUrl}
                  alt={profile.user.username}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            ) : (
              <div 
                className="flex h-24 w-24 items-center justify-center rounded-full border-2 text-3xl font-bold"
                style={{
                  borderColor: 'var(--primary)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                {profile.user.username[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {profile.user.username}
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>{profile.user.email}</p>
                <p className="mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Member since {format(new Date(profile.user.createdAt), "MMMM yyyy")}
                </p>
              </div>
              {/* Reputation Badge */}
              <div className="flex flex-col items-end gap-2">
                <div 
                  className="rounded-lg border px-4 py-2 text-center"
                  style={{
                    borderColor: 'var(--warning-border)',
                    backgroundColor: 'var(--warning-bg)'
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: 'var(--warning)' }}>Reputation</p>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>
                      {profile.stats.averageRating.toFixed(1)}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--warning)' }}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {profile.stats.ratingCount} rating{profile.stats.ratingCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div 
            className="rounded-lg border p-4"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)'
            }}
          >
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
              Auctions Created
            </p>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--info)' }}>
              {profile.stats.auctionsCreated}
            </p>
          </div>
          <div 
            className="rounded-lg border p-4"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)'
            }}
          >
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
              Auctions Won
            </p>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--success)' }}>
              {profile.stats.auctionsWon}
            </p>
          </div>
          <div 
            className="rounded-lg border p-4"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)'
            }}
          >
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
              Total Bids Placed
            </p>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
              {profile.stats.totalBidsPlaced}
            </p>
          </div>
        </div>
      </div>

      {/* Rating Section (only if not own profile) */}
      {!isOwnProfile && user && (
        <div 
          className="rounded-2xl border p-6"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <h2 className="mb-4 text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Rate This User</h2>
          <form onSubmit={handleSubmitRating} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Rating (1-5 stars)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition hover:opacity-80"
                    style={{
                      color: star <= rating ? '#fbbf24' : 'var(--muted-foreground)'
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill={star <= rating ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)'
                }}
                rows={3}
                placeholder="Share your experience with this user..."
                maxLength={500}
              />
            </div>
            {ratingError && (
              <p className="text-sm" style={{ color: 'var(--error)' }}>{ratingError}</p>
            )}
            <button
              type="submit"
              disabled={submittingRating}
              className="rounded-md px-4 py-2 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              {submittingRating ? "Submitting..." : "Submit Rating"}
            </button>
          </form>
        </div>
      )}

      {/* Recent Auctions Created */}
      {profile.recentAuctions.length > 0 && (
        <div 
          className="rounded-2xl border p-6"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <h2 className="mb-4 text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Recent Auctions Created
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.recentAuctions.map((auction: { _id: string; slug: string; [key: string]: unknown }) => (
              <Link
                key={auction._id}
                href={getAuctionUrl(auction)}
                prefetch={true}
                className="group overflow-hidden rounded-lg border transition hover:opacity-80"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)'
                }}
              >
                {auction.imageUrls?.length ? (
                  <div 
                    className="relative aspect-video w-full overflow-hidden"
                    style={{ backgroundColor: 'var(--surface)' }}
                  >
                    <Image
                      src={auction.imageUrls[0]}
                      alt={auction.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div 
                    className="flex aspect-video items-center justify-center"
                    style={{
                      backgroundColor: 'var(--surface)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    No image
                  </div>
                )}
                <div className="p-4">
                  <h3 className="line-clamp-1 font-semibold transition-colors group-hover:text-primary" style={{ color: 'var(--foreground)' }}>
                    {auction.title}
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Status: {auction.status.toUpperCase()}
                  </p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                    ${auction.currentPrice.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Wins */}
      {profile.recentWins.length > 0 && (
        <div 
          className="rounded-2xl border p-6"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <h2 className="mb-4 text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Recent Wins</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.recentWins.map((auction: { _id: string; slug: string; [key: string]: unknown }) => (
              <Link
                key={auction._id}
                href={getAuctionUrl(auction)}
                prefetch={true}
                className="group overflow-hidden rounded-lg border transition hover:opacity-80"
                style={{
                  borderColor: 'rgba(34, 197, 94, 0.3)',
                  backgroundColor: 'var(--card)'
                }}
              >
                {auction.imageUrls?.length ? (
                  <div 
                    className="relative aspect-video w-full overflow-hidden"
                    style={{ backgroundColor: 'var(--surface)' }}
                  >
                    <Image
                      src={auction.imageUrls[0]}
                      alt={auction.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div 
                    className="flex aspect-video items-center justify-center"
                    style={{
                      backgroundColor: 'var(--surface)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    No image
                  </div>
                )}
                <div className="p-4">
                  <div 
                    className="mb-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ade80'
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Won
                  </div>
                  <h3 className="line-clamp-1 font-semibold transition-colors" style={{ color: 'var(--foreground)' }}>
                    {auction.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--success)' }}>
                    ${auction.currentPrice.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Ratings */}
      {profile.recentRatings.length > 0 && (
        <div 
          className="rounded-2xl border p-6"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <h2 className="mb-4 text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Recent Ratings</h2>
          <div className="space-y-4">
            {profile.recentRatings.map((ratingItem: { _id: string; rating: number; comment?: string; ratedBy: { username: string; [key: string]: unknown }; createdAt: string; [key: string]: unknown }) => (
              <div
                key={ratingItem._id}
                className="rounded-lg border p-4"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {typeof ratingItem.ratedBy === "object" && ratingItem.ratedBy.avatarUrl ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border" style={{ borderColor: 'var(--border)' }}>
                        <Image
                          src={ratingItem.ratedBy.avatarUrl}
                          alt={ratingItem.ratedBy.username}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div 
                        className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--primary)',
                          color: 'var(--primary-foreground)'
                        }}
                      >
                        {typeof ratingItem.ratedBy === "object"
                          ? ratingItem.ratedBy.username[0].toUpperCase()
                          : "U"}
                      </div>
                    )}
                    <div>
                      <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                        {typeof ratingItem.ratedBy === "object"
                          ? ratingItem.ratedBy.username
                          : "Anonymous"}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill={star <= ratingItem.rating ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            style={{
                              color: star <= ratingItem.rating ? '#fbbf24' : 'var(--muted-foreground)'
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {format(new Date(ratingItem.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                {ratingItem.comment && (
                  <p className="mt-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{ratingItem.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

