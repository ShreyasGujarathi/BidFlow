'use client';

import { useCallback, useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Auction, Bid } from "../../../lib/types";
import { fetchBidHistory } from "../../../lib/api";
import { CountdownTimer } from "../../../components/common/CountdownTimer";
import { BidFeed } from "../../../components/bids/BidFeed";
import { BidForm } from "../../../components/forms/BidForm";
import { AutoBidForm } from "../../../components/forms/AutoBidForm";
import { WinnerModal } from "../../../components/common/WinnerModal";
import { WatchlistButton } from "../../../components/watchlist/WatchlistButton";
import { useAuctionSubscription } from "../../../hooks/useAuctionSubscription";
import { useAuth } from "../../../context/AuthContext";
import { useSocketContext } from "../../../context/SocketContext";
import { useAuction, useBidHistory } from "../../../lib/swr";
import { mutate } from 'swr';

// Dynamic import for heavy ImageGallery component
const ImageGallery = dynamic(
  () => import("../../../components/common/ImageGallery").then(mod => ({ default: mod.ImageGallery })),
  {
    loading: () => (
      <div className="aspect-video rounded-3xl border animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }} />
    ),
    ssr: true,
  }
);

export default function AuctionDetailPage() {
  const params = useParams<{ id: string }>();
  const slugParam = params?.id;
  // Extract ID from slug-id format (e.g., "test-auction-6916c6b921ebad307a924529")
  // MongoDB ObjectIds are 24 hex characters, so find the last segment if it's 24 chars
  const parts = slugParam?.split("-") || [];
  const auctionId = parts.length > 1 && parts[parts.length - 1]?.length === 24 
    ? parts[parts.length - 1] 
    : slugParam;
  const { token, user } = useAuth();
  const { socket } = useSocketContext();

  const { data: auction, error: auctionError, isLoading: auctionLoading } = useAuction(slugParam || '');
  const { data: bidHistory = [], error: bidError } = useBidHistory(auctionId || '');
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // Lightweight refresh without loading state - for smooth updates after actions
  const refreshAuctionData = useCallback(async () => {
    if (!auctionId || !slugParam) return;
    try {
      // Revalidate SWR cache
      await Promise.all([
        mutate(`/api/auctions/${slugParam}`),
        mutate(`/api/auctions/${auctionId}/bids`),
      ]);
    } catch (err) {
      // Silently fail - WebSocket will handle updates
      console.warn("Failed to refresh auction data:", err);
    }
  }, [auctionId, slugParam]);

  useAuctionSubscription(auctionId || '', {
    onAuctionUpdate: (updated) => {
      if (!auction || auction._id !== updated._id) return;
      // Update SWR cache optimistically
      mutate(`/api/auctions/${slugParam}`, updated, false);
    },
    onBid: () => {
      // Refresh auction data smoothly without loading state
      void refreshAuctionData();
    },
    onFinalized: () => {
      if (!auction) return;
      // Update SWR cache optimistically
      mutate(`/api/auctions/${slugParam}`, { ...auction, status: "completed" }, false);
    },
  });

  // Check if user won the auction and show modal
  useEffect(() => {
    if (!auction || !user || auction.status !== "completed") {
      setShowWinnerModal(false);
      return;
    }

    // Check if current user is the winner
    let winnerId: string | undefined;
    if (typeof auction.currentBidder === "object" && auction.currentBidder !== null) {
      const bidderObj = auction.currentBidder as { _id?: string | { toString?: () => string }; id?: string; [key: string]: unknown };
      if (bidderObj._id) {
        if (typeof bidderObj._id === "string") {
          winnerId = bidderObj._id;
        } else if (typeof bidderObj._id === "object" && bidderObj._id !== null && "toString" in bidderObj._id && typeof bidderObj._id.toString === "function") {
          winnerId = bidderObj._id.toString();
        } else {
          winnerId = String(bidderObj._id);
        }
      } else if (bidderObj.id) {
        winnerId = String(bidderObj.id);
      }
    } else if (typeof auction.currentBidder === "string") {
      winnerId = auction.currentBidder;
    }

    const userIdStr = String(user.id).trim();
    const winnerIdStr = winnerId ? String(winnerId).trim() : "";
    const isWinner = winnerIdStr !== "" && userIdStr !== "" && winnerIdStr === userIdStr;

    // Check if modal was already shown for this auction (using sessionStorage)
    const modalKey = `winner-modal-${auction._id}`;
    const modalShown = sessionStorage.getItem(modalKey);

    if (isWinner && !modalShown) {
      setShowWinnerModal(true);
      // Mark as shown in sessionStorage so it doesn't show again in this session
      sessionStorage.setItem(modalKey, "true");
    } else {
      setShowWinnerModal(false);
    }
  }, [auction, user]);

  if (auctionLoading) {
    return <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading auction…</p>;
  }

  if (auctionError || bidError) {
    return (
      <p className="text-sm" role="alert" style={{ color: 'var(--error)' }}>
        {auctionError instanceof Error ? auctionError.message : bidError instanceof Error ? bidError.message : "Failed to load auction details"}
      </p>
    );
  }

  if (!auction) {
    return <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Auction not found.</p>;
  }

  const isLive = auction.status === "live";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[2fr_1fr]" style={{ backgroundColor: 'var(--background)' }}>
      <section className="space-y-6">
        {/* Image Gallery */}
        {auction.imageUrls && auction.imageUrls.length > 0 && (
          <Suspense fallback={
            <div className="aspect-video rounded-3xl border animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }} />
          }>
            <ImageGallery images={auction.imageUrls} title={auction.title} />
          </Suspense>
        )}

        <div 
          className="rounded-3xl border p-6"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            boxShadow: 'var(--shadow-strong)'
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm uppercase" style={{ color: 'var(--muted-foreground)' }}>
                    {auction.category}
                  </p>
                  <h1 className="mt-2 text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {auction.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {auction.description}
                  </p>
                </div>
                {user && (
                  <div className="flex-shrink-0">
                    <WatchlistButton auctionId={auction._id} size="md" />
                  </div>
                )}
              </div>
            </div>
            <CountdownTimer endTime={auction.endTime} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
              <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Current bid</p>
              <p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--primary)' }}>
                ${auction.currentPrice.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
              <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Minimum raise</p>
              <p className="mt-2 text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                ${auction.minimumIncrement.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
              <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Status</p>
              <p className="mt-2 text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                {auction.status.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Live Bids</h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Updated instantly whenever a new bid arrives.
          </p>
          <BidFeed bids={bidHistory} />
        </div>
      </section>

      <aside className="space-y-6">
            {isLive ? (
              (() => {
                // Check if current user is the seller - handle both _id and id fields
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
                const isSeller = user && sellerId && String(sellerId).trim() === String(user.id).trim();
                
                if (isSeller) {
                  return (
                    <div className="rounded-lg border p-4 text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>
                      You are the seller of this item. Sellers cannot bid on their own auctions.
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    <BidForm
                      auctionId={auction._id}
                      currentPrice={auction.currentPrice}
                      minimumIncrement={auction.minimumIncrement}
                      currentBidder={auction.currentBidder}
                      userBidHistory={bidHistory}
                      onSuccess={refreshAuctionData}
                    />
                    <AutoBidForm auction={auction} onUpdate={refreshAuctionData} />
                  </div>
                );
              })()
            ) : (
              <div className="rounded-lg border p-4 text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--muted-foreground)' }}>
                Bidding is closed for this auction.
              </div>
            )}
      </aside>

      {/* Winner Modal */}
      {showWinnerModal && auction && (
        <WinnerModal
          auction={auction}
          currentUserId={user?.id}
          onClose={() => setShowWinnerModal(false)}
        />
      )}
    </div>
  );
}

