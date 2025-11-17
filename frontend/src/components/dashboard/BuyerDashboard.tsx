'use client';

import Link from "next/link";
import Image from "next/image";
import { Auction, Bid } from "../../lib/types";
import { getAuctionUrl } from "../../utils/slug";
import { formatDistanceToNow, format } from "date-fns";
import { useCountdown } from "../../hooks/useCountdown";
import { useSocketContext } from "../../context/SocketContext";

interface BuyerDashboardProps {
  activeBids: Bid[];
  wonAuctions: Auction[];
}

// Component for individual active bid card
interface ActiveBidCardProps {
  bid: Bid;
  auction: Auction;
  serverTimeOffset: number;
}

const ActiveBidCard = ({ bid, auction, serverTimeOffset }: ActiveBidCardProps) => {
  const countdown = useCountdown(auction.endTime, serverTimeOffset);
  const auctionUrl = getAuctionUrl(auction);
  const isLive = auction.status === "live";
  
  // Determine if user is winning (their highest bid matches current highest bid)
  const isUserWinning = auction.currentBidder && typeof auction.currentBidder === "object"
    ? String(auction.currentBidder.id || auction.currentBidder._id) === String(bid.bidder.id)
    : false;
  
  const status = isUserWinning ? "Winning" : "Outbid";
  const statusColor = isUserWinning ? "var(--success)" : "var(--error)";
  const statusBg = isUserWinning ? "var(--success-bg)" : "var(--error-bg)";

  return (
    <Link
      prefetch={true}
      href={auctionUrl}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-background/90 to-surface/80 transition-all hover:border-primary/50 hover:shadow-[var(--shadow-strong)]"
    >
      {/* Auction Image */}
      {auction.imageUrls && auction.imageUrls.length > 0 && (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={auction.imageUrls[0]}
            alt={auction.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={auction.imageUrls[0]?.startsWith("http://localhost:5000") || auction.imageUrls[0]?.startsWith("http://127.0.0.1:5000")}
          />
          {/* Status Badge Overlay */}
          <div className="absolute right-3 top-3 flex gap-2">
            {isLive && (
              <span 
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
              >
                <span 
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                Live
              </span>
            )}
            <span 
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
              style={{ backgroundColor: statusBg, color: statusColor }}
            >
              {status}
            </span>
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Auction Title */}
        <h3 className="mb-4 line-clamp-2 text-base font-semibold transition-colors" style={{ color: 'var(--foreground)' }}>
          {auction.title}
        </h3>

        {/* Bid Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Your Highest Bid</span>
            <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
              ${bid.amount.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Current Highest Bid</span>
            <span className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
              ${auction.currentPrice.toFixed(2)}
            </span>
          </div>

          {/* Time Left */}
          <div className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Time Left</span>
            <span 
              className="text-sm font-semibold"
              style={{ color: countdown.isExpired ? 'var(--error)' : 'var(--success)' }}
            >
              {countdown.isExpired ? "Ended" : countdown.formatted}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          <span>Bid placed {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</span>
          <span className="group-hover:text-primary transition-colors">View →</span>
        </div>
      </div>
    </Link>
  );
};

export const BuyerDashboard = ({
  activeBids,
  wonAuctions,
}: BuyerDashboardProps) => {
  const { serverTimeOffset } = useSocketContext();

  return (
    <div className="flex flex-col gap-8">
      {/* Active Bids Section */}
      <section className="space-y-4">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>Active Bids</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Auctions you're currently participating in
            </p>
          </div>
        </header>

        {activeBids.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-12 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--surface)' }}>
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-base font-medium" style={{ color: 'var(--foreground)' }}>
              No active bids
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Start bidding on auctions to see them here
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(() => {
              // Additional safeguard: filter to ensure only one bid per auction
              const seenAuctions = new Set<string>();
              const uniqueBids = activeBids.filter((bid) => {
                const auction = typeof bid.auction === "object" ? bid.auction : null;
                if (!auction || !auction._id) return false;
                
                const auctionId = typeof auction._id === "string" 
                  ? auction._id 
                  : auction._id.toString();
                
                if (seenAuctions.has(auctionId)) {
                  return false; // Skip duplicate
                }
                seenAuctions.add(auctionId);
                return true;
              });

              return uniqueBids.map((bid) => {
                const auction = typeof bid.auction === "object" ? bid.auction : null;
                if (!auction) return null;
                
                const auctionId = typeof auction._id === "string" 
                  ? auction._id 
                  : auction._id.toString();
                
                // Use auction ID as key since we now have one card per auction
                return (
                  <ActiveBidCard
                    key={auctionId}
                    bid={bid}
                    auction={auction}
                    serverTimeOffset={serverTimeOffset}
                  />
                );
              });
            })()}
          </div>
        )}
      </section>

      {/* Won Auctions Section */}
      <section className="space-y-4">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>Won Auctions</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Congratulations! Your successful purchases
            </p>
          </div>
        </header>

        {wonAuctions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-12 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--surface)' }}>
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
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <p className="text-base font-medium" style={{ color: 'var(--foreground)' }}>
              No won auctions yet
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Win an auction to see it here
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wonAuctions.map((auction) => (
              <Link
                key={auction._id}
                href={getAuctionUrl(auction)}
                className="group relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-[var(--shadow-strong)]"
                prefetch={true}
                style={{
                  borderColor: 'var(--success-border)',
                  backgroundColor: 'var(--card)'
                }}
              >
                {/* Winner Badge */}
                <div className="mb-3 flex items-center gap-2">
                  <span 
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
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
                  </span>
                  {auction.endTime && (
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Ended {format(new Date(auction.endTime), "MMM d, yyyy")}
                    </span>
                  )}
                </div>

                {/* Auction Title */}
                <h3 className="mb-3 line-clamp-2 text-base font-semibold transition-colors" style={{ color: 'var(--foreground)' }}>
                  {auction.title}
                </h3>

                {/* Item Image */}
                {auction.imageUrls && auction.imageUrls.length > 0 && (
                  <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <Image
                      src={auction.imageUrls[0]}
                      alt={auction.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                {/* Price Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Winning Price</span>
                    <span className="text-xl font-bold" style={{ color: 'var(--success)' }}>
                      ${auction.currentPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Category</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                      {auction.category}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                  <span style={{ color: 'var(--success)' }}>Purchase completed</span>
                  <span className="transition-colors" style={{ color: 'var(--primary)' }}>View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

