'use client';

import { useState, useEffect } from "react";
import { addToWatchlist, removeFromWatchlist, checkWatchlist } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface WatchlistButtonProps {
  auctionId: string;
  size?: 'sm' | 'md' | 'lg';
  onToggle?: () => void;
}

export const WatchlistButton = ({ auctionId, size = 'md', onToggle }: WatchlistButtonProps) => {
  const { token, user } = useAuth();
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      setChecking(false);
      return;
    }

    const check = async () => {
      try {
        const result = await checkWatchlist(auctionId, token);
        setIsWatched(result.inWatchlist);
      } catch (error) {
        console.error("Failed to check watchlist status", error);
      } finally {
        setChecking(false);
      }
    };

    void check();
  }, [auctionId, token, user]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !user) {
      return;
    }

    setLoading(true);
    try {
      if (isWatched) {
        await removeFromWatchlist(auctionId, token);
        setIsWatched(false);
      } else {
        await addToWatchlist(auctionId, token);
        setIsWatched(true);
      }
      onToggle?.();
    } catch (error) {
      console.error("Failed to update watchlist", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || checking) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-8 w-8 p-1.5',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-2.5',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-full border transition ${sizeClasses[size]} disabled:cursor-not-allowed disabled:opacity-50`}
      style={{
        borderColor: isWatched ? 'var(--warning-border)' : 'var(--border)',
        backgroundColor: isWatched ? 'var(--warning-bg)' : 'var(--background)',
        color: isWatched ? 'var(--warning)' : 'var(--muted-foreground)'
      }}
      onMouseEnter={(e) => {
        if (!isWatched) {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.color = 'var(--primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isWatched) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--muted-foreground)';
        }
      }}
      title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
      aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {loading ? (
        <svg
          className="h-full w-full animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          fill={isWatched ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </button>
  );
};

