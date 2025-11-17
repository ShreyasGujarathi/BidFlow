import useSWR from 'swr';
import { API_BASE_URL } from './api';

// SWR fetcher function
const fetcher = async (url: string, token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }

  const data = await response.json();
  return data.success ? data.data : data;
};

// Custom hooks for API endpoints
export const useAuctions = (category?: string) => {
  const url = category ? `/api/auctions?category=${category}` : '/api/auctions';
  return useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });
};

export const useAuction = (slugOrId: string) => {
  return useSWR(`/api/auctions/${slugOrId}`, fetcher, {
    revalidateOnFocus: false,
  });
};

export const useBidHistory = (auctionId: string) => {
  return useSWR(`/api/auctions/${auctionId}/bids`, fetcher, {
    revalidateOnFocus: false,
  });
};

export const useWatchlist = (token?: string) => {
  return useSWR(
    token ? ['/api/watchlist', token] : null,
    ([url, t]) => fetcher(url, t),
    {
      revalidateOnFocus: false,
    }
  );
};

export const useBuyerDashboard = (token?: string) => {
  return useSWR(
    token ? ['/api/dashboard/buyer', token] : null,
    ([url, t]) => fetcher(url, t),
    {
      revalidateOnFocus: false,
    }
  );
};

export const useSellerDashboard = (token?: string) => {
  return useSWR(
    token ? ['/api/dashboard/seller', token] : null,
    ([url, t]) => fetcher(url, t),
    {
      revalidateOnFocus: false,
    }
  );
};

export const useAdminOverview = (token?: string) => {
  return useSWR(
    token ? ['/api/admin/overview', token] : null,
    ([url, t]) => fetcher(url, t),
    {
      revalidateOnFocus: false,
    }
  );
};

export const useUserProfile = (userId: string) => {
  return useSWR(`/api/users/${userId}`, fetcher, {
    revalidateOnFocus: false,
  });
};

export const useNotifications = (token?: string) => {
  return useSWR(
    token ? ['/api/notifications', token] : null,
    ([url, t]) => fetcher(url, t),
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );
};

export const useWalletBalance = (token?: string) => {
  return useSWR(
    token ? ['/api/wallet/balance', token] : null,
    ([url, t]) => fetcher(url, t),
    {
      revalidateOnFocus: true,
      refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
      keepPreviousData: true, // Keep previous data while fetching new data
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
    }
  );
};

export const useTransactionHistory = (token?: string, limit: number = 50) => {
  return useSWR(
    token ? [`/api/wallet/transactions?limit=${limit}`, token] : null,
    ([url, t]) => fetcher(url, t),
    {
      revalidateOnFocus: false,
      keepPreviousData: true, // Keep previous data while fetching new data
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );
};

