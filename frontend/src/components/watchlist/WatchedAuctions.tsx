'use client';

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Auction } from "../../lib/types";
import { useAuth } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import { getAuctionUrl } from "../../utils/slug";
import { useCountdown } from "../../hooks/useCountdown";
import { WatchlistButton } from "./WatchlistButton";
import { useWatchlist } from "../../lib/swr";
import { mutate } from 'swr';
import { Card, CardContent } from "../ui/card";

// Separate component for each watched auction to use hooks properly
interface WatchedAuctionItemProps {
  auction: Auction;
  serverTimeOffset: number;
  onWatchlistChange: () => void;
}

const WatchedAuctionItem = ({ auction, serverTimeOffset, onWatchlistChange }: WatchedAuctionItemProps) => {
  const countdown = useCountdown(auction.endTime, serverTimeOffset);
  const isEndingSoon = !countdown.isExpired && countdown.totalSeconds < 3600; // Less than 1 hour
  const isLive = auction.status === "live";

  return (
    <Link
      href={getAuctionUrl(auction)}
      className="group relative block overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/85 p-5 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-strong)]"
      prefetch={true}
    >
      {isEndingSoon && isLive && (
        <div className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full bg-[var(--error-bg)]/85 px-3 py-1 text-xs font-semibold text-[var(--error)] shadow-[0_12px_28px_rgba(248,113,113,0.25)]">
          <span className="text-lg leading-none">•</span> Ending soon
        </div>
      )}

      <div className="flex gap-5">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--surface)] shadow-inner">
          {auction.imageUrls?.length ? (
            <Image
              src={auction.imageUrls[0]}
              alt={auction.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="96px"
              unoptimized={
                auction.imageUrls[0]?.startsWith("http://localhost:5000") ||
                auction.imageUrls[0]?.startsWith("http://127.0.0.1:5000")
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'var(--muted-foreground)' }}>
                {auction.category}
              </p>
              <h3 className="mt-1 line-clamp-1 text-lg font-semibold transition-colors group-hover:text-[var(--primary)]" style={{ color: 'var(--foreground)' }}>
                {auction.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {auction.description}
              </p>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <WatchlistButton
                auctionId={auction._id}
                size="sm"
                onToggle={onWatchlistChange}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'var(--muted-foreground)' }}>
                Current bid
              </p>
              <p className="text-xl font-semibold text-[var(--primary)]">
                ${auction.currentPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'var(--muted-foreground)' }}>
                Time left
              </p>
              <p
                className="text-lg font-semibold"
                style={{
                  color: countdown.isExpired
                    ? 'var(--muted-foreground)'
                    : isEndingSoon && isLive
                    ? 'var(--error)'
                    : 'var(--success)'
                }}
              >
                {countdown.isExpired ? "Ended" : countdown.formatted}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'var(--muted-foreground)' }}>
                Status
              </p>
              <p
                className="text-lg font-semibold"
                style={{ color: isLive ? 'var(--success)' : 'var(--muted-foreground)' }}
              >
                {auction.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const WatchedAuctions = () => {
  const { token, user } = useAuth();
  const { serverTimeOffset } = useSocketContext();
  const { data: watchlist = [], error, isLoading } = useWatchlist(token);

  // Refresh watchlist when items are removed
  const handleWatchlistChange = () => {
    if (token) {
      mutate(['/api/watchlist', token]);
    }
  };

  // Filter out items where auction is not populated or is a string
  const validWatchlist = watchlist.filter(
    (item) => typeof item.auction === "object" && item.auction !== null
  );

  const auctions = validWatchlist.map((item) => item.auction as Auction);

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Please sign in to view your watchlist</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading watchlist...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ borderColor: 'var(--error-border)', backgroundColor: 'var(--error-bg)' }}>
        <CardContent className="py-6 text-center">
          <p className="text-sm" style={{ color: 'var(--error)' }}>
            {error instanceof Error ? error.message : "Failed to load watchlist"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (auctions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              style={{ color: 'var(--muted-foreground)' }}
              fill="none"
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
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--foreground)' }}>No watched auctions</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Start watching auctions to see them here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {auctions.map((auction) => (
        <WatchedAuctionItem
          key={auction._id}
          auction={auction}
          serverTimeOffset={serverTimeOffset}
          onWatchlistChange={handleWatchlistChange}
        />
      ))}
    </div>
  );
};

