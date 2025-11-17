'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WatchedAuctions } from "../../components/watchlist/WatchedAuctions";
import { useAuth } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import { mutate } from 'swr';

export default function WatchlistPage() {
  const { user, token, loading } = useAuth();
  const { socket } = useSocketContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!socket || !token) return;
    
    // Refresh watchlist when auction updates occur
    const handleUpdate = () => {
      // Revalidate watchlist data using SWR
      mutate(['/api/watchlist', token]);
    };

    socket.on("auction:update", handleUpdate);
    socket.on("auction:finalized", handleUpdate);
    
    return () => {
      socket.off("auction:update", handleUpdate);
      socket.off("auction:finalized", handleUpdate);
    };
  }, [socket, token]);

  if (!user) {
    return <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Redirecting to login…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8" style={{ backgroundColor: 'var(--background)' }}>
      <section className="rounded-[32px] border border-[var(--card-border)] bg-[var(--card)]/80 p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'var(--muted-foreground)' }}>
          Personal radar
        </p>
        <h1 className="mt-2 text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Watchlist
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Save auctions you care about and get realtime nudges before they close.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--muted-foreground)' }}>
          <span className="rounded-full border border-[var(--border)] px-4 py-1">
            Ending soon alerts
          </span>
          <span className="rounded-full border border-[var(--border)] px-4 py-1">
            Smart reminders
          </span>
          <span className="rounded-full border border-[var(--border)] px-4 py-1">
            Realtime sync
          </span>
        </div>
      </section>

      <WatchedAuctions />
    </div>
  );
}

