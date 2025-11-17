import { FilterQuery, Types } from "mongoose";
import { AuctionItem, IAuctionItem, IAuctionItemDocument } from "../models/AuctionItem";
import { Bid } from "../models/Bid";
import { User } from "../models/User";
import { getIo } from "../config/socket";
import { sendNotification } from "./notificationService";
import { NotFoundError } from "../utils/errors";
import { generateSlug, generateUniqueSlug } from "../utils/slug";
import {
  captureWinningBid,
  releaseAllFundsForAuction,
  ensureAuctionFundsReleased,
} from "./walletService";

export const createAuction = async (
  payload: Omit<
    IAuctionItem,
    "seller" | "currentPrice" | "status" | "currentBidder" | "slug"
  > & { imageUrls?: string[] },
  sellerId: Types.ObjectId
) => {
  const startTime = new Date(payload.startTime);
  const endTime = new Date(payload.endTime);

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new Error("Invalid start or end time");
  }

  // Generate unique slug from title
  const baseSlug = generateSlug(payload.title);
  const slug = await generateUniqueSlug(
    baseSlug,
    async (s) => {
      const existing = await AuctionItem.findOne({ slug: s });
      return !!existing;
    }
  );

  const auction = await AuctionItem.create({
    ...payload,
    slug,
    seller: sellerId,
    imageUrls: payload.imageUrls ?? [],
    currentPrice: payload.startingPrice,
    status: startTime <= new Date() ? "live" : "pending",
  });

  return auction;
};

export const listAuctions = async (
  filter: FilterQuery<IAuctionItemDocument> = {},
  limit = 20
) => {
  return AuctionItem.find(filter)
    .sort({ endTime: 1 })
    .limit(limit)
    .populate("seller", "username role avatarUrl")
    .lean();
};

export const getAuctionById = async (auctionId: string) => {
  // Support both ID and slug-id format
  const id = auctionId.includes("-") ? auctionId.split("-").pop() : auctionId;
  return AuctionItem.findById(id)
    .populate("seller", "username role avatarUrl")
    .populate("currentBidder", "username avatarUrl")
    .lean();
};

export const getAuctionBySlug = async (slug: string) => {
  // Extract ID from slug-id format or use slug directly
  const parts = slug.split("-");
  const id = parts[parts.length - 1];
  
  // Try to find by ID first (most common case)
  let auction = await AuctionItem.findById(id)
    .populate("seller", "username role avatarUrl")
    .populate("currentBidder", "username avatarUrl")
    .lean();
  
  // If not found by ID, try by slug
  if (!auction) {
    auction = await AuctionItem.findOne({ slug })
      .populate("seller", "username role avatarUrl")
      .populate("currentBidder", "username avatarUrl")
      .lean();
  }
  
  return auction;
};

export const finalizeAuction = async (auctionId: string) => {
  const auction = await AuctionItem.findById(auctionId);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }
  if (auction.status === "completed") {
    // If already completed, ensure funds are properly handled (cleanup)
    await ensureAuctionFundsReleased(auctionId);
    return auction;
  }

  const highestBid = await Bid.findOne({ auction: auction._id })
    .sort({ amount: -1, createdAt: 1 })
    .populate("bidder", "username email")
    .lean<{
      _id: Types.ObjectId;
      amount: number;
      bidder?: {
        _id: Types.ObjectId;
        username?: string;
        email?: string;
      };
    }>();

  // If there is a highest bid, capture wallet funds and release others
  if (highestBid?.bidder?._id) {
    try {
      await captureWinningBid(auction._id);
      auction.currentBidder = highestBid.bidder._id;
      auction.currentPrice = highestBid.amount;
    } catch (error) {
      // If capture fails, still release all funds to prevent stuck balances
      console.error(`Error capturing winning bid for auction ${auctionId}:`, error);
      await releaseAllFundsForAuction(auction._id);
    }
  } else {
    // No bids, but release any blocked funds just in case (edge case cleanup)
    await releaseAllFundsForAuction(auction._id);
  }

  auction.status = "completed";
  await auction.save();

  const io = getIo();
  io.to(`auction:${auction._id}`).emit("auction:finalized", {
    auctionId: auction._id,
    winner:
      highestBid && highestBid.bidder
        ? {
            id: highestBid.bidder._id,
            username: highestBid.bidder.username ?? "Unknown bidder",
            amount: highestBid.amount,
          }
        : null,
  });

  if (highestBid?.bidder?._id) {
    await sendNotification(
      highestBid.bidder._id,
      "bid_won",
      `You won the auction for ${auction.title}!`,
      { auctionId: auction._id }
    );
  }

  await sendNotification(
    auction.seller,
    "auction_completed",
    highestBid
      ? `Your auction ${auction.title} completed. Winner: ${highestBid.bidder?.username ?? "Unknown bidder"}`
      : `Your auction ${auction.title} ended with no bids.`,
    { auctionId: auction._id }
  );

  return auction;
};

