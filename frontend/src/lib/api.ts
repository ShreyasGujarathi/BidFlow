import { ApiResponse, Auction, Bid, Notification, User } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

const buildHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  token?: string
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...buildHeaders(token),
        ...(init?.headers ?? {}),
      },
      credentials: "include",
    });

    if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = (await response.json()) as {
        message?: string;
        error?: string;
      };
      message = errorBody.message ?? errorBody.error ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

    const data = (await response.json()) as ApiResponse<T>;
    if (!data.success) {
      throw new Error(data.message || "Request failed");
    }
    return data.data;
  } catch (error) {
    // Handle network errors, CORS issues, or server not running
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      const errorMessage = `Unable to connect to the server at ${API_BASE_URL}. Please ensure:
1. The backend server is running (check if it's started in a separate terminal)
2. The server is accessible at ${API_BASE_URL}
3. There are no CORS or firewall issues blocking the connection`;
      throw new Error(errorMessage);
    }
    // Re-throw other errors
    throw error;
  }
}

export interface AuthPayload {
  username?: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateAuctionPayload {
  title: string;
  description: string;
  category: Auction["category"];
  startingPrice: number;
  minimumIncrement?: number;
  startTime: string;
  endTime: string;
  imageUrls?: string[];
}

export const registerUser = (payload: AuthPayload) =>
  apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginUser = (payload: AuthPayload) =>
  apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchCurrentUser = (token: string) =>
  apiFetch<User>("/api/auth/me", undefined, token);

export const fetchLiveAuctions = (category?: string) => {
  const url = category ? `/api/auctions?category=${category}` : "/api/auctions";
  return apiFetch<Auction[]>(url);
};

export const fetchAuctionById = (slugOrId: string) =>
  apiFetch<Auction>(`/api/auctions/${slugOrId}`);

export const fetchBidHistory = (auctionId: string) =>
  apiFetch<Bid[]>(`/api/auctions/${auctionId}/bids`);

export const placeBid = (
  auctionId: string,
  amount: number,
  token: string
) =>
  apiFetch<Bid>(
    `/api/auctions/${auctionId}/bids`,
    {
      method: "POST",
      body: JSON.stringify({ amount }),
    },
    token
  );

export const createAuction = (
  payload: CreateAuctionPayload,
  token: string
) =>
  apiFetch<Auction>(
    "/api/auctions",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );

export const fetchSellerDashboard = (token: string) =>
  apiFetch<{
    listings: (Auction & { bidCount?: number })[];
    activeBids: Bid[];
    analytics?: {
      totalRevenue: number;
      averageSalePrice: number;
      totalAuctions: number;
      completedAuctions: number;
      cancelledAuctions: number;
      successRate: number;
      statusBreakdown: {
        pending: number;
        live: number;
        completed: number;
        cancelled: number;
      };
      revenueTimeline: Array<{ date: string; revenue: number }>;
    };
  }>("/api/dashboard/seller", undefined, token);

export const fetchBuyerDashboard = (token: string) =>
  apiFetch<{
    activeBids: Bid[];
    wonAuctions: Auction[];
    analytics?: {
      totalBids: number;
      totalSpent: number;
      averageBidAmount: number;
      winRate: number;
      auctionsParticipated: number;
      wonCount: number;
      favoriteCategories: Array<{ category: string; count: number }>;
      biddingTimeline: Array<{ date: string; count: number }>;
      spendingTimeline: Array<{ date: string; amount: number }>;
    };
  }>("/api/dashboard/buyer", undefined, token);

export const fetchNotifications = (token: string) =>
  apiFetch<Notification[]>("/api/notifications", undefined, token);

export const markNotificationsAsRead = (token: string, ids?: string[]) =>
  apiFetch<boolean>(
    "/api/notifications/read",
    {
      method: "POST",
      body: JSON.stringify({
        ids,
      }),
    },
    token
  );

export const fetchAdminOverview = (token: string) =>
  apiFetch<{
    metrics: {
      liveAuctions: number;
      totalUsers: number;
      bidsInLast24h: number;
    };
    recentAuctions: Auction[];
  }>("/api/admin/overview", undefined, token);

export interface UpdateAuctionPayload {
  title?: string;
  description?: string;
  imageUrls?: string[];
  startingPrice?: number;
  minimumIncrement?: number;
}

export const updateAuction = (
  auctionId: string,
  payload: UpdateAuctionPayload,
  token: string
) =>
  apiFetch<Auction>(
    `/api/auctions/${auctionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token
  );

// Auto-bid API calls
export interface AutoBid {
  _id: string;
  auction: string | Auction;
  user: string | User;
  maximumBid: number;
  currentBidAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutoBidPayload {
  maximumBid: number;
}

export const createAutoBid = (
  auctionId: string,
  payload: CreateAutoBidPayload,
  token: string
) =>
  apiFetch<AutoBid>(
    `/api/auto-bids/${auctionId}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );

export const getAutoBid = (auctionId: string, token: string) =>
  apiFetch<AutoBid>(`/api/auto-bids/${auctionId}`, undefined, token);

export const deleteAutoBid = (auctionId: string, token: string) =>
  apiFetch<{ message: string }>(
    `/api/auto-bids/${auctionId}`,
    {
      method: "DELETE",
    },
    token
  );

export const getUserAutoBids = (token: string) =>
  apiFetch<AutoBid[]>("/api/auto-bids", undefined, token);

// Watchlist API
export interface WatchlistItem {
  _id: string;
  user: string | User;
  auction: string | Auction;
  createdAt: string;
  updatedAt: string;
}

export const addToWatchlist = (auctionId: string, token: string) =>
  apiFetch<WatchlistItem>(
    `/api/watchlist/${auctionId}`,
    {
      method: "POST",
    },
    token
  );

export const removeFromWatchlist = (auctionId: string, token: string) =>
  apiFetch<{ message: string }>(
    `/api/watchlist/${auctionId}`,
    {
      method: "DELETE",
    },
    token
  );

export const getUserWatchlist = (token: string) =>
  apiFetch<WatchlistItem[]>("/api/watchlist", undefined, token);

export const checkWatchlist = (auctionId: string, token: string) =>
  apiFetch<{ inWatchlist: boolean }>(
    `/api/watchlist/${auctionId}/check`,
    undefined,
    token
  );

// Upload API
export interface UploadImagesResponse {
  imageUrls: string[];
}

export const uploadImages = async (
  files: File[],
  token: string
): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      let message = `Upload failed with status ${response.status}`;
      try {
        const errorBody = (await response.json()) as {
          message?: string;
          error?: string;
        };
        message = errorBody.message ?? errorBody.error ?? message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    const data = (await response.json()) as ApiResponse<UploadImagesResponse>;
    if (!data.success) {
      throw new Error(data.message || "Upload failed");
    }

    // Convert relative URLs to absolute URLs
    return data.data.imageUrls.map((url) => {
      if (url.startsWith("http")) {
        return url;
      }
      // If it's a relative path, prepend API base URL
      return `${API_BASE_URL}${url}`;
    });
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Unable to connect to the server at ${API_BASE_URL}. Please ensure the backend server is running.`
      );
    }
    throw error;
  }
};

// User Profile API
export interface UserProfile {
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatarUrl?: string;
    createdAt: string;
  };
  stats: {
    auctionsCreated: number;
    auctionsWon: number;
    totalBidsPlaced: number;
    averageRating: number;
    ratingCount: number;
  };
  recentAuctions: Array<{
    _id: string;
    title: string;
    status: string;
    currentPrice: number;
    endTime: string;
    slug: string;
    imageUrls?: string[];
  }>;
  recentWins: Array<{
    _id: string;
    title: string;
    currentPrice: number;
    endTime: string;
    slug: string;
    imageUrls?: string[];
  }>;
  recentRatings: Array<{
    _id: string;
    rating: number;
    comment?: string;
    ratedBy: User;
    createdAt: string;
  }>;
}

export interface CreateRatingPayload {
  rating: number;
  comment?: string;
  auctionId?: string;
}

export const getUserProfile = (userId: string) =>
  apiFetch<UserProfile>(`/api/users/${userId}`);

export const createRating = (
  userId: string,
  payload: CreateRatingPayload,
  token: string
) =>
  apiFetch<{ _id: string; rating: number; comment?: string }>(
    `/api/users/${userId}/rating`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );

// Wallet API functions
export interface WalletBalance {
  walletBalance: number;
  blockedBalance: number;
  availableBalance: number;
}

export interface Transaction {
  _id: string;
  type: "deposit" | "bid_block" | "bid_release" | "bid_capture" | "refund";
  amount: number;
  description?: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  auction?: { _id: string; title: string };
}

export const addFunds = async (amount: number, token: string): Promise<{ walletBalance: number; transaction: Transaction }> => {
  return apiFetch<{ walletBalance: number; transaction: Transaction }>(
    "/api/wallet/add-funds",
    {
      method: "POST",
      body: JSON.stringify({ amount }),
    },
    token
  );
};

export const getWalletBalance = async (token: string): Promise<WalletBalance> => {
  return apiFetch<WalletBalance>("/api/wallet/balance", { method: "GET" }, token);
};

export const getTransactionHistory = async (token: string, limit: number = 50): Promise<Transaction[]> => {
  return apiFetch<Transaction[]>(`/api/wallet/transactions?limit=${limit}`, { method: "GET" }, token);
};

