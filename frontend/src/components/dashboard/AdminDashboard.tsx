'use client';

import { Auction } from "../../lib/types";
import { format } from "date-fns";

interface AdminDashboardProps {
  metrics: {
    liveAuctions: number;
    totalUsers: number;
    bidsInLast24h: number;
  };
  recentAuctions: Auction[];
}

const metricCards = [
  {
    key: "liveAuctions",
    label: "Live Auctions",
    color: "from-green-500/60 via-green-500/40 to-transparent",
  },
  {
    key: "totalUsers",
    label: "Registered Users",
    color: "from-blue-500/60 via-blue-500/40 to-transparent",
  },
  {
    key: "bidsInLast24h",
    label: "Bids (24h)",
    color: "from-orange-500/60 via-orange-500/40 to-transparent",
  },
] as const;

export const AdminDashboard = ({
  metrics,
  recentAuctions,
}: AdminDashboardProps) => {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        {metricCards.map((metric: { key: string; label: string; color: string }) => (
          <div
            key={metric.key}
            className="rounded-2xl border p-5 shadow-lg"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <p className="text-sm uppercase" style={{ color: 'var(--muted-foreground)' }}>{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {metrics[metric.key]}
            </p>
            <div
              className={`mt-4 h-2 rounded-full bg-gradient-to-r ${metric.color}`}
            />
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Recent Auctions</h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Track the latest activity across the platform.
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
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wide">
                  Ends
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentAuctions.map((auction: Auction) => (
                <tr key={auction._id} className="hover:bg-border/20">
                  <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{auction.title}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>
                    {auction.category}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{auction.status}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>
                    {format(new Date(auction.endTime), "MMM d, HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentAuctions.length === 0 && (
            <p className="p-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No auctions found.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

