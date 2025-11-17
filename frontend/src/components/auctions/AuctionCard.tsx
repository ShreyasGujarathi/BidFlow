'use client';

import Link from "next/link";
import Image from "next/image";
import { Auction } from "../../lib/types";
import { useSocketContext } from "../../context/SocketContext";
import { useCountdown } from "../../hooks/useCountdown";
import { useAuth } from "../../context/AuthContext";
import { getAuctionUrl } from "../../utils/slug";
import { format } from "date-fns";
import { WatchlistButton } from "../watchlist/WatchlistButton";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

interface AuctionCardProps {
  auction: Auction;
}

const statusStyles: Record<
  Auction["status"],
  { label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  pending: { 
    label: "Pending", 
    bgColor: 'var(--warning-bg)',
    textColor: 'var(--warning)',
    borderColor: 'var(--warning-border)'
  },
  live: { 
    label: "Live", 
    bgColor: 'var(--success-bg)',
    textColor: 'var(--success)',
    borderColor: 'var(--success-border)'
  },
  completed: {
    label: "Completed",
    bgColor: 'var(--surface)',
    textColor: 'var(--muted-foreground)',
    borderColor: 'var(--border)'
  },
  cancelled: {
    label: "Cancelled",
    bgColor: 'var(--error-bg)',
    textColor: 'var(--error)',
    borderColor: 'var(--error-border)'
  },
};

export const AuctionCard = ({ auction }: AuctionCardProps) => {
  const { serverTimeOffset } = useSocketContext();
  const { user } = useAuth();
  const countdown = useCountdown(auction.endTime, serverTimeOffset);
  const status = statusStyles[auction.status];
  const currentBidderName =
    typeof auction.currentBidder === "object"
      ? auction.currentBidder.username
      : undefined;
  
  // Extract seller ID - handle both object format (with _id or id) and string format
  let sellerId: string | undefined;
  if (typeof auction.seller === "object" && auction.seller !== null) {
    const sellerObj = auction.seller as { _id?: string | { toString?: () => string }; id?: string; [key: string]: unknown };
    if (sellerObj._id) {
      sellerId = typeof sellerObj._id === "string" 
        ? sellerObj._id 
        : typeof sellerObj._id === "object" && sellerObj._id !== null && "toString" in sellerObj._id
          ? sellerObj._id.toString()
          : String(sellerObj._id);
    } else if (sellerObj.id) {
      sellerId = String(sellerObj.id);
    }
  } else if (typeof auction.seller === "string") {
    sellerId = auction.seller;
  }
  
  // Compare normalized IDs
  const userIdStr = user?.id ? String(user.id).trim() : "";
  const sellerIdStr = sellerId ? String(sellerId).trim() : "";
  const isSeller = userIdStr !== "" && sellerIdStr !== "" && userIdStr === sellerIdStr;

      return (
        <Link
          href={getAuctionUrl(auction)}
          className="block"
          prefetch={true}
        >
          <Card
            className={cn(
              "group cursor-pointer transition-all duration-300 overflow-hidden",
              "hover:shadow-xl hover:-translate-y-1",
              "border-2"
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = getAuctionUrl(auction);
              }
            }}
          >
            <CardContent className="p-0">
              <div 
                className="relative aspect-[4/3] overflow-hidden rounded-t-lg"
                style={{
                  backgroundColor: 'var(--surface)'
                }}
              >
                {auction.imageUrls?.length ? (
                  <Image
                    src={auction.imageUrls[0]}
                    alt={auction.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized={auction.imageUrls[0]?.startsWith("http://localhost:5000") || auction.imageUrls[0]?.startsWith("http://127.0.0.1:5000")}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target) {
                        target.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    No image
                  </div>
                )}
                <div className="absolute right-3 top-3 z-10">
                  <Badge 
                    variant={auction.status === "live" ? "success" : auction.status === "completed" ? "secondary" : "warning"}
                    className="shadow-md"
                  >
                    {status.label}
                  </Badge>
                </div>
                <div
                  className="absolute left-3 top-3 z-10"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <WatchlistButton auctionId={auction._id} size="sm" />
                </div>
              </div>

              <div className="flex flex-col gap-4 p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                  <span>{auction.category}</span>
                  <span>
                    Ends {format(new Date(auction.endTime), "MMM d, HH:mm")}
                  </span>
                </div>
                <h3 className="text-lg font-bold line-clamp-2 transition-colors group-hover:text-primary" style={{ color: 'var(--foreground)' }}>
                  {auction.title}
                </h3>
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                  {auction.description}
                </p>
              </div>

              <div 
                className="flex items-center justify-between rounded-lg border px-4 py-3"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)'
                }}
              >
                <div>
                  <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Current Bid</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--primary)' }}>
                    ${auction.currentPrice.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Time Left</p>
                  <p
                    className="text-xl font-semibold"
                    style={{
                      color: countdown.isExpired ? 'var(--error)' : 'var(--success)'
                    }}
                  >
                    {countdown.formatted}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <span>Min increment ${auction.minimumIncrement.toFixed(2)}</span>
                {currentBidderName && typeof auction.currentBidder === "object" && auction.currentBidder ? (
                  (() => {
                    const bidderId = (auction.currentBidder as { id?: string; _id?: string }).id || 
                                    (auction.currentBidder as { id?: string; _id?: string })._id;
                    return bidderId ? (
                      <span
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        Leading:{" "}
                        <Link
                          href={`/users/${bidderId}`}
                          className="transition hover:text-primary"
                          prefetch={true}
                        >
                          {currentBidderName}
                        </Link>
                      </span>
                    ) : (
                      <span>Leading: {currentBidderName}</span>
                    );
                  })()
                ) : currentBidderName ? (
                  <span>Leading: {currentBidderName}</span>
                ) : null}
              </div>
            </div>
            </CardContent>
          </Card>
        </Link>
      );
};

