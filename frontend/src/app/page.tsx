'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Auction } from "../lib/types";
import { AuctionCard } from "../components/auctions/AuctionCard";
import { useSocketContext } from "../context/SocketContext";
import { useAuctions } from "../lib/swr";
import { mutate } from 'swr';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const categories: Array<{ label: string; value?: string }> = [
  { label: "All", value: undefined },
  { label: "Art", value: "Art" },
  { label: "Collectibles", value: "Collectibles" },
  { label: "Electronics", value: "Electronics" },
  { label: "Vehicles", value: "Vehicles" },
  { label: "Jewelry", value: "Jewelry" },
  { label: "Antiques", value: "Antiques" },
  { label: "Sports", value: "Sports" },
  { label: "Books", value: "Books" },
  { label: "Home & Garden", value: "Home & Garden" },
  { label: "Fashion", value: "Fashion" },
  { label: "Toys & Games", value: "Toys & Games" },
];

const heroStats = [
  { label: "Live Auctions", value: "180+", meta: "Curated daily drops" },
  { label: "Avg. Bid Speed", value: "220ms", meta: "Realtime socket updates" },
  { label: "Trusted Sellers", value: "2.4k", meta: "Verified worldwide" },
];

export default function HomePage() {
  const { socket, joinAuction, leaveAuction } = useSocketContext();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data: auctions = [], error, isLoading } = useAuctions(category);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (updated: Auction) => {
      // Revalidate auctions data when an update occurs
      const url = category ? `/api/auctions?category=${category}` : '/api/auctions';
      const now = new Date();
      const endTime = new Date(updated.endTime);
      const shouldRemove = updated.status !== "live" || endTime <= now;
      
      mutate(url, (current: Auction[] | undefined) => {
        if (!current) return current;
        const exists = current.some((auction) => auction._id === updated._id);
        if (!exists) {
          // If auction doesn't exist and should be shown, add it
          if (!shouldRemove) return [...current, updated];
          return current;
        }
        // If auction should be removed (completed or ended), filter it out
        if (shouldRemove) {
          return current.filter((auction: Auction) => auction._id !== updated._id);
        }
        // Otherwise update it
        return current.map((auction: Auction) =>
          auction._id === updated._id ? { ...auction, ...updated } : auction
        );
      }, false);
    };

    const handleFinalized = (payload: {
      auctionId: string;
      winner: { id: string; username: string; amount: number } | null;
    }) => {
      const url = category ? `/api/auctions?category=${category}` : '/api/auctions';
      // Remove finalized auction from the list
      mutate(url, (current: Auction[] | undefined) => {
        if (!current) return current;
        return current.filter((auction: Auction) => auction._id !== payload.auctionId);
      }, false);
    };

    socket.on("auction:update", handleUpdate);
    socket.on("auction:finalized", handleFinalized);
    return () => {
      socket.off("auction:update", handleUpdate);
      socket.off("auction:finalized", handleFinalized);
    };
  }, [socket, category]);

  const joinedRoomsKey = useMemo(
    () => {
      const now = new Date();
      return auctions
        .filter((auction: Auction) => {
          const endTime = new Date(auction.endTime);
          return auction.status === "live" && endTime > now;
        })
        .map((auction: Auction) => auction._id)
        .join("|");
    },
    [auctions]
  );

  useEffect(() => {
    if (!joinedRoomsKey) return;
    const auctionIds = joinedRoomsKey.split("|").filter(Boolean);
    auctionIds.forEach((id: string) => joinAuction(id));
    return () => {
      auctionIds.forEach((id: string) => leaveAuction(id));
    };
  }, [joinedRoomsKey, joinAuction, leaveAuction]);

  const filteredAuctions = auctions.filter((auction: Auction) => {
    const now = new Date();
    const endTime = new Date(auction.endTime);
    return auction.status === "live" && endTime > now;
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10" style={{ backgroundColor: 'var(--background)' }}>
      <section
        className="relative overflow-hidden rounded-[32px] border border-[var(--card-border)] bg-[var(--hero-gradient)] px-6 py-12 text-center"
        style={{ boxShadow: 'var(--hero-shadow)', color: 'var(--hero-foreground)' }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-[#8dc5ff] blur-3xl" />
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#ffe1a1] blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center gap-6">
          <span
            className="inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
            style={{
              backgroundColor: 'var(--hero-chip-bg)',
              borderColor: 'var(--hero-chip-border)',
              color: 'var(--hero-chip-foreground)',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            Premium live marketplace
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Fast, modern, and cinematic bidding for rare finds
          </h1>
          <p className="max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--muted-foreground)' }}>
            Curated auctions, lightning-fast socket updates, and responsive UI crafted for recruiters and collectors alike.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => {
                const section = document.getElementById("live-auctions");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Explore live auctions
            </Button>
            <Link href="/dashboard/seller/create" prefetch className="inline-flex">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-[var(--border)] bg-[var(--surface)]/60 text-[var(--foreground)] hover:bg-[var(--surface)]/90"
              >
                List your item
              </Button>
            </Link>
          </div>
          <div className="grid w-full gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-6 text-left sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--muted-foreground)' }}>
                  {stat.label}
                </p>
                <p className="text-3xl font-bold" style={{ color: 'var(--hero-foreground)' }}>{stat.value}</p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{stat.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="live-auctions" className="space-y-6 rounded-[32px] border border-[var(--card-border)] bg-[var(--card)]/80 p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
              Live right now
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
              Live auctions
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Filter by category and jump into the action instantly.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Button
              key={item.label}
              onClick={() => setCategory(item.value)}
              variant={category === item.value ? "default" : "outline"}
              size="sm"
              className={cn(
                "transition-all duration-200",
                category !== item.value && "hover:-translate-y-0.5"
              )}
              style={category === item.value ? { boxShadow: 'var(--accent-glow)' } : undefined}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {isLoading && (
          <Card className="border-dashed">
            <CardContent className="flex min-h-[220px] items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--primary)' }} />
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading auctions…</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-dashed" style={{ borderColor: 'var(--error-border)', backgroundColor: 'var(--error-bg)' }}>
            <CardContent className="py-6">
              <p className="text-sm font-medium text-center" role="alert" style={{ color: 'var(--error)' }}>
                {error instanceof Error ? error.message : "Failed to load auctions"}
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && filteredAuctions.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}

        {!isLoading && !error && filteredAuctions.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--surface)' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  style={{ color: 'var(--muted-foreground)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                No live auctions found
              </h3>
              <p className="max-w-md text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {category
                  ? `No active auctions in the "${category}" category. Try selecting a different category.`
                  : "There are currently no live auctions. Check back soon!"}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

