export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type AuctionStatus = "pending" | "live" | "completed" | "cancelled";
export type AuctionCategory =
  | "Art"
  | "Collectibles"
  | "Electronics"
  | "Vehicles"
  | "Jewelry"
  | "Antiques"
  | "Sports"
  | "Books"
  | "Home & Garden"
  | "Fashion"
  | "Toys & Games";

export interface Auction {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: AuctionCategory;
  startingPrice: number;
  minimumIncrement: number;
  currentPrice: number;
  currentBidder?: string | User;
  seller: User;
  status: AuctionStatus;
  startTime: string;
  endTime: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  _id: string;
  amount: number;
  bidder: User;
  auction: string | Auction;
  createdAt: string;
}

export type NotificationType =
  | "bid_outbid"
  | "bid_won"
  | "bid_received"
  | "auction_live"
  | "auction_completed"
  | "system";

export interface Notification {
  _id: string;
  user: string | User;
  type: NotificationType;
  message: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

