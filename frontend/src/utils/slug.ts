/**
 * Generates a URL-friendly slug from a string (matches backend logic)
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

import { AuctionReference } from "../lib/types";

/**
 * Creates an auction URL from auction data
 */
export const getAuctionUrl = (auction: AuctionReference | { _id: string; slug?: string; title?: string }): string => {
  const slug = auction.slug || (auction.title ? generateSlug(auction.title) : "");
  if (!slug) {
    // Fallback to ID-only if no slug or title
    return `/auctions/${auction._id}`;
  }
  return `/auctions/${slug}-${auction._id}`;
};

