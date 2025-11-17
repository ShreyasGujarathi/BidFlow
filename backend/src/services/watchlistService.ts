import { Types } from "mongoose";
import { Watchlist } from "../models/Watchlist";
import { AuctionItem } from "../models/AuctionItem";
import { NotFoundError } from "../utils/errors";

/**
 * Add an auction to user's watchlist
 */
export const addToWatchlist = async (
  auctionId: string,
  userId: Types.ObjectId
) => {
  const auction = await AuctionItem.findById(auctionId);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }

  // Check if already in watchlist
  const existing = await Watchlist.findOne({
    user: userId,
    auction: auction._id,
  });

  if (existing) {
    return existing;
  }

  const watchlistItem = await Watchlist.create({
    user: userId,
    auction: auction._id,
  });

  return watchlistItem;
};

/**
 * Remove an auction from user's watchlist
 */
export const removeFromWatchlist = async (
  auctionId: string,
  userId: Types.ObjectId
) => {
  const result = await Watchlist.findOneAndDelete({
    user: userId,
    auction: auctionId,
  });

  if (!result) {
    throw new NotFoundError("Auction not found in watchlist");
  }

  return result;
};

/**
 * Get user's watchlist
 */
export const getUserWatchlist = async (userId: Types.ObjectId) => {
  const watchlistItems = await Watchlist.find({ user: userId })
    .populate("auction", "title description category currentPrice endTime status imageUrls slug")
    .sort({ createdAt: -1 })
    .lean();

  return watchlistItems;
};

/**
 * Check if auction is in user's watchlist
 */
export const isInWatchlist = async (
  auctionId: string,
  userId: Types.ObjectId
) => {
  const watchlistItem = await Watchlist.findOne({
    user: userId,
    auction: auctionId,
  });

  return !!watchlistItem;
};

/**
 * Get watched auctions that are ending soon (within 1 hour)
 */
export const getWatchedAuctionsEndingSoon = async (userId: Types.ObjectId) => {
  const oneHourFromNow = new Date();
  oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

  const watchlistItems = await Watchlist.find({ user: userId })
    .populate({
      path: "auction",
      match: {
        status: "live",
        endTime: { $lte: oneHourFromNow, $gte: new Date() },
      },
      select: "title endTime status currentPrice slug",
    })
    .lean();

  // Filter out null auctions (those that don't match the populate match condition)
  return watchlistItems.filter(
    (item) => item.auction && typeof item.auction === "object"
  );
};

