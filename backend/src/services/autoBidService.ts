import { Types } from "mongoose";
import { AutoBid, IAutoBidDocument } from "../models/AutoBid";
import { AuctionItem } from "../models/AuctionItem";
import { Bid } from "../models/Bid";
import { placeBid } from "./bidService";
import { NotFoundError } from "../utils/errors";

/**
 * Create or update an auto-bid for a user on an auction
 */
export const setAutoBid = async (
  auctionId: string,
  userId: Types.ObjectId,
  maximumBid: number
) => {
  const auction = await AuctionItem.findById(auctionId);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }

  if (auction.status !== "live") {
    throw new Error("Auto-bid can only be set on live auctions");
  }

  if (auction.seller.toString() === userId.toString()) {
    throw new Error("Sellers cannot set auto-bids on their own auctions");
  }

  const minimumIncrement = Math.max(auction.minimumIncrement, 1);
  const nextRequiredBid = auction.currentPrice + minimumIncrement;

  if (maximumBid < nextRequiredBid) {
    throw new Error(
      `Maximum bid must be at least $${nextRequiredBid.toFixed(2)} (current price + minimum increment)`
    );
  }

  // Check if auto-bid already exists
  let autoBid = await AutoBid.findOne({
    auction: auction._id,
    user: userId,
  });

  if (autoBid) {
    // Update existing auto-bid
    autoBid.maximumBid = maximumBid;
    autoBid.isActive = true;
    await autoBid.save();
  } else {
    // Create new auto-bid
    autoBid = await AutoBid.create({
      auction: auction._id,
      user: userId,
      maximumBid,
      currentBidAmount: 0,
      isActive: true,
    });
  }

  return autoBid;
};

/**
 * Remove auto-bid for a user on an auction
 */
export const removeAutoBid = async (
  auctionId: string,
  userId: Types.ObjectId
) => {
  const autoBid = await AutoBid.findOneAndUpdate(
    {
      auction: auctionId,
      user: userId,
    },
    { isActive: false },
    { new: true }
  );

  if (!autoBid) {
    throw new NotFoundError("Auto-bid not found");
  }

  return autoBid;
};

/**
 * Get auto-bid for a user on an auction (including inactive ones)
 */
export const getAutoBid = async (
  auctionId: string,
  userId: Types.ObjectId
) => {
  return AutoBid.findOne({
    auction: auctionId,
    user: userId,
    // Don't filter by isActive - return even if inactive so frontend can show exceeded message
  }).lean();
};

/**
 * Process auto-bids when a new bid is placed
 * This should be called after a manual bid is placed
 * @param auctionId - The auction ID
 * @param depth - Current recursion depth (internal use, defaults to 0)
 * @param maxDepth - Maximum recursion depth to prevent infinite loops (defaults to 10)
 */
export const processAutoBids = async (
  auctionId: string,
  depth: number = 0,
  maxDepth: number = 10
) => {
  // Prevent infinite loops
  if (depth >= maxDepth) {
    return;
  }

  const auction = await AuctionItem.findById(auctionId);
  if (!auction || auction.status !== "live") {
    return;
  }

  const minimumIncrement = Math.max(auction.minimumIncrement, 1);
  const nextRequiredBid = auction.currentPrice + minimumIncrement;

  // Find all active auto-bids for this auction
  const autoBids = await AutoBid.find({
    auction: auction._id,
    isActive: true,
    maximumBid: { $gte: nextRequiredBid },
  })
    .populate("user")
    .sort({ maximumBid: -1, createdAt: 1 }) // Highest max bid first, then oldest first
    .lean();

  if (autoBids.length === 0) {
    return;
  }

  // Get the current highest bidder ID
  const currentBidderId = auction.currentBidder?.toString();

  // Find the best auto-bid that can bid (not the current bidder)
  for (const autoBid of autoBids) {
    const autoBidUser = autoBid.user as { _id: Types.ObjectId };
    const autoBidUserId = autoBidUser._id.toString();

    // Skip if this user is already the current highest bidder
    if (currentBidderId === autoBidUserId) {
      continue;
    }

    // Check if auto-bid can place the required bid
    if (autoBid.maximumBid >= nextRequiredBid) {
      try {
        // Place bid automatically - use the minimum required bid amount
        await placeBid(auctionId, autoBidUser._id, nextRequiredBid);

        // Update auto-bid's current bid amount
        await AutoBid.findByIdAndUpdate(autoBid._id, {
          currentBidAmount: nextRequiredBid,
        });

        // Reload auction to get updated price after the auto-bid
        const updatedAuction = await AuctionItem.findById(auctionId);
        if (!updatedAuction || updatedAuction.status !== "live") {
          return;
        }

        // Check if auto-bid reached its maximum (next bid would exceed max)
        const newMinimumIncrement = Math.max(updatedAuction.minimumIncrement, 1);
        const newNextRequiredBid = updatedAuction.currentPrice + newMinimumIncrement;
        
        if (newNextRequiredBid > autoBid.maximumBid) {
          // Auto-bid reached its maximum, deactivate it
          await AutoBid.findByIdAndUpdate(autoBid._id, { isActive: false });
        }

        // Only process one auto-bid per call to avoid conflicts
        // If price changed, process again for other auto-bids (recursively)
        if (updatedAuction.currentPrice > auction.currentPrice) {
          // Small delay to ensure auction state is saved
          await new Promise((resolve) => setTimeout(resolve, 100));
          // Recursively process remaining auto-bids
          await processAutoBids(auctionId, depth + 1, maxDepth);
        }

        return;
      } catch (error) {
        // If bid fails (e.g., auction ended, validation error), deactivate auto-bid
        console.error("Auto-bid failed:", error);
        await AutoBid.findByIdAndUpdate(autoBid._id, { isActive: false });
        continue;
      }
    }
  }
};

/**
 * Get all active auto-bids for a user
 */
export const getUserAutoBids = async (userId: Types.ObjectId) => {
  return AutoBid.find({
    user: userId,
    isActive: true,
  })
    .populate("auction", "title status currentPrice endTime minimumIncrement")
    .sort({ createdAt: -1 })
    .lean();
};

