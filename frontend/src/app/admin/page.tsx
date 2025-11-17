'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminOverview } from "../../lib/api";
import { AdminDashboard } from "../../components/dashboard/AdminDashboard";
import { Auction } from "../../lib/types";

export default function AdminPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{
    metrics: {
      liveAuctions: number;
      totalUsers: number;
      bidsInLast24h: number;
    };
    recentAuctions: Auction[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!token || !user || user.role !== "admin") return;
    const load = async () => {
      try {
        const overview = await fetchAdminOverview(token);
        setData(overview);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load admin data"
        );
      }
    };
    void load();
  }, [token, user]);

  if (!user || user.role !== "admin") {
    return <p className="text-sm text-gray-400">Checking permissions…</p>;
  }

  if (!data) {
    return <p className="text-sm text-gray-400">Loading admin panel…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
        <p className="text-sm text-gray-400">
          Monitor platform performance in real time.
        </p>
      </header>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <AdminDashboard
        metrics={data.metrics}
        recentAuctions={data.recentAuctions}
      />
    </div>
  );
}

