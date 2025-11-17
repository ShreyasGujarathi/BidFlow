'use client';

import Link from "next/link";
import { useEffect } from "react";
import { Auction, Bid } from "../../lib/types";
import { format } from "date-fns";
import { useSocketContext } from "../../context/SocketContext";
import { extractUserId } from "../../lib/userIdUtils";

interface SellerDashboardProps {
  listings: (Auction & { bidCount?: number })[];
  activeBids: Bid[];
  onListingUpdate?: (updated: Auction) => void;
}

export const SellerDashboard = ({
  listings,
  activeBids,
  onListingUpdate,
}: SellerDashboardProps) => {
  const { socket } = useSocketContext();

  // Listen for real-time auction updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (updated: Auction) => {
      onListingUpdate?.(updated);
    };

    listings.forEach((listing) => {
      socket.emit("joinAuction", listing._id);
    });

    socket.on("auction:update", handleUpdate);
    socket.on("bid:new", () => {
      // Reload listings when new bid arrives
      listings.forEach((listing) => {
        socket.emit("joinAuction", listing._id);
      });
    });

    return () => {
      socket.off("auction:update", handleUpdate);
      listings.forEach((listing) => {
        socket.emit("leaveAuction", listing._id);
      });
    };
  }, [socket, listings, onListingUpdate]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2 space-y-3">
        <header>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Your Listings</h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Manage current auctions and track performance.
          </p>
        </header>
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <table className="min-w-full divide-y divide-border/60 text-sm">
            <thead style={{ backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>
              <tr>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wide">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wide">
                  Highest Bid
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wide">
                  Bids
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wide">
                  Ends
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {listings.map((item: Auction & { bidCount?: number }) => {
                const currentBidderName =
                  typeof item.currentBidder === "object"
                    ? item.currentBidder.username
                    : undefined;
                return (
                  <tr key={item._id} className="hover:bg-border/20">
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{item.title}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{item.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold" style={{ color: 'var(--success)' }}>
                          ${item.currentPrice.toFixed(2)}
                        </span>
                        {currentBidderName && typeof item.currentBidder === "object" && item.currentBidder && (
                          (() => {
                            const bidderId = extractUserId(item.currentBidder);
                            return bidderId ? (
                              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                by{" "}
                                <Link
                                  href={`/users/${bidderId}`}
                                  className="transition hover:text-primary"
                                  prefetch={true}
                                >
                                  {currentBidderName}
                                </Link>
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                by {currentBidderName}
                              </span>
                            );
                          })()
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>
                      {item.bidCount ?? 0}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>
                      {format(new Date(item.endTime), "MMM d, HH:mm")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {listings.length === 0 && (
            <p className="p-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
              You have no listings yet.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <header>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Recent Bids</h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Monitor activity across your auctions.
          </p>
        </header>
        <div className="space-y-3 rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          {activeBids.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No bids received yet. Share your listings to attract bidders.
            </p>
          )}
          {activeBids.map((bid: Bid) => (
            <div
              key={bid._id}
              className="rounded-lg border p-3"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
            >
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {typeof bid.bidder === "object" && bid.bidder ? (
                  (() => {
                    const bidderId = extractUserId(bid.bidder);
                    const username = bid.bidder.username || "Bidder";
                    return bidderId ? (
                      <>
                        <Link
                          href={`/users/${bidderId}`}
                          className="transition hover:text-primary"
                          prefetch={true}
                        >
                          {username}
                        </Link>{" "}
                      </>
                    ) : (
                      <>{username} </>
                    );
                  })()
                ) : (
                  "Bidder "
                )}
                bid{" "}
                <span className="font-semibold" style={{ color: 'var(--success)' }}>
                  ${bid.amount.toFixed(2)}
                </span>
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {typeof bid.auction === "object"
                  ? bid.auction.title
                  : "Auction"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

