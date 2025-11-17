'use client';

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { BuyerDashboard } from "../../../components/dashboard/BuyerDashboard";
import { useAuth } from "../../../context/AuthContext";
import { useSocketContext } from "../../../context/SocketContext";
import { useBuyerDashboard } from "../../../lib/swr";
import { mutate } from 'swr';

// Dynamic import for heavy analytics component
const BuyerAnalytics = dynamic(
  () => import("../../../components/dashboard/BuyerAnalytics").then(mod => ({ default: mod.BuyerAnalytics })),
  {
    loading: () => (
      <div className="rounded-xl border p-6 animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="h-8 w-48 rounded mb-6" style={{ backgroundColor: 'var(--surface)' }} />
        <div className="space-y-4">
          <div className="h-64 rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
          <div className="h-64 rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function BuyerDashboardPage() {
  const { user, token, loading, initialized } = useAuth();
  const { socket } = useSocketContext();
  const router = useRouter();
  const { data, error, isLoading } = useBuyerDashboard(token || undefined);

  useEffect(() => {
    if (!initialized || loading) return;
    if (!token) {
      router.replace("/auth/login");
    }
  }, [token, loading, initialized, router]);

  useEffect(() => {
    if (!socket || !token) return;
    const refresh = () => {
      // Revalidate dashboard data using SWR
      mutate(['/api/dashboard/buyer', token]);
    };
    socket.on("auction:update", refresh);
    socket.on("auction:finalized", refresh);
    return () => {
      socket.off("auction:update", refresh);
      socket.off("auction:finalized", refresh);
    };
  }, [socket, token]);

  if (!initialized || loading) {
    return <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading dashboard…</p>;
  }

  if (!token) {
    return null;
  }

  if (isLoading) {
    return <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading dashboard…</p>;
  }

  if (!data) {
    return <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No data available.</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Buyer Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Track your bids, wins, and notifications in one place.
        </p>
      </header>

      {error && (
        <p className="text-sm" role="alert" style={{ color: 'var(--error)' }}>
          {error instanceof Error ? error.message : "Failed to load dashboard"}
        </p>
      )}

      {/* Analytics Section */}
      {data.analytics && (
        <section
          className="rounded-2xl border p-6"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}
        >
          <h2 className="mb-6 text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>Bid History Analytics</h2>
          <Suspense fallback={
            <div className="rounded-xl border p-6 animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
              <div className="h-8 w-48 rounded mb-6" style={{ backgroundColor: 'var(--surface)' }} />
              <div className="space-y-4">
                <div className="h-64 rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
                <div className="h-64 rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
              </div>
            </div>
          }>
            <BuyerAnalytics analytics={data.analytics} />
          </Suspense>
        </section>
      )}

      <BuyerDashboard
        activeBids={data.activeBids}
        wonAuctions={data.wonAuctions}
      />
    </div>
  );
}

