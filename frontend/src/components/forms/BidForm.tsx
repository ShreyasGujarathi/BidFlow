'use client';

import { FormEvent, useEffect, useState } from "react";
import { placeBid } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useWalletBalance } from "../../lib/swr";
import { Bid } from "../../lib/types";

interface BidFormProps {
  auctionId: string;
  currentPrice: number;
  minimumIncrement: number;
  currentBidder?: string | { id: string; username: string };
  userBidHistory?: Bid[];
  onSuccess?: () => void;
}

export const BidForm = ({
  auctionId,
  currentPrice,
  minimumIncrement,
  currentBidder,
  userBidHistory = [],
  onSuccess,
}: BidFormProps) => {
  const { token, user } = useAuth();
  const { data: walletBalance } = useWalletBalance(token || undefined);
  const [amount, setAmount] = useState<string>((currentPrice + minimumIncrement).toFixed(2));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLeading, setIsLeading] = useState(false);
  const [hasUserBid, setHasUserBid] = useState(false);

  // Check if user has placed any bids on this auction
  useEffect(() => {
    if (!user || !user.id || !userBidHistory || userBidHistory.length === 0) {
      setHasUserBid(false);
      return;
    }

    const userIdStr = String(user.id).trim();
    const hasBid = userBidHistory.some((bid) => {
      // bid.bidder is always a User object (populated from backend)
      const bidder = bid.bidder;
      if (typeof bidder === "object" && bidder !== null) {
        const bidderId = (bidder as { _id?: string; id?: string })._id || (bidder as { _id?: string; id?: string }).id;
        const bidderIdStr = bidderId ? String(bidderId).trim() : "";
        return bidderIdStr === userIdStr;
      }
      return false;
    });
    setHasUserBid(hasBid);
  }, [user, userBidHistory]);

  // Check if user is leading bidder
  useEffect(() => {
    if (!user || !user.id) {
      setIsLeading(false);
      return;
    }
    // If there's no currentBidder, user is not leading yet
    if (!currentBidder) {
      setIsLeading(false);
      return;
    }
    
    // Extract bidder ID - handle both object format (with _id or id) and string format
    let bidderId: string | undefined;
    if (typeof currentBidder === "object" && currentBidder !== null) {
      // When populated by Mongoose, the object has _id field (ObjectId)
      // It might also have id field if it's a User object from frontend
      const bidderObj = currentBidder as { _id?: string | { toString?: () => string }; id?: string; [key: string]: unknown };
      if (bidderObj._id) {
        // Handle both string and ObjectId-like objects
        bidderId = typeof bidderObj._id === "string" 
          ? bidderObj._id 
          : typeof bidderObj._id === "object" && bidderObj._id !== null && "toString" in bidderObj._id
            ? bidderObj._id.toString()
            : String(bidderObj._id);
      } else if (bidderObj.id) {
        bidderId = String(bidderObj.id);
      }
    } else if (typeof currentBidder === "string") {
      bidderId = currentBidder;
    }
    
    // Convert both to strings for reliable comparison and normalize
    const userIdStr = String(user.id).trim();
    const bidderIdStr = bidderId ? String(bidderId).trim() : "";
    
    // Compare normalized strings
    const matches = bidderIdStr !== "" && userIdStr !== "" && bidderIdStr === userIdStr;
    setIsLeading(matches);
  }, [user, currentBidder]);

  // Calculate minimum bid
  const minimumBid = currentPrice + minimumIncrement;
  
  // Track if input has focus to avoid interfering with manual editing
  const [hasInputFocus, setHasInputFocus] = useState(false);
  
  // Only update amount to minimum when auction changes initially (not when user is typing)
  // Use a ref to track if this is the initial mount
  const [isInitialMount, setIsInitialMount] = useState(true);
  useEffect(() => {
    if (isInitialMount) {
      setAmount(minimumBid.toFixed(2));
      setIsInitialMount(false);
    }
  }, []); // Only run once on mount

  // Auto-update bid amount when minimum bid increases (someone else bid higher)
  useEffect(() => {
    // Don't update if user is currently editing the field
    if (hasInputFocus) return;
    
    const currentAmount = parseFloat(amount);
    const newMinimum = minimumBid;
    
    // If current amount is below new minimum, update it automatically
    if (amount === "" || isNaN(currentAmount) || currentAmount < newMinimum) {
      setAmount(newMinimum.toFixed(2));
      // Clear any validation error since we just set it to a valid value
      setValidationError(null);
    }
  }, [minimumBid, hasInputFocus]); // React to minimumBid changes (price increases)

  // Validate bid amount in real-time
  useEffect(() => {
    const bidAmount = parseFloat(amount);
    
    // Only validate if user has entered a value
    if (amount === "" || amount === ".") {
      setValidationError(null);
      return;
    }
    
    if (isNaN(bidAmount)) {
      setValidationError("Please enter a valid number");
      return;
    }
    
    if (bidAmount < minimumBid) {
      setValidationError(`Bid must be at least $${minimumBid.toFixed(2)}. Please enter a higher amount.`);
    } else {
      setValidationError(null);
    }
  }, [amount, minimumBid]);

  if (!user) {
    return (
      <div
        className="rounded-2xl border p-4 text-sm"
        style={{ borderColor: 'var(--warning-border)', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}
      >
        Please sign in to place a bid.
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !user) {
      setError("Authentication required.");
      return;
    }
    
    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount) || bidAmount < currentPrice + minimumIncrement) {
      setError(`Bid must be at least $${(currentPrice + minimumIncrement).toFixed(2)}`);
      return;
    }

    // Check wallet balance
    if (walletBalance) {
      const availableBalance = walletBalance.availableBalance;
      // Calculate incremental amount needed (bidAmount - user's previous highest bid for this auction)
      const userPreviousBid = userBidHistory
        .filter((bid) => {
          const bidder = bid.bidder;
          if (typeof bidder === "object" && bidder !== null) {
            const bidderId = (bidder as { _id?: string; id?: string })._id || (bidder as { _id?: string; id?: string }).id;
            return String(bidderId).trim() === String(user.id).trim();
          }
          return false;
        })
        .sort((a, b) => b.amount - a.amount)[0];
      
      const previousBidAmount = userPreviousBid?.amount || 0;
      const incrementalAmount = bidAmount - previousBidAmount;

      if (availableBalance < incrementalAmount) {
        setError(
          `Insufficient wallet balance. Required: $${incrementalAmount.toFixed(2)}, Available: $${availableBalance.toFixed(2)}. Please add funds to your wallet.`
        );
        return;
      }
    }

    setError(null);
    setSubmitting(true);
    try {
      await placeBid(auctionId, bidAmount, token);
      // Optimistically update isLeading state - the user just placed the highest bid
      // This will be confirmed/updated by the useEffect when currentBidder prop updates
      setIsLeading(true);
      // Reset to new minimum after successful bid (bidAmount becomes the new currentPrice)
      setAmount((bidAmount + minimumIncrement).toFixed(2));
      // Trigger reload to get updated auction with new currentBidder
      // The onSuccess callback should reload the auction data
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid");
      // If bid fails, reset isLeading based on current state
      // Don't force it to false - let the useEffect determine it based on currentBidder
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border p-5"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div>
        <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          Your Bid
        </label>
        <div className="mt-2 flex items-center gap-3">
          <span style={{ color: 'var(--muted-foreground)' }}>$</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onFocus={() => setHasInputFocus(true)}
            onBlur={(event) => {
              setHasInputFocus(false);
              // When user leaves the field, validate and potentially round to 2 decimals
              const value = event.target.value.trim();
              if (value === "" || value === ".") {
                setAmount(minimumBid.toFixed(2));
                return;
              }
              
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                // Round to 2 decimal places on blur
                setAmount(numValue.toFixed(2));
              }
            }}
            onChange={(event) => {
              const value = event.target.value;
              // Allow empty string and valid numbers (including partial decimals like "5.")
              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                setAmount(value);
                // Clear submit error when user starts typing
                if (error) {
                  setError(null);
                }
              }
            }}
            placeholder={minimumBid.toFixed(2)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
        <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Minimum allowed: ${minimumBid.toFixed(2)}
        </p>
        {validationError && (
          <p className="mt-2 text-xs font-medium" role="alert" style={{ color: 'var(--error)' }}>
            ⚠ {validationError}
          </p>
        )}
        {walletBalance && (() => {
          const bidAmount = parseFloat(amount);
          if (isNaN(bidAmount)) return null;
          
          const userPreviousBid = userBidHistory
            .filter((bid) => {
              const bidder = bid.bidder;
              if (typeof bidder === "object" && bidder !== null) {
                const bidderId = (bidder as { _id?: string; id?: string })._id || (bidder as { _id?: string; id?: string }).id;
                return String(bidderId).trim() === String(user?.id).trim();
              }
              return false;
            })
            .sort((a, b) => b.amount - a.amount)[0];
          
          const previousBidAmount = userPreviousBid?.amount || 0;
          const incrementalAmount = bidAmount - previousBidAmount;
          const availableBalance = walletBalance.availableBalance;
          
          if (incrementalAmount > 0 && availableBalance < incrementalAmount) {
            return (
              <p className="mt-2 text-xs font-medium" role="alert" style={{ color: 'var(--error)' }}>
                ⚠ Insufficient wallet balance. You need an additional ${incrementalAmount.toFixed(2)} (total bid ${bidAmount.toFixed(2)}, available ${availableBalance.toFixed(2)}).
              </p>
            );
          }
          return null;
        })()}
      </div>

      {isLeading && (
        <div 
          className="rounded-lg border p-3 text-sm"
          style={{
            borderColor: 'var(--success-border)',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)'
          }}
        >
          ✓ You are currently leading this auction
        </div>
      )}

      {!isLeading && user && currentBidder && hasUserBid && (
        <div 
          className="rounded-lg border p-3 text-sm"
          style={{
            borderColor: 'var(--warning-border)',
            backgroundColor: 'var(--warning-bg)',
            color: 'var(--warning)'
          }}
        >
          ⚠ You have been outbid
        </div>
      )}

      {error && (
        <p className="text-sm" role="alert" style={{ color: 'var(--error)' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !!validationError || amount === "" || parseFloat(amount) < minimumBid}
        className="w-full rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:bg-secondary/60 disabled:opacity-50"
      >
        {submitting ? "Placing bid..." : "Place Bid"}
      </button>
    </form>
  );
};

