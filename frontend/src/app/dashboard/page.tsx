'use client';

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent } from "../../components/ui/card";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {loading ? "Loading…" : "Redirecting to login…"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8" style={{ backgroundColor: 'var(--background)' }}>
      <header className="rounded-[32px] border border-[var(--card-border)] bg-[var(--card)]/80 p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'var(--muted-foreground)' }}>
            Control center
          </p>
          <h1 className="mt-2 text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
            Dashboard
          </h1>
          <p className="mt-2 text-base" style={{ color: 'var(--muted-foreground)' }}>
            Manage listings, bids, and analytics from a single place.
          </p>
        </div>
        <Link
          href="/dashboard/seller/create"
          prefetch={true}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--primary)] via-[#5b73ff] to-[#7c3bff] px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 sm:mt-0"
        >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create auction
        </Link>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/dashboard/buyer" prefetch={true} className="group block h-full">
          <Card className="h-full overflow-hidden border border-[var(--card-border)]">
            <CardContent className="relative flex h-full flex-col gap-6 p-8">
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3ba7ff]/15 to-transparent" />
              </div>
              <div className="relative mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--info-bg)] text-[var(--info)] transition-transform group-hover:-translate-y-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div className="relative flex flex-col gap-2">
                <h2 className="text-2xl font-bold transition-colors group-hover:text-[var(--primary)]">
                  Buyer dashboard
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  Monitor high-stakes bids, watchlists, and realtime analytics.
                </p>
              </div>
              <div className="relative mt-auto flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition-all group-hover:gap-3">
                <span>View dashboard</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/seller" prefetch={true} className="group block h-full">
          <Card className="h-full overflow-hidden border border-[var(--card-border)]">
            <CardContent className="relative flex h-full flex-col gap-6 p-8">
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f6c350]/15 to-transparent" />
              </div>
              <div className="relative mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--success-bg)] text-[var(--success)] transition-transform group-hover:-translate-y-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="relative flex flex-col gap-2">
                <h2 className="text-2xl font-bold transition-colors group-hover:text-[var(--primary)]">
                  Seller dashboard
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  Launch listings, track conversions, and review payout insights.
                </p>
              </div>
              <div className="relative mt-auto flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition-all group-hover:gap-3">
                <span>View dashboard</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