export const announceAuctionUpdate = async (
  auctionId: Types.ObjectId | string
) => {
  const io = getIo();
  const id = auctionId.toString();
  const auction = await getAuctionById(id);
  if (auction) {
    io.to(`auction:${id}`).emit("auction:update", auction);
  }
};

export const getSellerDashboard = async (sellerId: Types.ObjectId) => {
  const listings = await AuctionItem.find({ seller: sellerId })
    .sort({ createdAt: -1 })
    .populate("currentBidder", "username avatarUrl")
    .lean();
  
  // Get bid counts for each auction
  const bidCounts = await Bid.aggregate([
    {
      $match: {
        auction: { $in: listings.map((item) => item._id) },
      },
    },
    {
      $group: {
        _id: "$auction",
        count: { $sum: 1 },
      },
    },
  ]);

  const bidCountMap = new Map(
    bidCounts.map((bc) => [bc._id.toString(), bc.count])
  );

  const listingsWithBidCounts = listings.map((listing) => ({
    ...listing,
    bidCount: bidCountMap.get(listing._id.toString()) ?? 0,
  }));

  const activeBids = await Bid.find({
    auction: { $in: listings.map((item) => item._id) },
  })
    .populate("auction", "title endTime status")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  // Calculate analytics metrics
  const completedAuctions = listings.filter((l) => l.status === "completed");
  const cancelledAuctions = listings.filter((l) => l.status === "cancelled");
  const totalAuctions = listings.length;
  const successRate =
    totalAuctions > 0
      ? ((completedAuctions.length / totalAuctions) * 100).toFixed(1)
      : "0";

  // Calculate revenue and average sale price
  const totalRevenue = completedAuctions.reduce(
    (sum, auction) => sum + auction.currentPrice,
    0
  );
  const averageSalePrice =
    completedAuctions.length > 0
      ? totalRevenue / completedAuctions.length
      : 0;

  // Get status breakdown
  const statusBreakdown = {
    pending: listings.filter((l) => l.status === "pending").length,
    live: listings.filter((l) => l.status === "live").length,
    completed: completedAuctions.length,
    cancelled: cancelledAuctions.length,
  };

  // Revenue over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCompletedAuctions = completedAuctions.filter(
    (auction) => new Date(auction.endTime) >= thirtyDaysAgo
  );

  const revenueByDay = recentCompletedAuctions.reduce(
    (acc, auction) => {
      const dateStr = new Date(auction.endTime).toISOString().split("T")[0];
      if (dateStr) {
        acc[dateStr] = (acc[dateStr] || 0) + auction.currentPrice;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const revenueTimeline = Object.entries(revenueByDay)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    listings: listingsWithBidCounts,
    activeBids,
    analytics: {
      totalRevenue,
      averageSalePrice,
      totalAuctions,
      completedAuctions: completedAuctions.length,
      cancelledAuctions: cancelledAuctions.length,
      successRate: parseFloat(successRate),
      statusBreakdown,
      revenueTimeline,
    },
  };
};

export const getBuyerDashboard = async (buyerId: Types.ObjectId) => {
  // Use aggregation to get the highest bid per auction for this buyer
  const highestBidsPerAuction = await Bid.aggregate([
    // Match bids by this buyer
    { $match: { bidder: buyerId } },
    // Sort by amount descending to get highest first
    { $sort: { amount: -1 } },
    // Group by auction and take the first (highest) bid
    {
      $group: {
        _id: "$auction",
        highestBid: { $first: "$$ROOT" },
      },
    },
    // Lookup auction details
    {
      $lookup: {
        from: "auctionitems",
        localField: "_id",
        foreignField: "_id",
        as: "auctionDetails",
      },
    },
    // Unwind auction details
    { $unwind: "$auctionDetails" },
    // Filter out completed auctions and auctions that have ended
    {
      $match: {
        "auctionDetails.status": { $ne: "completed" },
        "auctionDetails.endTime": { $gt: new Date() }, // Only include auctions that haven't ended
      },
    },
    // Lookup current bidder details
    {
      $lookup: {
        from: "users",
        localField: "auctionDetails.currentBidder",
        foreignField: "_id",
        as: "currentBidderDetails",
      },
    },
    // Project the final structure
    {
      $project: {
        _id: "$highestBid._id",
        amount: "$highestBid.amount",
        bidder: "$highestBid.bidder",
        createdAt: "$highestBid.createdAt",
        auction: {
          _id: "$auctionDetails._id",
          title: "$auctionDetails.title",
          endTime: "$auctionDetails.endTime",
          status: "$auctionDetails.status",
          currentPrice: "$auctionDetails.currentPrice",
          currentBidder: {
            $cond: {
              if: { $gt: [{ $size: "$currentBidderDetails" }, 0] },
              then: {
                _id: { $arrayElemAt: ["$currentBidderDetails._id", 0] },
                username: { $arrayElemAt: ["$currentBidderDetails.username", 0] },
              },
              else: null,
            },
          },
          category: "$auctionDetails.category",
          imageUrls: "$auctionDetails.imageUrls",
          slug: "$auctionDetails.slug",
        },
      },
    },
  ]);

  // Convert aggregation result to the expected format
  const activeBids = highestBidsPerAuction.map((item) => ({
    _id: item._id,
    amount: item.amount,
    bidder: {
      _id: item.bidder,
      id: item.bidder.toString(),
    },
    auction: item.auction,
    createdAt: item.createdAt,
  }));

  // Get won auctions (completed auctions where user is the winner)
  const wonAuctions = await AuctionItem.find({
    currentBidder: buyerId,
    status: "completed",
  })
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();

  // Fetch all bids for this buyer for analytics calculations
  const allBids = await Bid.find({ bidder: buyerId })
    .populate({
      path: "auction",
      select: "category endTime status currentPrice slug",
    })
    .sort({ createdAt: -1 })
    .lean<Array<{
      _id: Types.ObjectId;
      amount: number;
      bidder: Types.ObjectId;
      createdAt?: Date;
      auction:
        | Types.ObjectId
        | {
            _id: Types.ObjectId;
            category?: string;
            endTime?: Date;
            status?: string;
            currentPrice: number;
            slug?: string;
          };
    }>>();

  // Calculate analytics metrics
  const totalBids = allBids.length;
  const totalSpent = wonAuctions.reduce((sum, auction) => sum + auction.currentPrice, 0);
  const averageBidAmount = allBids.length > 0
    ? allBids.reduce((sum, bid) => sum + bid.amount, 0) / allBids.length
    : 0;

  // Calculate win rate
  const uniqueAuctionIds = new Set(
    allBids
      .map((bid) => {
        const auction = bid.auction;
        if (typeof auction === "object" && auction !== null && "_id" in auction) {
          return (auction as { _id: Types.ObjectId })._id.toString();
        }
        return null;
      })
      .filter((id): id is string => id !== null)
  );
  const auctionsParticipated = uniqueAuctionIds.size;
  const winRate = auctionsParticipated > 0
    ? ((wonAuctions.length / auctionsParticipated) * 100).toFixed(1)
    : "0";

  // Calculate favorite categories
  const categoryCounts = new Map<string, number>();
  allBids.forEach((bid) => {
    const auction = bid.auction;
    if (typeof auction === "object" && auction !== null && "category" in auction) {
      const category = (auction as { category: string }).category;
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    }
  });

  const favoriteCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 categories

  // Bidding timeline (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentBids = allBids.filter((bid) => {
    if (!bid.createdAt) return false;
    return new Date(bid.createdAt) >= thirtyDaysAgo;
  });

  const bidsByDay = recentBids.reduce(
    (acc, bid) => {
      if (!bid.createdAt) return acc;
      const dateStr = new Date(bid.createdAt).toISOString().split("T")[0];
      if (dateStr) {
        acc[dateStr] = (acc[dateStr] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const biddingTimeline = Object.entries(bidsByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate spending by day (from won auctions in last 30 days)
  const recentWonAuctions = wonAuctions.filter((auction) => {
    if (!auction.endTime) return false;
    return new Date(auction.endTime) >= thirtyDaysAgo;
  });

  const spendingByDay = recentWonAuctions.reduce(
    (acc, auction) => {
      if (!auction.endTime) return acc;
      const dateStr = new Date(auction.endTime).toISOString().split("T")[0];
      if (dateStr) {
        acc[dateStr] = (acc[dateStr] || 0) + auction.currentPrice;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const spendingTimeline = Object.entries(spendingByDay)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    activeBids,
    wonAuctions,
    analytics: {
      totalBids,
      totalSpent,
      averageBidAmount,
      winRate: parseFloat(winRate),
      auctionsParticipated,
      wonCount: wonAuctions.length,
      favoriteCategories,
      biddingTimeline,
      spendingTimeline,
    },
  };
};

export const updateAuction = async (
  auctionId: string,
  updates: Partial<IAuctionItem>,
  sellerId: Types.ObjectId
) => {
  const auction = await AuctionItem.findById(auctionId);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }
  if (auction.seller.toString() !== sellerId.toString()) {
    throw new Error("Unauthorized: Only seller can update auction");
  }
  if (auction.status === "completed") {
    throw new Error("Cannot update completed auction");
  }
  
  Object.assign(auction, updates);
  await auction.save();
  return auction;
};

export const setAuctionLive = async (
  auctionId: Types.ObjectId | string
) => {
  const id = auctionId.toString();
  const auction = await AuctionItem.findByIdAndUpdate(
    id,
    { status: "live" },
    { new: true }
  );
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }
  const seller = await User.findById(auction.seller);
  if (seller) {
    await sendNotification(
      seller._id,
      "auction_live",
      `${auction.title} is now live!`,
      { auctionId }
    );
  }
  await announceAuctionUpdate(auction._id);
  return auction;
};

