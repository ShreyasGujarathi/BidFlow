'use client';

import { FormEvent, useEffect, useState } from "react";
import { createAutoBid, getAutoBid, deleteAutoBid, type AutoBid } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Auction } from "../../lib/types";

interface AutoBidFormProps {
  auction: Auction;
  onUpdate?: () => void;
}

export const AutoBidForm = ({ auction, onUpdate }: AutoBidFormProps) => {
  const { token, user } = useAuth();
  const [autoBid, setAutoBid] = useState<AutoBid | null>(null);
  const [maximumBid, setMaximumBid] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  const isLive = auction.status === "live";
  const minimumBid = auction.currentPrice + auction.minimumIncrement;

  // Load existing auto-bid
  useEffect(() => {
    if (!token || !auction._id) return;

    const loadAutoBid = async () => {
      try {
        setFetching(true);
        const data = await getAutoBid(auction._id, token);
        setAutoBid(data);
        setMaximumBid(data.maximumBid.toFixed(2));
      } catch (err) {
        // Auto-bid not found is fine - just means user doesn't have one set
        if (err instanceof Error && !err.message.includes("not found")) {
          console.error("Failed to load auto-bid:", err);
        }
        setAutoBid(null);
      } finally {
        setFetching(false);
      }
    };

    void loadAutoBid();
  }, [token, auction._id]);

  // Update form when auction price changes and reload auto-bid to check status
  useEffect(() => {
    if (!autoBid || !token) return;
    
    const checkAutoBidStatus = async () => {
      try {
        // Reload auto-bid to get latest status from backend
        const updated = await getAutoBid(auction._id, token);
        if (!updated) {
          // Auto-bid was removed/deactivated
          setAutoBid(null);
          setMaximumBid("");
          return;
        }
        setAutoBid(updated);
        
        const newMinimum = auction.currentPrice + auction.minimumIncrement;
        // If current max bid is less than new minimum, it's been exceeded
        if (updated.maximumBid < newMinimum || !updated.isActive) {
          // Auto-bid has been exceeded or deactivated
          // Don't clear it, just keep showing the warning
          return;
        }
      } catch (err) {
        // Auto-bid not found - it was removed
        if (err instanceof Error && err.message.includes("not found")) {
          setAutoBid(null);
          setMaximumBid("");
        }
      }
    };
    
    void checkAutoBidStatus();
  }, [auction.currentPrice, auction.minimumIncrement, auction._id, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !user) {
      setError("Authentication required.");
      return;
    }

    const amount = parseFloat(maximumBid);
    if (isNaN(amount) || amount < minimumBid) {
      setError(`Maximum bid must be at least $${minimumBid.toFixed(2)}`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (autoBid) {
        // Update existing auto-bid
        await createAutoBid(auction._id, { maximumBid: amount }, token);
        const updated = await getAutoBid(auction._id, token);
        setAutoBid(updated);
      } else {
        // Create new auto-bid
        const newAutoBid = await createAutoBid(
          auction._id,
          { maximumBid: amount },
          token
        );
        setAutoBid(newAutoBid);
      }
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set auto-bid");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!token || !auction._id || !autoBid) return;

    setError(null);
    setLoading(true);

    try {
      await deleteAutoBid(auction._id, token);
      setAutoBid(null);
      setMaximumBid("");
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove auto-bid");
    } finally {
      setLoading(false);
    }
  };

  if (!isLive) {
    return null;
  }

  if (fetching) {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}
      >
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading auto-bid settings...</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}
    >
      <div className="mb-3 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Auto-Bid</h3>
      </div>

      <p className="mb-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        Set a maximum bid amount. We'll automatically bid for you up to this limit
        when others place bids.
      </p>

      {autoBid ? (
        <div className="space-y-3">
          {/* Check if maximum bid has been exceeded */}
          {(() => {
            const currentMinimum = auction.currentPrice + auction.minimumIncrement;
            const isExceeded = autoBid.maximumBid < currentMinimum || !autoBid.isActive;
            
            return (
              <>
                {isExceeded && (
                  <div className="rounded-lg border p-3" style={{ borderColor: 'var(--error-border)', backgroundColor: 'var(--error-bg)' }}>
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 flex-shrink-0 mt-0.5"
                        style={{ color: 'var(--error)' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: 'var(--error)' }}>
                          Auto-Bid Limit Exceeded
                        </p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                          Your maximum bid amount of ${autoBid.maximumBid.toFixed(2)} has been exceeded. 
                          The current minimum bid is ${currentMinimum.toFixed(2)}. 
                          Auto-bidding has been stopped.
                        </p>
                        <p className="mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          Update your maximum bid to continue auto-bidding.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div
                  className="rounded-lg border p-3"
                  style={{
                    borderColor: isExceeded ? 'var(--warning-border)' : 'var(--success-border)',
                    backgroundColor: isExceeded ? 'var(--warning-bg)' : 'var(--success-bg)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Current Maximum Bid</p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: isExceeded ? 'var(--warning)' : 'var(--success)' }}
                      >
                        ${autoBid.maximumBid.toFixed(2)}
                      </p>
                      {autoBid.currentBidAmount > 0 && (
                        <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          Last bid placed: ${autoBid.currentBidAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    {!autoBid.isActive && (
                      <span className="rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}>
                        Stopped
                      </span>
                    )}
                    {autoBid.isActive && !isExceeded && (
                      <span className="rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </>
            );
          })()}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                Update Maximum Bid
              </label>
              <div className="mt-2 flex items-center gap-2">
                <span style={{ color: 'var(--muted-foreground)' }}>$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={maximumBid}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setMaximumBid(value);
                    }
                  }}
                  placeholder={minimumBid.toFixed(2)}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
              >
                {loading ? "Updating..." : "Update"}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: 'var(--error-border)',
                  backgroundColor: 'var(--error-bg)',
                  color: 'var(--error)',
                }}
              >
                Remove
              </button>
            </div>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
              Maximum Bid Amount
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span style={{ color: 'var(--muted-foreground)' }}>$</span>
              <input
                type="text"
                inputMode="decimal"
                value={maximumBid}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setMaximumBid(value);
                  }
                }}
                placeholder={minimumBid.toFixed(2)}
                required
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Minimum: ${minimumBid.toFixed(2)}
            </p>
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--error)' }} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            {loading ? "Setting..." : "Enable Auto-Bid"}
          </button>
        </form>
      )}
    </div>
  );
};

