'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const STATIC_ROUTES = ["/", "/dashboard", "/watchlist", "/auctions", "/wallet"];
const DASHBOARD_ROUTES = ["/dashboard", "/dashboard/buyer", "/dashboard/seller", "/dashboard/seller/create"];

export const RoutePrefetcher = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const prefetch = async (path: string) => {
      try {
        await router.prefetch(path);
      } catch {
        // Ignore prefetch failures (e.g. route not generated yet)
      }
    };

    STATIC_ROUTES.forEach(prefetch);
    DASHBOARD_ROUTES.forEach(prefetch);

    if (user?.id) {
      void prefetch(`/users/${user.id}`);
      void prefetch(`/users/${user.id}?tab=activity`);
    }
  }, [router, user?.id]);

  return null;
};


