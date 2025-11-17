'use client';

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bid } from "../../lib/types";
import { extractUserId } from "../../lib/userIdUtils";

interface BidFeedProps {
  bids: Bid[];
}

export const BidFeed = ({ bids }: BidFeedProps) => {
  if (!bids.length) {
    return (
      <div className="rounded-lg border p-4 text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--muted-foreground)' }}>
        No bids yet. Be the first to place a bid!
      </div>
    );
  }

  return (
    <ul
      className="space-y-3 rounded-2xl border p-4"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      {bids.map((bid: Bid) => (
        <li
          key={bid._id}
          className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
          }}
        >
          <div>
            {typeof bid.bidder === "object" && bid.bidder ? (
              (() => {
                const bidderId = extractUserId(bid.bidder);
                return bidderId ? (
                  <Link
                    href={`/users/${bidderId}`}
                    className="font-medium transition hover:text-primary"
                    style={{ color: 'var(--foreground)' }}
                    prefetch={true}
                  >
                    {bid.bidder.username}
                  </Link>
                ) : (
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>{bid.bidder.username}</p>
                );
              })()
            ) : (
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>Anonymous</p>
            )}
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
            </p>
          </div>
          <span className="text-base font-semibold" style={{ color: 'var(--success)' }}>
            ${bid.amount.toFixed(2)}
          </span>
        </li>
      ))}
    </ul>
  );
};

